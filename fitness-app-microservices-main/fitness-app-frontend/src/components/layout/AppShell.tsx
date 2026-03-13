import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAppAuth } from '../../context/AppAuthContext'

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard' },
  { to: '/app/track', label: 'Track Activity' },
  { to: '/app/history', label: 'History' },
  { to: '/app/recommendations', label: 'Recommendations' },
  { to: '/app/coach-chat', label: 'AI Chat' },
]

export function AppShell() {
  const { user, logout } = useAppAuth()

  return (
    <div className="min-h-screen bg-grid bg-grid-soft">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-20 sm:px-6 lg:flex-row lg:gap-6 lg:px-8 lg:py-6">
        <aside className="glass-panel mb-4 w-full p-5 lg:mb-0 lg:w-80">
          <div className="flex items-center justify-between lg:block">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="theme-brand-mark">
                <span className="font-display text-lg font-bold text-[var(--brand-text)]">F</span>
              </div>
              <div>
                <div className="font-display text-lg font-bold text-ink">FitTrack AI</div>
                <div className="text-sm text-slate-500">Performance operating system</div>
              </div>
            </Link>
            <button className="action-secondary lg:hidden" onClick={logout}>
              Sign out
            </button>
          </div>

          <div className="theme-surface-dark mt-8 hidden rounded-[24px] p-5 lg:block">
            <div className="text-sm theme-surface-dark-muted">Signed in as</div>
            <div className="mt-2 font-display text-2xl">{user?.firstName || 'Athlete'} {user?.lastName || ''}</div>
            <div className="theme-surface-dark-muted mt-1 text-sm">{user?.email || 'Connected via Keycloak'}</div>
            <button className="action-secondary mt-5 w-full border-white/10 bg-white/10 text-white hover:bg-white/20" onClick={logout}>
              Sign out
            </button>
          </div>

          <nav className="mt-6 grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
