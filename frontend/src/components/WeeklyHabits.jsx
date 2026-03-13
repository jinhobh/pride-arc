import { useState } from 'react'
import { SKILL_INFO } from '../constants/planData'

const COUNTABLE_HABITS = new Set(['habit_leetcode'])

function CounterInput({ count, onSet, busy }) {
  return (
    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => onSet(Math.max(0, count - 1))}
        disabled={busy || count <= 0}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--ghibli-ink)',
          background: 'var(--ghibli-sand)',
          border: '1px solid rgba(139,111,71,0.35)',
          borderRadius: '999px',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 150ms ease',
          opacity: busy || count <= 0 ? 0.3 : 1,
        }}
      >
        −
      </button>
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--ghibli-ink)',
          minWidth: '20px',
          textAlign: 'center',
          lineHeight: 1,
        }}
      >
        {count}
      </span>
      <button
        onClick={() => onSet(count + 1)}
        disabled={busy}
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--ghibli-ink)',
          background: 'var(--ghibli-sand)',
          border: '1px solid rgba(139,111,71,0.35)',
          borderRadius: '999px',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 150ms ease',
          opacity: busy ? 0.3 : 1,
        }}
      >
        +
      </button>
    </div>
  )
}

function HabitRow({ habit, onToggle, isLast }) {
  const [busy, setBusy] = useState(false)
  const [popup, setPopup] = useState(null) // { key, xp }
  const info = SKILL_INFO[habit.skill_type]
  const isCountable = COUNTABLE_HABITS.has(habit.habit_id)

  const handleToggle = async () => {
    if (isCountable) return
    setBusy(true)
    const wasCompleted = habit.completed
    await onToggle(habit.habit_id, !habit.completed, 1)
    if (!wasCompleted) {
      const key = Date.now()
      setPopup({ key, xp: habit.xp_per_completion })
      setTimeout(() => setPopup(null), 1200)
    }
    setBusy(false)
  }

  const handleSetCount = async (newCount) => {
    setBusy(true)
    const prevCount = habit.count || 0
    await onToggle(habit.habit_id, newCount > 0, newCount)
    if (newCount > prevCount) {
      const key = Date.now()
      setPopup({ key, xp: habit.xp_per_completion })
      setTimeout(() => setPopup(null), 1200)
    }
    setBusy(false)
  }

  const displayXp = isCountable
    ? habit.xp_per_completion * (habit.count || 0)
    : habit.xp_per_completion

  return (
    <div
      onClick={isCountable ? undefined : handleToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        cursor: isCountable ? 'default' : 'pointer',
        borderBottom: isLast ? 'none' : '1px dashed rgba(139,111,71,0.20)',
        transition: 'background 150ms ease',
        opacity: busy ? 0.6 : 1,
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,213,163,0.30)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Checkbox or counter */}
      {isCountable ? (
        <CounterInput count={habit.count || 0} onSet={handleSetCount} busy={busy} />
      ) : (
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            border: habit.completed ? 'none' : '2px solid var(--ghibli-earth)',
            background: habit.completed ? 'var(--ghibli-forest)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 200ms ease, border 200ms ease',
          }}
        >
          {habit.completed && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Skill icon */}
      <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>{info?.icon}</span>

      {/* Habit label */}
      <span
        style={{
          flex: 1,
          fontFamily: 'Inter, sans-serif',
          fontSize: '13.5px',
          fontWeight: 500,
          color: habit.completed ? 'rgba(107,127,110,0.55)' : 'var(--ghibli-ink)',
          textDecoration: habit.completed ? 'line-through' : 'none',
          transition: 'color 200ms ease',
        }}
      >
        {habit.title}
      </span>

      {/* XP display + popup */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <span
          style={{
            fontFamily: '"Shippori Mincho", serif',
            fontStyle: 'italic',
            fontSize: '14px',
            color: habit.completed ? 'var(--ghibli-forest)' : 'var(--ghibli-mist)',
            transition: 'color 200ms ease',
          }}
        >
          +{displayXp} xp
        </span>
        {popup && (
          <span
            key={popup.key}
            className="xp-float-up"
            style={{
              position: 'absolute',
              right: 0,
              bottom: '100%',
              fontFamily: '"Shippori Mincho", serif',
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: '13px',
              color: 'var(--ghibli-forest)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            +{popup.xp} XP
          </span>
        )}
      </div>
    </div>
  )
}

export default function WeeklyHabits({ habits, onLogHabit, today }) {
  if (!habits?.length) return null

  const done = habits.filter(h => h.completed).length
  const total = habits.length
  const allDone = done === total
  const pct = total > 0 ? (done / total) * 100 : 0

  return (
    <section>
      {/* Section title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2
          style={{
            fontFamily: '"Shippori Mincho", serif',
            fontStyle: 'italic',
            fontWeight: 600,
            fontSize: '1.15rem',
            color: 'var(--ghibli-ink)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          🌿 Daily Habits
        </h2>
        <span
          style={{
            fontFamily: '"Shippori Mincho", serif',
            fontStyle: 'italic',
            fontSize: '0.85rem',
            color: 'var(--ghibli-mist)',
          }}
        >
          {done}/{total} today
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          background: 'var(--ghibli-cream)',
          border: '1px solid rgba(139,111,71,0.28)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(139,111,71,0.10)',
        }}
      >
        {/* Progress bar — top of card */}
        <div
          style={{
            height: '8px',
            background: 'var(--ghibli-sand)',
            borderRadius: '999px 999px 0 0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: allDone
                ? 'linear-gradient(90deg, var(--ghibli-forest), var(--ghibli-forest-light))'
                : 'var(--ghibli-forest)',
              borderRadius: '999px',
              transition: 'width 500ms cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>

        {/* Date subheader */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: 'rgba(232,213,163,0.25)',
            borderBottom: '1px dashed rgba(139,111,71,0.15)',
          }}
        >
          <span
            style={{
              fontFamily: '"Shippori Mincho", serif',
              fontStyle: 'italic',
              fontSize: '0.82rem',
              color: 'var(--ghibli-mist)',
            }}
          >
            {allDone ? '✓ All habits complete' : "Today's habits"}
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              color: 'rgba(139,111,71,0.55)',
            }}
          >
            {today}
          </span>
        </div>

        {/* Habit rows */}
        {habits.map((habit, i) => (
          <HabitRow
            key={habit.habit_id}
            habit={habit}
            onToggle={onLogHabit}
            isLast={i === habits.length - 1}
          />
        ))}
      </div>
    </section>
  )
}
