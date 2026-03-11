import { useGameData } from '../hooks/useApi'
import HeaderBar from '../components/HeaderBar'
import BossBanner from '../components/BossBanner'
import StatPanel from '../components/StatPanel'
import QuestChapters from '../components/QuestChapters'
import WeeklyHabits from '../components/WeeklyHabits'
import ActivityHeatmap from '../components/ActivityHeatmap'
import WeeklySummary from '../components/WeeklySummary'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-game-bg flex flex-col items-center justify-center gap-4">
      {/* Pixel spinner */}
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

export default function Dashboard() {
  const {
    state,
    progress,
    todayHabits,
    activity,
    weeklySummary,
    loading,
    error,
    today,
    hasCheckedInToday,
    checkin,
    logHabit,
  } = useGameData()

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />

  return (
    <div className="min-h-screen bg-game-bg">
      <HeaderBar
        state={state}
        hasCheckedIn={hasCheckedInToday}
        onCheckin={checkin}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* 1 — Boss banner */}
        <BossBanner progress={progress} />

        {/* 2 — Character stats */}
        <StatPanel stats={state?.stats} />

        {/* 3 — Monthly quest chapters */}
        <QuestChapters
          progress={progress}
          currentMonth={state?.current_month ?? 1}
        />

        {/* 4 — Weekly habits */}
        <WeeklyHabits
          habits={todayHabits}
          onLogHabit={logHabit}
          today={today}
        />

        {/* 5 — Activity heatmap */}
        <ActivityHeatmap activity={activity} />

        {/* 6 — Weekly summary */}
        <WeeklySummary summary={weeklySummary} />
      </main>

      {/* Footer spacer */}
      <div className="h-16" />
    </div>
  )
}

