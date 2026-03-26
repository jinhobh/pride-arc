import { useState, useEffect, useRef } from 'react'

export default function HeaderBar({ state, streakStatus, hasCheckedIn, onCheckin, onReset }) {
  const [busy, setBusy] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)
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
    <>
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        zIndex: 50,
        background: 'rgba(10, 22, 40, 0.35)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(200, 230, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        boxSizing: 'border-box',
      }}
    >
      {/* Left: streak */}
      {state && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '8px',
              border: `1px solid ${isStreakBroken ? 'rgba(196,123,90,0.4)' : 'rgba(212,168,67,0.4)'}`,
              background: isStreakBroken ? 'rgba(196,123,90,0.12)' : 'rgba(212,168,67,0.12)',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>{streakIcon}</span>
            <span
              className={animating ? 'streak-bounce' : ''}
              style={{
                fontFamily: '"Shippori Mincho", serif',
                fontSize: '1.1rem',
                fontWeight: 700,
                lineHeight: 1,
                color: isStreakBroken ? '#E8956D' : '#F0C44A',
              }}
            >
              {streakStatus?.streak ?? state.streak_current}
            </span>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {streakStatus ? `/ ${streakStatus.longest} best` : 'days'}
            </span>
          </div>

          {/* XP pill */}
          {state.total_xp > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.07)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.9)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {state.total_xp.toLocaleString()}
              </span>
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.45)',
                }}
              >
                XP
              </span>
            </div>
          )}
        </div>
      )}

      {/* Right: check-in + reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Reset button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          title="Reset progress"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.4,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.4' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M1 4v6h6M23 20v-6h-6" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
          </svg>
        </button>

        {!hasCheckedIn ? (
          <button
            onClick={handleCheckin}
            disabled={busy}
            style={{
              background: 'rgba(74,124,89,0.9)',
              border: 'none',
              borderRadius: '8px',
              padding: '7px 16px',
              fontFamily: '"Shippori Mincho", serif',
              fontSize: '0.9rem',
              fontStyle: 'italic',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              opacity: busy ? 0.5 : 1,
              transition: 'background 0.15s, transform 0.1s',
              boxShadow: '0 2px 10px rgba(74,124,89,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(122,174,135,0.95)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,124,89,0.9)' }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            {busy ? '...' : 'Check In'}
          </button>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.08)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(122,174,135,1)" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              Done
            </span>
          </div>
        )}
      </div>
    </header>

    {/* Reset confirmation modal */}
    {showResetConfirm && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={() => !resetting && setShowResetConfirm(false)}
      >
        <div
          style={{
            background: 'rgba(10, 22, 40, 0.95)',
            border: '1px solid rgba(200, 230, 255, 0.15)',
            borderRadius: '16px',
            padding: '28px 32px',
            maxWidth: '340px',
            width: '90%',
            textAlign: 'center',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{
            fontFamily: '"Shippori Mincho", serif',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '12px',
          }}>
            Reset All Progress?
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.82rem',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.5,
            margin: '0 0 24px',
          }}>
            This will erase all XP, completed tasks, checkpoints, habits, badges, and streaks. Your plan stays intact. This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setShowResetConfirm(false)}
              disabled={resetting}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                setResetting(true)
                await onReset()
                setResetting(false)
                setShowResetConfirm(false)
              }}
              disabled={resetting}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: '10px',
                border: 'none',
                background: 'rgba(220, 70, 70, 0.85)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                opacity: resetting ? 0.5 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!resetting) e.currentTarget.style.background = 'rgba(220, 70, 70, 1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220, 70, 70, 0.85)' }}
            >
              {resetting ? 'Resetting...' : 'Reset Everything'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
