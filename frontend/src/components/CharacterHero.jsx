import { SKILL_INFO, SKILL_ORDER, getXpBarData } from '../constants/planData'

const CHAR_LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9300, 10700]

function getCharLevelProgress(totalXp, level) {
    if (level >= CHAR_LEVEL_THRESHOLDS.length) return { pct: 100, current: totalXp, needed: 0 }
    const lo = CHAR_LEVEL_THRESHOLDS[level - 1] ?? 0
    const hi = CHAR_LEVEL_THRESHOLDS[level] ?? CHAR_LEVEL_THRESHOLDS[CHAR_LEVEL_THRESHOLDS.length - 1]
    const pct = Math.max(0, Math.min(100, ((totalXp - lo) / (hi - lo)) * 100))
    return { pct, current: totalXp - lo, needed: hi - lo }
}

export default function CharacterHero({ state, streakStatus, daysMissed = 0 }) {
    if (!state) return null

    const { pct, current, needed } = getCharLevelProgress(state.total_xp, state.character_level)

    // Decay filter on the avatar
    let avatarFilter = ''
    if (daysMissed === 1) avatarFilter = 'saturate(0.7)'
    else if (daysMissed === 2) avatarFilter = 'saturate(0.4) brightness(0.8)'
    else if (daysMissed >= 3) avatarFilter = 'grayscale(1) brightness(0.5)'

    // Gather top 3 skills
    const topSkills = [...(state.stats || [])]
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 3)

    return (
        <section className="relative overflow-hidden rounded-xl border border-green-900/30"
            style={{ background: 'linear-gradient(135deg, #0a1a0a 0%, #0f0f23 40%, #0a0a1a 100%)' }}
        >
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(#22c55e 1px, transparent 1px), linear-gradient(90deg, #22c55e 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />

            {/* Green glow behind avatar */}
            <div className="absolute top-1/2 left-[120px] sm:left-[140px] w-48 h-48 -translate-y-1/2 bg-green-500/10 blur-3xl rounded-full" />

            <div className="relative flex items-center gap-6 sm:gap-10 px-6 sm:px-10 py-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    <div
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden border-2 border-green-500/30 shadow-neon-green transition-all duration-500"
                        style={{ filter: avatarFilter }}
                    >
                        <img
                            src="/character.png"
                            alt="Character"
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                    {/* Level badge */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-game-bg border border-green-500/40 shadow-neon-green">
                        <span className="font-display text-[9px] text-green-400 uppercase tracking-wider">
                            LV {state.character_level}
                        </span>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    {/* Title + streak */}
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="font-display text-sm sm:text-base text-white uppercase tracking-[0.2em]">
                            Adventurer
                        </h2>
                        {streakStatus && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                                <span className="text-xs leading-none">{daysMissed >= 3 ? '💀' : '🔥'}</span>
                                <span className="font-vt text-sm leading-none text-orange-400">{streakStatus.streak}</span>
                            </div>
                        )}
                    </div>

                    {/* XP bar */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-vt text-lg leading-none text-green-400 tabular-nums">
                                {state.total_xp.toLocaleString()} XP
                            </span>
                            <span className="font-display text-[7px] text-slate-600 uppercase">
                                {needed > 0 ? `${current} / ${needed} to LV ${state.character_level + 1}` : 'MAX LEVEL'}
                            </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-black/60 border border-green-900/30 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000 ease-out relative"
                                style={{ width: `${pct}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                            </div>
                        </div>
                    </div>

                    {/* Top skills preview */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {topSkills.map(skill => {
                            const info = SKILL_INFO[skill.skill_type]
                            if (!info) return null
                            return (
                                <div key={skill.skill_type} className="flex items-center gap-1">
                                    <span className="text-xs leading-none">{info.icon}</span>
                                    <span className={`font-display text-[7px] uppercase ${info.c.text}`}>
                                        {info.label}
                                    </span>
                                    <span className="font-vt text-sm leading-none text-slate-500">
                                        {skill.xp}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
