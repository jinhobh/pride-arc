import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { MONTH_META, SKILL_INFO } from '../constants/planData'
import { usePlanStudio } from '../hooks/useApi'

const BASE = '/api'

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

const SKILL_COLORS = {
  dsa:           '#4A7C59',
  ml:            '#7B68A6',
  backend:       '#8B6F47',
  devops:        '#5E8A7A',
  cloud:         '#8BBDD9',
  system_design: '#C9A84C',
  project:       '#E8956D',
  networking:    '#7AAE87',
  interviewing:  '#B85C38',
  career:        '#D4A843',
}

const DIFFICULTY_STYLES = {
  easy:   { label: 'Easy',   bg: '#EAF4EC', text: '#4A7C59', border: '#7AAE87' },
  medium: { label: 'Medium', bg: '#FDF6E3', text: '#8B6510', border: '#C9A84C' },
  hard:   { label: 'Hard',   bg: '#FDF0E8', text: '#8B3A1A', border: '#E8956D' },
  epic:   { label: 'Epic',   bg: '#F0EDF8', text: '#4A3570', border: '#B8A9C9' },
}

// ── Data hook ─────────────────────────────────────────────────────────────────

function usePlanData() {
  const [currentMonth, setCurrentMonth] = useState(1)
  const [monthsData, setMonthsData] = useState({})
  const [progress, setProgress] = useState(null)
  const [recentCompletions, setRecentCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [stateRes, progressRes, recentRes] = await Promise.all([
        fetch(`${BASE}/state`),
        fetch(`${BASE}/progress`),
        fetch(`${BASE}/completions/recent?days=7`),
      ])
      if (!stateRes.ok) throw new Error(`State fetch failed: ${stateRes.status}`)

      const [stateData, progressData, recentData] = await Promise.all([
        stateRes.json(),
        progressRes.ok ? progressRes.json() : null,
        recentRes.ok ? recentRes.json() : Promise.resolve([]),
      ])

      const cm = stateData.current_month ?? 1
      setCurrentMonth(cm)
      setProgress(progressData)
      setRecentCompletions(Array.isArray(recentData) ? recentData : [])

      // Fetch all unlocked months in parallel
      const monthResponses = await Promise.all(
        Array.from({ length: cm }, (_, i) => i + 1).map(n => fetch(`${BASE}/plan/month/${n}`))
      )
      const monthJsons = await Promise.all(
        monthResponses.map(r => r.ok ? r.json() : null)
      )
      const monthsMap = {}
      monthJsons.forEach((data, i) => { if (data) monthsMap[i + 1] = data })
      setMonthsData(monthsMap)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

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

  return {
    currentMonth, monthsData, progress, recentCompletions,
    loading, error, toggleTask, completeCheckpoint,
  }
}

// ── StreakDots ─────────────────────────────────────────────────────────────────

function StreakDots({ taskId, recentCompletions }) {
  const todayStr = todayISO()
  const dots = getWeekDots(taskId, recentCompletions)

  return (
    <div className="flex gap-1.5 mt-2">
      {dots.map(d => {
        const isToday = d.dateStr === todayStr
        return (
          <div key={d.dateStr} className="flex flex-col items-center gap-0.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: d.done ? '#4A7C59' : isToday ? '#E8D5A3' : 'rgba(139,189,217,0.3)',
                border: isToday && !d.done ? '1.5px solid #8B6F47' : 'none',
              }}
            />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: '#6B7F6E' }}>
              {d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── TaskCard ───────────────────────────────────────────────────────────────────

function TaskCard({ task, recentCompletions, onToggle }) {
  const [pending, setPending] = useState(false)
  const today = todayISO()

  const isRecurring = task.frequency !== 'once'
  const isDoneToday = isRecurring
    ? task.frequency === 'daily'
      ? recentCompletions.some(r => r.task_id === task.id && r.completed_at.startsWith(today))
      : recentCompletions.some(r => r.task_id === task.id)
    : false
  const checked = isRecurring ? isDoneToday : task.completed
  const diff = task.difficulty ? DIFFICULTY_STYLES[task.difficulty] : null

  async function handleToggle() {
    if (pending) return
    setPending(true)
    await onToggle(task.id, !checked)
    setPending(false)
  }

  return (
    <div className={`flex gap-3 px-3 py-3 transition-all duration-200 ${checked ? 'opacity-60' : ''}`}>
      <button
        onClick={handleToggle}
        disabled={pending}
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
          checked ? 'border-ghibli-forest bg-ghibli-forest/15' : 'border-ghibli-earth/40 hover:border-ghibli-earth/70'
        }`}
      >
        {pending ? (
          <div className="w-2.5 h-2.5 rounded-full border border-ghibli-earth/50 border-t-transparent animate-spin" />
        ) : checked ? (
          <svg className="w-3 h-3 text-ghibli-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium leading-snug"
          style={{
            fontFamily: 'Inter, sans-serif',
            color: checked ? 'rgba(107,127,110,0.6)' : '#2C2416',
            textDecoration: checked ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#4A7C59', fontWeight: 500 }}>
            +{task.xp} XP
          </span>
          {diff && (
            <span
              style={{
                background: diff.bg,
                color: diff.text,
                border: `1px solid ${diff.border}`,
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                padding: '1px 7px',
                lineHeight: '1.4',
              }}
            >
              {diff.label}
            </span>
          )}
          {isRecurring && (
            <span className="font-display text-[8px] text-ghibli-mist/60 uppercase tracking-wider">
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
  const skill = SKILL_INFO[section.skillType] ?? SKILL_INFO.project
  const accentColor = SKILL_COLORS[section.skillType] ?? '#8B6F47'
  const onceTasks = section.tasks.filter(t => t.frequency === 'once')
  const doneCount = onceTasks.filter(t => t.completed).length

  return (
    <div
      style={{
        borderRadius: '10px',
        border: '1px solid rgba(139,111,71,0.2)',
        borderLeft: `3px solid ${accentColor}`,
        overflow: 'hidden',
        background: '#FAF3E0',
      }}
    >
      <button
        className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-150 ${
          open ? '' : 'hover:bg-[#E8D5A3]/40'
        }`}
        style={{
          background: open ? 'rgba(232,213,163,0.25)' : 'transparent',
          borderRadius: open ? '7px 7px 0 0' : '7px',
        }}
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-base leading-none">{skill.icon}</span>
        <span
          className="flex-1 text-left uppercase tracking-wider"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: accentColor }}
        >
          {section.title}
        </span>
        {onceTasks.length > 0 && (
          <span
            className="font-vt text-base"
            style={{ color: accentColor }}
          >
            {doneCount}/{onceTasks.length}
          </span>
        )}
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ml-1 ${open ? 'rotate-180' : ''}`}
          style={{ color: '#6B7F6E' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="divide-y divide-ghibli-earth/20 px-1">
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
  const skill = SKILL_INFO[checkpoint.skillType] ?? SKILL_INFO.project

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
        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          checkpoint.completed
            ? 'border-ghibli-gold bg-ghibli-gold/15'
            : 'border-ghibli-earth/40 hover:border-ghibli-gold/50 cursor-pointer'
        }`}
      >
        {pending ? (
          <div className="w-2 h-2 rounded-full border border-ghibli-earth/50 border-t-transparent animate-spin" />
        ) : checkpoint.completed ? (
          <svg className="w-2.5 h-2.5 text-ghibli-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${checkpoint.completed ? 'line-through text-ghibli-mist/60' : 'text-ghibli-ink'}`}>
          {checkpoint.title}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`font-display text-[8px] ${skill.c.text}`}>{skill.label}</span>
          <span className="font-vt text-sm text-ghibli-gold">+{checkpoint.xpReward} XP</span>
        </div>
      </div>
    </div>
  )
}

