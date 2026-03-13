import { useNavigate } from 'react-router-dom'
import { useGameData } from '../hooks/useApi'
import { MONTH_META } from '../constants/planData'
import HeaderBar from '../components/HeaderBar'
import CharacterHero from '../components/CharacterHero'
import WeeklyHabits from '../components/WeeklyHabits'
import OnTrackMeter from '../components/OnTrackMeter'
import RecentActivity from '../components/RecentActivity'

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: '100%' }}>
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
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center" style={{ minHeight: '100%' }}>
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

  let borderColor = 'var(--ghibli-forest)'
  let bgGradient = 'linear-gradient(135deg, #EEF6EC, #FAF3E0)'
  if (!allDone && incomplete > 7) {
    borderColor = '#B85C38'
    bgGradient = 'linear-gradient(135deg, #F6EDE8, #FAF3E0)'
  } else if (!allDone && incomplete > 3) {
    borderColor = '#C9A84C'
    bgGradient = 'linear-gradient(135deg, #F6F1E4, #FAF3E0)'
  }

  return (
    <button
      onClick={() => navigate('/plan')}
      style={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '12px 16px',
        background: bgGradient,
        borderLeft: `3px solid ${borderColor}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderRadius: '0 10px 10px 0',
        boxShadow: '0 2px 10px rgba(139,111,71,0.10)',
        cursor: 'pointer',
        transition: 'box-shadow 150ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,111,71,0.18)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(139,111,71,0.10)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>{meta?.icon ?? '📅'}</span>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: '"Shippori Mincho", serif',
              fontStyle: 'italic',
              fontSize: '11px',
              color: 'var(--ghibli-mist)',
              lineHeight: 1,
              marginBottom: '3px',
            }}
          >
            Month {currentMonth}
          </p>
          <p
            style={{
              fontFamily: '"Shippori Mincho", serif',
              fontWeight: 600,
              fontSize: '15px',
              color: 'var(--ghibli-ink)',
              lineHeight: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {meta?.title ?? 'Current Month'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        {allDone ? (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: 'var(--ghibli-forest)',
            }}
          >
            ✅ Complete
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '12px',
              color: 'var(--ghibli-mist)',
              whiteSpace: 'nowrap',
            }}
          >
            {incomplete} task{incomplete !== 1 ? 's' : ''} left
          </span>
        )}
        <span style={{ color: 'var(--ghibli-mist)', fontSize: '14px' }}>→</span>
      </div>
    </button>
  )
}

export default function Dashboard() {
  const {
    state, todayHabits, streakStatus, currentTasks, activityFeed,
    loading, error, today, hasCheckedInToday, checkin, logHabit,
  } = useGameData()

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} />

  const daysMissed   = streakStatus?.days_missed ?? 0
  const currentMonth = state?.current_month ?? 1

  return (
    <>
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
        <RecentActivity feed={activityFeed} />
      </main>
    </>
  )
}
