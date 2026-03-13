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

export default function BossBanner({ progress, daysMissed = 0 }) {
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

  const overallPct = progress
    ? (progress.tasks_completed / Math.max(1, progress.tasks_total)) * 100
    : 0

  const hpCreep = daysMissed >= 3 ? Math.min(20, (daysMissed - 2) * 5) : 0
  const bossHpPct = Math.min(100, Math.max(0, 100 - overallPct) + hpCreep)
  const isCritical = bossHpPct <= 25
  const days = daysUntil(recruitingDate)

  const hpColor =
    bossHpPct > 50
      ? 'from-ghibli-dusk to-ghibli-sunset'
      : bossHpPct > 25
        ? 'from-ghibli-gold to-yellow-400'
        : 'from-ghibli-forest to-ghibli-forest-light'

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
        {/* Warning tag */}
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

        {/* Boss name */}
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-ghibli-ink italic font-bold tracking-wide mb-1">
          Recruiting Season
        </h2>
        <p className="font-sans text-xs text-ghibli-mist mb-6 tracking-wider">
          The final obstacle — earn an offer
        </p>

        {/* HP bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display text-sm italic text-ghibli-earth/80">
              Boss HP
            </span>
            <div className="flex items-center gap-2">
              <span className="font-vt text-xl leading-none text-ghibli-dusk tabular-nums">
                {bossHpPct.toFixed(1)}%
              </span>
              {isCritical && (
                <span className="font-display text-xs text-ghibli-gold italic hp-critical">
                  CRITICAL
                </span>
              )}
            </div>
          </div>

          <div className="h-6 rounded-xl bg-ghibli-earth/15 border border-ghibli-earth/25 overflow-hidden relative">
            {/* Damage segments */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 border-r border-ghibli-earth/10 last:border-0" />
              ))}
            </div>

            <div
              className={`h-full bg-gradient-to-r ${hpColor} transition-all duration-1000 ease-out relative ${isCritical ? 'hp-critical' : ''}`}
              style={{ width: `${bossHpPct}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
            </div>
          </div>

          <div className="flex justify-between mt-1">
            <span className="font-sans text-[11px] text-ghibli-mist/70">
              {overallPct.toFixed(0)}% defeated
            </span>
            <span className="font-sans text-[11px] text-ghibli-mist/70">
              {progress?.tasks_completed ?? 0} / {progress?.tasks_total ?? '?'} tasks
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2">
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
                {days > 0 ? (
                  <>
                    <span className="font-vt text-2xl leading-none text-ghibli-ink">{days}</span>
                    <span className="ml-1 text-ghibli-mist"> days until recruiting</span>
                  </>
                ) : days === 0 ? (
                  <span className="font-display text-sm text-ghibli-sunset italic neon-text-red">
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
