import { useState } from 'react'
import { SKILL_INFO } from '../constants/planData'
import { SectionHeader } from './StatPanel'

const COUNTABLE_HABITS = new Set(['habit_leetcode'])

function CounterInput({ count, onSet, busy }) {
  return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => onSet(Math.max(0, count - 1))}
        disabled={busy || count <= 0}
        className="w-6 h-6 rounded-lg flex items-center justify-center
          bg-ghibli-sand hover:bg-ghibli-earth/20 border border-ghibli-earth/40
          text-ghibli-mist hover:text-ghibli-ink text-xs font-bold
          disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        −
      </button>
      <span className="font-vt text-lg leading-none text-ghibli-forest tabular-nums w-6 text-center">
        {count}
      </span>
      <button
        onClick={() => onSet(count + 1)}
        disabled={busy}
        className="w-6 h-6 rounded-lg flex items-center justify-center
          bg-ghibli-sand hover:bg-ghibli-earth/20 border border-ghibli-earth/40
          text-ghibli-mist hover:text-ghibli-ink text-xs font-bold
          disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        +
      </button>
    </div>
  )
}

function HabitRow({ habit, onToggle }) {
  const [busy, setBusy] = useState(false)
  const info = SKILL_INFO[habit.skill_type]
  const { c } = info ?? { c: { text: 'text-ghibli-mist', border: 'border-ghibli-earth/40', bar: 'bg-ghibli-mist' } }
  const isCountable = COUNTABLE_HABITS.has(habit.habit_id)

  const handleToggle = async () => {
    if (isCountable) return
    setBusy(true)
    await onToggle(habit.habit_id, !habit.completed, 1)
    setBusy(false)
  }

  const handleSetCount = async (newCount) => {
    setBusy(true)
    await onToggle(habit.habit_id, newCount > 0, newCount)
    setBusy(false)
  }

  const displayXp = isCountable
    ? habit.xp_per_completion * (habit.count || 0)
    : habit.xp_per_completion

  return (
    <div
      onClick={isCountable ? undefined : handleToggle}
      className={`flex items-center gap-3 px-4 py-3 ${isCountable ? '' : 'cursor-pointer'}
        hover:bg-ghibli-earth/5 active:bg-ghibli-earth/10
        transition-colors duration-150 ${busy ? 'opacity-60' : ''}`}
    >
      {isCountable ? (
        <CounterInput count={habit.count || 0} onSet={handleSetCount} busy={busy} />
      ) : (
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${habit.completed
              ? 'bg-ghibli-forest border-ghibli-forest'
              : `border-ghibli-earth/50 hover:${c.border}`
            }`}
        >
          {habit.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      <span className="text-base leading-none flex-shrink-0">{info?.icon}</span>

      <span
        className={`flex-1 text-sm font-medium transition-all duration-200 ${
          habit.completed ? 'line-through text-ghibli-mist/60' : 'text-ghibli-ink'
        }`}
      >
        {habit.title}
      </span>

      <span className={`font-vt text-xl leading-none flex-shrink-0 tabular-nums ${
        habit.completed ? 'text-ghibli-forest' : c.text
      }`}>
        +{displayXp}
      </span>
      <span className="font-sans text-[9px] text-ghibli-mist/70 flex-shrink-0">xp</span>
    </div>
  )
}

export default function WeeklyHabits({ habits, onLogHabit, today }) {
  if (!habits?.length) return null

  const done = habits.filter(h => h.completed).length
  const total = habits.length
  const allDone = done === total

  return (
    <section>
      <SectionHeader
        title="Daily Habits"
        right={
          <div className="flex items-center gap-2">
            <span className="font-vt text-xl leading-none tabular-nums text-ghibli-mist">
              {done}/{total}
            </span>
            <span className="font-sans text-[10px] text-ghibli-mist/70">today</span>
          </div>
        }
      />

      <div
        className={`rounded-xl border overflow-hidden divide-y divide-ghibli-earth/15 shadow-ghibli-card
          ${allDone
            ? 'border-ghibli-forest/40 bg-ghibli-forest/5'
            : 'border-ghibli-earth/30 bg-ghibli-cream'
          }`}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-ghibli-earth/8">
          <span className="font-display text-sm italic text-ghibli-mist">
            {allDone ? '✓ All habits complete' : "Today's habits"}
          </span>
          <span className="font-vt text-base leading-none text-ghibli-earth/60">{today}</span>
        </div>

        {habits.map(habit => (
          <HabitRow
            key={habit.habit_id}
            habit={habit}
            onToggle={onLogHabit}
          />
        ))}

        <div className="h-1.5 bg-ghibli-earth/10">
          <div
            className="h-full bg-ghibli-forest transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      </div>
    </section>
  )
}
