import { useState, useMemo } from 'react'
import { SKILL_INFO } from '../constants/planData'
import { SectionHeader } from './StatPanel'

/**
 * HSL hue values extracted from each skill's Tailwind color.
 * Used to tint heatmap cells by dominant skill.
 */
const SKILL_HUE = {
    dsa: 187,  // cyan
    ml: 263,  // violet
    backend: 25,   // orange
    devops: 48,   // yellow
    cloud: 199,  // sky
    system_design: 234,  // indigo
    project: 160,  // emerald
    networking: 330,  // pink
    interviewing: 350,  // rose
    career: 38,   // amber
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function getCellColor(xp, dominantSkill) {
    if (xp === 0) return 'rgba(30, 30, 56, 0.8)' // dark game surface

    const hue = SKILL_HUE[dominantSkill] ?? 160
    if (xp <= 25) return `hsla(${hue}, 60%, 28%, 0.9)`
    if (xp <= 75) return `hsla(${hue}, 65%, 42%, 0.95)`
    return `hsla(${hue}, 70%, 55%, 1)`
}

function Tooltip({ day }) {
    if (!day) return null
    const skills = day.dominant_skill
        ? (SKILL_INFO[day.dominant_skill]?.label ?? day.dominant_skill)
        : 'None'
    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
      pointer-events-none whitespace-nowrap px-3 py-2 rounded-lg
      bg-game-card border border-slate-700/60 shadow-xl
      opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="font-vt text-sm text-white leading-none">{day.date}</div>
            <div className="font-vt text-lg text-green-400 leading-none mt-1">
                {day.total_xp} <span className="text-xs text-slate-500">XP</span>
            </div>
            <div className="font-sans text-[10px] text-slate-400 mt-1">{skills}</div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
        border-l-[5px] border-r-[5px] border-t-[5px]
        border-l-transparent border-r-transparent border-t-slate-700/60" />
        </div>
    )
}

export default function ActivityHeatmap({ activity }) {
    if (!activity?.length) return null

    // Build a date→data map
    const dateMap = useMemo(() => {
        const m = {}
        for (const day of activity) m[day.date] = day
        return m
    }, [activity])

    // Build the grid: 26 columns (weeks) × 7 rows (days, Mon=0..Sun=6)
    // Work backwards from today to fill the grid
    const { weeks, monthHeaders } = useMemo(() => {
        const today = new Date()
        // Go to the most recent Saturday (end of the last full column)
        const endDay = new Date(today)
        // Calculate total cells: we want 26 full weeks = 182 days
        const totalWeeks = 26
        const totalDays = totalWeeks * 7

        // Start from (totalDays - 1) days ago, aligned to a Sunday column start
        const rawStart = new Date(today)
        rawStart.setDate(today.getDate() - totalDays + 1)
        // Shift to previous Monday (weekday 1)
        const startDow = rawStart.getDay() // 0=Sun
        const mondayShift = startDow === 0 ? -6 : 1 - startDow
        const startDate = new Date(rawStart)
        startDate.setDate(rawStart.getDate() + mondayShift)

        const cols = []
        const mHeaders = [] // {weekIdx, label}
        let prevMonth = -1
        let current = new Date(startDate)

        let weekIdx = 0
        while (current <= today) {
            const col = []
            for (let dow = 0; dow < 7; dow++) {
                const d = new Date(current)
                d.setDate(current.getDate() + dow)
                if (d > today) {
                    col.push(null)
                } else {
                    const key = d.toISOString().split('T')[0]
                    col.push(dateMap[key] ?? { date: key, total_xp: 0, dominant_skill: null })
                }
                // Track month headers (on first day-of-week-0 of a new month)
                if (dow === 0) {
                    const m = d.getMonth()
                    if (m !== prevMonth) {
                        mHeaders.push({ weekIdx, label: MONTH_LABELS[m] })
                        prevMonth = m
                    }
                }
            }
            cols.push(col)
            weekIdx++
            current.setDate(current.getDate() + 7)
        }

        return { weeks: cols, monthHeaders: mHeaders }
    }, [dateMap])

    return (
        <section>
            <SectionHeader
                title="Activity"
                right={
                    <div className="flex items-center gap-2">
                        <span className="font-display text-[8px] text-slate-600 uppercase">Last 6 months</span>
                    </div>
                }
            />

            <div className="rounded-xl border border-slate-800/60 bg-game-surface/40 p-4 overflow-x-auto scrollbar-hide">
                {/* Month labels row */}
                <div className="flex ml-8 mb-1">
                    {weeks.map((_, wi) => {
                        const mh = monthHeaders.find(h => h.weekIdx === wi)
                        return (
                            <div key={wi} className="flex-shrink-0" style={{ width: 14, marginRight: 2 }}>
                                {mh && (
                                    <span className="font-display text-[7px] text-slate-600 uppercase">
                                        {mh.label}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Grid: day labels + cells */}
                <div className="flex">
                    {/* Day-of-week labels */}
                    <div className="flex flex-col flex-shrink-0 mr-1" style={{ gap: 2 }}>
                        {DAY_LABELS.map((label, i) => (
                            <div key={i} className="flex items-center justify-end"
                                style={{ width: 28, height: 14 }}>
                                <span className="font-display text-[7px] text-slate-700 uppercase">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Week columns */}
                    {weeks.map((col, wi) => (
                        <div key={wi} className="flex flex-col flex-shrink-0" style={{ gap: 2 }}>
                            {col.map((day, di) => (
                                <div
                                    key={di}
                                    className="group relative"
                                    style={{
                                        width: 14,
                                        height: 14,
                                        marginRight: 2,
                                        borderRadius: 3,
                                        backgroundColor: day ? getCellColor(day.total_xp, day.dominant_skill) : 'transparent',
                                        transition: 'transform 0.1s',
                                        cursor: day ? 'pointer' : 'default',
                                    }}
                                    onMouseEnter={e => day && (e.currentTarget.style.transform = 'scale(1.3)')}
                                    onMouseLeave={e => day && (e.currentTarget.style.transform = 'scale(1)')}
                                >
                                    {day && <Tooltip day={day} />}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-2 mt-3 ml-8">
                    <span className="font-display text-[7px] text-slate-700 uppercase">Less</span>
                    {[0, 10, 50, 100].map(xp => (
                        <div key={xp} style={{
                            width: 12, height: 12, borderRadius: 2,
                            backgroundColor: getCellColor(xp, 'project'),
                        }} />
                    ))}
                    <span className="font-display text-[7px] text-slate-700 uppercase">More</span>
                </div>
            </div>
        </section>
    )
}
