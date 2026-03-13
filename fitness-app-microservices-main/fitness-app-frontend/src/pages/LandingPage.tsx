import { Link } from 'react-router-dom'

const features = [
  'Track every workout across the activity service',
  'Read recommendation status clearly when AI is still pending',
  'Present a polished dashboard even if the backend is temporarily unavailable',
]

export function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-grid bg-grid-soft">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-10 top-20 h-56 w-56 animate-pulseSoft rounded-full bg-cyan/20 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 animate-float rounded-full bg-peach/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-8">
        <header className="glass-panel flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="theme-brand-mark">
              <span className="font-display text-lg font-bold text-[var(--brand-text)]">F</span>
            </div>
            <div>
              <div className="font-display text-lg font-bold">FitTrack AI</div>
              <div className="text-sm text-slate-500">Stripe-style fitness intelligence</div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/auth" className="action-secondary">
              Login
            </Link>
            <Link to="/app/dashboard" className="action-primary">
              Dashboard
            </Link>
          </div>
        </header>

        <section className="grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="section-shell relative overflow-hidden">
            <span className="eyebrow">AI-native fitness workflow</span>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-bold leading-[1.02] text-ink md:text-7xl">
              Your workout backend, wrapped in a premium product story.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              FitTrack AI turns your microservices demo into a polished experience: sign in with Keycloak, track activities, inspect status, and surface recommendations with calm confidence.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/auth" className="action-primary">
                Start with Keycloak
              </Link>
              <a href="#preview" className="action-secondary">
                See the product preview
              </a>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature} className="theme-accent-card p-4 text-sm leading-6 text-slate-600">
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div id="preview" className="section-shell">
            <div className="theme-surface-dark rounded-[28px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="theme-surface-dark-muted text-sm uppercase tracking-[0.22em]">Dashboard preview</div>
                  <div className="mt-2 font-display text-3xl">Performance pulse</div>
                </div>
                <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-200">Live</div>
              </div>

              <div className="mt-8 grid gap-4">
                <div className="theme-surface-dark-soft rounded-[24px] p-5">
                  <div className="theme-surface-dark-muted text-sm">Weekly minutes</div>
                  <div className="mt-2 font-display text-4xl">131</div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="theme-surface-dark-soft rounded-[24px] p-5">
                    <div className="theme-surface-dark-muted text-sm">Pending AI cards</div>
                    <div className="mt-2 font-display text-3xl">02</div>
                  </div>
                  <div className="theme-surface-dark-soft rounded-[24px] p-5">
                    <div className="theme-surface-dark-muted text-sm">Calories burned</div>
                    <div className="mt-2 font-display text-3xl">1,040</div>
                  </div>
                </div>
                <div className="rounded-[24px] bg-white/10 p-5 text-sm leading-7 text-white/90">
                  Recommendation pipeline status is surfaced in the interface so you can explain asynchronous backend behavior cleanly during the interview.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
