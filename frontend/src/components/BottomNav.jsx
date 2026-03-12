import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',      icon: '⚡', label: 'Today' },
  { to: '/plan',  icon: '🗺️', label: 'Plan'  },
  { to: '/stats', icon: '📊', label: 'Stats' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-ghibli-cream/95 backdrop-blur border-t border-ghibli-earth/25 flex shadow-ghibli-card">
      {TABS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-display italic transition-colors ${
              isActive
                ? 'text-ghibli-forest'
                : 'text-ghibli-mist/70 hover:text-ghibli-mist'
            }`
          }
        >
          <span className="text-lg leading-none">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
