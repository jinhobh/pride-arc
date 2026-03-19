import datetime
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert

from models import Badge, CheckpointCompletion, HabitLog, PlanCheckpoint, PlanHabit, PlanSection, PlanSectionTask, PlanTask, StatLevel, TaskCompletion, UserState
from plan_data import (
    CHAPTER_REWARDS,
    CHECKPOINTS,
    HABITS,
    INITIAL_STATS,
    MONTH_SECTIONS,
    TASKS,
    calc_char_level,
    calc_skill_level,
)
from schemas import BadgeOut, StatLevelOut


# ── DB plan-data helpers ─────────────────────────────────────────────────────
# These replace direct reads from plan_data.py so that Studio edits propagate.

async def get_all_active_tasks(db: AsyncSession) -> dict[str, dict]:
    """Return all active tasks from DB as {task_id: dict} matching plan_data format."""
    result = await db.execute(
        select(PlanTask).where(PlanTask.is_active == True)  # noqa: E712
    )
    return {
        t.task_id: {
            "id": t.task_id, "title": t.title, "skill_type": t.skill_type,
            "frequency": t.frequency, "xp": t.xp, "month_number": t.month_number,
        }
        for t in result.scalars().all()
    }


async def get_all_active_checkpoints(db: AsyncSession) -> dict[str, dict]:
    """Return all active checkpoints from DB as {checkpoint_id: dict}."""
    result = await db.execute(
        select(PlanCheckpoint).where(PlanCheckpoint.is_active == True)  # noqa: E712
    )
    return {
        c.checkpoint_id: {
            "id": c.checkpoint_id, "title": c.title, "skill_type": c.skill_type,
            "xp_reward": c.xp_reward, "month_number": c.month_number,
        }
        for c in result.scalars().all()
    }


async def get_checkpoints_by_month(db: AsyncSession) -> dict[int, list[str]]:
    """Return {month_number: [checkpoint_id, ...]} from DB."""
    result = await db.execute(
        select(PlanCheckpoint).where(PlanCheckpoint.is_active == True)  # noqa: E712
    )
    by_month: dict[int, list[str]] = {}
    for c in result.scalars().all():
        by_month.setdefault(c.month_number, []).append(c.checkpoint_id)
    return by_month


async def get_all_active_habits(db: AsyncSession) -> dict[str, dict]:
    """Return all active habits from DB as {habit_id: dict}."""
    result = await db.execute(
        select(PlanHabit).where(PlanHabit.is_active == True)  # noqa: E712
    )
    return {
        h.habit_id: {
            "id": h.habit_id, "title": h.title, "skill_type": h.skill_type,
            "xp_per_completion": h.xp_per_completion,
            "starts_at_month": h.starts_at_month,
        }
        for h in result.scalars().all()
    }


async def get_tasks_by_month(db: AsyncSession) -> dict[int, list[str]]:
    """Return {month_number: [task_id, ...]} from DB."""
    result = await db.execute(
        select(PlanTask).where(PlanTask.is_active == True)  # noqa: E712
    )
    by_month: dict[int, list[str]] = {}
    for t in result.scalars().all():
        by_month.setdefault(t.month_number, []).append(t.task_id)
    return by_month


async def get_task_by_id(db: AsyncSession, task_id: str) -> dict | None:
    """Look up a single active task from DB."""
    result = await db.execute(
        select(PlanTask).where(PlanTask.task_id == task_id, PlanTask.is_active == True)  # noqa: E712
    )
    row = result.scalar_one_or_none()
    if row:
        return {
            "id": row.task_id, "title": row.title, "skill_type": row.skill_type,
            "frequency": row.frequency, "xp": row.xp, "month_number": row.month_number,
        }
    return None


async def get_checkpoint_by_id(db: AsyncSession, checkpoint_id: str) -> dict | None:
    """Look up a single active checkpoint from DB."""
    result = await db.execute(
        select(PlanCheckpoint).where(
            PlanCheckpoint.checkpoint_id == checkpoint_id,
            PlanCheckpoint.is_active == True  # noqa: E712
        )
    )
    row = result.scalar_one_or_none()
    if row:
        return {
            "id": row.checkpoint_id, "title": row.title, "skill_type": row.skill_type,
            "xp_reward": row.xp_reward, "month_number": row.month_number,
        }
    return None


