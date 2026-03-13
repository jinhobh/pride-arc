import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',      icon: '⚡', label: 'Today' },
  { to: '/plan',  icon: '🗺️', label: 'Plan'  },
  { to: '/stats', icon: '📊', label: 'Stats' },
]

export default function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        zIndex: 50,
        background: 'rgba(10, 22, 40, 0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(200, 230, 255, 0.1)',
        display: 'flex',
      }}
    >
      {TABS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', position: 'relative' }}
        >
          {({ isActive }) => (
            <>
              <span style={{ fontSize: '18px', lineHeight: 1, marginBottom: '3px' }}>{icon}</span>
              <span
                style={{
                  fontFamily: '"Shippori Mincho", serif',
                  fontSize: '0.65rem',
                  fontStyle: 'italic',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.55)',
                  transition: 'color 0.15s ease',
                }}
              >
                {label}
              </span>
              {/* Active indicator dot */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: isActive ? 'rgba(255,255,255,0.9)' : 'transparent',
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
