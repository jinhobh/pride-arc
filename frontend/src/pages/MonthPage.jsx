import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MONTH_META, SKILL_INFO } from '../constants/planData'

const BASE = '/api'

// ── Helpers ───────────────────────────────────────────────────────────────────

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

function getWeekDots(taskId, recentCompletions) {
  const today = new Date()
  const dateSet = new Set(
    recentCompletions
      .filter(r => r.task_id === taskId)
      .map(r => r.completed_at.substring(0, 10))
  )
  const dots = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const label = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()]
    dots.push({ dateStr, label, done: dateSet.has(dateStr) })
  }
  return dots
}

const DIFFICULTY = {
  easy: { label: 'EASY', cls: 'text-green-400  bg-green-500/10  border-green-500/30' },
  medium: { label: 'MED', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  hard: { label: 'HARD', cls: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  epic: { label: 'EPIC', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
}

// ── StreakDots ─────────────────────────────────────────────────────────────────

function StreakDots({ taskId, recentCompletions }) {
  const dots = getWeekDots(taskId, recentCompletions)
  return (
    <div className="flex gap-1.5 mt-2">
      {dots.map(d => (
        <div key={d.dateStr} className="flex flex-col items-center gap-0.5">
          <div className={`w-3 h-3 rounded-full border ${d.done
              ? 'bg-green-400 border-green-400'
              : 'bg-transparent border-slate-700'
            }`} />
          <span className="font-display text-[7px] text-slate-600">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// ── TaskCard ───────────────────────────────────────────────────────────────────

function TaskCard({ task, recentCompletions, onToggle }) {
  const [pending, setPending] = useState(false)
  const today = todayISO()

  const isRecurring = task.frequency !== 'once'
  const isRecurringDone = isRecurring
    ? task.frequency === 'daily'
      ? recentCompletions.some(r => r.task_id === task.id && r.completed_at.startsWith(today))
      : recentCompletions.some(r => r.task_id === task.id)
    : false
  const checked = isRecurring ? isRecurringDone : task.completed

  async function handleToggle() {
    if (pending) return
    setPending(true)
    await onToggle(task.id, !checked)
    setPending(false)
  }

  return (
    <div className={`flex gap-3 px-3 py-3 transition-opacity duration-200 ${checked ? 'opacity-50' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={pending}
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${checked ? 'border-green-500 bg-green-500/20' : 'border-slate-600 hover:border-slate-400'
          }`}
        aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
      >
        {pending ? (
          <div className="w-2.5 h-2.5 rounded-full border border-slate-500 border-t-transparent animate-spin" />
        ) : checked ? (
          <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${checked ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className="font-vt text-sm text-yellow-400">+{task.xp} XP</span>
          {isRecurring && (
            <span className="font-display text-[8px] text-slate-600 uppercase tracking-wider">
              {task.frequency}
            </span>
          )}
        </div>
        {task.frequency === 'daily' && (
          <StreakDots taskId={task.id} recentCompletions={recentCompletions} />
        )}
      </div>
    </div>
  )
}

// ── SectionCard ────────────────────────────────────────────────────────────────

function SectionCard({ section, recentCompletions, onToggle }) {
  const [open, setOpen] = useState(true)
  const skill = SKILL_INFO[section.skillType] || SKILL_INFO.project
  const c = skill.c
  const onceTasks = section.tasks.filter(t => t.frequency === 'once')
  const doneCount = onceTasks.filter(t => t.completed).length

  return (
    <div className={`rounded-xl border overflow-hidden ${c.border}`}>
      {/* Header — click to collapse */}
      <button
        className={`w-full flex items-center gap-3 px-4 py-3 ${c.bg} cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-base leading-none">{skill.icon}</span>
        <span className={`flex-1 text-left font-display text-[9px] uppercase tracking-wider ${c.text}`}>
          {section.title}
        </span>
        {onceTasks.length > 0 && (
          <span className={`font-vt text-base ${c.text}`}>
            {doneCount}/{onceTasks.length}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ml-1 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Task list */}
      {open && (
        <div className="divide-y divide-game-border/50 px-1">
          {section.tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              recentCompletions={recentCompletions}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── CheckpointRow ──────────────────────────────────────────────────────────────

function CheckpointRow({ checkpoint, onComplete }) {
  const [pending, setPending] = useState(false)
  const skill = SKILL_INFO[checkpoint.skillType] || SKILL_INFO.project

  async function handleComplete() {
    if (pending || checkpoint.completed) return
    setPending(true)
    await onComplete(checkpoint.id)
    setPending(false)
  }

  return (
    <div className={`flex items-start gap-3 px-3 py-3 transition-opacity duration-200 ${checkpoint.completed ? 'opacity-60' : ''}`}>
      <button
        onClick={handleComplete}
        disabled={checkpoint.completed || pending}
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${checkpoint.completed
            ? 'border-yellow-500 bg-yellow-500/20'
            : 'border-slate-600 hover:border-yellow-500/60 cursor-pointer'
          }`}
        aria-label={checkpoint.completed ? 'Completed' : 'Mark complete'}
      >
        {pending ? (
          <div className="w-2 h-2 rounded-full border border-slate-500 border-t-transparent animate-spin" />
        ) : checkpoint.completed ? (
          <svg className="w-2.5 h-2.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${checkpoint.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
          {checkpoint.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`font-display text-[8px] ${skill.c.text}`}>{skill.label}</span>
          <span className="font-vt text-sm text-yellow-400">+{checkpoint.xpReward} XP</span>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function MonthPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const n = Number(id)
  const meta = MONTH_META[n]

  const [month, setMonth] = useState(null)
  const [recentCompletions, setRecentCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [monthRes, recentRes] = await Promise.all([
        fetch(`${BASE}/plan/month/${n}`),
        fetch(`${BASE}/completions/recent?days=7`),
      ])
      if (!monthRes.ok) throw new Error(`Month fetch failed: ${monthRes.status}`)
      const [monthData, recentData] = await Promise.all([
        monthRes.json(),
        recentRes.ok ? recentRes.json() : Promise.resolve([]),
      ])
      setMonth(monthData)
      setRecentCompletions(Array.isArray(recentData) ? recentData : [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [n])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Actions ──────────────────────────────────────────────────────────────
  const toggleTask = useCallback(async (taskId, completed) => {
    const endpoint = completed ? '/task/complete' : '/task/uncomplete'
    try {
      const res = await fetch(`${BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId }),
      })
      if (res.ok) await fetchAll()
    } catch { /* swallow */ }
  }, [fetchAll])

  const completeCheckpoint = useCallback(async (cpId) => {
    try {
      const res = await fetch(`${BASE}/checkpoint/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkpoint_id: cpId }),
      })
      if (res.ok) await fetchAll()
    } catch { /* swallow */ }
  }, [fetchAll])

  // ── Computed stats ───────────────────────────────────────────────────────
  const { earnedXP, totalXP, doneCount, totalCount, cpDoneCount, allCpsDone, progressPct } = useMemo(() => {
    if (!month) return { earnedXP: 0, totalXP: 0, doneCount: 0, totalCount: 0, cpDoneCount: 0, allCpsDone: false, progressPct: 0 }
    const onceTasks = month.sections.flatMap(s => s.tasks).filter(t => t.frequency === 'once')
    const earnedTask = onceTasks.filter(t => t.completed).reduce((s, t) => s + t.xp, 0)
    const earnedCp = month.checkpoints.filter(c => c.completed).reduce((s, c) => s + c.xpReward, 0)
    const totalTask = onceTasks.reduce((s, t) => s + t.xp, 0)
    const totalCp = month.checkpoints.reduce((s, c) => s + c.xpReward, 0)
    const earned = earnedTask + earnedCp
    const total = totalTask + totalCp
    const cpDone = month.checkpoints.filter(c => c.completed).length
    return {
      earnedXP: earned,
      totalXP: total,
      doneCount: onceTasks.filter(t => t.completed).length,
      totalCount: onceTasks.length,
      cpDoneCount: cpDone,
      allCpsDone: cpDone === month.checkpoints.length,
      progressPct: total > 0 ? Math.round((earned / total) * 100) : 0,
    }
  }, [month])

  if (!meta) {
    return (
      <div className="min-h-screen bg-game-bg flex items-center justify-center">
        <p className="font-display text-xs text-slate-500">Month not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-game-bg">
      {/* Back nav */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-2">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer group"
        >
          <svg
            className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-display text-[9px] uppercase tracking-widest">Dashboard</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16 space-y-4">
        {/* ── Month hero ─────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-game-border bg-game-surface p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="text-5xl leading-none select-none">{meta.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[8px] uppercase tracking-[0.3em] text-slate-600 mb-1">
                Month {n}
              </div>
              <h1 className="font-display text-[11px] sm:text-sm text-white uppercase tracking-widest leading-relaxed">
                {meta.title}
              </h1>
              {month && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{month.subtitle}</p>}

              {/* Progress bar */}
              {month && (
                <div className="mt-4">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="font-display text-[8px] text-slate-600 uppercase tracking-wider">Progress</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-vt text-base text-yellow-400">{earnedXP}</span>
                      <span className="font-vt text-sm text-slate-600">/ {totalXP} XP</span>
                      <span className="font-display text-[8px] text-slate-600">{doneCount}/{totalCount}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-game-card overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPct}%`,
                        background: `linear-gradient(90deg, ${meta.hex}88, ${meta.hex})`,
                      }}
                    />
                  </div>
                  <div className="text-right mt-1">
                    <span className="font-display text-[8px] text-slate-600">{progressPct}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Loading / error ────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-slate-400 animate-spin" />
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="font-display text-[9px] text-red-400">Failed to load: {error}</p>
          </div>
        )}

        {/* ── Section cards ──────────────────────────────────────────────────── */}
        {!loading && month && month.sections.map(section => (
          <SectionCard
            key={section.id}
            section={section}
            recentCompletions={recentCompletions}
            onToggle={toggleTask}
          />
        ))}

        {/* ── Checkpoints ────────────────────────────────────────────────────── */}
        {!loading && month && (
          <div className="rounded-xl border border-game-border bg-game-surface overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-game-border bg-game-card/50">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span className="font-display text-[9px] text-slate-300 uppercase tracking-wider">
                  Chapter Checkpoints
                </span>
              </div>
              <span className={`font-vt text-lg ${allCpsDone ? 'text-yellow-400' : 'text-slate-400'}`}>
                {cpDoneCount}/{month.checkpoints.length}
              </span>
            </div>

            {/* Checkpoint progress bar */}
            <div className="px-4 py-2 border-b border-game-border/50">
              <div className="h-1.5 rounded-full bg-game-card overflow-hidden">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                  style={{ width: `${month.checkpoints.length > 0 ? (cpDoneCount / month.checkpoints.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-game-border/50 px-1">
              {month.checkpoints.map(cp => (
                <CheckpointRow
                  key={cp.id}
                  checkpoint={cp}
                  onComplete={completeCheckpoint}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Chapter reward banner ──────────────────────────────────────────── */}
        {!loading && month && allCpsDone && (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{ borderColor: `${meta.hex}50`, background: `${meta.hex}0d` }}
          >
            <div className="text-5xl mb-3 select-none">{month.chapterReward.badgeIcon}</div>
            <div className="font-display text-[8px] text-slate-500 uppercase tracking-[0.3em] mb-1">
              Chapter Complete
            </div>
            <h2 className="font-display text-[11px] sm:text-sm text-white uppercase tracking-widest mb-3">
              {month.chapterReward.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto mb-5">
              {month.chapterReward.description}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
              <span className="font-display text-[8px] text-yellow-500 uppercase tracking-wider">Chapter Bonus</span>
              <span className="font-vt text-lg text-yellow-400">+{month.chapterReward.xpBonus} XP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
