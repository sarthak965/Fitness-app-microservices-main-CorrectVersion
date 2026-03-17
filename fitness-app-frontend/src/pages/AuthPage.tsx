import { Navigate, useLocation } from 'react-router-dom'
import { useAppAuth } from '../context/AppAuthContext'

export function AuthPage() {
  const { isAuthenticated, login, signup } = useAppAuth()
  const location = useLocation()

  if (isAuthenticated) {
    const destination = (location.state as { from?: string } | null)?.from || '/app/dashboard'
    return <Navigate to={destination} replace />
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="section-shell">
          <div className="eyebrow">Secure access</div>
          <h1 className="mt-5 text-5xl font-bold">Use Keycloak to unlock the app</h1>
          <p className="mt-5 max-w-xl text-base leading-8">
            This frontend uses your Keycloak-based JWT flow. For the demo, both sign in and sign up routes land in the same identity flow so you can move quickly.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="action-primary" onClick={login}>
              Continue to login
            </button>
            <button className="action-secondary" onClick={signup}>
              Create account
            </button>
          </div>
          <div className="theme-accent-card mt-8 p-5">
            <div className="text-sm font-semibold text-slate-500">Interview framing</div>
            <p className="mt-2 text-sm leading-7">
              Mention that the gateway handles JWT verification and injects the user context downstream, while the frontend only manages the user's token and navigation state.
            </p>
          </div>
        </div>

        <div className="theme-surface-dark section-shell overflow-hidden text-white">
          <div className="eyebrow border-white/10 bg-white/10 text-white/70">Product posture</div>
          <h2 className="mt-5 text-4xl font-bold text-white">Clean enough for a demo, structured enough for growth.</h2>
          <div className="mt-8 grid gap-4">
            {[
              'Protected routes with a dedicated app shell',
              'Reusable API layer that keeps page logic clean',
              'Recommendation status badges that explain async behavior clearly',
            ].map((item) => (
              <div key={item} className="theme-surface-dark-soft rounded-[24px] border border-white/10 p-5 text-sm text-white/75">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
