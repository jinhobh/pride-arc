const CHAR_LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9300, 10700]

function getCharLevelProgress(totalXp, level) {
  if (level >= CHAR_LEVEL_THRESHOLDS.length) return { pct: 100, current: totalXp, needed: 0 }
  const lo = CHAR_LEVEL_THRESHOLDS[level - 1] ?? 0
  const hi = CHAR_LEVEL_THRESHOLDS[level] ?? CHAR_LEVEL_THRESHOLDS[CHAR_LEVEL_THRESHOLDS.length - 1]
  const pct = Math.max(0, Math.min(100, ((totalXp - lo) / (hi - lo)) * 100))
  return { pct, current: totalXp - lo, needed: hi - lo }
}

/** Sparse warm stars — fewer, softer, slightly warm-tinted */
function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => {
    const a = (Math.imul(i + 1, 2654435761) >>> 0)
    const b = (Math.imul(i + 1, 1664525) + 1013904223) >>> 0
    const x = (a % 10000) / 100
    const y = (b % 5500) / 100  // only top 55%
    const size = i % 12 === 0 ? 2.2 : i % 5 === 0 ? 1.4 : 0.75
    const opacity = 0.05 + (i % 8) * 0.055
    const warm = i % 7 === 0  // slightly amber-tinted
    const pulse = i % 11 === 0
    return { x, y, size, opacity, warm, pulse }
  })
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {stars.map((s, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${s.pulse ? 'animate-pulse-slow' : ''}`}
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            opacity: s.opacity,
            background: s.warm ? '#fde68a' : '#e2e8f0',
          }}
        />
      ))}
    </div>
  )
}

/** Fireflies — warm amber + pale green wisps rising from the platform */
function Fireflies() {
  const pts = Array.from({ length: 18 }, (_, i) => {
    const a = (Math.imul(i + 5, 2654435761) >>> 0)
    const xOffset = ((a % 3000) - 1500) / 10  // -150px to +150px
    const duration = 4 + (i % 6) * 0.9
    const delay    = -(i * (duration / 18))
    const amber    = i % 3 !== 0
    return { xOffset, duration, delay, amber }
  })
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pts.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `calc(50% + ${p.xOffset}px)`,
            bottom: '42%',
            width:  i % 4 === 0 ? '3px' : '2px',
            height: i % 4 === 0 ? '3px' : '2px',
            background: p.amber ? 'rgba(251,191,36,0.9)' : 'rgba(167,243,208,0.75)',
            boxShadow: p.amber
              ? '0 0 7px rgba(251,191,36,1), 0 0 14px rgba(251,191,36,0.5)'
              : '0 0 7px rgba(167,243,208,0.9)',
            animation: `particleRise ${p.duration}s ${p.delay}s ease-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

/** Mossy floating platform — earthy, no orbit rings */
function Platform() {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ bottom: '40%', left: '50%', transform: 'translateX(-50%)', width: '400px' }}
    >
      {/* Warm ground glow beneath platform */}
      <div style={{
        position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
        width: '480px', height: '65px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(251,191,36,0.16) 0%, transparent 70%)',
        filter: 'blur(16px)',
        animation: 'platformPulse 3.5s ease-in-out infinite',
      }} />

      {/* Platform disc — sage green mossy surface */}
      <div style={{
        position: 'absolute', bottom: '0px', left: '50%', transform: 'translateX(-50%)',
        width: '220px', height: '26px', borderRadius: '50%',
        background: 'linear-gradient(180deg, rgba(138,173,110,0.25) 0%, rgba(138,173,110,0.07) 100%)',
        border: '1px solid rgba(138,173,110,0.4)',
        boxShadow: '0 0 20px rgba(138,173,110,0.18), inset 0 2px 0 rgba(255,255,255,0.06)',
      }} />

      {/* Center pulse dot — warm amber lantern */}
      <div style={{
        position: 'absolute', bottom: '9px', left: '50%', transform: 'translateX(-50%)',
        width: '7px', height: '7px', borderRadius: '50%',
        background: 'rgba(251,191,36,0.95)',
        boxShadow: '0 0 12px rgba(251,191,36,1), 0 0 28px rgba(251,191,36,0.45)',
        animation: 'platformPulse 2.5s ease-in-out infinite',
      }} />
    </div>
  )
}