async def get_habit_by_id(db: AsyncSession, habit_id: str) -> dict | None:
    """Look up a single active habit from DB."""
    result = await db.execute(
        select(PlanHabit).where(
            PlanHabit.habit_id == habit_id,
            PlanHabit.is_active == True  # noqa: E712
        )
    )
    row = result.scalar_one_or_none()
    if row:
        return {
            "id": row.habit_id, "title": row.title, "skill_type": row.skill_type,
            "xp_per_completion": row.xp_per_completion,
            "starts_at_month": row.starts_at_month,
        }
    return None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _enrich_stat(row: StatLevel) -> StatLevelOut:
    info = INITIAL_STATS[row.skill_type]
    return StatLevelOut(
        skill_type=row.skill_type,
        xp=row.xp,
        level=row.level,
        icon=info["icon"],
        label=info["label"],
    )


def _badge_out(row: Badge) -> BadgeOut:
    return BadgeOut(
        badge_id=row.badge_id,
        earned_at=row.earned_at,
        icon=row.icon,
        title=row.title,
        description=row.description,
    )


async def _update_xp(
    db: AsyncSession,
    skill_type: str,
    xp_delta: int,
) -> StatLevel:
    """Add xp_delta to a StatLevel row, recalculate level, return updated row."""
    result = await db.execute(select(StatLevel).where(StatLevel.skill_type == skill_type))
    stat = result.scalar_one()
    stat.xp = max(0, stat.xp + xp_delta)
    stat.level = calc_skill_level(stat.xp)
    return stat


async def _update_total_xp(db: AsyncSession, xp_delta: int) -> UserState:
    """Add xp_delta to user_state.total_xp, recalculate character_level, return row."""
    state = await get_user_state(db)
    assert state is not None
    state.total_xp = max(0, state.total_xp + xp_delta)
    state.character_level = calc_char_level(state.total_xp)
    return state


async def _check_chapter_unlock(
    db: AsyncSession,
    month_number: int,
) -> tuple[bool, Badge | None]:
    """
    Check if all checkpoints in month_number are complete and the chapter badge
    hasn't been awarded yet. If so, award it and return (True, badge_row).
    Otherwise return (False, None).
    """
    reward = CHAPTER_REWARDS[month_number]
    badge_id = reward["badge_id"]

    # Already earned?
    existing = await db.execute(select(Badge).where(Badge.badge_id == badge_id))
    if existing.scalar_one_or_none():
        return False, None

    # All checkpoints done? (read from DB so Studio edits are respected)
    cps_by_month = await get_checkpoints_by_month(db)
    cp_ids = cps_by_month.get(month_number, [])
    if not cp_ids:
        return False, None
    result = await db.execute(
        select(CheckpointCompletion.checkpoint_id).where(
            CheckpointCompletion.checkpoint_id.in_(cp_ids)
        )
    )
    done_ids = {row[0] for row in result.fetchall()}
    if set(cp_ids) != done_ids:
        return False, None

    # Award chapter badge + bonus XP
    badge = Badge(
        badge_id=badge_id,
        icon=reward["icon"],
        title=reward["title"],
        description=reward["description"],
    )
    db.add(badge)
    await db.flush()  # populate badge.id / earned_at via server defaults
    await db.refresh(badge)

    first_cp = await get_checkpoint_by_id(db, cp_ids[0])
    await _update_xp(db, first_cp["skill_type"] if first_cp else "project", 0)  # no-op to keep flush chain
    await _update_total_xp(db, reward["xp_bonus"])

    return True, badge


# ── Reads ─────────────────────────────────────────────────────────────────────

async def get_user_state(db: AsyncSession) -> UserState | None:
    result = await db.execute(select(UserState))
    return result.scalar_one_or_none()


