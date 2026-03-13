import { useEffect, useState } from 'react'
import { ActivityListCard } from '../components/dashboard/ActivityListCard'
import { RecommendationSummaryCard } from '../components/dashboard/RecommendationSummaryCard'
import { StatCard } from '../components/ui/StatCard'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { useAppAuth } from '../context/AppAuthContext'
import { fitnessApi } from '../services/fitnessApi'
import type { Activity } from '../types/activity'
import type { Recommendation } from '../types/recommendation'
import type { UserProfile } from '../types/user'
import { summariseActivities, summariseRecommendations } from '../utils/metrics'

export function DashboardPage() {
  const { token, user } = useAppAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!token || !user) {
        return
      }

      setLoading(true)
      const [loadedProfile, loadedActivities, loadedRecommendations] = await Promise.all([
        fitnessApi.getUserProfile(user.id, token),
        fitnessApi.getActivities(token),
        fitnessApi.getRecommendationsByUser(user.id, token),
      ])
      setProfile(loadedProfile)
      setActivities(loadedActivities)
      setRecommendations(loadedRecommendations)
      setLoading(false)
    }

    void load()
  }, [token, user])

  const activitySummary = summariseActivities(activities)
  const recommendationSummary = summariseRecommendations(recommendations)

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
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard label="Activities" value={String(activitySummary.totalActivities)} detail="Logged workouts in the current feed" accent={<span>01</span>} />
            <StatCard label="Minutes" value={String(activitySummary.totalMinutes)} detail="Total training duration across sessions" accent={<span>02</span>} />
            <StatCard label="Calories" value={String(activitySummary.totalCalories)} detail="Energy burned from available activity data" accent={<span>03</span>} />
            <StatCard label="Pending AI" value={String(activitySummary.pendingRecommendations)} detail="Recommendations still waiting on the async pipeline" accent={<span>04</span>} />
          </>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <ActivityListCard activities={activities.slice(0, 3)} />
        <RecommendationSummaryCard recommendation={recommendationSummary.latest} />
      </section>
    </div>
  )
}
