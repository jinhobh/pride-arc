import { useState, useEffect, useRef } from 'react'

export default function HeaderBar({ state, streakStatus, hasCheckedIn, onCheckin }) {
  const [busy, setBusy] = useState(false)
  const [animating, setAnimating] = useState(false)
  const prevStreakRef = useRef(null)

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
    ? 'border-red-500/40'
    : daysMissed >= 1
      ? 'border-ghibli-gold/40'
      : 'border-ghibli-gold/40'

  const streakBgColor = isStreakBroken
    ? 'bg-red-500/10'
    : 'bg-ghibli-gold/10'

  const streakTextColor = isStreakBroken
    ? 'text-red-500'
    : 'text-ghibli-gold'

  return (
    <header className="sticky top-0 z-50 bg-ghibli-sky/95 backdrop-blur border-b border-ghibli-earth/20">
      <div className={`h-px bg-gradient-to-r from-transparent ${isStreakBroken ? 'via-red-500/40' : 'via-ghibli-forest/30'} to-transparent`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <span className="font-display text-base sm:text-lg text-ghibli-ink tracking-wide select-none italic">
          Level<span className="neon-text-green text-ghibli-forest font-semibold">Up</span>
        </span>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak */}
          {state && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${streakBorderColor} ${streakBgColor}`}>
              <span className="text-xs leading-none">{streakIcon}</span>
              <div className="flex flex-col items-center">
                <span className={`font-vt text-lg leading-none tabular-nums ${streakTextColor} ${animating ? 'streak-bounce' : ''}`}>
                  {streakStatus?.streak ?? state.streak_current}
                </span>
                {streakStatus && (
                  <span className="font-sans text-[9px] text-ghibli-mist/70 leading-none">
                    Best: {streakStatus.longest}
                  </span>
                )}
              </div>
              <span className={`font-sans text-[10px] ${streakTextColor}/70 hidden sm:block`}>days</span>
            </div>
          )}

          {/* XP */}
          {state && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-ghibli-forest/40 bg-ghibli-forest/10">
              <span className="font-vt text-lg leading-none text-ghibli-forest tabular-nums">
                {state.total_xp.toLocaleString()}
              </span>
              <span className="font-sans text-[10px] text-ghibli-mist hidden sm:block">XP</span>
            </div>
          )}

          {/* Char level */}
          {state && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg border border-ghibli-spirit/40 bg-ghibli-spirit/10">
              <span className="font-sans text-[10px] text-ghibli-spirit/70">LV</span>
              <span className="font-vt text-lg leading-none text-ghibli-spirit">{state.character_level}</span>
            </div>
          )}

          {/* Check-in */}
          {!hasCheckedIn ? (
            <button
              onClick={handleCheckin}
              disabled={busy}
              className="relative px-3 py-1.5 font-display text-xs text-white bg-ghibli-forest rounded-lg cursor-pointer hover:bg-ghibli-forest-light active:scale-95 transition-all disabled:opacity-50 shadow-neon-green italic"
            >
              {busy ? '...' : 'Check In'}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-ghibli-earth/40 bg-ghibli-sand/60">
              <svg className="w-3 h-3 text-ghibli-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-sans text-[10px] text-ghibli-mist">Done</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
