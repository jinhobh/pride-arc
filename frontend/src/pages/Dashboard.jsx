import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameData } from '../hooks/useApi'
import HeaderBar from '../components/HeaderBar'

// ── Constants ─────────────────────────────────────────────────────────────────
const CHAR_LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000,
  3800, 4700, 5700, 6800, 8000, 9300, 10700,
]
const CHAR_LEVEL_TITLES = [
  '', 'Wanderer', 'Apprentice', 'Practitioner', 'Builder',
  'Engineer', 'Craftsman', 'Architect', 'Specialist', 'Expert',
  'Senior', 'Principal', 'Staff', 'Distinguished', 'Fellow', 'Legend', 'Mythic',
]

function getCharXP(totalXp, level) {
  if (level >= CHAR_LEVEL_THRESHOLDS.length) return { pct: 100, current: totalXp, needed: 0 }
  const lo = CHAR_LEVEL_THRESHOLDS[level - 1] ?? 0
  const hi = CHAR_LEVEL_THRESHOLDS[level] ?? CHAR_LEVEL_THRESHOLDS[CHAR_LEVEL_THRESHOLDS.length - 1]
  const pct = Math.max(0, Math.min(100, ((totalXp - lo) / (hi - lo)) * 100))
  return { pct, current: totalXp - lo, needed: hi - lo }
}

function getPace(currentTasks) {
  if (!currentTasks) return { color: '#4A7C59', label: 'On track', pct: 0 }
  const all = [
    ...(currentTasks.weekly     ?? []),
    ...(currentTasks.monthly    ?? []),
    ...(currentTasks.checkpoints ?? []),
  ]
  const total = all.length
  const done  = all.filter(t => t.completed).length
  if (total === 0) return { color: '#4A7C59', label: 'No tasks this month', pct: 0 }

  const pct         = done / total
  const today       = new Date()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const dayOfMonth  = today.getDate()
  const expectedPct = dayOfMonth / daysInMonth
  const label       = `${done} of ${total} tasks · Day ${dayOfMonth} of ${daysInMonth}`

  if (pct >= expectedPct - 0.05) return { color: '#4A7C59', label, pct: Math.round(pct * 100) }
  if (pct >= expectedPct - 0.20) return { color: '#C9A84C', label, pct: Math.round(pct * 100) }
  return { color: '#B85C38', label, pct: Math.round(pct * 100) }
}

const GLASS = {
  background:             'rgba(10, 22, 40, 0.45)',
  backdropFilter:         'blur(16px)',
  WebkitBackdropFilter:   'blur(16px)',
  border:                 '1px solid rgba(200, 230, 255, 0.15)',
  borderRadius:           '16px',
  padding:                '16px',
}

// ── useIsMobile ───────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth < 768,
  )
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return isMobile
}

// ── XP Float ─────────────────────────────────────────────────────────────────
function XPFloat({ xp, onDone }) {
  return (
    <div
      className="xp-float-up"
      onAnimationEnd={onDone}
      style={{
        position:    'fixed',
        right:       '36px',
        bottom:      'calc(64px + 24px + 200px)',
        fontFamily:  'VT323, monospace',
        fontSize:    '22px',
        color:       '#7AAE87',
        textShadow:  '0 0 10px rgba(74,124,89,0.9)',
        zIndex:      100,
        pointerEvents: 'none',
        whiteSpace:  'nowrap',
      }}
    >
      +{xp} XP
    </div>
  )
}

// ── Character Sprite ──────────────────────────────────────────────────────────
function CharacterSprite({ daysMissed, isMobile }) {
  let decayFilter = ''
  if      (daysMissed === 1) decayFilter = 'saturate(0.65) brightness(0.93)'
  else if (daysMissed === 2) decayFilter = 'saturate(0.3) brightness(0.85)'
  else if (daysMissed >= 3) decayFilter = 'grayscale(1) brightness(0.75)'

  return (
    <div
      style={{
        position:  'fixed',
        bottom:    '64px',
        left:      '50%',
        transform: 'translateX(-50%)',
        height:    isMobile ? '60vh' : '72vh',
        zIndex:    20,
        pointerEvents: 'none',
      }}
    >
      <img
        src="/character.png"
        alt="Character"
        className="hero-float"
        style={{
          height:          '100%',
          width:           'auto',
          objectFit:       'contain',
          objectPosition:  'bottom center',
          imageRendering:  'pixelated',
          filter:          [decayFilter, 'drop-shadow(0px 8px 32px rgba(10,22,40,0.6))']
                             .filter(Boolean).join(' '),
          transition:      'filter 1.5s ease',
        }}
      />
    </div>
  )
}

