import { useState } from 'react'
import { SKILL_INFO } from '../constants/planData'
import { SectionHeader } from './StatPanel'

/** Habits that support counting (multiple completions per day) */
const COUNTABLE_HABITS = new Set(['habit_leetcode'])

function CounterInput({ count, onSet, busy }) {
  return (
    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => onSet(Math.max(0, count - 1))}
        disabled={busy || count <= 0}
        className="w-6 h-6 rounded flex items-center justify-center
          bg-slate-800 hover:bg-slate-700 border border-slate-700
          text-slate-400 hover:text-white text-xs font-bold
          disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        −
      </button>
      <span className="font-vt text-lg leading-none text-green-400 tabular-nums w-6 text-center">
        {count}
      </span>
      <button
        onClick={() => onSet(count + 1)}
        disabled={busy}
        className="w-6 h-6 rounded flex items-center justify-center
          bg-slate-800 hover:bg-slate-700 border border-slate-700
          text-slate-400 hover:text-white text-xs font-bold
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
  const { c } = info ?? { c: { text: 'text-slate-400', border: 'border-slate-700', bar: 'bg-slate-400' } }
  const isCountable = COUNTABLE_HABITS.has(habit.habit_id)

  const handleToggle = async () => {
    if (isCountable) return // countable habits use the counter, not click
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
        hover:bg-white/[0.03] active:bg-white/[0.05]
        transition-colors duration-150 ${busy ? 'opacity-60' : ''}`}
    >
      {/* Checkbox or Counter */}
      {isCountable ? (
        <CounterInput count={habit.count || 0} onSet={handleSetCount} busy={busy} />
      ) : (
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
            transition-all duration-200
            ${habit.completed
              ? 'bg-green-400 border-green-400'
              : `border-slate-600 hover:${c.border}`
            }`}
        >
          {habit.completed && (
            <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Skill icon */}
      <span className="text-base leading-none flex-shrink-0">
        {info?.icon}
      </span>

      {/* Title */}
      <span
        className={`flex-1 text-sm font-medium transition-all duration-200 ${habit.completed ? 'line-through text-slate-600' : 'text-slate-200'
          }`}
      >
        {habit.title}
      </span>

      {/* XP reward */}
      <span className={`font-vt text-xl leading-none flex-shrink-0 tabular-nums ${habit.completed ? 'text-green-400' : c.text
        }`}>
        +{displayXp}
      </span>
      <span className="font-display text-[7px] text-slate-600 flex-shrink-0 uppercase">xp</span>
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
            <span className="font-vt text-xl leading-none tabular-nums text-slate-400">
              {done}/{total}
            </span>
            <span className="font-display text-[8px] text-slate-600 uppercase">today</span>
          </div>
        }
      />

      <div
        className={`rounded-xl border overflow-hidden divide-y divide-white/[0.04]
          ${allDone ? 'border-green-500/30 bg-green-500/[0.04]' : 'border-slate-800/60 bg-game-surface/40'}`}
      >
        {/* Date header */}
        <div className="flex items-center justify-between px-4 py-2 bg-black/20">
          <span className="font-display text-[8px] uppercase tracking-widest text-slate-600">
            {allDone ? '✓ All habits complete' : 'Today\'s habits'}
          </span>
          <span className="font-vt text-base leading-none text-slate-700">{today}</span>
        </div>

        {habits.map(habit => (
          <HabitRow
            key={habit.habit_id}
            habit={habit}
            onToggle={onLogHabit}
          />
        ))}

        {/* Progress bar at bottom */}
        <div className="h-1 bg-black/40">
          <div
            className="h-full bg-green-400 transition-all duration-500"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      </div>
    </section>
  )
}
