import datetime
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

import crud
from database import AsyncSessionLocal, Base, engine, get_db
from models import CheckpointCompletion, HabitLog, TaskCompletion  # noqa: F401 — ensure models are imported so Base sees them
from sqlalchemy import select
from plan_data import CHECKPOINTS, HABITS, TASKS
from schemas import (
    ActivityDay,
    CheckinResponse,
    CheckpointCompleteRequest,
    CheckpointCompleteResponse,
    HabitLogRequest,
    HabitLogResponse,
    HabitStatusItem,
    ProgressResponse,
    StateResponse,
    StatLevelOut,
    StreakStatusResponse,
    TaskCompleteRequest,
    TaskCompleteResponse,
    TaskUncompleteResponse,
    WeeklySkillXP,
    WeeklySummaryResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Migrate: add 'count' column to habit_logs if not present
    async with engine.begin() as conn:
        try:
            await conn.execute(text(
                "ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS count INTEGER DEFAULT 0"
            ))
        except Exception:
            pass  # column already exists or no table yet

    # Seed initial data if the DB is empty
    async with AsyncSessionLocal() as db:
        if not await crud.get_user_state(db):
            await crud.create_initial_state(db)
            await crud.seed_stat_levels(db)
            await db.commit()

    yield


app = FastAPI(title="PrideArc API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "PrideArc API is running", "version": "0.1.0"}


@app.get("/health")
async def health(db: AsyncSession = Depends(get_db)):
    db_status = "disconnected"
    db_error = None
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_error = str(e)

    return {
        "status": "ok",
        "api": "running",
        "database": db_status,
        **({"db_error": db_error} if db_error else {}),
    }


# ── State ─────────────────────────────────────────────────────────────────────

@app.get("/state", response_model=StateResponse)
async def get_state(db: AsyncSession = Depends(get_db)):
    state = await crud.get_user_state(db)
    if not state:
        raise HTTPException(status_code=500, detail="User state not initialized")

    stats = await crud.get_stat_levels(db)
    completed_task_ids = await crud.get_completed_task_ids(db)
    completed_cp_ids = await crud.get_completed_checkpoint_ids(db)
    badges = await crud.get_badges(db)

    return StateResponse(
        current_month=state.current_month,
        total_xp=state.total_xp,
        character_level=state.character_level,
        streak_current=state.streak_current,
        streak_longest=state.streak_longest,
        last_checkin_date=state.last_checkin_date,
        stats=[
            StatLevelOut(
                skill_type=s.skill_type,
                xp=s.xp,
                level=s.level,
                icon=crud._enrich_stat(s).icon,
                label=crud._enrich_stat(s).label,
            )
            for s in stats
        ],
        completed_task_ids=completed_task_ids,
        completed_checkpoint_ids=completed_cp_ids,
        badges=[crud._badge_out(b) for b in badges],
    )


# ── Tasks ─────────────────────────────────────────────────────────────────────

@app.post("/task/complete", response_model=TaskCompleteResponse)
async def complete_task(body: TaskCompleteRequest, db: AsyncSession = Depends(get_db)):
    task = TASKS.get(body.task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{body.task_id}' not found")

    # Once-type tasks can only be completed once
    if task["frequency"] == "once":
        completed_ids = await crud.get_completed_task_ids(db)
        if body.task_id in completed_ids:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Task '{body.task_id}' is already completed",
            )

    xp, stat, total_xp, char_level, chapter_unlocked, chapter_badge = await crud.complete_task(
        db, body.task_id
    )
    return TaskCompleteResponse(
        xp_awarded=xp,
        new_total_xp=total_xp,
        character_level=char_level,
        skill=stat,
        chapter_unlocked=chapter_unlocked,
        chapter_badge=chapter_badge,
    )


@app.post("/task/uncomplete", response_model=TaskUncompleteResponse)
async def uncomplete_task(body: TaskCompleteRequest, db: AsyncSession = Depends(get_db)):
    task = TASKS.get(body.task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{body.task_id}' not found")

    completed_ids = await crud.get_completed_task_ids(db)
    if body.task_id not in completed_ids:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Task '{body.task_id}' has not been completed",
        )

    xp, stat, total_xp, char_level = await crud.uncomplete_task(db, body.task_id)
    return TaskUncompleteResponse(
        xp_revoked=xp,
        new_total_xp=total_xp,
        character_level=char_level,
        skill=stat,
    )


# ── Checkpoints ───────────────────────────────────────────────────────────────

@app.post("/checkpoint/complete", response_model=CheckpointCompleteResponse)
async def complete_checkpoint(
    body: CheckpointCompleteRequest, db: AsyncSession = Depends(get_db)
):
    cp = CHECKPOINTS.get(body.checkpoint_id)
    if not cp:
        raise HTTPException(status_code=404, detail=f"Checkpoint '{body.checkpoint_id}' not found")

    completed_ids = await crud.get_completed_checkpoint_ids(db)
    if body.checkpoint_id in completed_ids:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Checkpoint '{body.checkpoint_id}' is already completed",
        )

    xp, stat, total_xp, char_level, chapter_unlocked, chapter_badge = await crud.complete_checkpoint(
        db, body.checkpoint_id
    )
    return CheckpointCompleteResponse(
        xp_awarded=xp,
        new_total_xp=total_xp,
        character_level=char_level,
        skill=stat,
        chapter_unlocked=chapter_unlocked,
        chapter_badge=chapter_badge,
    )


# ── Habits ────────────────────────────────────────────────────────────────────

@app.post("/habit/log", response_model=HabitLogResponse)
async def log_habit(body: HabitLogRequest, db: AsyncSession = Depends(get_db)):
    habit = HABITS.get(body.habit_id)
    if not habit:
        raise HTTPException(status_code=404, detail=f"Habit '{body.habit_id}' not found")

    if habit["starts_at_month"] is not None:
        state = await crud.get_user_state(db)
        if state and state.current_month < habit["starts_at_month"]:
            raise HTTPException(
                status_code=400,
                detail=f"Habit '{body.habit_id}' is not available until month {habit['starts_at_month']}",
            )

    completed, count, xp_delta = await crud.upsert_habit_log(
        db, body.habit_id, body.date, body.completed, body.count
    )
    return HabitLogResponse(
        habit_id=body.habit_id,
        date=body.date,
        completed=completed,
        count=count,
        xp_delta=xp_delta,
    )


@app.get("/habits/{date}", response_model=list[HabitStatusItem])
async def get_habits_for_date(date: str, db: AsyncSession = Depends(get_db)):
    try:
        target_date = datetime.date.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    state = await crud.get_user_state(db)
    current_month = state.current_month if state else 1

    logs = await crud.get_habit_logs_for_date(db, target_date)
    log_map = {log.habit_id: log for log in logs}

    result = []
    for habit in HABITS.values():
        starts_at = habit["starts_at_month"]
        if starts_at is not None and current_month < starts_at:
            continue  # not yet unlocked
        log = log_map.get(habit["id"])
        result.append(
            HabitStatusItem(
                habit_id=habit["id"],
                title=habit["title"],
                skill_type=habit["skill_type"],
                xp_per_completion=habit["xp_per_completion"],
                completed=log.completed if log else False,
                count=log.count if log else 0,
                logged=log is not None,
            )
        )

    return result


# ── Current tasks (grouped by frequency) ─────────────────────────────────────

@app.get("/current-tasks")
async def get_current_tasks(db: AsyncSession = Depends(get_db)):
    """Return tasks for the current month grouped by frequency, with completion status."""
    state = await crud.get_user_state(db)
    current_month = state.current_month if state else 1
    completed_ids = set(await crud.get_completed_task_ids(db))

    daily = []
    weekly = []
    monthly = []  # one-time tasks

    for task in TASKS.values():
        if task["month_number"] != current_month:
            continue
        entry = {
            "id": task["id"],
            "title": task["title"],
            "skill_type": task["skill_type"],
            "xp": task["xp"],
            "frequency": task["frequency"],
            "completed": task["id"] in completed_ids,
        }
        if task["frequency"] == "daily":
            daily.append(entry)
        elif task["frequency"] == "weekly":
            weekly.append(entry)
        else:
            monthly.append(entry)

    # Also include checkpoints for the current month as milestone tasks
    completed_cps = set(await crud.get_completed_checkpoint_ids(db))
    checkpoints = []
    from plan_data import CHECKPOINTS
    for cp in CHECKPOINTS.values():
        if cp["month_number"] != current_month:
            continue
        checkpoints.append({
            "id": cp["id"],
            "title": cp["title"],
            "skill_type": cp["skill_type"],
            "xp": cp["xp_reward"],
            "completed": cp["id"] in completed_cps,
        })

    return {
        "current_month": current_month,
        "daily": daily,
        "weekly": weekly,
        "monthly": monthly,
        "checkpoints": checkpoints,
    }


# ── Check-in ──────────────────────────────────────────────────────────────────

@app.post("/checkin", response_model=CheckinResponse)
async def checkin(db: AsyncSession = Depends(get_db)):
    streak_current, streak_longest, today, was_no_op = await crud.record_checkin(db)
    return CheckinResponse(
        streak_current=streak_current,
        streak_longest=streak_longest,
        last_checkin_date=today,
        was_no_op=was_no_op,
    )


@app.get("/streak-status", response_model=StreakStatusResponse)
async def get_streak_status(db: AsyncSession = Depends(get_db)):
    state = await crud.get_user_state(db)
    if not state:
        raise HTTPException(status_code=500, detail="User state not initialized")

    today = datetime.date.today()
    checked_in_today = state.last_checkin_date == today

    if state.last_checkin_date is None:
        days_missed = 0  # brand new user
    else:
        delta = (today - state.last_checkin_date).days
        days_missed = max(0, delta - 1) if not checked_in_today else 0

    return StreakStatusResponse(
        streak=state.streak_current,
        longest=state.streak_longest,
        checked_in_today=checked_in_today,
        days_missed=days_missed,
    )


# ── Recent completions (for 7-day streak view) ────────────────────────────────

@app.get("/completions/recent")
async def recent_completions(days: int = 7, db: AsyncSession = Depends(get_db)):
    since = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
    result = await db.execute(
        select(TaskCompletion)
        .where(TaskCompletion.completed_at >= since)
        .order_by(TaskCompletion.completed_at.desc())
    )
    rows = result.scalars().all()
    return [
        {"task_id": r.task_id, "completed_at": r.completed_at.isoformat()}
        for r in rows
    ]


# ── Progress ──────────────────────────────────────────────────────────────────

@app.get("/progress", response_model=ProgressResponse)
async def get_progress(db: AsyncSession = Depends(get_db)):
    data = await crud.get_progress(db)
    return ProgressResponse(**data)


# ── Activity heatmap ──────────────────────────────────────────────────────────

@app.get("/activity", response_model=list[ActivityDay])
async def get_activity(days: int = 180, db: AsyncSession = Depends(get_db)):
    since = datetime.date.today() - datetime.timedelta(days=days)

    # Fetch task completions in range
    tc_result = await db.execute(
        select(TaskCompletion).where(
            TaskCompletion.completed_at >= datetime.datetime.combine(
                since, datetime.time.min, tzinfo=datetime.timezone.utc
            )
        )
    )
    task_rows = tc_result.scalars().all()

    # Fetch habit logs in range (only completed)
    hl_result = await db.execute(
        select(HabitLog).where(
            HabitLog.logged_date >= since,
            HabitLog.completed == True,  # noqa: E712
        )
    )
    habit_rows = hl_result.scalars().all()

    # Fetch checkpoint completions in range
    cc_result = await db.execute(
        select(CheckpointCompletion).where(
            CheckpointCompletion.completed_at >= datetime.datetime.combine(
                since, datetime.time.min, tzinfo=datetime.timezone.utc
            )
        )
    )
    cp_rows = cc_result.scalars().all()

    # Aggregate by date
    from collections import defaultdict
    day_map: dict[str, dict] = defaultdict(lambda: {"total_xp": 0, "skills": defaultdict(int)})

    for tc in task_rows:
        task = TASKS.get(tc.task_id)
        if not task:
            continue
        d = tc.completed_at.date().isoformat()
        day_map[d]["total_xp"] += task["xp"]
        day_map[d]["skills"][task["skill_type"]] += task["xp"]

    for hl in habit_rows:
        habit = HABITS.get(hl.habit_id)
        if not habit:
            continue
        d = hl.logged_date.isoformat()
        day_map[d]["total_xp"] += habit["xp_per_completion"]
        day_map[d]["skills"][habit["skill_type"]] += habit["xp_per_completion"]

    for cc in cp_rows:
        cp = CHECKPOINTS.get(cc.checkpoint_id)
        if not cp:
            continue
        d = cc.completed_at.date().isoformat()
        day_map[d]["total_xp"] += cp["xp_reward"]
        day_map[d]["skills"][cp["skill_type"]] += cp["xp_reward"]

    # Build result for every day in range
    result = []
    current = since
    today = datetime.date.today()
    while current <= today:
        d = current.isoformat()
        info = day_map.get(d)
        if info and info["total_xp"] > 0:
            dominant = max(info["skills"], key=info["skills"].get) if info["skills"] else None
            result.append(ActivityDay(date=d, total_xp=info["total_xp"], dominant_skill=dominant))
        else:
            result.append(ActivityDay(date=d, total_xp=0, dominant_skill=None))
        current += datetime.timedelta(days=1)

    return result


# ── Weekly summary ────────────────────────────────────────────────────────────

@app.get("/weekly-summary", response_model=WeeklySummaryResponse)
async def get_weekly_summary(db: AsyncSession = Depends(get_db)):
    today = datetime.date.today()
    # Monday of current week
    monday = today - datetime.timedelta(days=today.weekday())
    sunday = monday + datetime.timedelta(days=6)

    monday_dt = datetime.datetime.combine(monday, datetime.time.min, tzinfo=datetime.timezone.utc)
    sunday_dt = datetime.datetime.combine(sunday, datetime.time.max, tzinfo=datetime.timezone.utc)

    # Task completions this week
    tc_result = await db.execute(
        select(TaskCompletion).where(
            TaskCompletion.completed_at >= monday_dt,
            TaskCompletion.completed_at <= sunday_dt,
        )
    )
    task_rows = tc_result.scalars().all()

    # Habit logs this week (completed only)
    hl_result = await db.execute(
        select(HabitLog).where(
            HabitLog.logged_date >= monday,
            HabitLog.logged_date <= sunday,
            HabitLog.completed == True,  # noqa: E712
        )
    )
    habit_rows = hl_result.scalars().all()

    # Checkpoint completions this week
    cc_result = await db.execute(
        select(CheckpointCompletion).where(
            CheckpointCompletion.completed_at >= monday_dt,
            CheckpointCompletion.completed_at <= sunday_dt,
        )
    )
    cp_rows = cc_result.scalars().all()

    from collections import defaultdict
    total_xp = 0
    problems_solved = 0
    active_dates: set[str] = set()
    skill_xp: dict[str, int] = defaultdict(int)

    for tc in task_rows:
        task = TASKS.get(tc.task_id)
        if not task:
            continue
        total_xp += task["xp"]
        skill_xp[task["skill_type"]] += task["xp"]
        active_dates.add(tc.completed_at.date().isoformat())
        if task["skill_type"] == "dsa":
            problems_solved += 1

    for hl in habit_rows:
        habit = HABITS.get(hl.habit_id)
        if not habit:
            continue
        total_xp += habit["xp_per_completion"]
        skill_xp[habit["skill_type"]] += habit["xp_per_completion"]
        active_dates.add(hl.logged_date.isoformat())

    for cc in cp_rows:
        cp = CHECKPOINTS.get(cc.checkpoint_id)
        if not cp:
            continue
        total_xp += cp["xp_reward"]
        skill_xp[cp["skill_type"]] += cp["xp_reward"]
        active_dates.add(cc.completed_at.date().isoformat())

    from plan_data import INITIAL_STATS
    skill_breakdown = [
        WeeklySkillXP(
            skill_type=sk,
            label=INITIAL_STATS[sk]["label"],
            icon=INITIAL_STATS[sk]["icon"],
            xp=xp,
        )
        for sk, xp in sorted(skill_xp.items(), key=lambda x: -x[1])
        if xp > 0
    ]

    return WeeklySummaryResponse(
        total_xp=total_xp,
        problems_solved=problems_solved,
        days_active=len(active_dates),
        skill_breakdown=skill_breakdown,
    )
