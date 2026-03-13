import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import type { ActivityPayload, ActivityType } from '../../types/activity'

const activityTypes: ActivityType[] = [
  'RUNNING',
  'WALKING',
  'CYCLING',
  'SWIMMING',
  'WEIGHT_TRAINING',
  'YOGA',
  'HIIT',
  'CARDIO',
  'STRETCHING',
  'OTHER',
]

export function ActivityForm({
  onSubmit,
  loading,
}: {
  onSubmit: (payload: ActivityPayload) => Promise<void>
  loading: boolean
}) {
  const [metrics, setMetrics] = useState('distanceKm=5.2, avgHeartRate=148')
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'RUNNING' as ActivityType,
    duration: '45',
    caloriesBurned: '',
    startTime: new Date().toISOString().slice(0, 16),
  })
  const [error, setError] = useState<string | null>(null)

  const parsedMetrics = useMemo(() => {
    return metrics.split(',').reduce<Record<string, string | number>>((acc, pair) => {
      const [rawKey, rawValue] = pair.split('=').map((item) => item.trim())
      if (!rawKey || !rawValue) {
        return acc
      }

      const numeric = Number(rawValue)
      acc[rawKey] = Number.isNaN(numeric) ? rawValue : numeric
      return acc
    }, {})
  }, [metrics])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!form.type || !form.duration || !form.startTime) {
      setError('Type, duration, and start time are required.')
      return
    }

    await onSubmit({
      userId: '',
      name: form.name.trim() || undefined,
      description: form.description.trim() || undefined,
      type: form.type,
      duration: Number(form.duration),
      caloriesBurned: form.caloriesBurned ? Number(form.caloriesBurned) : 0,
      startTime: new Date(form.startTime).toISOString(),
      additionalMetrics: Object.keys(parsedMetrics).length > 0 ? parsedMetrics : undefined,
    })
  }

  return (
    <form className="section-shell" onSubmit={handleSubmit}>
      <div className="eyebrow">Track activity</div>
      <h1 className="mt-4 text-3xl font-bold">Send a new workout to the backend</h1>
      <p className="mt-3 max-w-2xl text-sm leading-7">
        The activity is written to the backend, then the recommendation pipeline can mark it pending or failed until the AI result lands.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">Activity name</span>
          <input
            className="field"
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Morning 5K, Leg day, Recovery walk..."
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">Activity type</span>
          <select
            className="field"
            value={form.type}
            onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ActivityType }))}
          >
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">Start time</span>
          <input
            className="field"
            type="datetime-local"
            value={form.startTime}
            onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">Duration in minutes</span>
          <input
            className="field"
            type="number"
            min="1"
            value={form.duration}
            onChange={(event) => setForm((current) => ({ ...current, duration: event.target.value }))}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-600">Calories burned</span>
          <input
            className="field"
            type="number"
            min="0"
            value={form.caloriesBurned}
            onChange={(event) => setForm((current) => ({ ...current, caloriesBurned: event.target.value }))}
            placeholder="Optional"
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-slate-600">Description</span>
        <textarea
          className="field min-h-28"
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Add context for the AI coach: exercises, sets, reps, load, fatigue, pain points, pacing, how you felt..."
        />
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-slate-600">Additional metrics</span>
        <textarea
          className="field min-h-32"
          value={metrics}
          onChange={(event) => setMetrics(event.target.value)}
          placeholder="distanceKm=5.2, avgHeartRate=148"
        />
      </label>

      {error ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button className="action-primary" type="submit" disabled={loading}>
          {loading ? 'Sending activity...' : 'Track activity'}
        </button>
        <div className="text-sm text-slate-500">Optimistic UX enabled. New entries appear immediately with `PENDING` status.</div>
      </div>
    </form>
  )
}