async def get_stat_levels(db: AsyncSession) -> list[StatLevel]:
    result = await db.execute(select(StatLevel))
    return list(result.scalars().all())


async def get_completed_task_ids(db: AsyncSession) -> list[str]:
    result = await db.execute(select(TaskCompletion.task_id))
    return [row[0] for row in result.fetchall()]


async def get_completed_checkpoint_ids(db: AsyncSession) -> list[str]:
    result = await db.execute(select(CheckpointCompletion.checkpoint_id))
    return [row[0] for row in result.fetchall()]


async def get_badges(db: AsyncSession) -> list[Badge]:
    result = await db.execute(select(Badge))
    return list(result.scalars().all())


async def get_habit_logs_for_date(db: AsyncSession, target_date: datetime.date) -> list[HabitLog]:
    result = await db.execute(
        select(HabitLog).where(HabitLog.logged_date == target_date)
    )
    return list(result.scalars().all())


async def get_habit_log(
    db: AsyncSession, habit_id: str, target_date: datetime.date
) -> HabitLog | None:
    result = await db.execute(
        select(HabitLog).where(
            HabitLog.habit_id == habit_id,
            HabitLog.logged_date == target_date,
        )
    )
    return result.scalar_one_or_none()


# ── Seed / init ───────────────────────────────────────────────────────────────

async def create_initial_state(db: AsyncSession) -> UserState:
    state = UserState(
        current_month=1,
        total_xp=0,
        streak_current=0,
        streak_longest=0,
        last_checkin_date=None,
        character_level=1,
    )
    db.add(state)
    return state


async def seed_stat_levels(db: AsyncSession) -> list[StatLevel]:
    rows = []
    for skill_type, info in INITIAL_STATS.items():
        row = StatLevel(skill_type=skill_type, xp=info["xp"], level=info["level"])
        db.add(row)
        rows.append(row)
    return rows


async def seed_plan_data(db: AsyncSession) -> None:
    """Seed plan_tasks, plan_checkpoints, plan_habits, plan_sections, plan_section_tasks.
    Uses ON CONFLICT DO NOTHING so edits made via Studio are never overwritten."""

    # Tasks
    for i, (task_id, task) in enumerate(TASKS.items()):
        stmt = (
            pg_insert(PlanTask)
            .values(
                task_id=task["id"],
                title=task["title"],
                skill_type=task["skill_type"],
                frequency=task["frequency"],
                xp=task["xp"],
                month_number=task["month_number"],
                sort_order=i,
                is_active=True,
                is_custom=False,
            )
            .on_conflict_do_nothing(index_elements=["task_id"])
        )
        await db.execute(stmt)

    # Checkpoints
    for i, (cp_id, cp) in enumerate(CHECKPOINTS.items()):
        stmt = (
            pg_insert(PlanCheckpoint)
            .values(
                checkpoint_id=cp["id"],
                title=cp["title"],
                skill_type=cp["skill_type"],
                xp_reward=cp["xp_reward"],
                month_number=cp["month_number"],
                sort_order=i,
                is_active=True,
                is_custom=False,
            )
            .on_conflict_do_nothing(index_elements=["checkpoint_id"])
        )
        await db.execute(stmt)

    # Habits
    for i, (habit_id, habit) in enumerate(HABITS.items()):
        stmt = (
            pg_insert(PlanHabit)
            .values(
                habit_id=habit["id"],
                title=habit["title"],
                skill_type=habit["skill_type"],
                xp_per_completion=habit["xp_per_completion"],
                starts_at_month=habit.get("starts_at_month"),
                sort_order=i,
                is_active=True,
                is_custom=False,
            )
            .on_conflict_do_nothing(index_elements=["habit_id"])
        )
        await db.execute(stmt)

    # Sections + section-task join rows
    task_counter = 0
    for month_num, sections in MONTH_SECTIONS.items():
        for s_idx, section_def in enumerate(sections):
            stmt = (
                pg_insert(PlanSection)
                .values(
                    section_id=section_def["id"],
                    title=section_def["title"],
                    skill_type=section_def["skill_type"],
                    month_number=month_num,
                    sort_order=s_idx,
                )
                .on_conflict_do_nothing(index_elements=["section_id"])
            )
            await db.execute(stmt)

            for t_idx, task_id in enumerate(section_def["task_ids"]):
                # Use a composite unique check: if (section_id, task_id) not already there
                existing = await db.execute(
                    select(PlanSectionTask).where(
                        PlanSectionTask.section_id == section_def["id"],
                        PlanSectionTask.task_id == task_id,
                    )
                )
                if not existing.scalar_one_or_none():
                    db.add(PlanSectionTask(
                        section_id=section_def["id"],
                        task_id=task_id,
                        sort_order=t_idx,
                    ))
            task_counter += 1

    await db.commit()



