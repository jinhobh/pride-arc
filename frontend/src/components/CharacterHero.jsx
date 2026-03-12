const CHAR_LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9300, 10700]

function getCharLevelProgress(totalXp, level) {
  if (level >= CHAR_LEVEL_THRESHOLDS.length) return { pct: 100, current: totalXp, needed: 0 }
  const lo = CHAR_LEVEL_THRESHOLDS[level - 1] ?? 0
  const hi = CHAR_LEVEL_THRESHOLDS[level] ?? CHAR_LEVEL_THRESHOLDS[CHAR_LEVEL_THRESHOLDS.length - 1]
  const pct = Math.max(0, Math.min(100, ((totalXp - lo) / (hi - lo)) * 100))
  return { pct, current: totalXp - lo, needed: hi - lo }
}

/** Deterministic star field — no random, SSR-safe */
function StarField() {
  const stars = Array.from({ length: 120 }, (_, i) => {
    const a = (Math.imul(i + 1, 2654435761) >>> 0)
    const b = (Math.imul(i + 1, 1664525) + 1013904223) >>> 0
    const x = (a % 10000) / 100
    const y = (b % 6500) / 100   // keep stars in top 65%
    const size = i % 7 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1
    const opacity = 0.1 + (i % 8) * 0.06
    const pulse = i % 5 === 0
    return { x, y, size, opacity, pulse }
  })

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          className={s.pulse ? 'absolute rounded-full bg-white animate-pulse-slow' : 'absolute rounded-full bg-white'}
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity }}
        />
      ))}
    </div>
  )
}