// ── Morning Message ───────────────────────────────────────────────────────────
function MorningMessage({ isMobile }) {
  const charHeight = isMobile ? '60vh' : '72vh'
  return (
    <div
      style={{
        position:      'fixed',
        bottom:        `calc(64px + ${charHeight} - 20px)`,
        left:          '50%',
        transform:     'translateX(-50%)',
        zIndex:        25,
        textAlign:     'center',
        whiteSpace:    'nowrap',
        pointerEvents: 'none',
        fontFamily:    '"Shippori Mincho", serif',
        fontSize:      '1.1rem',
        fontStyle:     'italic',
        color:         'rgba(255,255,255,0.92)',
        textShadow:    '0 2px 12px rgba(10,22,40,0.8)',
      }}
    >
      The forest is quiet. What will you build today?
    </div>
  )
}

// ── Character Info Panel ──────────────────────────────────────────────────────
function CharInfoPanel({ state, isMobile }) {
  if (!state) return null
  const levelTitle          = CHAR_LEVEL_TITLES[state.character_level] ?? ''
  const { pct, current, needed } = getCharXP(state.total_xp, state.character_level)

  return (
    <div
      style={{
        position:      'fixed',
        bottom:        isMobile ? 'calc(64px + 16px)' : 'calc(64px + 24px)',
        left:          isMobile ? '16px' : '24px',
        width:         isMobile ? '160px' : '220px',
        zIndex:        30,
        pointerEvents: 'none',
        ...GLASS,
      }}
    >
      {/* Name */}
      <div
        style={{
          fontFamily:    '"Shippori Mincho", serif',
          fontSize:      '1.2rem',
          fontWeight:    700,
          color:         '#fff',
          letterSpacing: '0.15em',
          lineHeight:    1,
          marginBottom:  '4px',
        }}
      >
        JINHO
      </div>

      {/* Level title */}
      <div
        style={{
          fontFamily:   'Inter, sans-serif',
          fontSize:     '0.75rem',
          color:        'rgba(255,255,255,0.6)',
          marginBottom: isMobile ? 0 : '10px',
          lineHeight:   1.3,
        }}
      >
        Level {state.character_level} · {levelTitle}
      </div>

      {/* XP bar — hidden on mobile */}
      {!isMobile && (
        <>
          <div
            style={{
              height:       '6px',
              borderRadius: '999px',
              background:   'rgba(255,255,255,0.15)',
              overflow:     'hidden',
              marginBottom: '5px',
            }}
          >
            <div
              style={{
                height:       '100%',
                width:        `${pct}%`,
                borderRadius: '999px',
                background:   'linear-gradient(90deg, #4A7C59, #7AAE87)',
                transition:   'width 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize:   '0.7rem',
              color:      'rgba(255,255,255,0.5)',
            }}
          >
            {needed > 0
              ? `${current.toLocaleString()} / ${needed.toLocaleString()} XP`
              : 'Max level'}
          </div>
        </>
      )}
    </div>
  )
}

// ── Habit Row ─────────────────────────────────────────────────────────────────
function HabitRow({ habit, onLog, onXP }) {
  const handleToggle = async () => {
    const newCompleted = !habit.completed
    const ok = await onLog(habit.habit_id, newCompleted, newCompleted ? 1 : 0)
    if (ok && newCompleted) onXP(habit.xp_per_completion)
  }

  return (
    <div
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        padding:      '9px 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Circle checkbox */}
      <button
        onClick={handleToggle}
        style={{
          width:        '18px',
          height:       '18px',
          borderRadius: '50%',
          border:       habit.completed ? 'none' : '1.5px solid rgba(255,255,255,0.35)',
          background:   habit.completed ? '#4A7C59' : 'transparent',
          flexShrink:   0,
          cursor:       'pointer',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          transition:   'all 0.15s ease',
          padding:      0,
        }}
      >
        {habit.completed && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Title */}
      <span
        style={{
          fontFamily:     'Inter, sans-serif',
          fontSize:       '0.85rem',
          color:          habit.completed ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)',
          textDecoration: habit.completed ? 'line-through' : 'none',
          flex:           1,
          lineHeight:     1.3,
          transition:     'color 0.2s',
        }}
      >
        {habit.title}
      </span>
    </div>
  )
}

