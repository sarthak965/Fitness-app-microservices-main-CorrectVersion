import { Link } from 'react-router-dom'
import { StatusBadge } from '../ui/StatusBadge'
import type { Activity } from '../../types/activity'
import { formatDateTime, titleCase } from '../../utils/formatters'

export function ActivityListCard({ activities }: { activities: Activity[] }) {
  return (
    <div className="section-shell">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="eyebrow">Recent activities</div>
          <h2 className="mt-4 text-2xl font-bold">Momentum this week</h2>
        </div>
        <Link to="/app/history" className="action-secondary">
          View all
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {activities.map((activity) => (
          <div key={activity.id} className="theme-accent-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {titleCase(activity.type)}
                </div>
                <div className="mt-2 text-sm text-slate-500">{formatDateTime(activity.startTime)}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold text-ink">{activity.duration} min</div>
                  <div className="text-sm text-slate-500">{activity.caloriesBurned ?? '--'} kcal</div>
                </div>
                <StatusBadge status={activity.recommendationStatus} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
