const CHAR_LEVEL_THRESHOLDS = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 3800, 4700, 5700, 6800, 8000, 9300, 10700]

const CHAR_LEVEL_TITLES = [
  '', 'Wanderer', 'Apprentice', 'Practitioner', 'Builder',
  'Engineer', 'Craftsman', 'Architect', 'Specialist', 'Expert',
  'Senior', 'Principal', 'Staff', 'Distinguished', 'Fellow', 'Legend', 'Mythic',
]

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
  const levelTitle = CHAR_LEVEL_TITLES[state.character_level] ?? ''

  let decayFilter = ''
  if      (daysMissed === 1) decayFilter = 'saturate(0.65) brightness(0.93)'
  else if (daysMissed === 2) decayFilter = 'saturate(0.3) brightness(0.85)'
  else if (daysMissed >= 3) decayFilter = 'grayscale(1) brightness(0.75)'

  const isStreakBroken = daysMissed >= 3

  return (
    <div
      className="relative overflow-hidden select-none mx-auto"
      style={{
        maxWidth: '360px',
        borderRadius: '20px',
        background: 'linear-gradient(160deg, #FAF3E0 0%, #F0E6C8 60%, #E8D9B0 100%)',
        border: '1px solid rgba(139,111,71,0.28)',
        boxShadow: '0 8px 32px rgba(100,70,30,0.18), 0 2px 8px rgba(100,70,30,0.10)',
      }}
    >
      {/* Subtle inner top highlight */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.7)' }}
      />

      {/* Character image */}
      <div className="flex justify-center pt-6 pb-2">
        <div style={{ height: 'clamp(180px, 32vw, 240px)', width: 'clamp(130px, 23vw, 175px)' }}>
          <img
            src="/character.png"
            alt="Character"
            className="hero-float"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'bottom center',
              imageRendering: 'initial',
              filter: `${decayFilter} drop-shadow(0px 8px 20px rgba(100,70,30,0.25)) drop-shadow(0 0 14px rgba(74,124,89,0.30))`,
              transition: 'filter 1.5s ease',
            }}
          />
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-5"
        style={{ height: '1px', background: 'rgba(139,111,71,0.18)' }}
      />

      {/* HUD section */}
      <div className="px-5 py-4">

        {/* Name + streak row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1
              style={{
                fontFamily: '"Crimson Pro", serif',
                fontSize: '1.35rem',
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#2C2416',
                letterSpacing: '0.15em',
                lineHeight: 1.1,
              }}
            >
              Jinho
            </h1>
            <p
              style={{
                fontFamily: '"Crimson Pro", serif',
                fontSize: '0.82rem',
                fontStyle: 'italic',
                color: '#6B7F6E',
                marginTop: '2px',
              }}
            >
              Level {state.character_level} — {levelTitle}
            </p>
          </div>

          {streakStatus && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0"
              style={{
                border: `1px solid ${isStreakBroken ? 'rgba(196,123,90,0.35)' : 'rgba(212,168,67,0.35)'}`,
                background: isStreakBroken ? 'rgba(196,123,90,0.10)' : 'rgba(212,168,67,0.10)',
              }}
            >
              <span className="text-base leading-none">{isStreakBroken ? '💀' : '🔥'}</span>
              <span
                style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: isStreakBroken ? '#C47B5A' : '#D4A843',
                }}
              >
                {streakStatus.streak}
              </span>
            </div>
          )}
        </div>

        {/* XP progress bar */}
        <div
          className="overflow-hidden"
          style={{ height: '10px', borderRadius: '999px', background: '#E8D5A3' }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #4A7C59, #7AAE87)',
              transition: 'width 1.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        {/* XP labels */}
        <div className="flex justify-between mt-1.5">
          <span
            style={{
              fontFamily: '"Crimson Pro", serif',
              fontSize: '0.75rem',
              fontStyle: 'italic',
              color: '#6B7F6E',
            }}
          >
            {needed > 0
              ? `${current.toLocaleString()} / ${needed.toLocaleString()} XP`
              : 'Max level'}
          </span>
          {needed > 0 && (
            <span
              style={{
                fontFamily: '"Crimson Pro", serif',
                fontSize: '0.75rem',
                fontStyle: 'italic',
                color: '#6B7F6E',
              }}
            >
              → Lv {state.character_level + 1}
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
