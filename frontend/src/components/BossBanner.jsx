import { useState } from 'react'

function daysUntil(isoDate) {
  const target = new Date(isoDate)
  target.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((target - now) / 86400000)
}

function defaultRecruitingDate() {
  const d = new Date()
  d.setMonth(d.getMonth() + 6)
  return d.toISOString().split('T')[0]
}

function formatDate(isoDate) {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BossBanner({ progress, pace }) {
  const [recruitingDate, setRecruitingDate] = useState(
    () => localStorage.getItem('prideArcRecruitingDate') || defaultRecruitingDate()
  )
  const [editing, setEditing] = useState(false)

  const handleDateChange = (e) => {
    const val = e.target.value
    setRecruitingDate(val)
    localStorage.setItem('prideArcRecruitingDate', val)
    setEditing(false)
  }

  const daysToRecruiting = daysUntil(recruitingDate)
  const projectedDate = pace?.projected_completion_date
  const hasProjection = !!projectedDate

  // How many days between projected completion and recruiting
  const projectedDaysToRecruiting = hasProjection ? daysUntil(recruitingDate) - daysUntil(projectedDate) : null
  const isAhead = projectedDaysToRecruiting !== null && projectedDaysToRecruiting >= 0
  const daysDiff = projectedDaysToRecruiting !== null ? Math.abs(projectedDaysToRecruiting) : 0

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-ghibli-earth/40 shadow-ghibli-card"
      style={{ background: 'linear-gradient(135deg, #FAF3E0 0%, #E8D5A3 50%, #FAF3E0 100%)' }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#8B6F47 1px, transparent 1px), linear-gradient(90deg, #8B6F47 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Warm corner accents */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-ghibli-sunset/15 blur-2xl rounded-full -translate-x-8 -translate-y-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-ghibli-dusk/15 blur-2xl rounded-full translate-x-8 translate-y-8" />

      <div className="relative px-6 sm:px-8 py-6 sm:py-8">
        {/* Tag */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            <span className="block w-1.5 h-1.5 rounded-full bg-ghibli-sunset animate-pulse" />
            <span className="block w-1.5 h-1.5 rounded-full bg-ghibli-sunset animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="block w-1.5 h-1.5 rounded-full bg-ghibli-sunset animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="font-display text-xs italic text-ghibli-dusk/80">
            Final Boss
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-ghibli-ink italic font-bold tracking-wide mb-1">
          Recruiting Readiness
        </h2>
        <p className="font-sans text-xs text-ghibli-mist mb-6 tracking-wider">
          Projected completion based on your pace
        </p>

        {/* Projected date display */}
        <div className="mb-5">
          {hasProjection ? (
            <div className="flex items-end gap-3 flex-wrap">
              <div>
                <div className="font-sans text-[11px] text-ghibli-mist/70 mb-1 uppercase tracking-wider">
                  Projected ready by
                </div>
                <div className="font-vt text-4xl sm:text-5xl leading-none text-ghibli-ink tabular-nums">
                  {formatDate(projectedDate)}
                </div>
              </div>
              <div className={`mb-1 px-3 py-1 rounded-lg font-display text-xs italic ${
                isAhead
                  ? 'bg-ghibli-forest/15 text-ghibli-forest border border-ghibli-forest/30'
                  : 'bg-ghibli-sunset/15 text-ghibli-dusk border border-ghibli-sunset/30'
              }`}>
                {isAhead
                  ? daysDiff === 0 ? 'Right on time' : `${daysDiff} day${daysDiff !== 1 ? 's' : ''} early`
                  : `${daysDiff} day${daysDiff !== 1 ? 's' : ''} behind`
                }
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="font-vt text-2xl text-ghibli-mist/50">— — —</div>
              <span className="font-sans text-sm text-ghibli-mist/60 italic">
                Complete some tasks to see your projection
              </span>
            </div>
          )}
        </div>

        {/* Progress context */}
        <div className="flex items-center gap-4 mb-4 text-[11px] font-sans text-ghibli-mist/70">
          <span>{progress?.tasks_completed ?? 0} / {progress?.tasks_total ?? '?'} tasks done</span>
          {pace && <span>Day {pace.arc_day} of {pace.arc_total_days}</span>}
          {pace && pace.earned_xp > 0 && (
            <span>{Math.round(pace.earned_xp / pace.arc_day)} XP/day avg</span>
          )}
        </div>

        {/* Recruiting target date */}
        <div className="flex items-center gap-2 pt-3 border-t border-ghibli-earth/20">
          <span className="font-sans text-[11px] text-ghibli-mist/60 uppercase tracking-wider mr-1">
            Target
          </span>
          {editing ? (
            <input
              type="date"
              defaultValue={recruitingDate}
              onBlur={handleDateChange}
              onChange={handleDateChange}
              autoFocus
              className="bg-ghibli-cream border border-ghibli-earth/40 rounded-lg px-2 py-1 text-sm text-ghibli-ink font-sans focus:outline-none focus:border-ghibli-earth"
            />
          ) : (
            <>
              <span className="font-sans text-sm text-ghibli-ink/80">
                {daysToRecruiting > 0 ? (
                  <>
                    <span className="font-vt text-xl leading-none text-ghibli-ink">{daysToRecruiting}</span>
                    <span className="ml-1 text-ghibli-mist">days until recruiting</span>
                  </>
                ) : daysToRecruiting === 0 ? (
                  <span className="font-display text-sm text-ghibli-sunset italic">
                    Recruiting starts TODAY
                  </span>
                ) : (
                  <span className="font-display text-sm text-ghibli-dusk italic">
                    Recruiting season is LIVE
                  </span>
                )}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="text-ghibli-earth/50 hover:text-ghibli-earth transition-colors cursor-pointer ml-1"
                aria-label="Edit recruiting date"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
