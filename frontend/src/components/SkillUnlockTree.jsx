import { SKILL_INFO, SKILL_THRESHOLDS } from '../constants/planData'
import { SectionHeader } from './StatPanel'

// Skill progression tracks: each is an ordered chain of skill_type keys
const TRACKS = [
  { label: 'Algorithms',   skills: ['dsa', 'interviewing'] },
  { label: 'Engineering',  skills: ['backend', 'cloud', 'devops'] },
  { label: 'Intelligence', skills: ['ml', 'system_design'] },
  { label: 'Career',       skills: ['project', 'networking', 'career'] },
]

function xpPct(xp, level) {
  if (level >= 10) return 100
  const lo = SKILL_THRESHOLDS[level - 1] ?? 0
  const hi = SKILL_THRESHOLDS[level] ?? SKILL_THRESHOLDS[9]
  return Math.max(0, Math.min(100, ((xp - lo) / (hi - lo)) * 100))
}

function SkillNode({ skillKey, stat }) {
  const info = SKILL_INFO[skillKey]
  if (!info) return null

  const { c } = info
  const level = stat?.level ?? 1
  const xp    = stat?.xp ?? 0
  const active = xp > 0 || level > 1

  const pct = xpPct(xp, level)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        width: '68px',
        flexShrink: 0,
        opacity: active ? 1 : 0.45,
        transition: 'opacity 0.3s',
      }}
    >
      {/* Icon bubble */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          border: `1.5px solid ${active ? 'rgba(139,111,71,0.35)' : 'rgba(139,111,71,0.15)'}`,
          background: active
            ? 'linear-gradient(145deg, #FAF3E0, #F0E6C8)'
            : 'rgba(240,230,200,0.4)',
          boxShadow: active ? '0 2px 8px rgba(100,70,30,0.12)' : 'none',
          position: 'relative',
        }}
      >
        {info.icon}
        {/* Level badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '-6px',
            right: '-4px',
            background: active ? '#4A7C59' : '#A8B5A2',
            borderRadius: '999px',
            padding: '1px 5px',
            border: '1.5px solid #FAF3E0',
          }}
        >
          <span
            style={{
              fontFamily: 'VT323, monospace',
              fontSize: '13px',
              lineHeight: 1,
              color: '#FAF3E0',
            }}
          >
            {level}
          </span>
        </div>
      </div>

      {/* Name */}
      <span
        style={{
          fontFamily: '"Shippori Mincho", serif',
          fontSize: '10px',
          fontStyle: 'italic',
          color: active ? '#2C2416' : '#8A9E8E',
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: '64px',
        }}
      >
        {info.label}
      </span>

      {/* XP mini bar */}
      <div
        style={{
          width: '100%',
          height: '4px',
          borderRadius: '999px',
          background: 'rgba(139,111,71,0.15)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${active ? Math.max(4, pct) : 0}%`,
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #4A7C59, #7AAE87)',
            transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
    </div>
  )
}

function Connector({ active }) {
  return (
    <div
      style={{
        flex: 1,
        height: '2px',
        marginBottom: '28px', // align with icon center (roughly)
        background: active
          ? 'linear-gradient(90deg, rgba(74,124,89,0.55), rgba(74,124,89,0.25))'
          : 'rgba(139,111,71,0.12)',
        position: 'relative',
        minWidth: '8px',
      }}
    >
      {/* Arrowhead */}
      <div
        style={{
          position: 'absolute',
          right: '-1px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
          borderLeft: `5px solid ${active ? 'rgba(74,124,89,0.55)' : 'rgba(139,111,71,0.15)'}`,
        }}
      />
    </div>
  )
}

export default function SkillUnlockTree({ stats }) {
  if (!stats || stats.length === 0) return null

  // Build lookup map
  const statMap = {}
  stats.forEach(s => { statMap[s.skill_type] = s })

  return (
    <section>
      <SectionHeader title="Skill Tree" />

      <div
        style={{
          borderRadius: '16px',
          border: '1px solid rgba(139,111,71,0.22)',
          background: 'linear-gradient(160deg, #FAF3E0 0%, #F0E6C8 100%)',
          padding: '16px 16px 12px',
          boxShadow: '0 2px 12px rgba(100,70,30,0.10)',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', minWidth: '320px' }}>
          {TRACKS.map(track => {
            const firstStat = statMap[track.skills[0]]
            const anyActive = track.skills.some(k => (statMap[k]?.xp ?? 0) > 0 || (statMap[k]?.level ?? 1) > 1)

            return (
              <div key={track.label} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                {/* Track label */}
                <div
                  style={{
                    width: '76px',
                    flexShrink: 0,
                    paddingRight: '10px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: '"Shippori Mincho", serif',
                      fontSize: '10px',
                      fontStyle: 'italic',
                      color: anyActive ? '#6B7F6E' : '#A8B5A2',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {track.label}
                  </span>
                </div>

                {/* Nodes + connectors */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: '0' }}>
                  {track.skills.map((skillKey, idx) => {
                    const stat = statMap[skillKey]
                    const nextStat = statMap[track.skills[idx + 1]]
                    const connActive = (stat?.xp ?? 0) > 0 || (stat?.level ?? 1) > 1
                    return (
                      <div
                        key={skillKey}
                        style={{ display: 'flex', alignItems: 'flex-start', flex: idx < track.skills.length - 1 ? 1 : 0 }}
                      >
                        <SkillNode skillKey={skillKey} stat={stat} />
                        {idx < track.skills.length - 1 && (
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingTop: '22px' }}>
                            <Connector active={connActive} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