// ── Habits Panel header ────────────────────────────────────────────────────────
function HabitsHeader({ today }) {
  const dateLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
  return (
    <div
      style={{
        display:       'flex',
        alignItems:    'center',
        justifyContent: 'space-between',
        marginBottom:  '10px',
      }}
    >
      <span style={{ fontFamily: '"Shippori Mincho", serif', fontSize: '1rem', fontStyle: 'italic', color: '#fff' }}>
        Today
      </span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
        {dateLabel}
      </span>
    </div>
  )
}

// ── Daily Habits Panel (desktop) ──────────────────────────────────────────────
function DailyHabitsPanel({ habits, today, onLogHabit }) {
  const [xpFloats, setXpFloats] = useState([])
  const floatId = useRef(0)

  const handleXP = useCallback((xp) => {
    const id = floatId.current++
    setXpFloats(prev => [...prev, { id, xp }])
  }, [])

  return (
    <>
      {xpFloats.map(f => (
        <XPFloat
          key={f.id}
          xp={f.xp}
          onDone={() => setXpFloats(prev => prev.filter(x => x.id !== f.id))}
        />
      ))}

      <div
        style={{
          position:     'fixed',
          bottom:       'calc(64px + 24px)',
          right:        '24px',
          width:        '280px',
          maxHeight:    '320px',
          zIndex:       30,
          pointerEvents: 'auto',
          overflowY:    'auto',
          ...GLASS,
        }}
      >
        <HabitsHeader today={today} />

        {habits.length === 0 ? (
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize:   '0.8rem',
              color:      'rgba(255,255,255,0.35)',
              textAlign:  'center',
              padding:    '12px 0',
              margin:     0,
            }}
          >
            No habits yet
          </p>
        ) : (
          habits.map(habit => (
            <HabitRow key={habit.habit_id} habit={habit} onLog={onLogHabit} onXP={handleXP} />
          ))
        )}
      </div>
    </>
  )
}

// ── Mobile Habits Drawer ──────────────────────────────────────────────────────
function MobileHabitsDrawer({ habits, today, onLogHabit }) {
  const [open, setOpen]         = useState(false)
  const [xpFloats, setXpFloats] = useState([])
  const floatId    = useRef(0)
  const touchStartY = useRef(null)

  const handleXP = useCallback((xp) => {
    const id = floatId.current++
    setXpFloats(prev => [...prev, { id, xp }])
  }, [])

  const onTouchStart = (e) => { touchStartY.current = e.touches[0].clientY }
  const onTouchEnd   = (e) => {
    if (touchStartY.current === null) return
    const delta = touchStartY.current - e.changedTouches[0].clientY
    if (delta >  30) setOpen(true)
    if (delta < -30) setOpen(false)
    touchStartY.current = null
  }

  const completedCount = habits.filter(h => h.completed).length

  return (
    <>
      {xpFloats.map(f => (
        <XPFloat
          key={f.id}
          xp={f.xp}
          onDone={() => setXpFloats(prev => prev.filter(x => x.id !== f.id))}
        />
      ))}

      <div
        style={{
          position:            'fixed',
          bottom:              '64px',
          left:                0,
          right:               0,
          height:              open ? '60vh' : '48px',
          zIndex:              35,
          pointerEvents:       'auto',
          background:          'rgba(10, 22, 40, 0.75)',
          backdropFilter:      'blur(20px)',
          WebkitBackdropFilter:'blur(20px)',
          borderTop:           '1px solid rgba(200, 230, 255, 0.12)',
          borderRadius:        '16px 16px 0 0',
          transition:          'height 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          overflow:            'hidden',
          display:             'flex',
          flexDirection:       'column',
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle row */}
        <div
          style={{
            flexShrink:    0,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            padding:       '10px 0 6px',
            cursor:        'pointer',
            userSelect:    'none',
          }}
          onClick={() => setOpen(o => !o)}
        >
          <div
            style={{
              width:        '36px',
              height:       '4px',
              borderRadius: '999px',
              background:   'rgba(255,255,255,0.3)',
            }}
          />
          {!open && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontFamily: '"Shippori Mincho", serif', fontSize: '0.9rem', fontStyle: 'italic', color: '#fff' }}>
                Today
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
                {completedCount}/{habits.length} done
              </span>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 16px' }}>
          <HabitsHeader today={today} />
          {habits.map(habit => (
            <HabitRow key={habit.habit_id} habit={habit} onLog={onLogHabit} onXP={handleXP} />
          ))}
        </div>
      </div>
    </>
  )
}

