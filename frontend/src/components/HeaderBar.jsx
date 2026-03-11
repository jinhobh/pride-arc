import { useState, useEffect, useRef } from 'react'

export default function HeaderBar({ state, streakStatus, hasCheckedIn, onCheckin }) {
  const [busy, setBusy] = useState(false)
  const [animating, setAnimating] = useState(false)
  const prevStreakRef = useRef(null)

  // Animate streak counter on first check-in
  useEffect(() => {
    if (prevStreakRef.current !== null && streakStatus?.streak > prevStreakRef.current) {
      setAnimating(true)
      const timer = setTimeout(() => setAnimating(false), 600)
      return () => clearTimeout(timer)
    }
    if (streakStatus) prevStreakRef.current = streakStatus.streak
  }, [streakStatus?.streak])

  const handleCheckin = async () => {
    setBusy(true)
    await onCheckin()
    setBusy(false)
  }

  const daysMissed = streakStatus?.days_missed ?? 0
  const isStreakBroken = daysMissed >= 3
  const streakIcon = isStreakBroken ? '💀' : '🔥'

  const streakBorderColor = isStreakBroken
    ? 'border-red-500/30'
    : daysMissed >= 1
      ? 'border-amber-500/30'
      : 'border-orange-500/30'

  const streakBgColor = isStreakBroken
    ? 'bg-red-500/10'
    : daysMissed >= 1
      ? 'bg-amber-500/10'
      : 'bg-orange-500/10'

  const streakTextColor = isStreakBroken
    ? 'text-red-400'
    : daysMissed >= 1
      ? 'text-amber-400'
      : 'text-orange-400'

  return (
    <header className="sticky top-0 z-50 bg-game-bg/95 backdrop-blur border-b border-white/5">
      {/* Subtle top accent line */}
      <div className={`h-px bg-gradient-to-r from-transparent ${isStreakBroken ? 'via-red-500/40' : 'via-green-500/40'} to-transparent`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <span className="font-display text-[11px] sm:text-sm text-white tracking-widest select-none">
          LEVEL<span className="neon-text-green text-green-400">UP</span>
        </span>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          {state && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${streakBorderColor} ${streakBgColor}`}>
              <span className="text-xs leading-none">{streakIcon}</span>
              <div className="flex flex-col items-center">
                <span className={`font-vt text-lg leading-none tabular-nums ${streakTextColor} ${animating ? 'streak-bounce' : ''}`}>
                  {streakStatus?.streak ?? state.streak_current}
                </span>
                {streakStatus && (
                  <span className="font-display text-[6px] text-slate-600 uppercase leading-none">
                    Best: {streakStatus.longest}
                  </span>
                )}
              </div>
              <span className={`font-display text-[8px] ${streakTextColor}/60 uppercase hidden sm:block`}>days</span>
            </div>
          )}

          {/* XP */}
          {state && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-green-500/30 bg-green-500/10">
              <span className="font-vt text-lg leading-none text-green-400 tabular-nums">
                {state.total_xp.toLocaleString()}
              </span>
              <span className="font-display text-[8px] text-green-400/60 uppercase hidden sm:block">XP</span>
            </div>
          )}

          {/* Char level */}
          {state && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded border border-violet-500/30 bg-violet-500/10">
              <span className="font-display text-[8px] text-violet-400/60 uppercase">LV</span>
              <span className="font-vt text-lg leading-none text-violet-400">{state.character_level}</span>
            </div>
          )}

          {/* Check-in */}
          {!hasCheckedIn ? (
            <button
              onClick={handleCheckin}
              disabled={busy}
              className="relative px-3 py-1.5 font-display text-[8px] uppercase tracking-widest text-black bg-green-400 rounded cursor-pointer hover:bg-green-300 active:scale-95 transition-all disabled:opacity-50 animate-pulse shadow-neon-green"
            >
              {busy ? '...' : 'Check In'}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-700 bg-slate-800/50">
              <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-display text-[8px] text-slate-500 uppercase">Done</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