# ── Task operations ───────────────────────────────────────────────────────────

async def complete_task(
    db: AsyncSession, task_id: str, task_data: dict | None = None
) -> tuple[int, StatLevelOut, int, int, bool, BadgeOut | None]:
    """
    Returns: (xp_awarded, stat_out, new_total_xp, new_char_level, chapter_unlocked, chapter_badge)
    """
    task = task_data or await get_task_by_id(db, task_id)
    if not task:
        task = TASKS[task_id]  # fallback to static data
    xp = task["xp"]

    db.add(TaskCompletion(task_id=task_id))
    stat = await _update_xp(db, task["skill_type"], xp)
    state = await _update_total_xp(db, xp)
    await db.flush()

    chapter_unlocked, chapter_badge = await _check_chapter_unlock(db, task["month_number"])
    await db.commit()

    # Re-fetch state after potential chapter XP bonus
    await db.refresh(state)
    await db.refresh(stat)

    badge_out = _badge_out(chapter_badge) if chapter_badge else None
    return xp, _enrich_stat(stat), state.total_xp, state.character_level, chapter_unlocked, badge_out


async def uncomplete_task(
    db: AsyncSession, task_id: str, task_data: dict | None = None
) -> tuple[int, StatLevelOut, int, int]:
    """
    Deletes the most recent TaskCompletion for task_id, reverses XP.
    Returns: (xp_revoked, stat_out, new_total_xp, new_char_level)
    """
    task = task_data or await get_task_by_id(db, task_id)
    if not task:
        task = TASKS[task_id]  # fallback to static data
    xp = task["xp"]

    # Delete most recent completion
    result = await db.execute(
        select(TaskCompletion)
        .where(TaskCompletion.task_id == task_id)
        .order_by(TaskCompletion.id.desc())
        .limit(1)
    )
    row = result.scalar_one()
    await db.delete(row)

    stat = await _update_xp(db, task["skill_type"], -xp)
    state = await _update_total_xp(db, -xp)
    await db.commit()
    await db.refresh(stat)
    await db.refresh(state)

    return xp, _enrich_stat(stat), state.total_xp, state.character_level


# ── Checkpoint operations ─────────────────────────────────────────────────────

async def complete_checkpoint(
    db: AsyncSession, checkpoint_id: str
) -> tuple[int, StatLevelOut, int, int, bool, BadgeOut | None]:
    """
    Returns: (xp_awarded, stat_out, new_total_xp, new_char_level, chapter_unlocked, chapter_badge)
    """
    cp = await get_checkpoint_by_id(db, checkpoint_id)
    if not cp:
        cp = CHECKPOINTS[checkpoint_id]  # fallback to static data
    xp = cp["xp_reward"]

    db.add(CheckpointCompletion(checkpoint_id=checkpoint_id))
    stat = await _update_xp(db, cp["skill_type"], xp)
    state = await _update_total_xp(db, xp)
    await db.flush()

    chapter_unlocked, chapter_badge = await _check_chapter_unlock(db, cp["month_number"])
    await db.commit()

    await db.refresh(state)
    await db.refresh(stat)

    badge_out = _badge_out(chapter_badge) if chapter_badge else None
    return xp, _enrich_stat(stat), state.total_xp, state.character_level, chapter_unlocked, badge_out


# ── Habit operations ──────────────────────────────────────────────────────────

