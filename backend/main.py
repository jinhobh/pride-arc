import datetime
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

import crud
from database import AsyncSessionLocal, Base, engine, get_db
from models import CheckpointCompletion, TaskCompletion  # noqa: F401 — ensure models are imported so Base sees them
from sqlalchemy import select
from plan_data import CHECKPOINTS, HABITS, TASKS
from schemas import (
    CheckinResponse,
    CheckpointCompleteRequest,
    CheckpointCompleteResponse,
    HabitLogRequest,
    HabitLogResponse,
    HabitStatusItem,
    ProgressResponse,
    StateResponse,
    StatLevelOut,
    TaskCompleteRequest,
    TaskCompleteResponse,
    TaskUncompleteResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

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

    completed, xp_delta = await crud.upsert_habit_log(db, body.habit_id, body.date, body.completed)
    return HabitLogResponse(
        habit_id=body.habit_id,
        date=body.date,
        completed=completed,
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
                logged=log is not None,
            )
        )

    return result


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
