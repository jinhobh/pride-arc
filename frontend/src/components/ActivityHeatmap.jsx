import { useState, useMemo } from 'react'
import { SectionHeader } from './StatPanel'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

function getCellColor(done, total) {
    if (done === 0 || total === 0) return 'rgba(139,111,71,0.1)' // empty
    if (done >= total) return 'hsla(140, 55%, 38%, 1)'           // all done — full green
    if (done / total >= 0.5) return 'hsla(140, 50%, 48%, 0.8)'   // most done — medium green
    return 'hsla(140, 40%, 58%, 0.55)'                            // some done — light green
}

function Tooltip({ day }) {
    if (!day) return null
    const label = day.habits_total === 0
        ? 'No habits'
        : day.habits_done === 0
            ? 'No habits done'
            : `${day.habits_done} / ${day.habits_total} habits`
    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
      pointer-events-none whitespace-nowrap px-3 py-2 rounded-xl
      bg-ghibli-cream border border-ghibli-earth/40 shadow-ghibli-card
      opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="font-vt text-sm text-ghibli-ink leading-none">{day.date}</div>
            <div className="font-vt text-lg text-ghibli-forest leading-none mt-1">{label}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0
        border-l-[5px] border-r-[5px] border-t-[5px]
        border-l-transparent border-r-transparent border-t-ghibli-earth/40" />
        </div>
    )
}

export default function ActivityHeatmap({ activity }) {
    if (!activity?.length) return null

    const dateMap = useMemo(() => {
        const m = {}
        for (const day of activity) m[day.date] = day
        return m
    }, [activity])

    const { weeks, monthHeaders } = useMemo(() => {
        const today = new Date()
        const totalWeeks = 26
        const totalDays = totalWeeks * 7
        const rawStart = new Date(today)
        rawStart.setDate(today.getDate() - totalDays + 1)
        const startDow = rawStart.getDay()
        const mondayShift = startDow === 0 ? -6 : 1 - startDow
        const startDate = new Date(rawStart)
        startDate.setDate(rawStart.getDate() + mondayShift)

        const cols = []
        const mHeaders = []
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
                    col.push(dateMap[key] ?? { date: key, habits_done: 0, habits_total: 0 })
                }
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
                title="Habit Activity"
                right={
                    <div className="flex items-center gap-2">
                        <span className="font-sans text-[11px] text-ghibli-mist/70">Last 6 months</span>
                    </div>
                }
            />

            <div className="rounded-xl border border-ghibli-earth/30 bg-ghibli-cream p-4 overflow-x-auto scrollbar-hide shadow-ghibli-card">
                <div className="flex ml-8 mb-1">
                    {weeks.map((_, wi) => {
                        const mh = monthHeaders.find(h => h.weekIdx === wi)
                        return (
                            <div key={wi} className="flex-shrink-0" style={{ width: 14, marginRight: 2 }}>
                                {mh && (
                                    <span className="font-sans text-[8px] text-ghibli-mist/70 uppercase">
                                        {mh.label}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="flex">
                    <div className="flex flex-col flex-shrink-0 mr-1" style={{ gap: 2 }}>
                        {DAY_LABELS.map((label, i) => (
                            <div key={i} className="flex items-center justify-end" style={{ width: 28, height: 14 }}>
                                <span className="font-sans text-[7px] text-ghibli-earth/50 uppercase">{label}</span>
                            </div>
                        ))}
                    </div>

                    {weeks.map((col, wi) => (
                        <div key={wi} className="flex flex-col flex-shrink-0" style={{ gap: 2 }}>
                            {col.map((day, di) => (
                                <div
                                    key={di}
                                    className="group relative"
                                    style={{
                                        width: 14, height: 14, marginRight: 2,
                                        borderRadius: 3,
                                        backgroundColor: day ? getCellColor(day.habits_done, day.habits_total) : 'transparent',
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

                <div className="flex items-center gap-2 mt-3 ml-8">
                    <span className="font-sans text-[8px] text-ghibli-earth/50 uppercase">None</span>
                    <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: getCellColor(0, 5) }} />
                    <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: getCellColor(2, 5) }} />
                    <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: getCellColor(4, 5) }} />
                    <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: getCellColor(5, 5) }} />
                    <span className="font-sans text-[8px] text-ghibli-earth/50 uppercase">All</span>
                </div>
            </div>
        </section>
    )
}