async def upsert_habit_log(
    db: AsyncSession, habit_id: str, log_date: datetime.date,
    completed: bool, count: int = 1
) -> tuple[bool, int, int]:
    """
    Upsert a HabitLog row. Returns (new_completed_state, new_count, xp_delta).
    count = number of completions (e.g. 4 leetcode problems).
    XP = xp_per_completion * count.
    """
    habit = await get_habit_by_id(db, habit_id)
    if not habit:
        habit = HABITS[habit_id]  # fallback to static data
    xp_per = habit["xp_per_completion"]

    existing = await get_habit_log(db, habit_id, log_date)

    old_count = existing.count if existing else 0
    new_count = count if completed else 0

    xp_delta = (new_count - old_count) * xp_per

    # Upsert via PostgreSQL INSERT ... ON CONFLICT DO UPDATE
    stmt = (
        pg_insert(HabitLog)
        .values(habit_id=habit_id, logged_date=log_date, completed=completed, count=new_count)
        .on_conflict_do_update(
            constraint="uq_habit_date",
            set_={"completed": completed, "count": new_count},
        )
    )
    await db.execute(stmt)

    if xp_delta != 0:
        await _update_xp(db, habit["skill_type"], xp_delta)
        await _update_total_xp(db, xp_delta)

    await db.commit()
    return completed, new_count, xp_delta


# ── Check-in ──────────────────────────────────────────────────────────────────

async def record_checkin(db: AsyncSession) -> tuple[int, int, datetime.date, bool]:
    """
    Records today's check-in (UTC). Updates streak.
    Returns: (streak_current, streak_longest, today, was_no_op)
    """
    today = datetime.date.today()
    state = await get_user_state(db)
    assert state is not None

    if state.last_checkin_date == today:
        return state.streak_current, state.streak_longest, today, True

    yesterday = today - datetime.timedelta(days=1)
    if state.last_checkin_date == yesterday:
        state.streak_current += 1
    else:
        state.streak_current = 1

    state.streak_longest = max(state.streak_longest, state.streak_current)
    state.last_checkin_date = today

    await db.commit()
    await db.refresh(state)
    return state.streak_current, state.streak_longest, today, False


# ── Progress ──────────────────────────────────────────────────────────────────

async def get_progress(db: AsyncSession) -> dict:
    state = await get_user_state(db)
    assert state is not None

    completed_task_ids = set(await get_completed_task_ids(db))
    completed_cp_ids = set(await get_completed_checkpoint_ids(db))
    stats = await get_stat_levels(db)

    # Read from DB so Studio edits are reflected
    db_tasks_by_month = await get_tasks_by_month(db)
    db_cps_by_month = await get_checkpoints_by_month(db)

    months = []
    for m in range(1, 7):
        month_task_ids = db_tasks_by_month.get(m, [])
        month_cp_ids = db_cps_by_month.get(m, [])

        tasks_done = sum(1 for tid in month_task_ids if tid in completed_task_ids)
        cps_done = sum(1 for cid in month_cp_ids if cid in completed_cp_ids)
        total_items = len(month_task_ids) + len(month_cp_ids)
        done_items = tasks_done + cps_done
        pct = round(done_items / total_items * 100, 1) if total_items else 0.0

        months.append({
            "month_number": m,
            "tasks_completed": tasks_done,
            "tasks_total": len(month_task_ids),
            "checkpoints_completed": cps_done,
            "checkpoints_total": len(month_cp_ids),
            "completion_pct": pct,
        })

    skills = [
        {
            "skill_type": s.skill_type,
            "label": INITIAL_STATS[s.skill_type]["label"],
            "icon": INITIAL_STATS[s.skill_type]["icon"],
            "xp": s.xp,
            "level": s.level,
        }
        for s in stats
    ]

    return {
        "total_xp": state.total_xp,
        "character_level": state.character_level,
        "tasks_completed": len(completed_task_ids),
        "tasks_total": sum(len(ids) for ids in db_tasks_by_month.values()),
        "months": months,
        "skills": skills,
    }
