import { SKILL_INFO, SKILL_ORDER, getXpBarData } from '../constants/planData'

function StatCard({ stat }) {
  const info = SKILL_INFO[stat.skill_type]
  if (!info) return null
  const { c } = info
  const { pct, xpNeeded } = getXpBarData(stat.xp, stat.level)
  const isMaxed = stat.level >= 10

  return (
    <div
      className={`rounded-xl p-4 border ${c.border} bg-ghibli-cream group cursor-default
        transition-all duration-200 hover:scale-[1.03] hover:shadow-ghibli-card-hover shadow-ghibli-card`}
      style={{ '--glow': c.glow }}
    >
      <div className="flex items-start justify-between mb-3 gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base leading-none flex-shrink-0">{info.icon}</span>
          <span className={`font-display text-xs italic truncate ${c.text}`}>
            {info.label}
          </span>
        </div>
        <div className={`flex-shrink-0 rounded-md px-1.5 py-0.5 border ${c.border} bg-white/50`}>
          <span className={`font-sans text-[10px] font-semibold ${c.text} tabular-nums`}>
            {isMaxed ? 'MAX' : `Lv${stat.level}`}
          </span>
        </div>
      </div>

      <div className="mb-2">
        <span className={`font-vt text-4xl leading-none ${c.text} tabular-nums`}>
          {stat.level}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="h-1.5 rounded-full bg-ghibli-earth/15 overflow-hidden">
          <div
            className={`h-full ${c.bar} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-vt text-base leading-none text-ghibli-mist tabular-nums">
            {stat.xp} XP
          </span>
          {!isMaxed && (
            <span className="font-sans text-[9px] text-ghibli-earth/60 tabular-nums">
              -{xpNeeded} next
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function DecayBanner({ daysMissed }) {
  if (daysMissed === 0) return null

  let bg, border, textColor, icon, message
  if (daysMissed === 1) {
    bg = 'bg-ghibli-gold/10'
    border = 'border-ghibli-gold/40'
    textColor = 'text-ghibli-gold'
    icon = '⚠️'
    message = 'Your character is getting rusty...'
  } else if (daysMissed === 2) {
    bg = 'bg-ghibli-sunset/10'
    border = 'border-ghibli-sunset/40'
    textColor = 'text-ghibli-sunset'
    icon = '🔶'
    message = `You haven't checked in for 2 days. XP decay incoming.`
  } else {
    bg = 'bg-red-500/10'
    border = 'border-red-500/30'
    textColor = 'text-red-500'
    icon = '💀'
    message = 'STREAK BROKEN. Check in to recover.'
  }

  return (
    <div className={`rounded-lg ${bg} border ${border} px-4 py-2.5 flex items-center gap-2.5 mb-4 transition-all duration-300`}>
      <span className="text-base leading-none flex-shrink-0">{icon}</span>
      <span className={`font-display text-sm italic ${textColor}`}>
        {message}
      </span>
      {daysMissed >= 3 && (
        <span className={`ml-auto font-vt text-base leading-none ${textColor} tabular-nums`}>
          {daysMissed}d
        </span>
      )}
    </div>
  )
}

export default function StatPanel({ stats, daysMissed = 0 }) {
  if (!stats?.length) return null

  const ordered = SKILL_ORDER
    .map(sk => stats.find(s => s.skill_type === sk))
    .filter(Boolean)

  let filterStyle = {}
  if (daysMissed === 1) filterStyle = { filter: 'saturate(0.7)' }
  else if (daysMissed === 2) filterStyle = { filter: 'saturate(0.4)' }
  else if (daysMissed >= 3) filterStyle = { filter: 'grayscale(1) brightness(0.8)' }

  return (
    <section>
      <SectionHeader title="Character Stats" />
      <DecayBanner daysMissed={daysMissed} />
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 transition-all duration-500"
        style={filterStyle}
      >
        {ordered.map(stat => (
          <StatCard key={stat.skill_type} stat={stat} />
        ))}
      </div>
    </section>
  )
}

export function SectionHeader({ title, right }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-display text-base sm:text-lg italic text-ghibli-ink font-semibold whitespace-nowrap">
        {title}
      </span>
      <div className="flex-1 h-px border-t border-dashed border-ghibli-earth/30" />
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}
