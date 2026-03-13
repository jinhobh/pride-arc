import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { MONTH_META, SKILL_INFO } from '../constants/planData'

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
    <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
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
            className="relative flex-shrink-0 w-36 cursor-pointer text-left transition-all duration-200 hover:scale-[1.03] focus:outline-none"
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

// ── PlanPage ───────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const {
    currentMonth, monthsData, progress, recentCompletions,
    loading, error, toggleTask, completeCheckpoint,
  } = usePlanData()

  const location = useLocation()
  const meta = MONTH_META[currentMonth]

  // Scroll to hash anchor after data loads (e.g. navigated from /stats)
  useEffect(() => {
    if (loading || !location.hash) return
    const id = location.hash.slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, location.hash])

  if (loading) {
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center pb-16" style={{ minHeight: '100%' }}>
        <span className="font-display text-sm italic text-red-400">Error</span>
        <p className="text-xs text-ghibli-mist font-sans max-w-sm">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-8 space-y-8">

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

        {/* ── Chapter scroll row ───────────────────────────────────────────── */}
        <section>
          <div className="font-display text-xs italic text-ghibli-mist/70 mb-3">
            Quest Chapters
          </div>
          <ChapterScrollRow currentMonth={currentMonth} progress={progress} />
        </section>

        {/* ── Month sections ───────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Current month first */}
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

          {/* Previous months, collapsed by default */}
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

          {/* Locked months (greyed out, not expandable) */}
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

      <div className="h-20" />
    </div>
  )
}
