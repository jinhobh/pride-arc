import { SectionHeader } from './StatPanel'

export default function OnTrackMeter({ currentTasks, todayHabits, totalXp }) {
    if (!currentTasks || typeof totalXp !== 'number') return null

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startDate = new Date(2026, 2, 12)

    const diffDays = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    const dayOfMonth = (diffDays % 30) + 1
    const daysInMonth = 30

    let totalMonthXp = 0
    totalMonthXp += (currentTasks.monthly || []).reduce((sum, t) => sum + t.xp, 0)
    totalMonthXp += (currentTasks.checkpoints || []).reduce((sum, c) => sum + c.xp, 0)
    totalMonthXp += (currentTasks.daily || []).reduce((sum, t) => sum + t.xp, 0) * daysInMonth
    totalMonthXp += (currentTasks.weekly || []).reduce((sum, t) => sum + t.xp, 0) * 4
    if (todayHabits) {
        totalMonthXp += todayHabits.reduce((sum, h) => sum + h.xp_per_completion, 0) * daysInMonth
    }

    if (totalMonthXp === 0) return null

    const actualPct = (totalXp / totalMonthXp) * 100
    const expectedPct = (dayOfMonth / daysInMonth) * 100

    const diff = actualPct - expectedPct
    let status, barColor, bg, border, textColor, icon, message
    if (diff >= -5) {
        status = 'on-track'
        barColor = 'bg-ghibli-forest'
        bg = 'bg-ghibli-forest/8'
        border = 'border-ghibli-forest/40'
        textColor = 'text-ghibli-forest'
        icon = '🟢'
        message = "You're on track! Keep it up."
    } else if (diff >= -20) {
        status = 'slightly-behind'
        barColor = 'bg-ghibli-gold'
        bg = 'bg-ghibli-gold/8'
        border = 'border-ghibli-gold/40'
        textColor = 'text-ghibli-gold'
        icon = '🟡'
        message = "Slightly behind pace — push a bit harder this week."
    } else {
        status = 'falling-behind'
        barColor = 'bg-ghibli-sunset'
        bg = 'bg-ghibli-sunset/8'
        border = 'border-ghibli-sunset/40'
        textColor = 'text-ghibli-sunset'
        icon = '🔴'
        message = "Falling behind — time to catch up!"
    }

    return (
        <section>
            <SectionHeader title="Pace Tracker" />
            <div className={`rounded-xl border p-4 ${bg} ${border} shadow-ghibli-card`}>
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg leading-none">{icon}</span>
                    <span className={`font-display text-sm italic ${textColor}`}>
                        {message}
                    </span>
                </div>

                <div className="relative">
                    <div className="h-3 rounded-full bg-ghibli-earth/15 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                            style={{ width: `${Math.min(100, actualPct)}%` }}
                        />
                    </div>
                    <div
                        className="absolute top-0 w-0.5 h-3 bg-ghibli-earth/50"
                        style={{ left: `${Math.min(100, expectedPct)}%` }}
                        title={`Expected: ${Math.round(expectedPct)}%`}
                    />
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="font-vt text-base leading-none text-ghibli-mist tabular-nums">
                        {totalXp.toLocaleString()} / {totalMonthXp.toLocaleString()} XP
                    </span>
                    <span className="font-sans text-[10px] text-ghibli-mist/70">
                        Day {dayOfMonth}/{daysInMonth} • Expected {Math.round(expectedPct)}%
                    </span>
                </div>
            </div>
        </section>
    )
}
