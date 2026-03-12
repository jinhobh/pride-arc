import { useState } from 'react'
import { SKILL_INFO } from '../constants/planData'
import { SectionHeader } from './StatPanel'

const BASE = '/api'

function TaskRow({ task, onToggle }) {
    const [busy, setBusy] = useState(false)
    const info = SKILL_INFO[task.skill_type]
    const { c } = info ?? { c: { text: 'text-slate-400', border: 'border-slate-700' } }

    const handleToggle = async () => {
        setBusy(true)
        await onToggle(task.id, !task.completed)
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
          ${task.completed
                        ? 'bg-green-400 border-green-400'
                        : `border-slate-600 hover:${c.border}`
                    }`}
            >
                {task.completed && (
                    <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>

            {/* Skill icon */}
            <span className="text-sm leading-none flex-shrink-0">
                {info?.icon}
            </span>

            {/* Title */}
            <span
                className={`flex-1 text-sm font-medium transition-all duration-200 ${task.completed ? 'line-through text-slate-600' : 'text-slate-200'
                    }`}
            >
                {task.title}
            </span>

            {/* XP reward */}
            <span className={`font-vt text-lg leading-none flex-shrink-0 tabular-nums ${task.completed ? 'text-green-400' : c.text
                }`}>
                +{task.xp}
            </span>
            <span className="font-display text-[7px] text-slate-600 flex-shrink-0 uppercase">xp</span>
        </div>
    )
}

export default function TaskSection({ title, icon, tasks, onToggle, emptyLabel }) {
    if (!tasks?.length) return null

    const done = tasks.filter(t => t.completed).length
    const total = tasks.length

    return (
        <section>
            <SectionHeader
                title={`${icon} ${title}`}
                right={
                    <div className="flex items-center gap-2">
                        <span className="font-vt text-xl leading-none tabular-nums text-slate-400">
                            {done}/{total}
                        </span>
                    </div>
                }
            />

            <div
                className={`rounded-xl border overflow-hidden divide-y divide-white/[0.04]
          ${done === total && total > 0
                        ? 'border-green-500/30 bg-green-500/[0.04]'
                        : 'border-slate-800/60 bg-game-surface/40'
                    }`}
            >
                {tasks.map(task => (
                    <TaskRow key={task.id} task={task} onToggle={onToggle} />
                ))}

                {/* Progress bar at bottom */}
                <div className="h-1 bg-black/40">
                    <div
                        className="h-full bg-green-400 transition-all duration-500"
                        style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
                    />
                </div>
            </div>
        </section>
    )
}
