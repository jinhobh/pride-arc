import datetime
import math
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

import crud
from database import AsyncSessionLocal, Base, engine, get_db
from models import CheckpointCompletion, HabitLog, PlanCheckpoint, PlanHabit, PlanSection, PlanSectionTask, PlanTask, TaskCompletion, TaskDayAssignment  # noqa: F401 — ensure models are imported so Base sees them
from sqlalchemy import delete, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from plan_data import CHECKPOINTS, HABITS, MONTH_SUBTITLES, TASKS
from schemas import (
    AssignDayRequest,
    MissedHabitOut,
    MissedTaskOut,
    PaceResponse,
    PlanCheckpointCreate,
    PlanCheckpointOut,
    PlanCheckpointUpdate,
    PlanHabitCreate,
    PlanHabitOut,
    PlanHabitUpdate,
    PlanTaskCreate,
    PlanTaskOut,
    PlanTaskUpdate,
    ActivityDay,
    HabitActivityDay,
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

    # Seed plan data into DB tables (idempotent — on_conflict_do_nothing)
    async with AsyncSessionLocal() as db:
        await crud.seed_plan_data(db)

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

    import datetime as _dt
    today = _dt.date.today()
    yesterday = today - _dt.timedelta(days=1)
    effective_streak = (
        state.streak_current
        if state.last_checkin_date in (today, yesterday)
        else 0
    )

    return StateResponse(
        current_month=state.current_month,
        total_xp=state.total_xp,
        character_level=state.character_level,
        streak_current=effective_streak,
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
    task = TASKS.get(body.task_id) or await crud.resolve_custom_task(db, body.task_id)
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
        db, body.task_id, task_data=task
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
    task = TASKS.get(body.task_id) or await crud.resolve_custom_task(db, body.task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{body.task_id}' not found")

    completed_ids = await crud.get_completed_task_ids(db)
    if body.task_id not in completed_ids:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Task '{body.task_id}' has not been completed",
        )

    xp, stat, total_xp, char_level = await crud.uncomplete_task(db, body.task_id, task_data=task)
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


# ── Plan data (single source of truth) ───────────────────────────────────────

@app.get("/plan/month/{n}")
async def get_month_plan(n: int, db: AsyncSession = Depends(get_db)):
    """Return full month data for the MonthPage UI, directly from plan_data.py."""
    from plan_data import MONTH_SECTIONS, MONTH_SUBTITLES, CHAPTER_REWARDS

    if n < 1 or n > 6:
        raise HTTPException(status_code=404, detail=f"Month {n} does not exist")

    # Get completion state
    completed_ids = set(await crud.get_completed_task_ids(db))
    completed_cps = set(await crud.get_completed_checkpoint_ids(db))

    # Build sections with full task objects
    sections = []
    for section_def in MONTH_SECTIONS.get(n, []):
        tasks = []
        for tid in section_def["task_ids"]:
            task = TASKS.get(tid)
            if task:
                tasks.append({
                    "id": task["id"],
                    "title": task["title"],
                    "skill_type": task["skill_type"],
                    "frequency": task["frequency"],
                    "xp": task["xp"],
                    "completed": task["id"] in completed_ids,
                })
        sections.append({
            "id": section_def["id"],
            "title": section_def["title"],
            "skillType": section_def["skill_type"],
            "tasks": tasks,
        })

    # Build checkpoints
    from plan_data import CHECKPOINTS_BY_MONTH
    checkpoints = []
    for cp_id in CHECKPOINTS_BY_MONTH.get(n, []):
        cp = CHECKPOINTS.get(cp_id)
        if cp:
            checkpoints.append({
                "id": cp["id"],
                "title": cp["title"],
                "skillType": cp["skill_type"],
                "xpReward": cp["xp_reward"],
                "completed": cp["id"] in completed_cps,
            })

    # Chapter reward
    reward = CHAPTER_REWARDS.get(n, {})
    chapter_reward = {
        "title": reward.get("title", ""),
        "description": reward.get("description", ""),
        "badgeIcon": reward.get("icon", ""),
        "xpBonus": reward.get("xp_bonus", 0),
    }

    return {
        "monthNumber": n,
        "subtitle": MONTH_SUBTITLES.get(n, ""),
        "sections": sections,
        "checkpoints": checkpoints,
        "chapterReward": chapter_reward,
    }


# ── Plan Pace ─────────────────────────────────────────────────────────────────

@app.get("/plan/pace", response_model=PaceResponse)
async def get_plan_pace(db: AsyncSession = Depends(get_db)):
    """Return on-track pace metrics for the 6-month arc."""
    state = await crud.get_user_state(db)
    today = datetime.date.today()
    created = state.created_at.date() if state and state.created_at else today
    arc_day = max(1, (today - created).days + 1)
    arc_total_days = 180

    # Which month of the arc are we in (1–6)?
    current_month = min(6, math.ceil(arc_day / 30))

    # Expected XP = "once" tasks + checkpoints from fully elapsed months
    #             + habit XP for each elapsed day since the habit starts.
    expected_xp_today = sum(
        t["xp"] for t in TASKS.values()
        if t["frequency"] == "once" and t["month_number"] < current_month
    ) + sum(
        c["xp_reward"] for c in CHECKPOINTS.values()
        if c["month_number"] < current_month
    )

    # Habits: active from starts_at_month (or month 1) onward
    # Expected XP assumes 1 completion per day for each active habit.
    habit_expected_days: dict[str, int] = {}
    for h in HABITS.values():
        start_month = h.get("starts_at_month") or 1
        habit_start_day = (start_month - 1) * 30 + 1
        if arc_day < habit_start_day:
            continue
        active_days = arc_day - habit_start_day + 1
        habit_expected_days[h["id"]] = active_days
        expected_xp_today += h["xp_per_completion"] * active_days

    # Total arc XP includes once + checkpoints + all habits over 180 days.
    total_arc_xp = sum(
        t["xp"] for t in TASKS.values() if t["frequency"] == "once"
    ) + sum(c["xp_reward"] for c in CHECKPOINTS.values())

    for h in HABITS.values():
        start_month = h.get("starts_at_month") or 1
        habit_start_day = (start_month - 1) * 30 + 1
        total_days = 180 - habit_start_day + 1
        total_arc_xp += h["xp_per_completion"] * total_days

    earned_xp = state.total_xp if state else 0
    delta_xp = earned_xp - expected_xp_today

    if delta_xp >= 50:
        status_label = "Ahead"
    elif delta_xp <= -50:
        status_label = "Behind"
    else:
        status_label = "On Track"

    # Missed tasks: incomplete "once" tasks from fully elapsed months
    completed_ids = set(await crud.get_completed_task_ids(db))
    missed = [
        MissedTaskOut(
            id=t["id"],
            title=t["title"],
            xp=t["xp"],
            skill_type=t["skill_type"],
            month_number=t["month_number"],
        )
        for t in TASKS.values()
        if t["frequency"] == "once"
        and t["month_number"] < current_month
        and t["id"] not in completed_ids
    ]
    missed.sort(key=lambda x: (x.month_number, x.skill_type, x.title))

    # Missed habits: count completed days per habit from habit_logs
    habit_log_rows = await db.execute(
        select(HabitLog.habit_id, HabitLog.count)
        .where(HabitLog.completed.is_(True))
    )
    # Sum actual completions per habit (each log row count = 1 completion day)
    habit_completed_days: dict[str, int] = {}
    for row in habit_log_rows.fetchall():
        habit_completed_days[row[0]] = habit_completed_days.get(row[0], 0) + 1

    missed_habits = []
    for h in HABITS.values():
        expected_days = habit_expected_days.get(h["id"], 0)
        if expected_days == 0:
            continue
        actual_days = habit_completed_days.get(h["id"], 0)
        missed_days = max(0, expected_days - actual_days)
        if missed_days > 0:
            missed_habits.append(MissedHabitOut(
                habit_id=h["id"],
                title=h["title"],
                skill_type=h["skill_type"],
                xp_per_day=h["xp_per_completion"],
                missed_days=missed_days,
                total_missed_xp=missed_days * h["xp_per_completion"],
            ))
    missed_habits.sort(key=lambda x: (-x.total_missed_xp, x.title))

    return PaceResponse(
        arc_day=arc_day,
        arc_total_days=arc_total_days,
        expected_xp_today=expected_xp_today,
        earned_xp=earned_xp,
        delta_xp=delta_xp,
        status=status_label,
        total_arc_xp=total_arc_xp,
        missed_tasks=missed,
        missed_habits=missed_habits,
    )


# ── Plan Roadmap ───────────────────────────────────────────────────────────────

@app.get("/plan/roadmap")
async def get_plan_roadmap(db: AsyncSession = Depends(get_db)):
    """6-month arc overview with XP totals and completion percentages."""
    from plan_data import CHAPTER_REWARDS, MONTH_SUBTITLES
    completed_ids = set(await crud.get_completed_task_ids(db))
    completed_cps = set(await crud.get_completed_checkpoint_ids(db))
    state = await crud.get_user_state(db)
    current_month = state.current_month if state else 1

    months = []
    for n in range(1, 7):
        month_tasks = [t for t in TASKS.values() if t["month_number"] == n]
        month_cps = [c for c in CHECKPOINTS.values() if c["month_number"] == n]
        once_tasks = [t for t in month_tasks if t["frequency"] == "once"]

        total_xp = (
            sum(t["xp"] for t in once_tasks)
            + sum(c["xp_reward"] for c in month_cps)
        )
        earned_xp = (
            sum(t["xp"] for t in once_tasks if t["id"] in completed_ids)
            + sum(c["xp_reward"] for c in month_cps if c["id"] in completed_cps)
        )
        done_items = (
            sum(1 for t in once_tasks if t["id"] in completed_ids)
            + sum(1 for c in month_cps if c["id"] in completed_cps)
        )
        total_items = len(once_tasks) + len(month_cps)
        pct = round(done_items / total_items * 100, 1) if total_items else 0.0

        skills = list(set(t["skill_type"] for t in month_tasks))
        reward = CHAPTER_REWARDS.get(n, {})

        months.append({
            "month_number": n,
            "subtitle": MONTH_SUBTITLES.get(n, ""),
            "completion_pct": pct,
            "earned_xp": earned_xp,
            "total_xp": total_xp,
            "skills": skills,
            "is_locked": n > current_month,
            "is_current": n == current_month,
            "chapter_reward": {
                "badge_id": reward.get("badge_id", ""),
                "title": reward.get("title", ""),
                "icon": reward.get("icon", ""),
                "xp_bonus": reward.get("xp_bonus", 0),
            },
        })

    return {"months": months}


# ── Plan Weekly View ───────────────────────────────────────────────────────────

def _parse_wk_number(title: str) -> int | None:
    """Extract week number from task titles like 'Wk 1 · ...' or 'Wk 3 · ...'"""
    import re
    m = re.match(r'^Wk\s+(\d+)', title)
    return int(m.group(1)) if m else None


_PERMANENT_WEEK = datetime.date(9999, 1, 1)  # sentinel for once-task assignments


@app.get("/plan/week")
async def get_plan_week(db: AsyncSession = Depends(get_db)):
    """This week's tasks grouped by day (Mon–Sun), with completion state.

    Once tasks labelled 'Wk N' appear on the Monday that starts their week.
    Carry-over: incomplete once tasks from earlier weeks also surface on Monday.
    Manual day assignments (from drag-and-drop) override default placement.
    """
    state = await crud.get_user_state(db)
    current_month = state.current_month if state else 1
    completed_ids = set(await crud.get_completed_task_ids(db))

    today = datetime.date.today()
    monday = today - datetime.timedelta(days=today.weekday())

    # ── Arc week calculation ───────────────────────────────────────────────────
    arc_start = state.created_at.date() if state and state.created_at else today
    month_start = arc_start + datetime.timedelta(days=(current_month - 1) * 30)
    days_into_month = max(0, (today - month_start).days)
    arc_week = min(4, (days_into_month // 7) + 1)  # 1–4

    # ── Load manual day assignments ────────────────────────────────────────────
    assign_result = await db.execute(
        select(TaskDayAssignment).where(
            TaskDayAssignment.week_start.in_([monday, _PERMANENT_WEEK])
        )
    )
    assignments: dict[str, int] = {
        row.task_id: row.day_offset for row in assign_result.scalars().all()
    }

    # ── Bucket tasks by type ───────────────────────────────────────────────────
    month_tasks = [t for t in TASKS.values() if t["month_number"] == current_month]
    daily_tasks  = [t for t in month_tasks if t["frequency"] == "daily"]
    weekly_tasks = [t for t in month_tasks if t["frequency"] == "weekly"]

    # Once tasks: current week's + carry-overs from earlier incomplete weeks
    once_tasks: list[dict] = []
    for t in month_tasks:
        if t["frequency"] != "once":
            continue
        wk = _parse_wk_number(t["title"])
        if wk is None:
            if t["id"] not in completed_ids:
                once_tasks.append(t)
        elif wk == arc_week:
            once_tasks.append(t)
        elif wk < arc_week and t["id"] not in completed_ids:
            once_tasks.append(t)

    def _entry(t: dict, default_day: int, is_carryover: bool = False) -> tuple[int, dict]:
        day = assignments.get(t["id"], default_day)
        return day, {
            "id": t["id"],
            "title": t["title"],
            "skill_type": t["skill_type"],
            "xp": t["xp"],
            "frequency": t["frequency"],
            "completed": t["id"] in completed_ids,
            "carryover": is_carryover,
            "draggable": True,
        }

    # Build a dict of day_index -> task list
    day_buckets: dict[int, list] = {i: [] for i in range(7)}

    # Daily tasks always go on their own day (not draggable/moveable)
    for i in range(7):
        for t in daily_tasks:
            day_buckets[i].append({
                "id": t["id"],
                "title": t["title"],
                "skill_type": t["skill_type"],
                "xp": t["xp"],
                "frequency": t["frequency"],
                "completed": t["id"] in completed_ids,
                "carryover": False,
                "draggable": False,  # daily tasks fill every day; dragging is meaningless
            })

    # Weekly tasks default to Monday (day 0), user can reassign
    for t in weekly_tasks:
        day, entry = _entry(t, default_day=0)
        day = max(0, min(6, day))
        day_buckets[day].append(entry)

    # Once tasks default to Monday (day 0), user can reassign
    for t in once_tasks:
        wk = _parse_wk_number(t["title"])
        is_carryover = wk is not None and wk < arc_week
        day, entry = _entry(t, default_day=0, is_carryover=is_carryover)
        day = max(0, min(6, day))
        day_buckets[day].append(entry)

    DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    days = [
        {
            "day": DAY_NAMES[i],
            "date": (monday + datetime.timedelta(days=i)).isoformat(),
            "is_today": (monday + datetime.timedelta(days=i)) == today,
            "tasks": day_buckets[i],
        }
        for i in range(7)
    ]

    return {
        "week_start": monday.isoformat(),
        "arc_week": arc_week,
        "days": days,
    }


@app.post("/plan/task/{task_id}/assign-day")
async def assign_task_day(
    task_id: str,
    body: AssignDayRequest,
    db: AsyncSession = Depends(get_db),
):
    """Assign a once or weekly task to a specific day (0=Mon…6=Sun).
    Pass day_offset=-1 to remove the assignment and reset to default.
    """
    task = TASKS.get(task_id) or await crud.resolve_custom_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")

    today = datetime.date.today()
    monday = today - datetime.timedelta(days=today.weekday())
    week_start = _PERMANENT_WEEK if task["frequency"] == "once" else monday

    if body.day_offset == -1:
        # Remove assignment — task reverts to its default day
        await db.execute(
            delete(TaskDayAssignment).where(
                TaskDayAssignment.task_id == task_id,
                TaskDayAssignment.week_start == week_start,
            )
        )
    else:
        stmt = (
            pg_insert(TaskDayAssignment)
            .values(task_id=task_id, week_start=week_start, day_offset=body.day_offset)
            .on_conflict_do_update(
                constraint="uq_task_week_assign",
                set_={"day_offset": body.day_offset},
            )
        )
        await db.execute(stmt)

    await db.commit()
    return {"task_id": task_id, "day_offset": body.day_offset, "week_start": week_start.isoformat()}


# ── Plan Studio — Task CRUD ────────────────────────────────────────────────────

@app.get("/plan/studio/{month_number}")
async def get_studio_month(month_number: int, db: AsyncSession = Depends(get_db)):
    """Return editable plan data for Studio view (tasks from DB, with is_custom flag)."""
    from plan_data import MONTH_SECTIONS, CHAPTER_REWARDS
    if month_number < 1 or month_number > 6:
        raise HTTPException(status_code=404, detail=f"Month {month_number} does not exist")

    completed_ids = set(await crud.get_completed_task_ids(db))
    completed_cps = set(await crud.get_completed_checkpoint_ids(db))

    # Fetch DB tasks for this month (active only)
    db_tasks_result = await db.execute(
        select(PlanTask)
        .where(PlanTask.month_number == month_number, PlanTask.is_active == True)  # noqa: E712
        .order_by(PlanTask.sort_order)
    )
    db_tasks = {t.task_id: t for t in db_tasks_result.scalars().all()}

    # Fetch DB checkpoints for this month
    db_cps_result = await db.execute(
        select(PlanCheckpoint)
        .where(PlanCheckpoint.month_number == month_number, PlanCheckpoint.is_active == True)  # noqa: E712
        .order_by(PlanCheckpoint.sort_order)
    )
    db_cps = {c.checkpoint_id: c for c in db_cps_result.scalars().all()}

    # Build sections using MONTH_SECTIONS as structure
    sections = []
    section_task_ids_seen: set[str] = set()
    for section_def in MONTH_SECTIONS.get(month_number, []):
        tasks = []
        for tid in section_def["task_ids"]:
            db_task = db_tasks.get(tid)
            if db_task:
                tasks.append({
                    "id": db_task.task_id,
                    "title": db_task.title,
                    "skill_type": db_task.skill_type,
                    "frequency": db_task.frequency,
                    "xp": db_task.xp,
                    "completed": db_task.task_id in completed_ids,
                    "is_custom": db_task.is_custom,
                    "sort_order": db_task.sort_order,
                })
                section_task_ids_seen.add(tid)
        sections.append({
            "id": section_def["id"],
            "title": section_def["title"],
            "skillType": section_def["skill_type"],
            "tasks": tasks,
        })

    # Custom tasks not in any section
    custom_tasks = [
        {
            "id": t.task_id, "title": t.title, "skill_type": t.skill_type,
            "frequency": t.frequency, "xp": t.xp,
            "completed": t.task_id in completed_ids, "is_custom": t.is_custom,
            "sort_order": t.sort_order,
        }
        for t in db_tasks.values()
        if t.task_id not in section_task_ids_seen and t.is_custom
    ]
    if custom_tasks:
        sections.append({"id": "custom", "title": "Custom Tasks", "skillType": "project", "tasks": custom_tasks})

    # Checkpoints
    checkpoints = [
        {
            "id": c.checkpoint_id, "title": c.title, "skill_type": c.skill_type,
            "xp_reward": c.xp_reward, "completed": c.checkpoint_id in completed_cps,
            "is_custom": c.is_custom,
        }
        for c in db_cps.values()
    ]

    # Habits (all active habits for this month based on starts_at_month)
    db_habits_result = await db.execute(
        select(PlanHabit)
        .where(PlanHabit.is_active == True)  # noqa: E712
        .order_by(PlanHabit.sort_order)
    )
    habits = [
        {
            "id": h.habit_id, "title": h.title, "skill_type": h.skill_type,
            "xp_per_completion": h.xp_per_completion, "starts_at_month": h.starts_at_month,
            "is_custom": h.is_custom,
        }
        for h in db_habits_result.scalars().all()
        if h.starts_at_month is None or h.starts_at_month <= month_number
    ]

    reward = CHAPTER_REWARDS.get(month_number, {})
    return {
        "monthNumber": month_number,
        "subtitle": MONTH_SUBTITLES.get(month_number, ""),
        "sections": sections,
        "checkpoints": checkpoints,
        "habits": habits,
        "chapterReward": {
            "title": reward.get("title", ""),
            "icon": reward.get("icon", ""),
            "xp_bonus": reward.get("xp_bonus", 0),
        },
    }


@app.patch("/plan/task/{task_id}", response_model=PlanTaskOut)
async def update_plan_task(task_id: str, body: PlanTaskUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlanTask).where(PlanTask.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")

    if body.title is not None:
        task.title = body.title
    if body.xp is not None:
        task.xp = body.xp
    if body.frequency is not None:
        task.frequency = body.frequency
    if body.skill_type is not None:
        task.skill_type = body.skill_type
    if body.month_number is not None:
        task.month_number = body.month_number
    task.is_custom = True

    await db.commit()
    await db.refresh(task)
    return PlanTaskOut.model_validate(task)


@app.post("/plan/task", response_model=PlanTaskOut)
async def create_plan_task(body: PlanTaskCreate, db: AsyncSession = Depends(get_db)):
    import secrets
    task_id = f"custom_{secrets.token_urlsafe(8)}"

    # Find current max sort_order for this month
    result = await db.execute(
        select(PlanTask)
        .where(PlanTask.month_number == body.month_number)
        .order_by(PlanTask.sort_order.desc())
        .limit(1)
    )
    last = result.scalar_one_or_none()
    sort_order = (last.sort_order + 1) if last else 0

    task = PlanTask(
        task_id=task_id,
        title=body.title,
        skill_type=body.skill_type,
        frequency=body.frequency,
        xp=body.xp,
        month_number=body.month_number,
        sort_order=sort_order,
        is_active=True,
        is_custom=True,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # If section_id provided, add to section
    if body.section_id:
        existing_st = await db.execute(
            select(PlanSectionTask)
            .where(
                PlanSectionTask.section_id == body.section_id,
                PlanSectionTask.task_id == task_id,
            )
        )
        if not existing_st.scalar_one_or_none():
            db.add(PlanSectionTask(section_id=body.section_id, task_id=task_id, sort_order=sort_order))
            await db.commit()

    return PlanTaskOut.model_validate(task)


@app.delete("/plan/task/{task_id}")
async def delete_plan_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlanTask).where(PlanTask.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
    task.is_active = False
    await db.commit()
    return {"deleted": True, "task_id": task_id}


@app.post("/plan/task/{task_id}/restore")
async def restore_plan_task(task_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlanTask).where(PlanTask.task_id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
    task.is_active = True
    await db.commit()
    return {"restored": True, "task_id": task_id}


# ── Plan Studio — Checkpoint CRUD ─────────────────────────────────────────────

@app.patch("/plan/checkpoint/{checkpoint_id}", response_model=PlanCheckpointOut)
async def update_plan_checkpoint(checkpoint_id: str, body: PlanCheckpointUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlanCheckpoint).where(PlanCheckpoint.checkpoint_id == checkpoint_id))
    cp = result.scalar_one_or_none()
    if not cp:
        raise HTTPException(status_code=404, detail=f"Checkpoint '{checkpoint_id}' not found")

    if body.title is not None:
        cp.title = body.title
    if body.xp_reward is not None:
        cp.xp_reward = body.xp_reward
    if body.skill_type is not None:
        cp.skill_type = body.skill_type
    if body.month_number is not None:
        cp.month_number = body.month_number
    cp.is_custom = True

    await db.commit()
    await db.refresh(cp)
    return PlanCheckpointOut.model_validate(cp)


@app.post("/plan/checkpoint", response_model=PlanCheckpointOut)
async def create_plan_checkpoint(body: PlanCheckpointCreate, db: AsyncSession = Depends(get_db)):
    import secrets
    cp_id = f"custom_cp_{secrets.token_urlsafe(6)}"
    cp = PlanCheckpoint(
        checkpoint_id=cp_id,
        title=body.title,
        skill_type=body.skill_type,
        xp_reward=body.xp_reward,
        month_number=body.month_number,
        is_active=True,
        is_custom=True,
    )
    db.add(cp)
    await db.commit()
    await db.refresh(cp)
    return PlanCheckpointOut.model_validate(cp)


@app.delete("/plan/checkpoint/{checkpoint_id}")
async def delete_plan_checkpoint(checkpoint_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlanCheckpoint).where(PlanCheckpoint.checkpoint_id == checkpoint_id))
    cp = result.scalar_one_or_none()
    if not cp:
        raise HTTPException(status_code=404, detail=f"Checkpoint '{checkpoint_id}' not found")
    cp.is_active = False
    await db.commit()
    return {"deleted": True, "checkpoint_id": checkpoint_id}


# ── Plan Studio — Habit CRUD ───────────────────────────────────────────────────

@app.patch("/plan/habit/{habit_id}", response_model=PlanHabitOut)
async def update_plan_habit(habit_id: str, body: PlanHabitUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlanHabit).where(PlanHabit.habit_id == habit_id))
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=404, detail=f"Habit '{habit_id}' not found")

    if body.title is not None:
        habit.title = body.title
    if body.xp_per_completion is not None:
        habit.xp_per_completion = body.xp_per_completion
    if body.skill_type is not None:
        habit.skill_type = body.skill_type
    if body.starts_at_month is not None:
        habit.starts_at_month = body.starts_at_month
    habit.is_custom = True

    await db.commit()
    await db.refresh(habit)
    return PlanHabitOut.model_validate(habit)


@app.post("/plan/habit", response_model=PlanHabitOut)
async def create_plan_habit(body: PlanHabitCreate, db: AsyncSession = Depends(get_db)):
    import secrets
    habit_id = f"custom_habit_{secrets.token_urlsafe(6)}"
    habit = PlanHabit(
        habit_id=habit_id,
        title=body.title,
        skill_type=body.skill_type,
        xp_per_completion=body.xp_per_completion,
        starts_at_month=body.starts_at_month,
        is_active=True,
        is_custom=True,
    )
    db.add(habit)
    await db.commit()
    await db.refresh(habit)
    return PlanHabitOut.model_validate(habit)


@app.delete("/plan/habit/{habit_id}")
async def delete_plan_habit(habit_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(PlanHabit).where(PlanHabit.habit_id == habit_id))
    habit = result.scalar_one_or_none()
    if not habit:
        raise HTTPException(status_code=404, detail=f"Habit '{habit_id}' not found")
    habit.is_active = False
    await db.commit()
    return {"deleted": True, "habit_id": habit_id}


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

    yesterday = today - datetime.timedelta(days=1)
    effective_streak = (
        state.streak_current
        if state.last_checkin_date in (today, yesterday)
        else 0
    )

    return StreakStatusResponse(
        streak=effective_streak,
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


# ── Habit activity heatmap ────────────────────────────────────────────────────

@app.get("/activity-habits", response_model=list[HabitActivityDay])
async def get_habit_activity(days: int = 180, db: AsyncSession = Depends(get_db)):
    since = datetime.date.today() - datetime.timedelta(days=days)

    # Fetch all completed habit logs in range
    hl_result = await db.execute(
        select(HabitLog).where(
            HabitLog.logged_date >= since,
            HabitLog.completed == True,  # noqa: E712
        )
    )
    habit_rows = hl_result.scalars().all()

    # Get current month to determine which habits are available
    user_state = await crud.get_user_state(db)
    current_month = user_state.current_month if user_state else 1

    habits_total = sum(
        1 for h in HABITS.values()
        if h.get("starts_at_month") is None or h["starts_at_month"] <= current_month
    )

    # Aggregate completed habit counts by date
    from collections import defaultdict
    day_done: dict[str, set] = defaultdict(set)
    for hl in habit_rows:
        day_done[hl.logged_date.isoformat()].add(hl.habit_id)

    result = []
    current = since
    today = datetime.date.today()
    while current <= today:
        d = current.isoformat()
        result.append(HabitActivityDay(
            date=d,
            habits_done=len(day_done.get(d, set())),
            habits_total=habits_total,
        ))
        current += datetime.timedelta(days=1)

    return result


# ── Activity feed (recent events across tasks, checkpoints, habits) ───────────

@app.get("/activity-feed")
async def get_activity_feed(limit: int = 10, db: AsyncSession = Depends(get_db)):
    """Return the N most recent completions across tasks, checkpoints, and habits."""
    tc_result = await db.execute(
        select(TaskCompletion).order_by(TaskCompletion.completed_at.desc()).limit(limit * 3)
    )
    task_rows = tc_result.scalars().all()

    cc_result = await db.execute(
        select(CheckpointCompletion).order_by(CheckpointCompletion.completed_at.desc()).limit(limit)
    )
    cp_rows = cc_result.scalars().all()

    hl_result = await db.execute(
        select(HabitLog)
        .where(HabitLog.completed == True)  # noqa: E712
        .order_by(HabitLog.logged_date.desc())
        .limit(limit)
    )
    habit_rows = hl_result.scalars().all()

    events = []

    for tc in task_rows:
        task = TASKS.get(tc.task_id)
        if task:
            events.append({
                "type": "task",
                "title": task["title"],
                "skill_type": task["skill_type"],
                "xp": task["xp"],
                "ts": tc.completed_at.isoformat(),
            })

    for cc in cp_rows:
        cp = CHECKPOINTS.get(cc.checkpoint_id)
        if cp:
            events.append({
                "type": "checkpoint",
                "title": cp["title"],
                "skill_type": cp["skill_type"],
                "xp": cp["xp_reward"],
                "ts": cc.completed_at.isoformat(),
            })

    for hl in habit_rows:
        habit = HABITS.get(hl.habit_id)
        if habit:
            ts = datetime.datetime.combine(
                hl.logged_date, datetime.time(12, 0), tzinfo=datetime.timezone.utc
            )
            events.append({
                "type": "habit",
                "title": habit["title"],
                "skill_type": habit["skill_type"],
                "xp": habit["xp_per_completion"],
                "ts": ts.isoformat(),
            })

    events.sort(key=lambda e: e["ts"], reverse=True)
    return events[:limit]


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
