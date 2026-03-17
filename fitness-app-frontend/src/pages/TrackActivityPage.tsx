import { useEffect, useState } from 'react'
import { ActivityForm } from '../components/forms/ActivityForm'
import { ActionNotice } from '../components/ui/ActionNotice'
import { LoadingOverlay } from '../components/ui/LoadingOverlay'
import { StatusBadge } from '../components/ui/StatusBadge'
import { useAppAuth } from '../context/AppAuthContext'
import { fitnessApi } from '../services/fitnessApi'
import type { Activity, ActivityPayload } from '../types/activity'
import { formatDateTime, titleCase } from '../utils/formatters'

export function TrackActivityPage() {
  const { token } = useAppAuth()
  const [createdActivity, setCreatedActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !createdActivity?.id || createdActivity.recommendationStatus !== 'PENDING') {
      return
    }

    const intervalId = window.setInterval(async () => {
      try {
        const latestActivity = await fitnessApi.getActivityById(createdActivity.id, token)
        setCreatedActivity(latestActivity)

        if (latestActivity.recommendationStatus !== 'PENDING') {
          window.clearInterval(intervalId)
        }
      } catch {
        window.clearInterval(intervalId)
      }
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [createdActivity, token])

  async function handleSubmit(payload: ActivityPayload) {
    if (!token) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fitnessApi.createActivity(payload, token)
      setCreatedActivity(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create activity')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingOverlay active={loading} message="Saving activity..." />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <ActivityForm onSubmit={handleSubmit} loading={loading} />

      <div className="space-y-6">
        <div className="section-shell">
          <div className="eyebrow">Submission state</div>
          <h2 className="mt-4 text-2xl font-bold">Newest activity</h2>
          {loading ? (
            <div className="mt-4">
              <ActionNotice
                title="Saving activity"
                message="Sending your workout to the backend and starting AI analysis."
                loading
              />
            </div>
          ) : null}
          {error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}
          {createdActivity ? (
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white/80 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {titleCase(createdActivity.type)}
                  </div>
                  {createdActivity.name ? <div className="mt-2 text-lg font-semibold text-slate-900">{createdActivity.name}</div> : null}
                  <div className="mt-2 text-sm text-slate-500">{formatDateTime(createdActivity.startTime)}</div>
                  {createdActivity.description ? (
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{createdActivity.description}</p>
                  ) : null}
                </div>
                <StatusBadge status={createdActivity.recommendationStatus} />
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Duration</div>
                  <div className="mt-1 font-display text-2xl">{createdActivity.duration} min</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">Calories</div>
                  <div className="mt-1 font-display text-2xl">{createdActivity.caloriesBurned ?? '--'}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7">
              Submit an activity and the card will render instantly with a visible recommendation status.
            </p>
          )}
        </div>

        <div className="section-shell">
          <div className="eyebrow">How to explain it</div>
          <p className="mt-4 text-sm leading-7">
            Each activity is stored first, then enriched asynchronously by the recommendation service. Status badges show whether analysis is still processing, finished, or needs a retry.
          </p>
        </div>
      </div>
      </div>
    </>
  )
}
