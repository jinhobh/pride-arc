import { SKILL_INFO, SKILL_ORDER, getXpBarData } from '../constants/planData'

function StatCard({ stat }) {
  const info = SKILL_INFO[stat.skill_type]
  if (!info) return null
  const { c } = info
  const { pct, xpNeeded } = getXpBarData(stat.xp, stat.level)
  const isMaxed = stat.level >= 10

  return (
    <div
      className={`rounded-xl p-4 border ${c.border} ${c.bg} group cursor-default
        transition-all duration-200 hover:scale-[1.03] hover:shadow-lg`}
      style={{ '--glow': c.glow }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3 gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base leading-none flex-shrink-0">{info.icon}</span>
          <span className={`font-display text-[8px] uppercase tracking-wider truncate ${c.text}`}>
            {info.label}
          </span>
        </div>
        {/* Level badge */}
        <div className={`flex-shrink-0 rounded px-1.5 py-0.5 border ${c.border} bg-black/40`}>
          <span className={`font-display text-[9px] ${c.text} tabular-nums`}>
            {isMaxed ? 'MAX' : `${stat.level}`}
          </span>
        </div>
      </div>

      {/* Level number — big VT323 */}
      <div className="mb-2">
        <span className={`font-vt text-4xl leading-none ${c.text} tabular-nums`}>
          LV.{stat.level}
        </span>
      </div>

      {/* XP bar */}
      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full bg-black/50 overflow-hidden">
          <div
            className={`h-full ${c.bar} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-vt text-base leading-none text-slate-600 tabular-nums">
            {stat.xp} XP
          </span>
          {!isMaxed && (
            <span className="font-display text-[7px] text-slate-700 tabular-nums">
              -{xpNeeded} next
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StatPanel({ stats }) {
  if (!stats?.length) return null

  // Render in canonical skill order
  const ordered = SKILL_ORDER
    .map(sk => stats.find(s => s.skill_type === sk))
    .filter(Boolean)

  return (
    <section>
      <SectionHeader title="Character Stats" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ordered.map(stat => (
          <StatCard key={stat.skill_type} stat={stat} />
        ))}
      </div>
    </section>
  )
}

/** Re-usable section header with pixel title + decorative line */
export function SectionHeader({ title, right }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-display text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}
