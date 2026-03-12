import { SKILL_INFO } from '../constants/planData'

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
            <div className="absolute top-1/2 left-1/2 w-56 h-56 -translate-x-1/2 -translate-y-1/2 bg-green-500/10 blur-3xl rounded-full" />

            <div className="relative flex flex-col items-center py-8 px-6">
                {/* Avatar — centered */}
                <div className="relative mb-4">
                    <div
                        className="w-36 h-36 sm:w-44 sm:h-44 rounded-xl overflow-hidden border-2 border-green-500/30 shadow-neon-green transition-all duration-500"
                        style={{ filter: avatarFilter }}
                    >
                        <img
                            src="/character.png"
                            alt="Character"
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                        />
                    </div>
                </div>

                {/* Title + streak */}
                <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-display text-sm sm:text-base text-white uppercase tracking-[0.2em]">
                        Jinho
                    </h2>
                    {streakStatus && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/20">
                            <span className="text-xs leading-none">{daysMissed >= 3 ? '💀' : '🔥'}</span>
                            <span className="font-vt text-sm leading-none text-orange-400">{streakStatus.streak}</span>
                        </div>
                    )}
                </div>

                {/* XP + Level bar */}
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-vt text-2xl leading-none text-green-400 tabular-nums">
                            {state.total_xp.toLocaleString()} XP
                        </span>
                        <span className="font-display text-[7px] text-slate-600 uppercase">
                            {needed > 0 ? `${current} / ${needed} to LV ${state.character_level + 1}` : 'MAX LEVEL'}
                        </span>
                    </div>
                    <div className="h-3 rounded-full bg-black/60 border border-green-900/30 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-1000 ease-out relative"
                            style={{ width: `${pct}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                        </div>
                    </div>
                </div>

                {/* Level badge below */}
                <div className="mt-4 px-4 py-1.5 rounded-full bg-game-bg border border-green-500/40 shadow-neon-green">
                    <span className="font-display text-[10px] text-green-400 uppercase tracking-[0.3em]">
                        Level {state.character_level}
                    </span>
                </div>
            </div>
        </section>
    )
}
