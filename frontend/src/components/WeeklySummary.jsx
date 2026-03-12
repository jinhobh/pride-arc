import { SKILL_INFO } from '../constants/planData'
import { SectionHeader } from './StatPanel'

function StatBox({ label, value, sub }) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-3 min-w-[80px]">
            <span className="font-vt text-3xl leading-none text-ghibli-forest tabular-nums">{value}</span>
            <span className="font-sans text-[10px] text-ghibli-mist/70 mt-1.5">{label}</span>
            {sub && <span className="font-sans text-[9px] text-ghibli-earth/50 mt-0.5">{sub}</span>}
        </div>
    )
}

function SkillBar({ skill, maxXP }) {
    const info = SKILL_INFO[skill.skill_type]
    const { c } = info ?? { c: { bar: 'bg-ghibli-mist', text: 'text-ghibli-mist' } }
    const pct = maxXP > 0 ? Math.max(4, (skill.xp / maxXP) * 100) : 4

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm leading-none flex-shrink-0 w-5 text-center">{info?.icon ?? '❓'}</span>
            <span className={`font-sans text-[10px] font-medium w-16 flex-shrink-0 ${c.text}`}>
                {skill.label}
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-ghibli-earth/15 overflow-hidden">
                <div
                    className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className={`font-vt text-base leading-none tabular-nums flex-shrink-0 w-10 text-right ${c.text}`}>
                {skill.xp}
            </span>
            <span className="font-sans text-[9px] text-ghibli-earth/50 flex-shrink-0">XP</span>
        </div>
    )
}

export default function WeeklySummary({ summary }) {
    if (!summary) return null

    const maxXP = Math.max(1, ...summary.skill_breakdown.map(s => s.xp))

    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const rangeLabel = `${fmt(monday)} – ${fmt(sunday)}`

    return (
        <section>
            <SectionHeader
                title="This Week"
                right={
                    <span className="font-sans text-[11px] text-ghibli-mist/70">{rangeLabel}</span>
                }
            />

            <div className="rounded-xl border border-ghibli-earth/30 bg-ghibli-cream overflow-hidden shadow-ghibli-card">
                <div className="flex items-stretch divide-x divide-ghibli-earth/20 bg-ghibli-earth/5">
                    <StatBox label="XP Earned" value={summary.total_xp} />
                    <StatBox label="Problems" value={summary.problems_solved} sub="DSA" />
                    <StatBox label="Days Active" value={summary.days_active} sub="/ 7" />
                </div>

                {summary.skill_breakdown.length > 0 && (
                    <div className="px-4 py-3 space-y-2">
                        <span className="font-display text-sm italic text-ghibli-mist/80">
                            Skill Breakdown
                        </span>
                        {summary.skill_breakdown.map(skill => (
                            <SkillBar key={skill.skill_type} skill={skill} maxXP={maxXP} />
                        ))}
                    </div>
                )}

                {summary.skill_breakdown.length === 0 && summary.total_xp === 0 && (
                    <div className="px-4 py-6 text-center">
                        <span className="font-display text-sm italic text-ghibli-mist/60">
                            No activity this week yet — start a quest!
                        </span>
                    </div>
                )}
            </div>
        </section>
    )
}