// ── Pace Tracker ──────────────────────────────────────────────────────────────
function PaceTracker({ currentTasks }) {
  const [hovered, setHovered] = useState(false)
  const pace = getPace(currentTasks)

  return (
    <div
      style={{
        position:      'fixed',
        bottom:        '64px',
        left:          0,
        right:         0,
        height:        hovered ? '8px' : '3px',
        zIndex:        40,
        pointerEvents: 'auto',
        transition:    'height 200ms ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Track */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)' }} />
      {/* Fill */}
      <div
        style={{
          position:   'absolute',
          top:        0, left: 0, bottom: 0,
          width:      `${pace.pct}%`,
          background: pace.color,
          transition: 'width 1.2s ease, background 0.5s ease',
          borderRadius: '0 2px 2px 0',
        }}
      />
      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position:            'absolute',
            bottom:              '12px',
            left:                '50%',
            transform:           'translateX(-50%)',
            background:          'rgba(10, 22, 40, 0.75)',
            backdropFilter:      'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            border:              '1px solid rgba(200, 230, 255, 0.15)',
            borderRadius:        '8px',
            padding:             '6px 12px',
            whiteSpace:          'nowrap',
            fontFamily:          'Inter, sans-serif',
            fontSize:            '0.75rem',
            color:               'rgba(255,255,255,0.8)',
            pointerEvents:       'none',
          }}
        >
          {pace.label}
        </div>
      )}
    </div>
  )
}

// ── Loading / Error ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <div style={{ position: 'relative', width: '40px', height: '40px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.12)' }} />
          <div
            className="animate-spin"
            style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'rgba(255,255,255,0.6)' }}
          />
        </div>
        <span style={{ fontFamily: '"Shippori Mincho", serif', fontSize: '0.9rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>
          Loading...
        </span>
      </div>
    </div>
  )
}

function ErrorScreen({ message }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px', textAlign: 'center',
      }}
    >
      <div>
        <p style={{ fontFamily: '"Shippori Mincho", serif', fontStyle: 'italic', color: 'rgba(255,100,100,0.85)', marginBottom: '8px' }}>
          Connection Error
        </p>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          {message}
        </p>
      </div>
    </div>
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const {
    state, todayHabits, streakStatus, currentTasks,
    loading, error, today, hasCheckedInToday, checkin, logHabit,
  } = useGameData()

  const isMobile = useIsMobile()

  if (loading) return <LoadingScreen />
  if (error)   return <ErrorScreen message={error} />

  const daysMissed = streakStatus?.days_missed ?? 0

  return (
    <>
      <HeaderBar
        state={state}
        streakStatus={streakStatus}
        hasCheckedIn={hasCheckedInToday}
        onCheckin={checkin}
      />

      <CharacterSprite daysMissed={daysMissed} isMobile={isMobile} />
      <MorningMessage  isMobile={isMobile} />
      <CharInfoPanel   state={state} isMobile={isMobile} />

      {isMobile ? (
        <MobileHabitsDrawer habits={todayHabits} today={today} onLogHabit={logHabit} />
      ) : (
        <DailyHabitsPanel habits={todayHabits} today={today} onLogHabit={logHabit} />
      )}

      {/* Pace tracker hidden on mobile (drawer sits at the same position) */}
      {!isMobile && <PaceTracker currentTasks={currentTasks} />}
    </>
  )
}
