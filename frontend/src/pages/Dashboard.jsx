import { useCallback } from 'react'
import { useGameData } from '../hooks/useApi'
import HeaderBar from '../components/HeaderBar'
import CharacterHero from '../components/CharacterHero'
import WeeklyHabits from '../components/WeeklyHabits'
import TaskSection from '../components/TaskSection'
import OnTrackMeter from '../components/OnTrackMeter'
import BossBanner from '../components/BossBanner'
import StatPanel from '../components/StatPanel'
import QuestChapters from '../components/QuestChapters'
import ActivityHeatmap from '../components/ActivityHeatmap'
import WeeklySummary from '../components/WeeklySummary'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-green-400/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-400 animate-spin" />
      </div>
      <span className="font-display text-[9px] uppercase tracking-[0.3em] text-slate-600 animate-pulse">
        Loading...
      </span>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="font-display text-[10px] uppercase tracking-widest text-red-400 neon-text-red">
        Connection Error
      </span>
      <p className="text-xs text-slate-600 font-mono max-w-sm">{message}</p>
      <p className="text-[10px] text-slate-700 font-display uppercase tracking-wider mt-2">
        Make sure the backend is running
      </p>
    </div>
  )
}

const BASE = '/api'

export default function Dashboard() {
  const {
    state,
    progress,
    todayHabits,
    activity,
    weeklySummary,
    streakStatus,
    currentTasks,
    loading,
    error,
    today,
    hasCheckedInToday,
    checkin,
    logHabit,
    refetch,
  } = useGameData()

  // ── Task toggle handler (must be before any early return — React Rules of Hooks)
  const toggleTask = useCallback(async (taskId, completed) => {
    const endpoint = completed ? '/task/complete' : '/task/uncomplete'
    try {
      const res = await fetch(`${BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      })
      if (res.ok) await refetch()
    } catch { /* swallow */ }
  }, [refetch])

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />

  const daysMissed = streakStatus?.days_missed ?? 0

  return (
    <div className="min-h-screen bg-game-bg">
      <HeaderBar
        state={state}
        streakStatus={streakStatus}
        hasCheckedIn={hasCheckedInToday}
        onCheckin={checkin}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ═══ ABOVE THE FOLD: Character + Today's Focus ═══ */}

        {/* 1 — Character avatar centered + level + XP */}
        <CharacterHero
          state={state}
          streakStatus={streakStatus}
          daysMissed={daysMissed}
        />

        {/* 2 — Daily habits (LeetCode counter + checkboxes) */}
        <WeeklyHabits
          habits={todayHabits}
          onLogHabit={logHabit}
          today={today}
        />

        {/* 3 — Daily tasks from current month plan */}
        {currentTasks?.daily?.length > 0 && (
          <TaskSection
            title="Daily Quests"
            icon="⚡"
            tasks={currentTasks.daily}
            onToggle={toggleTask}
          />
        )}

        {/* 4 — Weekly tasks */}
        {currentTasks?.weekly?.length > 0 && (
          <TaskSection
            title="Weekly Quests"
            icon="📅"
            tasks={currentTasks.weekly}
            onToggle={toggleTask}
          />
        )}

        {/* 5 — Monthly goals (one-time tasks) */}
        {currentTasks?.monthly?.length > 0 && (
          <TaskSection
            title="Monthly Goals"
            icon="🎯"
            tasks={currentTasks.monthly}
            onToggle={toggleTask}
          />
        )}

        {/* 6 — On-Track Meter */}
        <OnTrackMeter
          currentTasks={currentTasks}
          todayHabits={todayHabits}
          totalXp={state?.total_xp ?? 0}
        />

        {/* 7 — Boss Banner (total progress) */}
        <BossBanner progress={progress} daysMissed={daysMissed} />

        {/* ═══ BELOW THE FOLD: Detailed views ═══ */}

        {/* Weekly summary */}
        <WeeklySummary summary={weeklySummary} />

        {/* Activity heatmap */}
        <ActivityHeatmap activity={activity} />

        {/* Character stats */}
        <StatPanel stats={state?.stats} daysMissed={daysMissed} />

        {/* Monthly quest chapters */}
        <QuestChapters
          progress={progress}
          currentMonth={state?.current_month ?? 1}
        />
      </main>

      <div className="h-16" />
    </div>
  )
}
