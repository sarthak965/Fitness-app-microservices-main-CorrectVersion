import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAppAuth } from '../../context/AppAuthContext'

const navItems = [
  {
    to: '/app/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 11h7V4H4v7zm9 9h7v-7h-7v7zM4 20h7v-7H4v7zm9-9h7V4h-7v7z" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/app/track',
    label: 'Track Activity',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 19h3l4-14h-3L6 19zm8 0h3l3-10h-3l-3 10z" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/app/history',
    label: 'History',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M4 12a8 8 0 1 0 2.3-5.7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/app/recommendations',
    label: 'Recommendations',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l2.6 5.3L20 9l-4 4 1 5-5-2.7L7 18l1-5-4-4 5.4-.7L12 3z" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/app/plans',
    label: 'Plans',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 4h10a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/app/coach-chat',
    label: 'AI Chat',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 5h16v10H7l-3 3V5z" fill="currentColor" />
        <circle cx="9" cy="10" r="1.2" fill="#fff" />
        <circle cx="12" cy="10" r="1.2" fill="#fff" />
        <circle cx="15" cy="10" r="1.2" fill="#fff" />
      </svg>
    ),
  },
]

export function AppShell() {
  const { user, logout } = useAppAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`min-h-screen bg-grid bg-grid-soft ${collapsed ? 'app-shell--collapsed' : ''}`}>
      <div
        className={`app-shell__layout mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-20 sm:px-6 lg:flex-row lg:gap-6 lg:px-8 lg:py-6 ${
          collapsed ? 'app-shell__layout--collapsed' : ''
        }`}
      >
        <aside className={`glass-panel app-shell__aside mb-4 w-full p-5 lg:mb-0 ${collapsed ? 'lg:w-24' : 'lg:w-80'}`}>
          <div className="flex items-center justify-between lg:block">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" className="inline-flex items-center gap-3">
              <div className="theme-brand-mark">
                <span className="font-display text-lg font-bold text-[var(--brand-text)]">F</span>
              </div>
              <div className="app-shell__brand">
                <div className="font-display text-lg font-bold text-ink">FitTrack AI</div>
                <div className="text-sm text-slate-500">Performance operating system</div>
              </div>
              </Link>
              <button
                className="sidebar-toggle"
                onClick={() => setCollapsed((prev) => !prev)}
                type="button"
                title={collapsed ? 'Open sidebar' : 'Close sidebar'}
                aria-label={collapsed ? 'Open sidebar' : 'Close sidebar'}
              >
                {collapsed ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M16 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <button className="action-secondary" onClick={() => setCollapsed((prev) => !prev)}>
                {collapsed ? 'Expand' : 'Collapse'}
              </button>
              <button className="action-secondary" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>

          <div className="theme-surface-dark app-shell__user-card mt-8 hidden rounded-[24px] p-5 lg:block">
            <div className="text-sm theme-surface-dark-muted">Signed in as</div>
            <div className="mt-2 font-display text-2xl">
              {user?.firstName || 'Athlete'} {user?.lastName || ''}
            </div>
            <div className="theme-surface-dark-muted mt-1 text-sm">{user?.email || 'Connected via Keycloak'}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="action-secondary flex-1 border-white/10 bg-white/10 text-white hover:bg-white/20"
                onClick={() => setCollapsed((prev) => !prev)}
              >
                {collapsed ? 'Expand' : 'Collapse'}
              </button>
              <button className="action-secondary flex-1 border-white/10 bg-white/10 text-white hover:bg-white/20" onClick={logout}>
                Sign out
              </button>
            </div>
          </div>

          <nav className="app-shell__nav mt-6 grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                aria-label={item.label}
                className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="app-nav-icon">{item.icon}</span>
                <span className="app-nav-label">{item.label}</span>
                <span className="app-nav-tooltip">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="app-shell__main flex-1">
          <div key={location.pathname} className="route-panel">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
