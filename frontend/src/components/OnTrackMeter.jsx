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
    let barColor, message
    if (diff >= -5) {
        barColor = 'var(--ghibli-forest)'
        message = "You're on track! Keep it up."
    } else if (diff >= -20) {
        barColor = '#C9A84C'
        message = 'Slightly behind pace — push a bit harder this week.'
    } else {
        barColor = '#B85C38'
        message = 'Falling behind — time to catch up!'
    }

    return (
        <section>
            {/* Section title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h2
                    style={{
                        fontFamily: '"Crimson Pro", serif',
                        fontStyle: 'italic',
                        fontWeight: 600,
                        fontSize: '1.15rem',
                        color: 'var(--ghibli-ink)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                >
                    🧭 Today's Pace
                </h2>
            </div>

            {/* Card */}
            <div
                style={{
                    background: 'var(--ghibli-cream)',
                    border: '1px solid rgba(139,111,71,0.28)',
                    borderRadius: '14px',
                    padding: '16px',
                    boxShadow: '0 2px 12px rgba(139,111,71,0.10)',
                }}
            >
                {/* Status message */}
                <p
                    style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontStyle: 'italic',
                        color: 'var(--ghibli-mist)',
                        marginBottom: '12px',
                    }}
                >
                    {message}
                </p>

                {/* Bar */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                    {/* Track */}
                    <div
                        style={{
                            height: '12px',
                            borderRadius: '999px',
                            background: 'var(--ghibli-sand)',
                            overflow: 'visible',
                            position: 'relative',
                        }}
                    >
                        {/* Fill */}
                        <div
                            style={{
                                height: '100%',
                                width: `${Math.min(100, actualPct)}%`,
                                borderRadius: '999px',
                                background: barColor,
                                transition: 'width 700ms ease-out',
                            }}
                        />
                    </div>

                    {/* Expected pace diamond marker */}
                    <div
                        title={`Expected: ${Math.round(expectedPct)}%`}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: `${Math.min(99, expectedPct)}%`,
                            transform: 'translate(-50%, -50%) rotate(45deg)',
                            width: '9px',
                            height: '9px',
                            background: 'var(--ghibli-ink)',
                            opacity: 0.60,
                            borderRadius: '1px',
                            pointerEvents: 'none',
                        }}
                    />
                </div>

                {/* XP labels */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                        style={{
                            fontFamily: '"Crimson Pro", serif',
                            fontStyle: 'italic',
                            fontSize: '13px',
                            color: 'var(--ghibli-mist)',
                        }}
                    >
                        {totalXp.toLocaleString()} / {totalMonthXp.toLocaleString()} XP
                    </span>
                    <span
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '11px',
                            fontStyle: 'italic',
                            color: 'var(--ghibli-mist)',
                        }}
                    >
                        Day {dayOfMonth}/{daysInMonth} · Expected {Math.round(expectedPct)}%
                    </span>
                </div>
            </div>
        </section>
    )
}
