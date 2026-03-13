import { SKILL_INFO } from '../constants/planData'
import { SectionHeader } from './StatPanel'

function timeAgo(tsStr) {
  const ts = new Date(tsStr)
  const now = new Date()
  const diffMs = now - ts
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const TYPE_STYLE = {
  task:       { label: 'Quest',     dot: '#4A7C59' },
  checkpoint: { label: 'Milestone', dot: '#C9A84C' },
  habit:      { label: 'Habit',     dot: '#7B8EAE' },
}

export default function RecentActivity({ feed }) {
  if (!feed || feed.length === 0) return null

  return (
    <section>
      <SectionHeader title="Recent Activity" />

      <div
        style={{
          borderRadius: '16px',
          border: '1px solid rgba(139,111,71,0.22)',
          background: 'linear-gradient(160deg, #FAF3E0 0%, #F0E6C8 100%)',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(100,70,30,0.10)',
        }}
      >
        {feed.map((event, i) => {
          const skill = SKILL_INFO[event.skill_type]
          const meta  = TYPE_STYLE[event.type] ?? TYPE_STYLE.task
          const isLast = i === feed.length - 1

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                borderBottom: isLast ? 'none' : '1px solid rgba(139,111,71,0.12)',
              }}
            >
              {/* Skill icon */}
              <span style={{ fontSize: '20px', lineHeight: 1, flexShrink: 0, width: '24px', textAlign: 'center' }}>
                {skill?.icon ?? '⚡'}
              </span>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: '"Crimson Pro", serif',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#2C2416',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.2,
                  }}
                >
                  {event.title}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                  {/* Type dot */}
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: meta.dot,
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: '"Crimson Pro", serif',
                      fontSize: '11px',
                      fontStyle: 'italic',
                      color: meta.dot,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span style={{ color: 'rgba(107,127,110,0.4)', fontSize: '10px' }}>·</span>
                  <span
                    style={{
                      fontFamily: '"Crimson Pro", serif',
                      fontSize: '11px',
                      fontStyle: 'italic',
                      color: '#6B7F6E',
                    }}
                  >
                    {timeAgo(event.ts)}
                  </span>
                </div>
              </div>

              {/* XP badge */}
              <span
                style={{
                  fontFamily: 'VT323, monospace',
                  fontSize: '18px',
                  lineHeight: 1,
                  color: '#4A7C59',
                  flexShrink: 0,
                }}
              >
                +{event.xp}
              </span>
              <span
                style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontSize: '10px',
                  fontStyle: 'italic',
                  color: '#6B7F6E',
                  flexShrink: 0,
                  marginLeft: '-6px',
                }}
              >
                XP
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
