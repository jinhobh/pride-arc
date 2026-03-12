import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MONTH_META } from '../constants/planData'
import BossBanner from '../components/BossBanner'
import StatPanel from '../components/StatPanel'
import ActivityHeatmap from '../components/ActivityHeatmap'
import WeeklySummary from '../components/WeeklySummary'
import { SectionHeader } from '../components/StatPanel'

const BASE = '/api'

function useStatsData() {
  const [state, setState] = useState(null)
  const [progress, setProgress] = useState(null)
  const [activity, setActivity] = useState([])
  const [weeklySummary, setWeeklySummary] = useState(null)
  const [streakStatus, setStreakStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [stateRes, progressRes, activityRes, weeklyRes, streakRes] = await Promise.all([
        fetch(`${BASE}/state`),
        fetch(`${BASE}/progress`),
        fetch(`${BASE}/activity?days=180`),
        fetch(`${BASE}/weekly-summary`),
        fetch(`${BASE}/streak-status`),
      ])
      if (!stateRes.ok)    throw new Error(`State fetch failed: ${stateRes.status}`)
      if (!progressRes.ok) throw new Error(`Progress fetch failed: ${progressRes.status}`)

      const [stateData, progressData, activityData, weeklyData, streakData] = await Promise.all([
        stateRes.json(),
        progressRes.json(),
        activityRes.ok  ? activityRes.json()  : Promise.resolve([]),
        weeklyRes.ok    ? weeklyRes.json()    : Promise.resolve(null),
        streakRes.ok    ? streakRes.json()    : Promise.resolve(null),
      ])

      setState(stateData)
      setProgress(progressData)
      setActivity(Array.isArray(activityData) ? activityData : [])
      setWeeklySummary(weeklyData)
      setStreakStatus(streakData)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { state, progress, activity, weeklySummary, streakStatus, loading, error }
}

function HeadlineStat({ label, value, unit, colorClass = 'text-ghibli-forest' }) {
  return (
    <div className="flex-1 rounded-xl border border-ghibli-earth/30 bg-ghibli-cream px-5 py-4 shadow-ghibli-card">
      <div className={`font-vt text-4xl leading-none tabular-nums ${colorClass}`}>{value}</div>
      {unit && <div className="font-sans text-[10px] text-ghibli-mist/70 mt-0.5">{unit}</div>}
      <div className="font-display text-sm italic text-ghibli-mist mt-2">{label}</div>
    </div>
  )
}

function OverallProgress({ progress }) {
  const navigate = useNavigate()
  if (!progress?.months?.length) return null

  function goToMonth(n) { navigate(`/plan#month-${n}`) }

  return (
    <section>
      <SectionHeader title="6-Month Plan Progress" />
      <div className="rounded-xl border border-ghibli-earth/30 bg-ghibli-cream overflow-hidden divide-y divide-ghibli-earth/15 shadow-ghibli-card">
        {[1, 2, 3, 4, 5, 6].map(n => {
          const meta = MONTH_META[n]
          const monthProgress = progress.months.find(m => m.month_number === n)
          const pct = monthProgress?.completion_pct ?? 0
          const tasksCompleted = monthProgress?.tasks_completed ?? 0
          const tasksTotal = monthProgress?.tasks_total ?? 0
          const isLocked = !monthProgress && pct === 0 && tasksTotal === 0

          return (
            <button
              key={n}
              onClick={() => goToMonth(n)}
              className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors duration-150 ${
                isLocked
                  ? 'opacity-35 cursor-not-allowed'
                  : 'hover:bg-ghibli-earth/5 cursor-pointer'
              }`}
              disabled={isLocked}
            >
              <div className="flex items-center gap-2 w-8 flex-shrink-0">
                <span className="text-base leading-none">{meta.icon}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <span className="font-display text-sm italic text-ghibli-mist/80 truncate">
                    M{n} · {meta.title}
                  </span>
                  <span className="font-vt text-base leading-none tabular-nums flex-shrink-0"
                    style={{ color: pct >= 100 ? '#4A7C59' : pct > 0 ? meta.hex : '#6B7F6E' }}>
                    {Math.round(pct)}%
                  </span>
                </div>

                <div className="h-2 rounded-full bg-ghibli-earth/15 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 100
                        ? '#4A7C59'
                        : `linear-gradient(90deg, ${meta.hex}88, ${meta.hex})`,
                    }}
                  />
                </div>
              </div>

              <span className="font-sans text-[11px] text-ghibli-mist/70 tabular-nums flex-shrink-0 w-14 text-right">
                {tasksCompleted}/{tasksTotal}
              </span>

              {!isLocked && (
                <svg className="w-3 h-3 text-ghibli-earth/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export default function StatsPage() {
  const { state, progress, activity, weeklySummary, streakStatus, loading, error } = useStatsData()

  if (loading) {
    return (
      <div className="min-h-screen bg-ghibli-sky flex flex-col items-center justify-center gap-4 pb-16">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-ghibli-forest/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-ghibli-forest animate-spin" />
        </div>
        <span className="font-display text-sm italic text-ghibli-mist animate-pulse">
          Loading stats...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ghibli-sky flex flex-col items-center justify-center gap-3 p-8 text-center pb-16">
        <span className="font-display text-base italic text-red-500">Error</span>
        <p className="text-xs text-ghibli-mist font-sans max-w-sm">{error}</p>
      </div>
    )
  }

  const daysMissed    = streakStatus?.days_missed ?? 0
  const totalXp       = state?.total_xp ?? 0
  const streak        = streakStatus?.streak ?? state?.streak_current ?? 0
  const longestStreak = streakStatus?.longest ?? state?.streak_longest ?? 0

  return (
    <div className="min-h-screen bg-ghibli-sky">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-8 space-y-8">

        <div>
          <h1 className="font-display text-2xl italic font-semibold text-ghibli-ink mb-1">
            Your Progress
          </h1>
          <p className="text-sm text-ghibli-mist font-sans">
            Your stats grow. The boss weakens.
          </p>
        </div>

        <div className="flex gap-3">
          <HeadlineStat label="Total XP Earned" value={totalXp.toLocaleString()} unit="XP" colorClass="text-ghibli-forest" />
          <HeadlineStat label="Current Streak" value={streak} unit={streak === 1 ? 'day' : 'days'} colorClass="text-ghibli-gold" />
          <HeadlineStat label="Longest Streak" value={longestStreak} unit={longestStreak === 1 ? 'day' : 'days'} colorClass="text-ghibli-sunset" />
        </div>

        <BossBanner progress={progress} daysMissed={daysMissed} />
        <StatPanel stats={state?.stats} daysMissed={daysMissed} />
        <ActivityHeatmap activity={activity} />
        <WeeklySummary summary={weeklySummary} />
        <OverallProgress progress={progress} />

      </div>
      <div className="h-20" />
    </div>
  )
}
