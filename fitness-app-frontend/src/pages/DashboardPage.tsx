import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActivityListCard } from '../components/dashboard/ActivityListCard'
import { RecommendationSummaryCard } from '../components/dashboard/RecommendationSummaryCard'
import { useAppAuth } from '../context/AppAuthContext'
import { fitnessApi } from '../services/fitnessApi'
import type { Activity } from '../types/activity'
import type { Recommendation } from '../types/recommendation'
import type { UserProfile } from '../types/user'
import { summariseRecommendations } from '../utils/metrics'

export function DashboardPage() {
  const { token, user } = useAppAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    async function load() {
      if (!token || !user) {
        return
      }

      const [loadedProfile, loadedActivities, loadedRecommendations] = await Promise.all([
        fitnessApi.getUserProfile(user.id, token),
        fitnessApi.getActivities(token),
        fitnessApi.getRecommendationsByUser(user.id, token),
      ])
      setProfile(loadedProfile)
      setActivities(loadedActivities)
      setRecommendations(loadedRecommendations)
    }

    void load()
  }, [token, user])

  const recommendationSummary = summariseRecommendations(recommendations)

  const quickActions = [
    {
      to: '/app/coach-chat',
      label: 'Talk to AI Coach',
      description: "Ask for form tips, meal swaps, or a quick check-in on today's training.",
      cta: 'Open chat',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 5h16v10H7l-3 3V5z" fill="currentColor" />
          <circle cx="9" cy="10" r="1.2" fill="#fff" />
          <circle cx="12" cy="10" r="1.2" fill="#fff" />
          <circle cx="15" cy="10" r="1.2" fill="#fff" />
        </svg>
      ),
    },
    {
      to: '/app/plans',
      label: 'Make Your Plan',
      description: 'Generate multi-week workout, nutrition, or combined plans in minutes.',
      cta: 'Create plan',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h10a2 2 0 0 1 2 2v12l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2z" fill="currentColor" />
        </svg>
      ),
    },
    {
      to: '/app/track',
      label: 'Add Activity',
      description: 'Log a workout and keep your activity feed fresh for recommendations.',
      cta: 'Track now',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 19h3l4-14h-3L6 19zm8 0h3l3-10h-3l-3 10z" fill="currentColor" />
        </svg>
      ),
    },
    {
      to: '/app/history',
      label: 'View History',
      description: 'Review progress, scan trends, and keep the plan grounded in reality.',
      cta: 'See history',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M4 12a8 8 0 1 0 2.3-5.7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <section className="section-shell overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="eyebrow">Dashboard</div>
            <h1 className="mt-5 page-title">
              Welcome back, {profile?.firstName || user?.firstName || 'Athlete'}.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8">
              This dashboard is built to tell the story fast: activity volume, calories, pending AI work, and the latest recommendation all in one place.
            </p>
          </div>
          <div className="theme-surface-dark rounded-[28px] p-6">
            <div className="theme-surface-dark-muted text-sm uppercase tracking-[0.18em]">Profile signal</div>
            <div className="mt-3 font-display text-3xl font-bold">
              {profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}
            </div>
            <div className="theme-surface-dark-muted mt-2 text-sm">{profile?.email || user?.email}</div>
            <div className="theme-surface-dark-soft mt-6 rounded-[24px] p-4 text-sm leading-7 text-white/80">
              Your activity stream, recommendation pipeline, and AI assistant are connected through the gateway and background messaging flow.
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="theme-accent-card group relative flex h-full flex-col overflow-hidden p-6 transition duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="theme-surface-dark-soft text-ink flex h-12 w-12 items-center justify-center rounded-2xl text-lg">
                {action.icon}
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Quick</span>
            </div>
            <div className="mt-6 font-display text-xl text-ink">{action.label}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
            <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink">
              {action.cta}
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <path d="M5 12h12M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ActivityListCard activities={activities.slice(0, 3)} />
        <RecommendationSummaryCard recommendation={recommendationSummary.latest} />
      </section>
    </div>
  )
}
