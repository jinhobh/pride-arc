import { useEffect, useState } from 'react'

function StatusDot({ ok, pending }) {
  if (pending) return <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
  return (
    <span
      className={`w-2 h-2 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400'}`}
    />
  )
}

function StatusBadge({ label, value }) {
  const pending = value === 'checking…'
  const ok = value === 'connected' || value === 'running'

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] cursor-default select-none">
      <StatusDot ok={ok} pending={pending} />
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className={`text-sm font-semibold transition-colors duration-300 ${
          pending
            ? 'text-yellow-400'
            : ok
            ? 'text-green-400'
            : 'text-red-400'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

export default function App() {
  const [health, setHealth] = useState({ api: 'checking…', database: 'checking…' })

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) =>
        setHealth({ api: data.api ?? 'unknown', database: data.database ?? 'unknown' }),
      )
      .catch(() => setHealth({ api: 'error', database: 'error' }))
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-10 px-6 py-16">
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(34,197,94,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        v0.1.0 · Scaffold
      </span>

      {/* Wordmark */}
      <div className="text-center space-y-4">
        <h1 className="text-7xl sm:text-8xl font-extrabold tracking-tight text-white leading-none">
          Level<span className="text-green-400">Up</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-sm mx-auto leading-relaxed">
          React · FastAPI · PostgreSQL running end-to-end.
        </p>
      </div>

      {/* Status row */}
      <div className="flex flex-wrap gap-3 justify-center">
        <StatusBadge label="API" value={health.api} />
        <StatusBadge label="Database" value={health.database} />
      </div>

      {/* Endpoint hint */}
      <div className="px-5 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] font-mono text-slate-500 text-sm select-all">
        GET /health → 200 OK
      </div>
    </div>
  )
}
