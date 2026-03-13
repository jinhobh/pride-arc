import { useNavigate } from 'react-router-dom'
import { MONTH_META } from '../constants/planData'
import { SectionHeader } from './StatPanel'

function LockIcon({ className = 'w-6 h-6' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function MonthCard({ n, meta, monthProgress, isLocked, isCurrent, isComplete }) {
  const navigate = useNavigate()
  const pct = monthProgress?.completion_pct ?? 0

  if (isLocked) {
    return (
      <div className="flex-shrink-0 w-40 rounded-xl border border-ghibli-earth/20 bg-ghibli-sand/30 opacity-40 cursor-not-allowed select-none shadow-ghibli-card">
        <div className="flex flex-col items-center justify-center gap-2 p-5 min-h-[160px]">
          <LockIcon className="w-7 h-7 text-ghibli-earth/40" />
          <span className="font-display text-sm italic text-ghibli-mist/60">
            Month {n}
          </span>
        </div>
      </div>
    )
  }

  const borderCls = isCurrent
    ? 'border-ghibli-forest/60'
    : isComplete
    ? 'border-ghibli-earth/50'
    : 'border-ghibli-earth/30 hover:border-ghibli-earth/50'

  const glowStyle = isCurrent
    ? { boxShadow: '0 0 18px rgba(74,124,89,0.18), 0 4px 16px rgba(44,36,22,0.08)' }
    : { boxShadow: '0 2px 12px rgba(44,36,22,0.07)' }

  return (
    <button
      onClick={() => navigate(`/month/${n}`)}
      className={`relative flex-shrink-0 w-40 rounded-xl border ${borderCls} bg-ghibli-cream overflow-visible
        cursor-pointer text-left transition-all duration-200 hover:scale-[1.03] focus:outline-none
        focus:ring-2 focus:ring-ghibli-forest/30`}
      style={glowStyle}
    >
      {isCurrent && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-ghibli-forest text-white
          font-display text-xs italic px-2 py-0.5 rounded-full z-10 whitespace-nowrap">
          Active
        </span>
      )}

      <div className="flex flex-col gap-3 p-4 min-h-[160px]">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs italic text-ghibli-mist">
            M{n}
          </span>
          <span className="text-lg leading-none">
            {isComplete ? meta.badgeIcon : meta.icon}
          </span>
        </div>

        {isComplete && (
          <div className="flex items-center gap-1">
            <CheckIcon className="w-3 h-3 text-ghibli-forest" />
            <span className="font-display text-xs italic text-ghibli-forest">
              Done
            </span>
          </div>
        )}

        <p className="font-sans text-[12px] text-ghibli-ink/80 font-medium leading-snug flex-1">
          {meta.title}
        </p>

        <div className="space-y-1">
          <div className="h-1.5 rounded-full bg-ghibli-earth/15 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: meta.hex }}
            />
          </div>
          <span className="font-vt text-base leading-none text-ghibli-mist tabular-nums">
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>
    </button>
  )
}

export default function QuestChapters({ progress, currentMonth }) {
  const completedBadgeIds = new Set(
    (progress?.months ?? [])
      .filter(m => m.completion_pct >= 100)
      .map(m => `month_${m.month_number}_complete`)
  )

  return (
    <section>
      <SectionHeader title="Quest Chapters" />
      <div className="flex gap-3 overflow-x-auto pb-3 pt-4 scrollbar-hide -mx-1 px-1">
        {[1, 2, 3, 4, 5, 6].map(n => {
          const meta = MONTH_META[n]
          const monthProgress = progress?.months?.find(m => m.month_number === n)
          const pct = monthProgress?.completion_pct ?? 0

          return (
            <MonthCard
              key={n}
              n={n}
              meta={meta}
              monthProgress={monthProgress}
              isLocked={n > currentMonth}
              isCurrent={n === currentMonth}
              isComplete={pct >= 100}
            />
          )
        })}
      </div>
    </section>
  )
}
