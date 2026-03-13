import type { RecommendationStatus } from '../../types/activity'

const statusMap: Record<RecommendationStatus, string> = {
  READY: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  PENDING: 'bg-amber-100 text-amber-700 ring-amber-200',
  FAILED: 'bg-rose-100 text-rose-700 ring-rose-200',
}

export function StatusBadge({ status = 'PENDING' }: { status?: RecommendationStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusMap[status]}`}>
      {status}
    </span>
  )
}
