import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ActionNotice } from '../components/ui/ActionNotice'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingOverlay } from '../components/ui/LoadingOverlay'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { useAppAuth } from '../context/AppAuthContext'
import { fitnessApi } from '../services/fitnessApi'
import type { WorkoutPlan } from '../types/plan'
import { formatDateTime } from '../utils/formatters'

export function PlanDetailPage() {
  const { token } = useAppAuth()
  const { planId } = useParams()
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [explaining, setExplaining] = useState(false)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [explainError, setExplainError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      if (!token || !planId) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await fitnessApi.getPlanById(planId, token)
        setPlan(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plan')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [planId, token])

  const planTitle = useMemo(() => plan?.title || 'Workout plan', [plan])

  function downloadPlanAsPdf() {
    if (!plan) {
      return
    }

    const printable = buildPrintableHtml(plan)
    const printWindow = window.open('', '_blank', 'width=900,height=720')
    if (!printWindow) {
      return
    }

    printWindow.document.open()
    printWindow.document.write(printable)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    setTimeout(() => printWindow.close(), 500)
  }

  async function handleExplainPlan() {
    if (!token || !planId) {
      return
    }
    setExplaining(true)
    setExplainError(null)
    try {
      const text = await fitnessApi.explainWorkoutPlan(planId, token)
      setExplanation(text)
    } catch (err) {
      setExplainError(err instanceof Error ? err.message : 'Failed to generate explanation')
    } finally {
      setExplaining(false)
    }
  }

  function requestDeletePlan() {
    setShowDeleteConfirm(true)
  }

  async function handleDeletePlan() {
    if (!token || !planId) {
      return
    }
    setShowDeleteConfirm(false)
    setDeleting(true)
    setDeleteError(null)
    try {
      await fitnessApi.deleteWorkoutPlan(planId, token)
      navigate('/app/plans')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete plan')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !plan) {
    return <EmptyState title="Plan not found" description={error || 'We could not load this plan.'} />
  }

  return (
    <>
      <LoadingOverlay active={explaining} message="Generating plan explanation..." />
      <div className="space-y-6">
      <section className="section-shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="eyebrow">Plan details</div>
            <h1 className="mt-4 page-title">{planTitle}</h1>
            <p className="mt-3 text-sm leading-7">{plan.goal}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              {plan.planLengthWeeks ? <span className="rounded-full bg-slate-100 px-3 py-1">{plan.planLengthWeeks} weeks</span> : null}
              {plan.daysPerWeek ? <span className="rounded-full bg-slate-100 px-3 py-1">{plan.daysPerWeek} days/week</span> : null}
              {plan.createdAt ? <span className="rounded-full bg-slate-100 px-3 py-1">Created {formatDateTime(plan.createdAt)}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="action-secondary" onClick={downloadPlanAsPdf}>
              Download PDF
            </button>
            <button className="action-primary" onClick={handleExplainPlan} disabled={explaining}>
              {explaining ? 'Explaining...' : 'Explain plan'}
            </button>
            <button className="action-secondary action-danger" onClick={requestDeletePlan} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete plan'}
            </button>
            <Link className="action-primary" to="/app/plans">
              Back to plans
            </Link>
          </div>
        </div>

        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete this workout plan?"
          message="This action cannot be undone."
          confirmLabel={deleting ? 'Deleting...' : 'Yes, delete'}
          cancelLabel="Cancel"
          confirmDisabled={deleting}
          onConfirm={handleDeletePlan}
          onCancel={() => setShowDeleteConfirm(false)}
        />

        {deleteError ? (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{deleteError}</div>
        ) : null}
        {explainError ? (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{explainError}</div>
        ) : null}
        {explanation ? (
          <div className="mt-4">
            <ActionNotice title="Why this plan works" message={explanation} />
          </div>
        ) : null}

        {plan.historySummary ? (
          <div className="mt-6">
            <ActionNotice title="History summary" message={plan.historySummary} />
          </div>
        ) : null}
      </section>

      {plan.weeks.map((week) => (
        <section key={`${plan.id}-week-${week.weekNumber}`} className="section-shell">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Week {week.weekNumber}</div>
          <h2 className="mt-3 text-2xl font-bold">{week.theme || 'Weekly focus'}</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {week.days.map((day) => (
              <article key={`${week.weekNumber}-${day.day}-${day.focus}`} className="theme-accent-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{day.day}</div>
                <div className="mt-2 text-lg font-semibold">{day.focus}</div>
                <div className="mt-3 text-sm text-slate-600">{day.session}</div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                  {day.durationMinutes ? <span>{day.durationMinutes} min</span> : null}
                  {day.intensity ? <span>{day.intensity}</span> : null}
                </div>
                {day.notes ? <div className="mt-3 text-xs text-slate-500">{day.notes}</div> : null}
              </article>
            ))}
          </div>
        </section>
      ))}
      </div>
    </>
  )
}

function buildPrintableHtml(plan: WorkoutPlan) {
  const weeksHtml = plan.weeks
    .map(
      (week) => `
      <section class="week">
        <h2>Week ${week.weekNumber}${week.theme ? ` — ${escapeHtml(week.theme)}` : ''}</h2>
        <div class="week-grid">
          ${week.days
            .map(
              (day) => `
              <div class="day">
                <div class="day-label">${escapeHtml(day.day)}</div>
                <div class="day-focus">${escapeHtml(day.focus)}</div>
                <div class="day-session">${escapeHtml(day.session)}</div>
                <div class="day-meta">
                  ${day.durationMinutes ? `<span>${day.durationMinutes} min</span>` : ''}
                  ${day.intensity ? `<span>${escapeHtml(day.intensity)}</span>` : ''}
                </div>
                ${day.notes ? `<div class="day-notes">${escapeHtml(day.notes)}</div>` : ''}
              </div>
            `,
            )
            .join('')}
        </div>
      </section>
    `,
    )
    .join('')

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(plan.title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: "Segoe UI", system-ui, -apple-system, sans-serif; margin: 32px; color: #0f172a; }
          h1 { font-size: 28px; margin-bottom: 6px; }
          h2 { font-size: 18px; margin-bottom: 12px; }
          .meta { color: #475569; font-size: 12px; margin-bottom: 20px; }
          .chip { display: inline-block; border: 1px solid #e2e8f0; border-radius: 999px; padding: 4px 10px; margin-right: 6px; }
          .summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 12px 16px; margin: 16px 0 24px; }
          .week { margin-bottom: 22px; }
          .week-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
          .day { border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; background: #ffffff; }
          .day-label { text-transform: uppercase; font-size: 10px; letter-spacing: 0.18em; color: #64748b; font-weight: 700; }
          .day-focus { font-size: 14px; font-weight: 700; margin-top: 6px; }
          .day-session { font-size: 12px; color: #475569; margin-top: 6px; }
          .day-meta { margin-top: 8px; font-size: 11px; color: #64748b; display: flex; gap: 8px; flex-wrap: wrap; }
          .day-notes { margin-top: 8px; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(plan.title)}</h1>
        <div class="meta">${escapeHtml(plan.goal || '')}</div>
        <div class="meta">
          ${plan.planLengthWeeks ? `<span class="chip">${plan.planLengthWeeks} weeks</span>` : ''}
          ${plan.daysPerWeek ? `<span class="chip">${plan.daysPerWeek} days/week</span>` : ''}
        </div>
        ${plan.historySummary ? `<div class="summary">${escapeHtml(plan.historySummary)}</div>` : ''}
        ${weeksHtml}
      </body>
    </html>
  `
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
