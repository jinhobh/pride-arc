import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/',      icon: '⚡', label: 'Today' },
  { to: '/plan',  icon: '🗺️', label: 'Plan'  },
  { to: '/stats', icon: '📊', label: 'Stats' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-game-surface border-t border-slate-800 flex">
      {TABS.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[9px] font-display uppercase tracking-widest transition-colors ${
              isActive
                ? 'text-green-400'
                : 'text-slate-600 hover:text-slate-400'
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
