import { useParams, useNavigate } from 'react-router-dom'
import { MONTH_META } from '../constants/planData'

export default function MonthPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const n         = Number(id)
  const meta      = MONTH_META[n]

  return (
    <div className="min-h-screen bg-game-bg flex flex-col">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-display text-[9px] uppercase tracking-widest">Dashboard</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
        <span className="text-6xl leading-none">{meta?.icon}</span>

        <div className="space-y-2">
          <div className="font-display text-[9px] uppercase tracking-[0.3em] text-slate-600">
            Month {n}
          </div>
          <h1 className="font-display text-lg sm:text-xl text-white uppercase tracking-widest">
            {meta?.title}
          </h1>
        </div>

        {/* Placeholder badge */}
        <div className="mt-4 px-6 py-4 rounded-xl border border-slate-800 bg-game-surface">
          <span className="font-display text-[9px] text-slate-600 uppercase tracking-widest">
            Task list coming soon
          </span>
        </div>
      </div>
    </div>
  )
}
