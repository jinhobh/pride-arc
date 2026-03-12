import { SectionHeader } from './StatPanel'

/**
 * Computes how "on track" the user is based on their total XP vs elapsed month time.
 * Calculates total available XP for the month (Tasks + Daily Habits) and tracks current accumulated XP.
 */
export default function OnTrackMeter({ currentTasks, todayHabits, totalXp }) {
    if (!currentTasks || typeof totalXp !== 'number') return null

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startDate = new Date(2026, 2, 12) // March 12, 2026

    const diffDays = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const dayOfMonth = (diffDays % 30) + 1
    const daysInMonth = 30 // Standardize plan months to 30 days

    let totalMonthXp = 0

    // 1. Monthly goals & checkpoints (done once per month)
    totalMonthXp += (currentTasks.monthly || []).reduce((sum, t) => sum + t.xp, 0)
    totalMonthXp += (currentTasks.checkpoints || []).reduce((sum, c) => sum + c.xp, 0)

    // 2. Daily quests × days in month
    totalMonthXp += (currentTasks.daily || []).reduce((sum, t) => sum + t.xp, 0) * daysInMonth

    // 3. Weekly quests × 4 weeks roughly
    totalMonthXp += (currentTasks.weekly || []).reduce((sum, t) => sum + t.xp, 0) * 4

    // 4. Daily habits × days in month
    if (todayHabits) {
        totalMonthXp += todayHabits.reduce((sum, h) => sum + h.xp_per_completion, 0) * daysInMonth
    }

    if (totalMonthXp === 0) return null

    const actualPct = (totalXp / totalMonthXp) * 100
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
                        {totalXp.toLocaleString()} / {totalMonthXp.toLocaleString()} XP
                    </span>
                    <span className="font-display text-[7px] text-slate-600 uppercase">
                        Day {dayOfMonth}/{daysInMonth} • Expected {Math.round(expectedPct)}%
                    </span>
                </div>
            </div>
        </section>
    )
}
