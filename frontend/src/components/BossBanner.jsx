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

  // Boss HP creep: +5% per missed day (3+ days), capped at +20%
  const hpCreep = daysMissed >= 3 ? Math.min(20, (daysMissed - 2) * 5) : 0
  const bossHpPct = Math.min(100, Math.max(0, 100 - overallPct) + hpCreep)
  const isCritical = bossHpPct <= 25
  const days = daysUntil(recruitingDate)

  // HP bar color thresholds
  const hpColor =
    bossHpPct > 50
      ? 'from-red-700 to-red-500'
      : bossHpPct > 25
        ? 'from-orange-700 to-orange-400'
        : 'from-yellow-600 to-yellow-400'

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-red-900/40"
      style={{
        background: 'linear-gradient(135deg, #1a0a0a 0%, #0f0f23 50%, #1a0a0a 100%)',
      }}
    >
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#ff0000 1px, transparent 1px), linear-gradient(90deg, #ff0000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Red corner accents */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-red-900/20 blur-2xl rounded-full -translate-x-8 -translate-y-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-red-900/20 blur-2xl rounded-full translate-x-8 translate-y-8" />

      <div className="relative px-6 sm:px-8 py-6 sm:py-8">
        {/* Warning tag */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            <span className="block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="font-display text-[9px] uppercase tracking-[0.25em] text-red-500/70">
            Final Boss
          </span>
        </div>

        {/* Boss name */}
        <h2 className="font-display text-xl sm:text-2xl lg:text-3xl text-white uppercase tracking-widest mb-1 neon-text-red">
          Recruiting Season
        </h2>
        <p className="font-sans text-xs text-red-300/40 mb-6 tracking-wider">
          THE FINAL BOSS · BEAT IT AND WALK AWAY WITH AN OFFER
        </p>

        {/* HP bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display text-[9px] uppercase tracking-[0.2em] text-red-400/80">
              Boss HP
            </span>
            <div className="flex items-center gap-2">
              <span className="font-vt text-xl leading-none text-red-400 tabular-nums">
                {bossHpPct.toFixed(1)}%
              </span>
              {isCritical && (
                <span className="font-display text-[8px] text-yellow-400 uppercase tracking-wider hp-critical">
                  CRITICAL
                </span>
              )}
            </div>
          </div>

          {/* Bar track */}
          <div className="h-6 rounded bg-black/60 border border-red-900/40 overflow-hidden relative">
            {/* Damage segments */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex-1 border-r border-black/30 last:border-0" />
              ))}
            </div>

            {/* HP fill */}
            <div
              className={`h-full bg-gradient-to-r ${hpColor} transition-all duration-1000 ease-out relative ${isCritical ? 'hp-critical' : ''}`}
              style={{ width: `${bossHpPct}%` }}
            >
              {/* Shine */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
            </div>
          </div>

          {/* Progress legend */}
          <div className="flex justify-between mt-1">
            <span className="font-display text-[8px] text-slate-600 uppercase tracking-wider">
              {overallPct.toFixed(0)}% defeated
            </span>
            <span className="font-display text-[8px] text-slate-600 uppercase tracking-wider">
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
              className="bg-black/60 border border-red-500/40 rounded px-2 py-1 text-sm text-white font-mono focus:outline-none focus:border-red-400"
            />
          ) : (
            <>
              <span className="font-sans text-sm text-slate-300">
                {days > 0 ? (
                  <>
                    <span className="font-vt text-2xl leading-none text-white">{days}</span>
                    <span className="ml-1 text-slate-400"> days until recruiting</span>
                  </>
                ) : days === 0 ? (
                  <span className="font-display text-[10px] text-red-400 uppercase tracking-widest neon-text-red">
                    Recruiting starts TODAY
                  </span>
                ) : (
                  <span className="font-display text-[10px] text-orange-400 uppercase tracking-widest">
                    Recruiting season is LIVE
                  </span>
                )}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="text-slate-700 hover:text-slate-400 transition-colors cursor-pointer ml-1"
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
