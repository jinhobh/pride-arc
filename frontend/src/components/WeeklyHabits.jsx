import { useState } from 'react'
import { SKILL_INFO } from '../constants/planData'
import { SectionHeader } from './StatPanel'

function HabitRow({ habit, onToggle }) {
  const [busy, setBusy] = useState(false)
  const info = SKILL_INFO[habit.skill_type]
  const { c } = info ?? { c: { text: 'text-slate-400', border: 'border-slate-700', bar: 'bg-slate-400' } }

  const handleToggle = async () => {
    setBusy(true)
    await onToggle(habit.habit_id, !habit.completed)
    setBusy(false)
  }

  return (
    <div
      onClick={handleToggle}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer
        hover:bg-white/[0.03] active:bg-white/[0.05]
        transition-colors duration-150 ${busy ? 'opacity-60' : ''}`}
    >
      {/* Checkbox */}
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

      {/* Skill icon */}
      <span className="text-base leading-none flex-shrink-0">
        {info?.icon}
      </span>

      {/* Title */}
      <span
        className={`flex-1 text-sm font-medium transition-all duration-200 ${
          habit.completed ? 'line-through text-slate-600' : 'text-slate-200'
        }`}
      >
        {habit.title}
      </span>

      {/* XP reward */}
      <span className={`font-vt text-xl leading-none flex-shrink-0 tabular-nums ${
        habit.completed ? 'text-green-400' : c.text
      }`}>
        +{habit.xp_per_completion}
      </span>
      <span className="font-display text-[7px] text-slate-600 flex-shrink-0 uppercase">xp</span>
    </div>
  )
}

export default function WeeklyHabits({ habits, onLogHabit, today }) {
  if (!habits?.length) return null

  const done  = habits.filter(h => h.completed).length
  const total = habits.length
  const allDone = done === total

  return (
    <section>
      <SectionHeader
        title="Weekly Habits"
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