export default function CharacterHero({ state, streakStatus, daysMissed = 0, scrollProgress = 0 }) {
  if (!state) return null

  const { pct, current, needed } = getCharLevelProgress(state.total_xp, state.character_level)

  let avatarFilter = ''
  if (daysMissed === 1) avatarFilter = 'saturate(0.7)'
  else if (daysMissed === 2) avatarFilter = 'saturate(0.4) brightness(0.8)'
  else if (daysMissed >= 3) avatarFilter = 'grayscale(1) brightness(0.5)'

  // Scroll-driven transforms — direct, no CSS transition
  const charScale    = 1 - scrollProgress * 0.45     // 1.0 → 0.55
  const charOpacity  = 1 - scrollProgress * 0.7      // 1.0 → 0.3
  const charShiftY   = scrollProgress * -60           // float upward slightly
  const envOpacity   = 1 - scrollProgress * 0.5

  return (
    <div
      className="relative h-screen overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #02020e 0%, #04041a 30%, #060620 60%, #0a0a1e 100%)' }}
    >
      <StarField />

      {/* Nebula corners */}
      <div className="absolute top-0 left-0 w-[50%] h-[40%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(88,28,135,0.08) 0%, transparent 65%)', opacity: envOpacity }}
      />
      <div className="absolute top-0 right-0 w-[50%] h-[40%] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(34,197,94,0.05) 0%, transparent 65%)', opacity: envOpacity }}
      />

      {/* ── Perspective floor grid ── */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '52%', perspective: '500px', perspectiveOrigin: '50% 0%', opacity: envOpacity }}
      >
        <div
          className="absolute inset-0 grid-pulse"
          style={{
            transform: 'rotateX(72deg)',
            transformOrigin: 'bottom center',
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.15) 1px, transparent 1px)',
            backgroundSize: '70px 70px',
          }}
        />
        {/* Fade top of grid into bg */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(2,2,14,1) 0%, rgba(2,2,14,0.6) 30%, transparent 70%)' }}
        />
        {/* Radial vignette on grid sides */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, transparent 40%, rgba(2,2,14,0.8) 80%)' }}
        />
      </div>

      {/* ── Character & Stats — scroll-driven ── */}
      <div
        className="absolute inset-x-0 flex flex-col items-center"
        style={{
          top: '10%',
          transform: `scale(${charScale}) translateY(${charShiftY}px)`,
          opacity: charOpacity,
          transformOrigin: 'top center',
          willChange: 'transform, opacity',
        }}
      >
        {/* Large atmospheric glow behind character */}
        <div className="absolute pointer-events-none"
          style={{
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.09) 0%, rgba(34,197,94,0.03) 45%, transparent 70%)',
            filter: 'blur(30px)',
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />

        {/* Character avatar */}
        <div className="relative mb-5 character-float">
          {/* Ground shadow */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ width: '180px', height: '20px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(34,197,94,0.35) 0%, transparent 70%)', filter: 'blur(8px)' }}
          />
          {/* Rim light */}
          <div className="absolute -inset-2 rounded-2xl pointer-events-none blur-lg"
            style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.18) 0%, transparent 50%, rgba(99,102,241,0.1) 100%)' }}
          />
          {/* Portrait */}
          <div
            className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-2xl overflow-hidden"
            style={{
              filter: avatarFilter,
              boxShadow: '0 0 0 1px rgba(34,197,94,0.25), 0 24px 80px rgba(0,0,0,0.9), 0 0 50px rgba(34,197,94,0.12)',
            }}
          >
            <img
              src="/character.png"
              alt="Character"
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* Inner vignette on portrait */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)' }}
            />
          </div>
        </div>

        {/* Name + streak */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-display text-sm sm:text-base text-white uppercase tracking-[0.3em] neon-text-green">
            Jinho
          </h1>
          {streakStatus && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-500/30 bg-black/50 backdrop-blur-sm">
              <span className="text-sm leading-none">{daysMissed >= 3 ? '💀' : '🔥'}</span>
              <span className="font-vt text-xl leading-none text-orange-400 tabular-nums">{streakStatus.streak}</span>
            </div>
          )}
        </div>

        {/* ── XP / Level block — FOCAL POINT ── */}
        <div className="w-full max-w-xs px-4 sm:max-w-sm">
          {/* Level number + total XP */}
          <div className="flex items-end justify-between mb-3">
            <div className="flex items-end gap-2 leading-none">
              <span className="font-display text-[8px] text-green-500/50 uppercase tracking-widest mb-1">LV</span>
              <span
                className="font-vt text-6xl leading-none tabular-nums text-green-400"
                style={{ textShadow: '0 0 24px rgba(34,197,94,0.7), 0 0 8px rgba(34,197,94,0.5)' }}
              >
                {state.character_level}
              </span>
            </div>
            <div className="text-right leading-none">
              <span className="font-vt text-2xl text-slate-300 tabular-nums">{state.total_xp.toLocaleString()}</span>
              <span className="font-display text-[8px] text-slate-600 uppercase ml-1.5">xp</span>
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{ filter: 'drop-shadow(0 0 10px rgba(34,197,94,0.35))' }}
          >
            <div
              className="relative h-5 rounded-full overflow-hidden"
              style={{
                background: 'rgba(0,0,0,0.75)',
                boxShadow: 'inset 0 0 0 1px rgba(34,197,94,0.2), inset 0 2px 6px rgba(0,0,0,0.6)',
              }}
            >
              <div
                className="h-full rounded-full overflow-hidden relative"
                style={{
                  width: `${pct}%`,
                  background: 'linear-gradient(90deg, #14532d 0%, #15803d 35%, #22c55e 75%, #4ade80 100%)',
                  transition: 'width 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Shine */}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 55%)' }}
                />
                {/* Shimmer sweep */}
                <div className="absolute inset-y-0 w-16"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)', animation: 'shimmer 2.5s ease-in-out infinite' }}
                />
              </div>
              {/* Tick marks at 25% intervals */}
              {[25, 50, 75].map(t => (
                <div key={t} className="absolute top-0 bottom-0 w-px bg-black/30" style={{ left: `${t}%` }} />
              ))}
            </div>
          </div>

          {/* XP label row */}
          <div className="flex justify-between mt-1.5 px-0.5">
            <span className="font-display text-[7px] text-slate-700 uppercase tracking-wider">
              {needed > 0 ? `${current.toLocaleString()} / ${needed.toLocaleString()} xp` : 'max level'}
            </span>
            {needed > 0 && (
              <span className="font-display text-[7px] text-green-700 uppercase tracking-wider">
                → lv {state.character_level + 1}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none select-none"
        style={{ opacity: Math.max(0, 1 - scrollProgress * 5) }}
      >
        <span className="font-display text-[7px] uppercase tracking-[0.35em] text-slate-700">scroll</span>
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-px h-5 bg-gradient-to-b from-green-500/30 to-transparent animate-pulse" />
          <svg className="w-3 h-3 text-green-500/25 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
