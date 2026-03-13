from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column
from database import Base



class UserState(Base):
    __tablename__ = "user_state"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    current_month: Mapped[int] = mapped_column(Integer, default=1)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    streak_current: Mapped[int] = mapped_column(Integer, default=0)
    streak_longest: Mapped[int] = mapped_column(Integer, default=0)
    last_checkin_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    character_level: Mapped[int] = mapped_column(Integer, default=1)


class StatLevel(Base):
    __tablename__ = "stat_levels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    skill_type: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)


class TaskCompletion(Base):
    __tablename__ = "task_completions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CheckpointCompletion(Base):
    __tablename__ = "checkpoint_completions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    checkpoint_id: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class HabitLog(Base):
    __tablename__ = "habit_logs"
    __table_args__ = (UniqueConstraint("habit_id", "logged_date", name="uq_habit_date"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    habit_id: Mapped[str] = mapped_column(String, nullable=False)
    logged_date: Mapped[date] = mapped_column(Date, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    count: Mapped[int] = mapped_column(Integer, default=0)


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    badge_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    icon: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)


# ── Plan data tables (editable via Studio) ────────────────────────────────────

class PlanTask(Base):
    __tablename__ = "plan_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    skill_type: Mapped[str] = mapped_column(String, nullable=False)
    frequency: Mapped[str] = mapped_column(String, nullable=False)  # once | daily | weekly
    xp: Mapped[int] = mapped_column(Integer, nullable=False)
    month_number: Mapped[int] = mapped_column(Integer, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PlanCheckpoint(Base):
    __tablename__ = "plan_checkpoints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    checkpoint_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    skill_type: Mapped[str] = mapped_column(String, nullable=False)
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False)
    month_number: Mapped[int] = mapped_column(Integer, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PlanHabit(Base):
    __tablename__ = "plan_habits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    habit_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    skill_type: Mapped[str] = mapped_column(String, nullable=False)
    xp_per_completion: Mapped[int] = mapped_column(Integer, nullable=False)
    starts_at_month: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_custom: Mapped[bool] = mapped_column(Boolean, default=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PlanSection(Base):
    __tablename__ = "plan_sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    section_id: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    skill_type: Mapped[str] = mapped_column(String, nullable=False)
    month_number: Mapped[int] = mapped_column(Integer, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class PlanSectionTask(Base):
    __tablename__ = "plan_section_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    section_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    task_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class TaskDayAssignment(Base):
    """Stores which day of the week a user has manually assigned a task to.

    - weekly tasks:  week_start = actual Monday of the target week (resets each week)
    - once tasks:    week_start = date(9999, 1, 1) as a permanent marker
    Unique per (task_id, week_start) so upsert works cleanly.
    day_offset:  0=Mon … 6=Sun
    """
    __tablename__ = "task_day_assignments"
    __table_args__ = (UniqueConstraint("task_id", "week_start", name="uq_task_week_assign"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    task_id: Mapped[str] = mapped_column(String, nullable=False)
    week_start: Mapped[date] = mapped_column(Date, nullable=False)
    day_offset: Mapped[int] = mapped_column(Integer, nullable=False)  # 0=Mon … 6=Sun