/** Rolling dark forest hills silhouette */
function ForestHills() {
  return (
    <div
      className="absolute left-0 right-0 pointer-events-none"
      style={{ top: '58%', bottom: 0 }}
    >
      {/* Deep forest floor */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 0%, #050a05 55%, #030703 100%)',
      }} />

      {/* Far treeline — lightest, smallest */}
      <svg
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '90%' }}
        viewBox="0 0 1200 200" preserveAspectRatio="none"
      >
        <path
          d="M0 200 L0 140 Q40 115 80 125 Q110 100 140 115 L155 90 L170 110 Q200 85 235 100 Q260 70 290 88 L305 72 L320 88 Q355 60 390 80 Q425 45 460 68 L475 52 L490 68 Q530 38 568 60 Q605 28 640 52 L655 38 L670 52 Q708 22 745 45 Q782 12 818 38 Q855 20 892 42 Q928 28 965 50 Q1000 35 1038 55 Q1068 38 1100 58 Q1130 45 1160 62 L1200 70 L1200 200 Z"
          fill="#0a1308"
        />
        {/* Slightly lighter mid-ground trees */}
        <path
          d="M0 200 L0 165 Q60 148 100 158 Q145 138 185 152 Q225 132 268 148 Q310 125 352 142 Q392 118 435 136 Q478 112 520 130 Q562 108 605 125 Q648 102 690 120 Q730 96 774 115 Q816 92 860 110 Q900 86 945 105 Q988 80 1030 98 Q1068 76 1110 94 Q1148 72 1200 88 L1200 200 Z"
          fill="#0d1a0a"
        />
      </svg>

      {/* Horizon mist — soft sage */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, rgba(138,173,110,0.04) 0%, rgba(138,173,110,0.02) 60%, transparent 100%)',
        animation: 'mistDrift 8s ease-in-out infinite',
      }} />

      {/* Side vignettes */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(5,10,5,0.55) 0%, transparent 18%, transparent 82%, rgba(5,10,5,0.55) 100%)',
      }} />
    </div>
  )
}

