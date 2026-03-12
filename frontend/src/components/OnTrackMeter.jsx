import { SectionHeader } from './StatPanel'

/**
 * Computes how "on track" the user is based on task completions vs time elapsed.
 * Expected pace is linear: if 50% of the month has passed, you should have ~50% done.
 */
export default function OnTrackMeter({ currentTasks, progress }) {
    if (!currentTasks || !progress) return null

    const all = [
        ...(currentTasks.monthly || []),
        ...(currentTasks.checkpoints || []),
    ]
    if (all.length === 0) return null

    const done = all.filter(t => t.completed).length
    const total = all.length
    const actualPct = (done / total) * 100

    // Calculate expected pace based on day of month
    const now = new Date()
    const dayOfMonth = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const expectedPct = (dayOfMonth / daysInMonth) * 100

    const diff = actualPct - expectedPct
    let status, color, bg, icon, message
    if (diff >= -5) {
        status = 'on-track'
        color = 'text-green-400'
        bg = 'bg-green-500/10 border-green-500/30'
        icon = '🟢'
        message = "You're on track! Keep it up."
    } else if (diff >= -20) {
        status = 'slightly-behind'
        color = 'text-yellow-400'
        bg = 'bg-yellow-500/10 border-yellow-500/30'
        icon = '🟡'
        message = "Slightly behind pace — push a bit harder this week."
    } else {
        status = 'falling-behind'
        color = 'text-red-400'
        bg = 'bg-red-500/10 border-red-500/30'
        icon = '🔴'
        message = "Falling behind — time to catch up!"
    }

    return (
        <section>
            <SectionHeader title="Pace Tracker" />
            <div className={`rounded-xl border p-4 ${bg}`}>
                {/* Status */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg leading-none">{icon}</span>
                    <span className={`font-display text-[9px] uppercase tracking-widest ${color}`}>
                        {message}
                    </span>
                </div>

                {/* Progress bar with pace marker */}
                <div className="relative">
                    <div className="h-3 rounded-full bg-black/40 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${status === 'on-track' ? 'bg-green-500' :
                                    status === 'slightly-behind' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(100, actualPct)}%` }}
                        />
                    </div>
                    {/* Expected pace marker */}
                    <div
                        className="absolute top-0 w-0.5 h-3 bg-white/40"
                        style={{ left: `${Math.min(100, expectedPct)}%` }}
                        title={`Expected: ${Math.round(expectedPct)}%`}
                    />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between mt-2">
                    <span className="font-vt text-base leading-none text-slate-500 tabular-nums">
                        {done}/{total} goals done
                    </span>
                    <span className="font-display text-[7px] text-slate-600 uppercase">
                        Day {dayOfMonth}/{daysInMonth} • Expected {Math.round(expectedPct)}%
                    </span>
                </div>
            </div>
        </section>
    )
}
