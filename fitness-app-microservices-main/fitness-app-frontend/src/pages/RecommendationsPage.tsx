import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { useAppAuth } from '../context/AppAuthContext'
import { fitnessApi } from '../services/fitnessApi'
import type { Activity } from '../types/activity'
import type { Recommendation } from '../types/recommendation'
import { formatDateTime, titleCase } from '../utils/formatters'

type RecommendationSection = {
  title: string
  body: string
  tone: 'overall' | 'performance' | 'recovery' | 'next' | 'neutral'
}

const sectionStyles: Record<RecommendationSection['tone'], string> = {
  overall: 'border-emerald-200 bg-emerald-50/90 text-emerald-950',
  performance: 'border-sky-200 bg-sky-50/90 text-sky-950',
  recovery: 'border-fuchsia-200 bg-fuchsia-50/90 text-fuchsia-950',
  next: 'border-amber-200 bg-amber-50/90 text-amber-950',
  neutral: 'border-slate-200 bg-white/90 text-slate-800',
}

function getTone(title: string): RecommendationSection['tone'] {
  const normalized = title.toLowerCase()
  if (normalized.includes('overall')) {
    return 'overall'
  }
  if (normalized.includes('performance')) {
    return 'performance'
  }
  if (normalized.includes('recovery')) {
    return 'recovery'
  }
  if (normalized.includes('next')) {
    return 'next'
  }
  return 'neutral'
}

function parseRecommendationSections(content: string): RecommendationSection[] {
  const normalized = content.replace(/\r/g, '').trim()
  const matches = [...normalized.matchAll(/(Overall|Performance|Recovery|Next focus):([\s\S]*?)(?=(Overall|Performance|Recovery|Next focus):|$)/gi)]

  if (matches.length === 0) {
    return [
      {
        title: 'Core insight',
        body: normalized,
        tone: 'neutral',
      },
    ]
  }

  return matches.map((match) => ({
    title: match[1],
    body: match[2].trim(),
    tone: getTone(match[1]),
  }))
}

export function RecommendationsPage() {
  const { token, user } = useAppAuth()
  const [searchParams] = useSearchParams()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [selectedActivityId, setSelectedActivityId] = useState<string>(searchParams.get('activity') || 'all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!token || !user) {
        return
      }

      setLoading(true)
      const [recommendationResponse, activityResponse] = await Promise.all([
        fitnessApi.getRecommendationsByUser(user.id, token),
        fitnessApi.getActivities(token),
      ])

      setRecommendations(recommendationResponse)
      setActivities(activityResponse)
      setLoading(false)
    }

    void load()
  }, [token, user])

  const visibleRecommendations = useMemo(() => {
    return recommendations.filter((item) => selectedActivityId === 'all' || item.activityId === selectedActivityId)
  }, [recommendations, selectedActivityId])

  const activityMap = useMemo(
    () => new Map(activities.map((activity) => [activity.id, activity])),
    [activities],
  )

  return (
    <div className="space-y-6">
      <section className="section-shell">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow">Recommendations</div>
            <h1 className="mt-4 page-title">AI coaching feed</h1>
            <p className="mt-3 text-sm leading-7">
              Review generated coaching briefs, improvement areas, next-step ideas, and safety guidance for each finished session.
            </p>
          </div>

          <div className="w-full md:w-72">
            <label className="mb-2 block text-sm font-semibold text-slate-500">Open by activity</label>
            <select className="field" value={selectedActivityId} onChange={(event) => setSelectedActivityId(event.target.value)}>
              <option value="all">All recommendations</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {titleCase(activity.type)} | {new Date(activity.startTime).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : visibleRecommendations.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          description="Recommendations appear here after a finished session has been processed by the coaching service."
        />
      ) : (
        <div className="grid gap-5">
          {visibleRecommendations.map((recommendation) => {
            const activity = activityMap.get(recommendation.activityId)
            const sections = parseRecommendationSections(recommendation.recommendation)

            return (
              <article key={recommendation.id} className="section-shell">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {titleCase(recommendation.activityType)}
                    </div>
                    <h2 className="mt-3 text-2xl font-bold">
                      {titleCase(recommendation.activityType)} session on {formatDateTime(activity?.startTime || recommendation.createdAt)}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">{activity?.duration || '--'} min</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{activity?.caloriesBurned ?? '--'} kcal</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">Generated {formatDateTime(recommendation.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {sections.map((section) => (
                    <div key={`${recommendation.id}-${section.title}`} className={`rounded-[24px] border p-5 ${sectionStyles[section.tone]}`}>
                      <div className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{section.title}</div>
                      <div className="mt-3 text-sm leading-7">{section.body}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[24px] border border-amber-200 bg-amber-50/90 p-5">
                    <div className="text-sm font-semibold text-amber-900">Improvements</div>
                    <ul className="mt-3 grid gap-3 text-sm text-amber-950">
                      {recommendation.improvements.map((item) => (
                        <li key={item} className="rounded-2xl border border-amber-200 bg-white/60 px-4 py-3">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[24px] border border-sky-200 bg-sky-50/90 p-5">
                    <div className="text-sm font-semibold text-sky-900">Suggestions</div>
                    <ul className="mt-3 grid gap-3 text-sm text-sky-950">
                      {recommendation.suggestions.map((item) => (
                        <li key={item} className="rounded-2xl border border-sky-200 bg-white/60 px-4 py-3">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[24px] border border-fuchsia-200 bg-fuchsia-50/90 p-5">
                    <div className="text-sm font-semibold text-fuchsia-900">Safety</div>
                    <ul className="mt-3 grid gap-3 text-sm text-fuchsia-950">
                      {recommendation.safety.map((item) => (
                        <li key={item} className="rounded-2xl border border-fuchsia-200 bg-white/60 px-4 py-3">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
