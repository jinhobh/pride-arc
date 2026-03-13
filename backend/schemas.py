from datetime import date, datetime
from pydantic import BaseModel


# ── Request bodies ────────────────────────────────────────────────────────────

class TaskCompleteRequest(BaseModel):
    task_id: str


class CheckpointCompleteRequest(BaseModel):
    checkpoint_id: str


class HabitLogRequest(BaseModel):
    habit_id: str
    date: date
    completed: bool
    count: int = 1  # how many completions (e.g. 4 leetcode problems)


# ── Response models ───────────────────────────────────────────────────────────

class StatLevelOut(BaseModel):
    skill_type: str
    xp: int
    level: int
    icon: str
    label: str

    model_config = {"from_attributes": True}


class BadgeOut(BaseModel):
    badge_id: str
    earned_at: datetime
    icon: str
    title: str
    description: str

    model_config = {"from_attributes": True}


class StateResponse(BaseModel):
    current_month: int
    total_xp: int
    character_level: int
    streak_current: int
    streak_longest: int
    last_checkin_date: date | None
    stats: list[StatLevelOut]
    completed_task_ids: list[str]
    completed_checkpoint_ids: list[str]
    badges: list[BadgeOut]


class TaskCompleteResponse(BaseModel):
    xp_awarded: int
    new_total_xp: int
    character_level: int
    skill: StatLevelOut
    chapter_unlocked: bool
    chapter_badge: BadgeOut | None = None


class TaskUncompleteResponse(BaseModel):
    xp_revoked: int
    new_total_xp: int
    character_level: int
    skill: StatLevelOut


class CheckpointCompleteResponse(BaseModel):
    xp_awarded: int
    new_total_xp: int
    character_level: int
    skill: StatLevelOut
    chapter_unlocked: bool
    chapter_badge: BadgeOut | None = None


class HabitLogResponse(BaseModel):
    habit_id: str
    date: date
    completed: bool
    count: int
    xp_delta: int


class HabitStatusItem(BaseModel):
    habit_id: str
    title: str
    skill_type: str
    xp_per_completion: int
    completed: bool
    count: int
    logged: bool


class CheckinResponse(BaseModel):
    streak_current: int
    streak_longest: int
    last_checkin_date: date
    was_no_op: bool


class MonthProgress(BaseModel):
    month_number: int
    tasks_completed: int
    tasks_total: int
    checkpoints_completed: int
    checkpoints_total: int
    completion_pct: float


class SkillProgress(BaseModel):
    skill_type: str
    label: str
    icon: str
    xp: int
    level: int


class ProgressResponse(BaseModel):
    total_xp: int
    character_level: int
    tasks_completed: int
    tasks_total: int
    months: list[MonthProgress]
    skills: list[SkillProgress]


# ── Activity & Weekly Summary ─────────────────────────────────────────────────

class ActivityDay(BaseModel):
    date: str
    total_xp: int
    dominant_skill: str | None


class WeeklySkillXP(BaseModel):
    skill_type: str
    label: str
    icon: str
    xp: int


class WeeklySummaryResponse(BaseModel):
    total_xp: int
    problems_solved: int
    days_active: int
    skill_breakdown: list[WeeklySkillXP]


class StreakStatusResponse(BaseModel):
    streak: int
    longest: int
    checked_in_today: bool
    days_missed: int


# ── Plan Studio schemas ───────────────────────────────────────────────────────

class PlanTaskOut(BaseModel):
    task_id: str
    title: str
    skill_type: str
    frequency: str
    xp: int
    month_number: int
    sort_order: int
    is_active: bool
    is_custom: bool

    model_config = {"from_attributes": True}


class PlanTaskCreate(BaseModel):
    title: str
    skill_type: str
    frequency: str
    xp: int
    month_number: int
    section_id: str | None = None


class PlanTaskUpdate(BaseModel):
    title: str | None = None
    skill_type: str | None = None
    frequency: str | None = None
    xp: int | None = None
    month_number: int | None = None


class PlanCheckpointOut(BaseModel):
    checkpoint_id: str
    title: str
    skill_type: str
    xp_reward: int
    month_number: int
    sort_order: int
    is_active: bool
    is_custom: bool

    model_config = {"from_attributes": True}


class PlanCheckpointCreate(BaseModel):
    title: str
    skill_type: str
    xp_reward: int
    month_number: int


class PlanCheckpointUpdate(BaseModel):
    title: str | None = None
    skill_type: str | None = None
    xp_reward: int | None = None
    month_number: int | None = None


class PlanHabitOut(BaseModel):
    habit_id: str
    title: str
    skill_type: str
    xp_per_completion: int
    starts_at_month: int | None
    sort_order: int
    is_active: bool
    is_custom: bool

    model_config = {"from_attributes": True}


class PlanHabitCreate(BaseModel):
    title: str
    skill_type: str
    xp_per_completion: int
    starts_at_month: int | None = None


class PlanHabitUpdate(BaseModel):
    title: str | None = None
    skill_type: str | None = None
    xp_per_completion: int | None = None
    starts_at_month: int | None = None


class AssignDayRequest(BaseModel):
    day_offset: int  # 0=Mon … 6=Sun; -1 = remove (reset to default)


class MissedTaskOut(BaseModel):
    id: str
    title: str
    xp: int
    skill_type: str
    month_number: int


class PaceResponse(BaseModel):
    arc_day: int
    arc_total_days: int
    expected_xp_today: int
    earned_xp: int
    delta_xp: int
    status: str  # "On Track" | "Behind" | "Ahead"
    total_arc_xp: int
    missed_tasks: list[MissedTaskOut] = []