// ── CheckpointsPanel ───────────────────────────────────────────────────────────

function CheckpointsPanel({ checkpoints, onComplete }) {
  const cpDone = checkpoints.filter(c => c.completed).length
  const cpTotal = checkpoints.length

  return (
    <div className="overflow-hidden" style={{ borderRadius: '10px', border: '1px solid rgba(139,111,71,0.25)', background: '#FDF8F0' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-ghibli-earth/25 bg-ghibli-sand/30">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">⛩️</span>
          <span
            className="uppercase tracking-wider"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: 'rgba(44,36,22,0.8)' }}
          >
            Chapter Milestones
          </span>
        </div>
        <span
          className="font-vt text-lg"
          style={{ color: cpDone === cpTotal ? '#D4A843' : '#6B7F6E', fontFamily: 'monospace' }}
        >
          {cpDone}/{cpTotal}
        </span>
      </div>
      <div className="px-4 py-2 border-b border-ghibli-earth/20">
        <div className="rounded-full overflow-hidden" style={{ height: '6px', background: '#E8D5A3' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${cpTotal > 0 ? (cpDone / cpTotal) * 100 : 0}%`, background: '#4A7C59' }}
          />
        </div>
      </div>
      <div className="divide-y divide-ghibli-earth/20 px-1">
        {checkpoints.map(cp => (
          <CheckpointRow key={cp.id} checkpoint={cp} onComplete={onComplete} />
        ))}
      </div>
    </div>
  )
}

// ── ChapterRewardBanner ────────────────────────────────────────────────────────

function ChapterRewardBanner({ reward }) {
  return (
    <div
      className="relative rounded-2xl p-6 text-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #EEF6EC 0%, #FDF8F0 50%, #EDE9F6 100%)',
        border: '1px solid #7AAE87',
      }}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: 'hidden', borderRadius: 'inherit' }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '30%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
            animation: 'shimmer-card 4s ease-in-out infinite',
          }}
        />
      </div>

      <div className="relative z-10">
        <div className="text-6xl mb-4 select-none">{reward.badgeIcon}</div>
        <div
          className="uppercase tracking-[0.3em] mb-1"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: 'rgba(107,127,110,0.7)' }}
        >
          Chapter Complete
        </div>
        <h2
          className="mb-3"
          style={{ fontFamily: '"Shippori Mincho", serif', fontSize: '1.6rem', fontWeight: 600, fontStyle: 'italic', color: '#2C2416', lineHeight: 1.2 }}
        >
          {reward.title}
        </h2>
        <p
          className="leading-relaxed max-w-sm mx-auto mb-5"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontStyle: 'italic', color: '#6B7F6E' }}
        >
          {reward.description}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg" style={{ border: '1px solid rgba(212,168,67,0.35)', background: 'rgba(212,168,67,0.08)' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontStyle: 'italic', color: '#D4A843', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Chapter Bonus
          </span>
          <span className="font-vt text-2xl text-ghibli-gold">✨ +{reward.xpBonus} XP</span>
        </div>
      </div>
    </div>
  )
}

// ── MonthSection ───────────────────────────────────────────────────────────────

function MonthSection({ n, monthData, meta, monthProgress, isCurrent, recentCompletions, onToggle, onCompleteCheckpoint }) {
  const [open, setOpen] = useState(isCurrent)

  const { earnedXP, totalXP, doneCount, totalCount, allCpsDone, progressPct } = useMemo(() => {
    if (!monthData) return { earnedXP: 0, totalXP: 0, doneCount: 0, totalCount: 0, allCpsDone: false, progressPct: 0 }
    const onceTasks = monthData.sections.flatMap(s => s.tasks).filter(t => t.frequency === 'once')
    const earnedTask = onceTasks.filter(t => t.completed).reduce((s, t) => s + t.xp, 0)
    const earnedCp = monthData.checkpoints.filter(c => c.completed).reduce((s, c) => s + c.xpReward, 0)
    const totalTask = onceTasks.reduce((s, t) => s + t.xp, 0)
    const totalCp = monthData.checkpoints.reduce((s, c) => s + c.xpReward, 0)
    const cpDone = monthData.checkpoints.filter(c => c.completed).length
    return {
      earnedXP: earnedTask + earnedCp,
      totalXP: totalTask + totalCp,
      doneCount: onceTasks.filter(t => t.completed).length,
      totalCount: onceTasks.length,
      allCpsDone: cpDone === monthData.checkpoints.length && monthData.checkpoints.length > 0,
      progressPct: (totalTask + totalCp) > 0
        ? Math.round(((earnedTask + earnedCp) / (totalTask + totalCp)) * 100)
        : 0,
    }
  }, [monthData])

  const pct = monthProgress?.completion_pct ?? progressPct

  return (
    <section id={`month-${n}`} className="scroll-mt-20">
      {/* Accordion header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 text-left ${
          isCurrent
            ? 'border-ghibli-forest/40 bg-ghibli-cream'
            : 'border-ghibli-earth/30 bg-ghibli-cream/60 hover:border-ghibli-earth/50'
        }`}
        style={isCurrent ? { boxShadow: '0 0 18px rgba(74,124,89,0.08)' } : {}}
      >
        <span className="text-3xl leading-none select-none flex-shrink-0">{meta.icon}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display text-xs italic text-ghibli-mist">Month {n}</span>
            {isCurrent && (
              <span className="bg-ghibli-forest text-white font-display text-[7px] uppercase tracking-widest px-1.5 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>
          <p className="font-display text-xs sm:text-sm italic font-semibold text-ghibli-ink leading-snug">
            {meta.title}
          </p>
          {/* Mini progress bar */}
          <div className="mt-2 h-1 rounded-full bg-ghibli-earth/15 overflow-hidden w-32">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: meta.hex }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-vt text-lg text-ghibli-mist tabular-nums hidden sm:block">{Math.round(pct)}%</span>
          <svg
            className={`w-4 h-4 text-ghibli-mist transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Accordion body */}
      {open && monthData && (
        <div className="mt-3 space-y-3 pl-0">
          {/* Month subtitle */}
          {monthData.subtitle && (
            <p className="text-xs text-ghibli-mist leading-relaxed px-1">{monthData.subtitle}</p>
          )}

          {/* Task sections */}
          {monthData.sections.map(section => (
            <SectionCard
              key={section.id}
              section={section}
              recentCompletions={recentCompletions}
              onToggle={onToggle}
            />
          ))}

          {/* Checkpoints */}
          {monthData.checkpoints.length > 0 && (
            <CheckpointsPanel
              checkpoints={monthData.checkpoints}
              onComplete={onCompleteCheckpoint}
            />
          )}

          {/* Chapter reward */}
          {allCpsDone && (
            <ChapterRewardBanner reward={monthData.chapterReward} meta={meta} />
          )}
        </div>
      )}
    </section>
  )
}

// ── ChapterScrollRow ───────────────────────────────────────────────────────────

function ChapterScrollRow({ currentMonth, progress }) {
  function scrollToMonth(n) {
    const el = document.getElementById(`month-${n}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 pt-4 scrollbar-hide -mx-1 px-1">
      {[1, 2, 3, 4, 5, 6].map(n => {
        const meta = MONTH_META[n]
        const monthProgress = progress?.months?.find(m => m.month_number === n)
        const pct = monthProgress?.completion_pct ?? 0
        const isLocked = n > currentMonth
        const isCurrent = n === currentMonth
        const isComplete = pct >= 100

        if (isLocked) {
          return (
            <div
              key={n}
              className="flex-shrink-0 w-36 cursor-not-allowed select-none opacity-35"
              style={{ borderRadius: '14px', border: '1px solid rgba(200,230,245,0.6)', background: '#C8E6F5' }}
            >
              <div className="flex flex-col items-center justify-center gap-2 p-4 min-h-[140px]">
                <span className="text-2xl leading-none">🔒</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: 'rgba(107,127,110,0.7)' }}>
                  Month {n}
                </span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', color: 'rgba(107,127,110,0.5)', textAlign: 'center', lineHeight: 1.3 }}>
                  {meta.title}
                </span>
              </div>
            </div>
          )
        }

        return (
          <button
            key={n}
            onClick={() => scrollToMonth(n)}
            className="relative flex-shrink-0 w-36 cursor-pointer text-left transition-all duration-200 hover:scale-[1.03] focus:outline-none overflow-visible"
            style={{
              borderRadius: '14px',
              border: isCurrent ? '2px solid #4A7C59' : isComplete ? '1px solid #7AAE87' : '1px solid rgba(139,111,71,0.25)',
              background: isCurrent || isComplete ? '#F0F7F1' : '#FAF3E0',
              boxShadow: isCurrent ? '0 2px 12px rgba(74,124,89,0.15)' : 'none',
            }}
          >
            {/* Top ribbon for current */}
            {isCurrent && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: '#4A7C59',
                  borderRadius: '14px 14px 0 0',
                }}
              />
            )}

            {/* Active pill */}
            {isCurrent && (
              <span
                className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
                style={{
                  background: '#4A7C59',
                  color: '#fff',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}
              >
                Active
              </span>
            )}

            <div className="flex flex-col gap-2.5 p-3.5 min-h-[140px]" style={{ paddingTop: isCurrent ? '1.25rem' : undefined }}>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', color: '#6B7F6E' }}>M{n}</span>
                <span className="text-xl leading-none">{isComplete ? meta.badgeIcon : meta.icon}</span>
              </div>

              {isComplete && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" style={{ color: '#4A7C59' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 600, color: '#4A7C59' }}>Complete</span>
                </div>
              )}

              <p
                className="flex-1 leading-snug"
                style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 500, color: 'rgba(44,36,22,0.8)' }}
              >
                {meta.title}
              </p>

              <div className="space-y-1">
                <div className="rounded-full overflow-hidden" style={{ height: '6px', background: '#E8D5A3' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: '#4A7C59' }}
                  />
                </div>
                <span className="font-vt text-sm leading-none text-ghibli-mist tabular-nums">{pct.toFixed(0)}%</span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ── PaceWidget ────────────────────────────────────────────────────────────────

function PaceWidget({ pace }) {
  if (!pace) return null

  const statusStyles = {
    'Ahead':    { bg: '#EEF6EC', text: '#4A7C59', border: '#7AAE87' },
    'Behind':   { bg: '#FDF0E8', text: '#8B3A1A', border: '#E8956D' },
    'On Track': { bg: '#FDF8F0', text: '#8B6F47', border: '#C9A84C' },
  }
  const s = statusStyles[pace.status] ?? statusStyles['On Track']
  const pct = Math.min(100, Math.round((pace.arc_day / pace.arc_total_days) * 100))

  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ background: s.bg, border: `1px solid ${s.border}` }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-sans text-xs font-semibold uppercase tracking-wider"
          style={{ color: s.text }}
        >
          Arc Pace
        </span>
        <span
          className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full"
          style={{ background: s.border + '30', color: s.text, border: `1px solid ${s.border}` }}
        >
          {pace.status}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="rounded-full overflow-hidden" style={{ height: '5px', background: 'rgba(139,111,71,0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: s.text }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-vt text-xs" style={{ color: s.text }}>Day {pace.arc_day}</span>
          <span className="font-vt text-xs text-ghibli-mist">{pace.arc_total_days} days</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-sans">
        <div>
          <span style={{ color: '#6B7F6E' }}>Expected: </span>
          <span className="font-semibold" style={{ color: s.text }}>{pace.expected_xp_today.toLocaleString()} XP</span>
        </div>
        <div>
          <span style={{ color: '#6B7F6E' }}>Earned: </span>
          <span className="font-semibold" style={{ color: s.text }}>{pace.earned_xp.toLocaleString()} XP</span>
        </div>
        <div>
          <span className="font-semibold" style={{ color: pace.delta_xp >= 0 ? '#4A7C59' : '#8B3A1A' }}>
            {pace.delta_xp >= 0 ? '+' : ''}{pace.delta_xp} XP
          </span>
        </div>
      </div>
    </div>
  )
}

// ── PlanWeekView ──────────────────────────────────────────────────────────────

function PlanWeekView() {
  const [weekData, setWeekData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plan/week')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setWeekData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-7 h-7 rounded-full border-2 border-ghibli-forest/20 border-t-ghibli-forest animate-spin" />
      </div>
    )
  }

  if (!weekData) {
    return <p className="text-center text-xs text-ghibli-mist py-8">Could not load weekly plan.</p>
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-ghibli-mist font-sans">
        Week of {new Date(weekData.week_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {weekData.days.map(day => (
          <div
            key={day.date}
            className="flex-shrink-0 w-40 rounded-xl p-3 space-y-2"
            style={{
              background: day.is_today ? '#EEF6EC' : '#FAF3E0',
              border: day.is_today ? '1.5px solid #7AAE87' : '1px solid rgba(139,111,71,0.2)',
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="font-sans text-xs font-semibold"
                style={{ color: day.is_today ? '#4A7C59' : '#6B7F6E' }}
              >
                {day.day}
              </span>
              {day.is_today && (
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider" style={{ color: '#4A7C59' }}>
                  Today
                </span>
              )}
            </div>

            {day.tasks.length === 0 ? (
              <p className="text-[10px] text-ghibli-mist/50 font-sans italic">Rest day</p>
            ) : (
              <div className="space-y-1.5">
                {day.tasks.map(t => (
                  <div
                    key={t.id}
                    className="text-[10px] font-sans leading-snug"
                    style={{
                      color: t.completed ? 'rgba(107,127,110,0.5)' : 'rgba(44,36,22,0.8)',
                      textDecoration: t.completed ? 'line-through' : 'none',
                    }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                      style={{ background: SKILL_COLORS[t.skill_type] ?? '#8B6F47', flexShrink: 0 }}
                    />
                    {t.title.length > 45 ? t.title.slice(0, 45) + '…' : t.title}
                    <span className="ml-1 text-[9px]" style={{ color: '#4A7C59' }}>+{t.xp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PlanStudioView ────────────────────────────────────────────────────────────

const SKILL_OPTIONS = [
  'dsa', 'ml', 'backend', 'devops', 'cloud', 'system_design',
  'project', 'networking', 'interviewing', 'career',
]
const FREQ_OPTIONS = ['once', 'daily', 'weekly']

function EditTaskModal({ task, sectionId, monthNumber, onSave, onClose, onDelete }) {
  const [form, setForm] = useState({
    title: task?.title ?? '',
    skill_type: task?.skill_type ?? 'dsa',
    frequency: task?.frequency ?? 'once',
    xp: task?.xp ?? 10,
    month_number: task?.month_number ?? monthNumber,
  })
  const [saving, setSaving] = useState(false)

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    await onSave(task?.id ?? null, { ...form, xp: Number(form.xp), section_id: sectionId })
    setSaving(false)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(10,14,26,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4"
        style={{ background: '#FAF3E0', border: '1px solid rgba(139,111,71,0.3)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm italic font-semibold text-ghibli-ink">
            {task ? 'Edit Task' : 'Add Task'}
            {task?.is_custom && (
              <span className="ml-2 text-ghibli-gold text-base">✱</span>
            )}
          </h3>
          <button onClick={onClose} className="text-ghibli-mist hover:text-ghibli-ink text-lg leading-none">×</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-ghibli-mist mb-1">Title</label>
            <textarea
              value={form.title}
              onChange={e => setField('title', e.target.value)}
              rows={2}
              className="w-full rounded-lg px-3 py-2 text-sm font-sans resize-none focus:outline-none"
              style={{ background: '#FDF8F0', border: '1px solid rgba(139,111,71,0.3)', color: '#2C2416' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-ghibli-mist mb-1">Skill</label>
              <select
                value={form.skill_type}
                onChange={e => setField('skill_type', e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-xs font-sans focus:outline-none"
                style={{ background: '#FDF8F0', border: '1px solid rgba(139,111,71,0.3)', color: '#2C2416' }}
              >
                {SKILL_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-ghibli-mist mb-1">Frequency</label>
              <select
                value={form.frequency}
                onChange={e => setField('frequency', e.target.value)}
                className="w-full rounded-lg px-2 py-2 text-xs font-sans focus:outline-none"
                style={{ background: '#FDF8F0', border: '1px solid rgba(139,111,71,0.3)', color: '#2C2416' }}
              >
                {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-ghibli-mist mb-1">XP</label>
              <input
                type="number"
                value={form.xp}
                min={1}
                onChange={e => setField('xp', e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm font-sans focus:outline-none"
                style={{ background: '#FDF8F0', border: '1px solid rgba(139,111,71,0.3)', color: '#2C2416' }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-ghibli-mist mb-1">Month</label>
              <select
                value={form.month_number}
                onChange={e => setField('month_number', Number(e.target.value))}
                className="w-full rounded-lg px-2 py-2 text-xs font-sans focus:outline-none"
                style={{ background: '#FDF8F0', border: '1px solid rgba(139,111,71,0.3)', color: '#2C2416' }}
              >
                {[1,2,3,4,5,6].map(m => <option key={m} value={m}>Month {m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="flex-1 py-2 rounded-lg text-sm font-sans font-semibold transition-opacity"
            style={{ background: '#4A7C59', color: '#fff', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : task ? 'Save Changes' : 'Add Task'}
          </button>
          {task && onDelete && (
            <button
              onClick={() => { onDelete(task.id); onClose() }}
              className="px-4 py-2 rounded-lg text-sm font-sans font-semibold"
              style={{ background: 'rgba(229,62,62,0.12)', color: '#C53030', border: '1px solid rgba(229,62,62,0.3)' }}
            >
              Hide
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StudioSectionCard({ section, onEditTask, onAddTask, onDeleteTask }) {
  const [open, setOpen] = useState(true)
  const accentColor = SKILL_COLORS[section.skillType] ?? '#8B6F47'

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: '10px',
        border: '1px solid rgba(139,111,71,0.2)',
        borderLeft: `3px solid ${accentColor}`,
        background: '#FAF3E0',
      }}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer"
        style={{ background: open ? 'rgba(232,213,163,0.25)' : 'transparent' }}
        onClick={() => setOpen(o => !o)}
      >
        <span
          className="flex-1 text-left uppercase tracking-wider"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: accentColor }}
        >
          {section.title}
        </span>
        <span className="text-xs font-sans text-ghibli-mist">{section.tasks.length}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ml-1 ${open ? 'rotate-180' : ''}`}
          style={{ color: '#6B7F6E' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-1 pb-2">
          {section.tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-2 px-3 py-2 border-t border-ghibli-earth/15 group"
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: SKILL_COLORS[task.skill_type] ?? '#8B6F47' }}
              />
              <span
                className="flex-1 text-xs font-sans leading-snug"
                style={{ color: task.completed ? 'rgba(107,127,110,0.5)' : 'rgba(44,36,22,0.85)' }}
              >
                {task.title}
                {task.is_custom && <span className="ml-1 text-ghibli-gold text-xs">✱</span>}
              </span>
              <span className="text-[10px] font-sans" style={{ color: '#4A7C59' }}>+{task.xp}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditTask(task, section.id)}
                  className="p-1 rounded hover:bg-ghibli-earth/20 transition-colors"
                  title="Edit task"
                >
                  <svg className="w-3 h-3 text-ghibli-mist" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 rounded hover:bg-red-100 transition-colors"
                  title="Hide task"
                >
                  <svg className="w-3 h-3 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={() => onAddTask(section.id)}
            className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-xs font-sans transition-colors hover:bg-ghibli-earth/10"
            style={{ color: '#6B7F6E', border: '1px dashed rgba(139,111,71,0.3)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add task
          </button>
        </div>
      )}
    </div>
  )
}

function PlanStudioView({ currentMonth }) {
  const {
    studioData, pace, loading, error,
    fetchStudioMonth, updateTask, createTask, deleteTask,
  } = usePlanStudio()

  const [selectedMonth, setSelectedMonth] = useState(currentMonth ?? 1)
  const [editTarget, setEditTarget] = useState(null) // { task, sectionId } | null
  const [addTarget, setAddTarget] = useState(null)   // sectionId | null

  useEffect(() => {
    fetchStudioMonth(selectedMonth)
  }, [selectedMonth, fetchStudioMonth])

  const refreshData = useCallback(() => {
    fetchStudioMonth(selectedMonth)
  }, [fetchStudioMonth, selectedMonth])

  async function handleSaveTask(taskId, formData) {
    if (taskId) {
      await updateTask(taskId, {
        title: formData.title,
        skill_type: formData.skill_type,
        frequency: formData.frequency,
        xp: formData.xp,
        month_number: formData.month_number,
      })
    } else {
      await createTask({
        title: formData.title,
        skill_type: formData.skill_type,
        frequency: formData.frequency,
        xp: formData.xp,
        month_number: formData.month_number,
        section_id: formData.section_id,
      })
    }
    await refreshData()
  }

  async function handleDeleteTask(taskId) {
    if (!confirm('Hide this task? Your completion history is preserved.')) return
    await deleteTask(taskId)
    await refreshData()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-7 h-7 rounded-full border-2 border-ghibli-forest/20 border-t-ghibli-forest animate-spin" />
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-xs text-red-400 py-8">{error}</p>
  }

  return (
    <div className="space-y-5">
      {/* Pace widget at top of Studio */}
      <PaceWidget pace={pace} />

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-sans font-semibold text-ghibli-mist uppercase tracking-wider">Month</span>
        <div className="flex gap-1.5 flex-wrap">
          {[1,2,3,4,5,6].map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className="w-8 h-8 rounded-lg text-xs font-sans font-semibold transition-all"
              style={{
                background: selectedMonth === m ? '#4A7C59' : 'rgba(139,111,71,0.12)',
                color: selectedMonth === m ? '#fff' : '#6B7F6E',
                border: selectedMonth === m ? 'none' : '1px solid rgba(139,111,71,0.2)',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {studioData && (
        <>
          {/* Subtitle */}
          {studioData.subtitle && (
            <p className="text-xs text-ghibli-mist font-sans leading-relaxed">{studioData.subtitle}</p>
          )}

          {/* Task sections */}
          <div className="space-y-3">
            {studioData.sections.map(section => (
              <StudioSectionCard
                key={section.id}
                section={section}
                onEditTask={(task, sectionId) => setEditTarget({ task, sectionId })}
                onAddTask={(sectionId) => setAddTarget(sectionId)}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          {/* Checkpoints */}
          {studioData.checkpoints.length > 0 && (
            <div className="overflow-hidden" style={{ borderRadius: '10px', border: '1px solid rgba(212,168,67,0.3)', background: '#FDF8F0' }}>
              <div className="px-4 py-3 border-b border-ghibli-earth/20 flex items-center gap-2">
                <span className="text-sm">⛩️</span>
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-ghibli-mist">Checkpoints</span>
              </div>
              <div className="px-2 py-1">
                {studioData.checkpoints.map(cp => (
                  <div key={cp.id} className="flex items-center gap-3 px-2 py-2 border-b border-ghibli-earth/10 last:border-0">
                    <span className={`flex-1 text-xs font-sans ${cp.completed ? 'line-through text-ghibli-mist/50' : 'text-ghibli-ink'}`}>
                      {cp.title}
                      {cp.is_custom && <span className="ml-1 text-ghibli-gold">✱</span>}
                    </span>
                    <span className="font-vt text-sm text-ghibli-gold">+{cp.xp_reward}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Habits */}
          {studioData.habits.length > 0 && (
            <div className="overflow-hidden" style={{ borderRadius: '10px', border: '1px solid rgba(139,189,217,0.4)', background: '#F0F7FB' }}>
              <div className="px-4 py-3 border-b border-ghibli-earth/20 flex items-center gap-2">
                <span className="text-sm">🌱</span>
                <span className="text-xs font-sans font-semibold uppercase tracking-wider text-ghibli-mist">Daily Habits</span>
              </div>
              <div className="px-2 py-1">
                {studioData.habits.map(h => (
                  <div key={h.id} className="flex items-center gap-3 px-2 py-2 border-b border-ghibli-earth/10 last:border-0">
                    <span className="flex-1 text-xs font-sans text-ghibli-ink">
                      {h.title}
                      {h.is_custom && <span className="ml-1 text-ghibli-gold">✱</span>}
                    </span>
                    <span className="text-[10px] font-sans text-ghibli-mist">+{h.xp_per_completion} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit/Add Modal */}
      {(editTarget || addTarget !== null) && (
        <EditTaskModal
          task={editTarget?.task ?? null}
          sectionId={editTarget?.sectionId ?? addTarget}
          monthNumber={selectedMonth}
          onSave={handleSaveTask}
          onClose={() => { setEditTarget(null); setAddTarget(null) }}
          onDelete={editTarget ? handleDeleteTask : null}
        />
      )}
    </div>
  )
}

// ── PlanPage ───────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'weekly',  label: 'Weekly' },
  { key: 'studio',  label: 'Studio ✏️' },
]

export default function PlanPage() {
  const {
    currentMonth, monthsData, progress, recentCompletions,
    loading, error, toggleTask, completeCheckpoint,
  } = usePlanData()

  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const meta = MONTH_META[currentMonth]
  const activeTab = searchParams.get('view') ?? 'roadmap'

  function setTab(key) {
    setSearchParams({ view: key }, { replace: true })
  }

  // Scroll to hash anchor after data loads (e.g. navigated from /stats)
  useEffect(() => {
    if (loading || !location.hash) return
    const id = location.hash.slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, location.hash])

  if (loading && activeTab !== 'studio') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pb-16" style={{ minHeight: '100%' }}>
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-ghibli-forest/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-ghibli-forest animate-spin" />
        </div>
        <span className="font-display text-sm italic text-ghibli-mist animate-pulse">
          Loading plan...
        </span>
      </div>
    )
  }

  if (error && activeTab !== 'studio') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center pb-16" style={{ minHeight: '100%' }}>
        <span className="font-display text-sm italic text-red-400">Error</span>
        <p className="text-xs text-ghibli-mist font-sans max-w-sm">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-8 space-y-6">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div>
          <h1 className="font-display text-2xl italic font-semibold text-ghibli-ink mb-1">
            Your Plan
          </h1>
          {meta && (
            <p className="text-xs text-ghibli-mist font-sans">
              Currently in Month {currentMonth} — {meta.title}
            </p>
          )}
        </div>

        {/* ── Tab switcher ─────────────────────────────────────────────────── */}
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(139,111,71,0.12)', border: '1px solid rgba(139,111,71,0.15)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className="flex-1 py-2 rounded-lg text-xs font-sans font-semibold transition-all"
              style={{
                background: activeTab === tab.key ? '#FAF3E0' : 'transparent',
                color: activeTab === tab.key ? '#2C2416' : '#6B7F6E',
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(139,111,71,0.15)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ──────────────────────────────────────────────────── */}

        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            {/* Chapter scroll row */}
            <section>
              <div className="font-display text-xs italic text-ghibli-mist/70 mb-3">Quest Chapters</div>
              <ChapterScrollRow currentMonth={currentMonth} progress={progress} />
            </section>

            {/* Month sections */}
            <div className="space-y-4">
              <MonthSection
                key={currentMonth}
                n={currentMonth}
                monthData={monthsData[currentMonth] ?? null}
                meta={MONTH_META[currentMonth]}
                monthProgress={progress?.months?.find(m => m.month_number === currentMonth)}
                isCurrent={true}
                recentCompletions={recentCompletions}
                onToggle={toggleTask}
                onCompleteCheckpoint={completeCheckpoint}
              />

              {Array.from({ length: currentMonth - 1 }, (_, i) => currentMonth - 1 - i).map(n => (
                <MonthSection
                  key={n}
                  n={n}
                  monthData={monthsData[n] ?? null}
                  meta={MONTH_META[n]}
                  monthProgress={progress?.months?.find(m => m.month_number === n)}
                  isCurrent={false}
                  recentCompletions={recentCompletions}
                  onToggle={toggleTask}
                  onCompleteCheckpoint={completeCheckpoint}
                />
              ))}

              {Array.from({ length: 6 - currentMonth }, (_, i) => currentMonth + 1 + i).map(n => {
                const lmeta = MONTH_META[n]
                return (
                  <div
                    key={n}
                    className="flex items-center gap-4 px-5 py-4 rounded-xl border border-ghibli-earth/20 bg-ghibli-sand/30 opacity-40 select-none"
                  >
                    <span className="text-2xl leading-none">{lmeta.icon}</span>
                    <div>
                      <span className="font-display text-xs italic text-ghibli-mist/60">Month {n}</span>
                      <p className="font-display text-xs italic text-ghibli-mist/60 mt-0.5">{lmeta.title}</p>
                    </div>
                    <svg className="ml-auto w-4 h-4 text-ghibli-earth/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <PlanWeekView />
          </div>
        )}

        {activeTab === 'studio' && (
          <PlanStudioView currentMonth={currentMonth} />
        )}
      </div>

      <div className="h-20" />
    </div>
  )
}
