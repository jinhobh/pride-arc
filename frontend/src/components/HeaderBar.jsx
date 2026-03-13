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

  return (
    <header
      className="sticky top-0 z-50 bg-ghibli-cream backdrop-blur-sm border-b border-ghibli-earth/30"
      style={{ boxShadow: '0 1px 8px rgba(139,111,71,0.10)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <span
          className="select-none"
          style={{
            fontFamily: '"Shippori Mincho", serif',
            fontSize: '1.4rem',
            fontStyle: 'italic',
            color: '#4A7C59',
            letterSpacing: '0.02em',
          }}
        >
          Level<span style={{ fontWeight: 700 }}>Up</span>
        </span>

        <div className="flex items-center gap-2 sm:gap-3">

          {/* Streak */}
          {state && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                border: `1px solid ${isStreakBroken ? 'rgba(196,123,90,0.35)' : 'rgba(212,168,67,0.35)'}`,
                background: isStreakBroken ? 'rgba(196,123,90,0.08)' : 'rgba(212,168,67,0.08)',
              }}
            >
              <span className="text-xs leading-none">{streakIcon}</span>
              <div className="flex flex-col items-center">
                <span
                  className={animating ? 'streak-bounce' : ''}
                  style={{
                    fontFamily: '"Shippori Mincho", serif',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    lineHeight: 1,
                    color: isStreakBroken ? '#C47B5A' : '#D4A843',
                  }}
                >
                  {streakStatus?.streak ?? state.streak_current}
                </span>
                {streakStatus && (
                  <span className="font-sans text-[9px] text-ghibli-mist/70 leading-none">
                    Best: {streakStatus.longest}
                  </span>
                )}
              </div>
              <span
                className="hidden sm:block text-[10px]"
                style={{ color: isStreakBroken ? 'rgba(196,123,90,0.7)' : 'rgba(212,168,67,0.7)', fontFamily: 'Inter, sans-serif' }}
              >
                days
              </span>
            </div>
          )}

          {/* XP */}
          {state && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{
                border: '1px solid rgba(44,36,22,0.18)',
                background: 'rgba(44,36,22,0.04)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#2C2416',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {state.total_xp.toLocaleString()}
              </span>
              <span className="hidden sm:block text-[10px] text-ghibli-mist" style={{ fontFamily: 'Inter, sans-serif' }}>XP</span>
            </div>
          )}

          {/* Char level */}
          {state && (
            <div
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg"
              style={{
                border: '1px solid rgba(184,169,201,0.4)',
                background: 'rgba(184,169,201,0.10)',
              }}
            >
              <span className="text-[10px] text-ghibli-spirit/70" style={{ fontFamily: 'Inter, sans-serif' }}>LV</span>
              <span
                style={{
                  fontFamily: '"Shippori Mincho", serif',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#B8A9C9',
                  lineHeight: 1,
                }}
              >
                {state.character_level}
              </span>
            </div>
          )}

          {/* Check-in */}
          {!hasCheckedIn ? (
            <button
              onClick={handleCheckin}
              disabled={busy}
              className="relative px-4 py-1.5 text-white rounded-lg cursor-pointer active:scale-95 transition-all disabled:opacity-50"
              style={{
                background: '#4A7C59',
                fontFamily: '"Shippori Mincho", serif',
                fontSize: '0.95rem',
                fontStyle: 'italic',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(74,124,89,0.25)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#7AAE87'}
              onMouseLeave={e => e.currentTarget.style.background = '#4A7C59'}
            >
              {busy ? '...' : 'Check In'}
            </button>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ border: '1px solid rgba(139,111,71,0.35)', background: 'rgba(232,213,163,0.4)' }}
            >
              <svg className="w-3 h-3 text-ghibli-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-[10px] text-ghibli-mist" style={{ fontFamily: 'Inter, sans-serif' }}>Done</span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
