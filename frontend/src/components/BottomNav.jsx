import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',      icon: '⚡', label: 'Today' },
  { to: '/plan',  icon: '🗺️', label: 'Plan'  },
  { to: '/stats', icon: '📊', label: 'Stats' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 flex backdrop-blur-sm"
      style={{
        background: 'rgba(250,243,224,0.96)',
        borderTop: '1px solid rgba(139,111,71,0.28)',
      }}
    >
      {TABS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className="flex-1 flex flex-col items-center justify-center py-2 transition-colors"
        >
          {({ isActive }) => (
            <>
              <span className="text-lg leading-none mb-0.5">{icon}</span>
              <span
                style={{
                  fontFamily: '"Shippori Mincho", serif',
                  fontSize: '0.7rem',
                  fontStyle: 'italic',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#4A7C59' : 'rgba(107,127,110,0.7)',
                  transition: 'color 0.15s ease',
                }}
              >
                {label}
              </span>
              {/* Active underline dot */}
              <div
                style={{
                  marginTop: '3px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: isActive ? '#4A7C59' : 'transparent',
                  transition: 'background 0.15s ease',
                }}
              />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
