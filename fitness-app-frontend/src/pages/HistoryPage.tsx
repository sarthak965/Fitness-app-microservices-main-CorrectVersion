import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppAuth } from '../context/AppAuthContext'
import { fitnessApi } from '../services/fitnessApi'
import type { Activity } from '../types/activity'
import { formatDateTime, titleCase } from '../utils/formatters'

export function HistoryPage() {
  const { token } = useAppAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const deferredTypeFilter = useDeferredValue(typeFilter)

  useEffect(() => {
    async function load() {
      if (!token) {
        return
      }

      setLoading(true)
      const response = await fitnessApi.getActivities(token)
      setActivities(response)
      setLoading(false)
    }

    void load()
  }, [token])

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => deferredTypeFilter === 'ALL' || activity.type === deferredTypeFilter)
  }, [activities, deferredTypeFilter])

  async function handleDelete(activityId: string) {
    if (!token) {
      return
    }

    setDeletingId(activityId)
    await fitnessApi.deleteActivity(activityId, token)
    setActivities((current) => current.filter((activity) => activity.id !== activityId))
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <section className="section-shell">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="eyebrow">Activity history</div>
            <h1 className="mt-4 page-title">Review sessions and recommendation status</h1>
          </div>
          <div className="w-full md:w-56">
            <label className="mb-2 block text-sm font-semibold text-slate-500">Filter by type</label>
            <select className="field" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="ALL">All types</option>
              {Array.from(new Set(activities.map((activity) => activity.type))).map((type) => (
                <option key={type} value={type}>
                  {type}
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
          <SkeletonCard />
        </div>
      ) : filteredActivities.length === 0 ? (
        <EmptyState title="No activities found" description="Try a different filter or create a new activity from the tracking page." />
      ) : (
        <div className="grid gap-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="section-shell">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {titleCase(activity.type)}
                  </div>
                  {activity.name ? <div className="mt-2 text-lg font-semibold text-slate-900">{activity.name}</div> : null}
                  <div className="mt-2 text-sm text-slate-500">{formatDateTime(activity.startTime)}</div>
                  {activity.description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{activity.description}</p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span>{activity.duration} min</span>
                    {activity.caloriesBurned != null ? <span>{activity.caloriesBurned} kcal</span> : null}
                    {Object.entries(activity.additionalMetrics || {}).map(([key, value]) => (
                      <span key={key} className="rounded-full bg-slate-100 px-3 py-1">
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to={`/app/coach-chat?activityId=${encodeURIComponent(activity.id)}&type=${encodeURIComponent(activity.type)}&name=${encodeURIComponent(activity.name || '')}&startedAt=${encodeURIComponent(activity.startTime)}&duration=${activity.duration}`}
                    className="action-secondary min-h-[60px] min-w-[112px] px-4 text-center"
                  >
                    Ask AI
                  </Link>
                  {activity.recommendationStatus === 'READY' ? (
                    <Link
                      to={`/app/recommendations?activity=${activity.id}`}
                      className="action-secondary min-h-[60px] min-w-[112px] px-4 text-center"
                    >
                      Open AI brief
                    </Link>
                  ) : null}
                  <button
                    className="action-secondary min-h-[60px] min-w-[112px] px-4 text-center"
                    onClick={() => void handleDelete(activity.id)}
                    disabled={deletingId === activity.id}
                  >
                    {deletingId === activity.id ? 'Deleting...' : 'Delete'}
                  </button>
                  <StatusBadge status={activity.recommendationStatus} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