export default function CharacterHero({ state, streakStatus, daysMissed = 0, scrollProgress = 0 }) {
  if (!state) return null

  const { pct, current, needed } = getCharLevelProgress(state.total_xp, state.character_level)

  let decayFilter = ''
  if      (daysMissed === 1) decayFilter = 'saturate(0.7)'
  else if (daysMissed === 2) decayFilter = 'saturate(0.4) brightness(0.8)'
  else if (daysMissed >= 3) decayFilter = 'grayscale(1) brightness(0.5)'

  const sceneScale   = 1 - scrollProgress * 0.4
  const sceneOpacity = 1 - scrollProgress * 0.75

  return (
    <div
      className="relative h-screen overflow-hidden select-none"
      style={{
        background: 'linear-gradient(180deg, #050810 0%, #0a0e1a 18%, #111630 38%, #1f1535 56%, #3a1f38 70%, #62302a 84%, #7a3c22 100%)',
      }}
    >
      {/* Sparse warm stars */}
      <StarField />

      {/* Atmospheric color blobs — warm dusk tones */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 15% 22%, rgba(100,45,25,0.14) 0%, transparent 50%)',
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 85% 18%, rgba(190,130,50,0.08) 0%, transparent 46%)',
      }} />

      {/* World light source — warm amber lantern glow centred on character */}
      <div className="absolute pointer-events-none" style={{
        top: '12%', left: '50%', transform: 'translateX(-50%)',
        width: '680px', height: '480px',
        background: 'radial-gradient(ellipse, rgba(251,191,36,0.045) 0%, transparent 65%)',
        filter: 'blur(55px)',
      }} />

      {/* Rolling forest hills */}
      <ForestHills />

      {/* Volumetric warm light cone above character */}
      <div className="absolute pointer-events-none" style={{
        top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '500px', height: '65%',
        background: 'linear-gradient(180deg, rgba(251,191,36,0.0) 0%, rgba(251,191,36,0.02) 40%, rgba(251,191,36,0.07) 90%, transparent 100%)',
        clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
        filter: 'blur(26px)',
      }} />

      {/* Platform + fireflies */}
      <Platform />
      <Fireflies />

      {/* Character */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: 'calc(40% + 13px)',
          left: '50%',
          transform: `translateX(-50%) scale(${sceneScale})`,
          transformOrigin: 'bottom center',
          opacity: sceneOpacity,
          willChange: 'transform, opacity',
        }}
      >
        <div className="hero-float flex flex-col items-center">
          <div style={{ position: 'relative', height: 'clamp(340px, 62vh, 560px)', width: 'clamp(240px, 44vh, 400px)' }}>
            {/* Rim lighting — warm amber + sage */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', borderRadius: '8px',
              background: 'linear-gradient(105deg, rgba(251,191,36,0.1) 0%, transparent 35%, transparent 65%, rgba(138,173,110,0.08) 100%)',
            }} />
            <img
              src="/character.png"
              alt="Character"
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain', objectPosition: 'bottom center',
                imageRendering: 'pixelated',
                filter: `${decayFilter} drop-shadow(0 0 22px rgba(251,191,36,0.2)) drop-shadow(0 50px 90px rgba(0,0,0,0.98))`,
              }}
            />
          </div>
        </div>
      </div>

      {/* HUD: name, streak, level, XP bar */}
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          bottom: 'calc(40% - 115px)',
          opacity: sceneOpacity,
          willChange: 'opacity',
        }}
      >
        {/* Name + streak */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <h1 className="font-display text-sm sm:text-base text-amber-100 uppercase tracking-[0.35em] neon-text-amber">
            Jinho
          </h1>
          {streakStatus && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-500/30 bg-black/50 backdrop-blur-sm">
              <span className="text-sm leading-none">{daysMissed >= 3 ? '💀' : '🔥'}</span>
              <span className="font-vt text-xl leading-none text-orange-400 tabular-nums">{streakStatus.streak}</span>
            </div>
          )}
        </div>

        {/* Level number + XP total */}
        <div className="flex items-end justify-center gap-5 mb-2">
          <div className="flex items-end gap-1.5 leading-none">
            <span className="font-display text-[8px] text-amber-500/50 uppercase tracking-widest mb-2">LV</span>
            <span
              className="font-vt leading-none tabular-nums text-amber-400"
              style={{
                fontSize: 'clamp(52px, 7.5vh, 76px)',
                textShadow: '0 0 30px rgba(251,191,36,0.8), 0 0 70px rgba(251,191,36,0.25)',
              }}
            >
              {state.character_level}
            </span>
          </div>
          <div className="text-right mb-2.5">
            <div className="font-vt text-2xl text-slate-300 tabular-nums leading-none">
              {state.total_xp.toLocaleString()}
            </div>
            <div className="font-display text-[7px] text-slate-600 uppercase tracking-widest">total xp</div>
          </div>
        </div>

        {/* XP progress bar — earthy amber gradient */}
        <div className="flex justify-center">
          <div style={{ width: 'clamp(240px, 38vw, 360px)', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.3))' }}>
            <div style={{
              height: '18px', borderRadius: '999px',
              background: 'rgba(0,0,0,0.78)',
              boxShadow: 'inset 0 0 0 1px rgba(251,191,36,0.2), inset 0 2px 6px rgba(0,0,0,0.7)',
              overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: '999px',
                background: 'linear-gradient(90deg, #451a03 0%, #78350f 30%, #d97706 75%, #fbbf24 100%)',
                transition: 'width 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 55%)' }} />
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, width: '40px',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
                  animation: 'shimmer 3s ease-in-out infinite',
                }} />
              </div>
              {[25, 50, 75].map(t => (
                <div key={t} style={{ position: 'absolute', top: 0, bottom: 0, left: `${t}%`, width: '1px', background: 'rgba(0,0,0,0.3)' }} />
              ))}
            </div>
            <div className="flex justify-between mt-1.5 px-0.5">
              <span className="font-display text-[7px] text-slate-700 uppercase tracking-wider">
                {needed > 0 ? `${current.toLocaleString()} / ${needed.toLocaleString()} xp` : 'max level'}
              </span>
              {needed > 0 && (
                <span className="font-display text-[7px] text-amber-900 uppercase tracking-wider">
                  → lv {state.character_level + 1}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Foreground depth vignettes */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(5,8,16,0.5) 100%)',
      }} />
      <div className="absolute inset-y-0 left-0 w-28 pointer-events-none" style={{
        background: 'linear-gradient(90deg, rgba(5,8,16,0.5) 0%, transparent 100%)',
      }} />
      <div className="absolute inset-y-0 right-0 w-28 pointer-events-none" style={{
        background: 'linear-gradient(270deg, rgba(5,8,16,0.5) 0%, transparent 100%)',
      }} />

      {/* Scroll cue */}
      <div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ opacity: Math.max(0, 1 - scrollProgress * 6) }}
      >
        <span className="font-display text-[7px] uppercase tracking-[0.35em] text-slate-700">scroll</span>
        <svg className="w-4 h-4 text-amber-500/20 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
