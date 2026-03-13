import { Link } from 'react-router-dom'
import type { Recommendation } from '../../types/recommendation'

export function RecommendationSummaryCard({ recommendation }: { recommendation: Recommendation | null }) {
  return (
    <div className="section-shell h-full">
      <div className="eyebrow">AI recommendations</div>
      <h2 className="mt-4 text-2xl font-bold">Coach snapshot</h2>
      {recommendation ? (
        <>
          <p className="mt-4 text-sm leading-7">{recommendation.recommendation}</p>
          <div className="mt-6 grid gap-3">
            {recommendation.suggestions.slice(0, 2).map((item) => (
              <div key={item} className="theme-surface-dark rounded-2xl px-4 py-3 text-sm">
                {item}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm leading-7">
          Recommendations appear after your activity event reaches the AI service. Pending states are shown clearly in the dashboard.
        </p>
      )}
      <Link to="/app/recommendations" className="action-primary mt-6">
        Open recommendations
      </Link>
    </div>
  )
}
