import { useNavigate } from 'react-router-dom'
import { useGameData } from '../hooks/useApi'
import { MONTH_META } from '../constants/planData'
import HeaderBar from '../components/HeaderBar'
import CharacterHero from '../components/CharacterHero'
import WeeklyHabits from '../components/WeeklyHabits'
import OnTrackMeter from '../components/OnTrackMeter'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ghibli-sky flex flex-col items-center justify-center gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-ghibli-forest/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-ghibli-forest animate-spin" />
      </div>
      <span className="font-display text-sm italic text-ghibli-mist animate-pulse">
        Loading...
      </span>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen bg-ghibli-sky flex flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="font-display text-base italic text-red-500 neon-text-red">
        Connection Error
      </span>
      <p className="text-xs text-ghibli-mist font-sans max-w-sm">{message}</p>
      <p className="font-display text-sm italic text-ghibli-mist/70 mt-2">
        Make sure the backend is running
      </p>
    </div>
  )
}

function MonthlyNudge({ currentMonth, currentTasks }) {
  const navigate = useNavigate()
  const meta = MONTH_META[currentMonth]

  const incomplete = [
    ...(currentTasks?.weekly  ?? []),
    ...(currentTasks?.monthly ?? []),
  ].filter(t => !t.completed).length

  const allDone = incomplete === 0

  return (
    <button
      onClick={() => navigate('/plan')}
      className="w-full text-left rounded-xl border border-ghibli-earth/30 bg-ghibli-cream
        hover:border-ghibli-earth/50 hover:bg-ghibli-sand/50 transition-colors duration-150
        px-4 py-3 flex items-center justify-between gap-4 shadow-ghibli-card"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base leading-none flex-shrink-0">{meta?.icon ?? '📅'}</span>
        <div className="min-w-0">
          <p className="font-display text-xs italic text-ghibli-mist leading-none mb-1">
            Month {currentMonth}
          </p>
          <p className="text-sm font-medium text-ghibli-ink truncate leading-none">
            {meta?.title ?? 'Current Month'}
          </p>
        </div>
      </div>

      {allDone ? (
        <span className="font-display text-xs italic text-ghibli-forest whitespace-nowrap flex-shrink-0">
          ✅ Month complete!
        </span>
      ) : (
        <span className="font-display text-xs italic text-ghibli-mist/70 whitespace-nowrap flex-shrink-0">
          {incomplete} task{incomplete !== 1 ? 's' : ''} need attention →
        </span>
      )}
    </button>
  )
}

export default function Dashboard() {
  const {
    state, todayHabits, streakStatus, currentTasks, loading, error,
    today, hasCheckedInToday, checkin, logHabit,
  } = useGameData()

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} />

  const daysMissed   = streakStatus?.days_missed ?? 0
  const currentMonth = state?.current_month ?? 1

  return (
    <div className="bg-ghibli-sky">
      <HeaderBar
        state={state}
        streakStatus={streakStatus}
        hasCheckedIn={hasCheckedInToday}
        onCheckin={checkin}
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <CharacterHero
          state={state}
          streakStatus={streakStatus}
          daysMissed={daysMissed}
        />
          <WeeklyHabits
            habits={todayHabits}
            onLogHabit={logHabit}
            today={today}
          />
          <OnTrackMeter
            currentTasks={currentTasks}
            todayHabits={todayHabits}
            totalXp={state?.total_xp ?? 0}
          />
          <MonthlyNudge
            currentMonth={currentMonth}
            currentTasks={currentTasks}
          />
        <div className="h-20" />
      </main>
    </div>
  )
}
