import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ActionNotice } from '../components/ui/ActionNotice'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingOverlay } from '../components/ui/LoadingOverlay'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { useAppAuth } from '../context/AppAuthContext'
import { fitnessApi } from '../services/fitnessApi'
import type { NutritionDay, NutritionPlan, UpdateNutritionPayload } from '../types/nutrition'
import { formatDateTime } from '../utils/formatters'

export function NutritionPlanDetailPage() {
  const { token } = useAppAuth()
  const { planId } = useParams()
  const [plan, setPlan] = useState<NutritionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<UpdateNutritionPayload | null>(null)
  const [copiedDay, setCopiedDay] = useState<NutritionDay | null>(null)
  const [lastPasteDays, setLastPasteDays] = useState<NutritionDay[] | null>(null)
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
        const data = await fitnessApi.getNutritionPlanById(planId, token)
        setPlan(data)
        setDraft(buildDraft(data))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plan')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [planId, token])

  const planTitle = useMemo(() => plan?.title || 'Nutrition plan', [plan])

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

  function startEditing() {
    if (!plan) {
      return
    }
    setDraft(buildDraft(plan))
    setEditing(true)
  }

  function copyDay(sourceDay: NutritionDay) {
    setCopiedDay(cloneDay(sourceDay, sourceDay.day))
  }

  function pasteDay(targetIndex: number) {
    if (!copiedDay) {
      return
    }
    setDraft((prev) => {
      if (!prev?.days) {
        return prev
      }
      setLastPasteDays(cloneDays(prev.days))
      const updatedDays = [...prev.days]
      const targetDay = updatedDays[targetIndex]
      updatedDays[targetIndex] = cloneDay(copiedDay, targetDay.day)
      return { ...prev, days: updatedDays }
    })
  }

  function pasteAllDays() {
    if (!copiedDay) {
      return
    }
    setDraft((prev) => {
      if (!prev?.days) {
        return prev
      }
      setLastPasteDays(cloneDays(prev.days))
      const updatedDays = prev.days.map((day) => cloneDay(copiedDay, day.day))
      return { ...prev, days: updatedDays }
    })
  }

  function undoPaste() {
    if (!lastPasteDays) {
      return
    }
    setDraft((prev) => {
      if (!prev) {
        return prev
      }
      return { ...prev, days: cloneDays(lastPasteDays) }
    })
    setLastPasteDays(null)
  }

  async function saveEdits() {
    if (!token || !planId || !draft) {
      return
    }
    setSaving(true)
    try {
      const updated = await fitnessApi.updateNutritionPlan(planId, draft, token)
      setPlan(updated)
      setDraft(buildDraft(updated))
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleExplainPlan() {
    if (!token || !planId) {
      return
    }
    setExplaining(true)
    setExplainError(null)
    try {
      const text = await fitnessApi.explainNutritionPlan(planId, token)
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
      await fitnessApi.deleteNutritionPlan(planId, token)
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

  if (!draft) {
    return <EmptyState title="Plan unavailable" description="Unable to load nutrition plan editor." />
  }

  return (
    <>
      <LoadingOverlay active={explaining} message="Generating plan explanation..." />
      <div className="space-y-6">
      <section className="section-shell">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="eyebrow">Nutrition plan</div>
            {editing ? (
              <input
                className="field mt-4 text-2xl font-bold"
                value={draft.title ?? planTitle}
                onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              />
            ) : (
              <h1 className="mt-4 page-title">{planTitle}</h1>
            )}
            {editing ? (
              <input
                className="field mt-3"
                value={draft.goalTimeline ?? plan.goalTimeline ?? plan.goal ?? ''}
                onChange={(event) => setDraft((prev) => ({ ...prev, goalTimeline: event.target.value }))}
                placeholder="Goal timeline or focus"
              />
            ) : (
              <p className="mt-3 text-sm leading-7">{plan.goalTimeline || plan.goal}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              {plan.dietaryPreference ? <span className="rounded-full bg-slate-100 px-3 py-1">{plan.dietaryPreference}</span> : null}
              {plan.mealsPerDay ? <span className="rounded-full bg-slate-100 px-3 py-1">{plan.mealsPerDay} meals/day</span> : null}
              {plan.weeklyBudget ? <span className="rounded-full bg-slate-100 px-3 py-1">INR {plan.weeklyBudget}/week</span> : null}
              {plan.createdAt ? <span className="rounded-full bg-slate-100 px-3 py-1">Created {formatDateTime(plan.createdAt)}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="action-secondary" onClick={downloadPlanAsPdf}>
              Download PDF
            </button>
            {editing ? (
              <button className="action-primary" onClick={saveEdits} disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            ) : (
              <>
                <button className="action-primary" onClick={startEditing}>
                  Edit plan
                </button>
                <button className="action-primary" onClick={handleExplainPlan} disabled={explaining}>
                  {explaining ? 'Explaining...' : 'Explain plan'}
                </button>
              </>
            )}
            <button className="action-secondary action-danger" onClick={requestDeletePlan} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete plan'}
            </button>
            <Link className="action-secondary" to="/app/plans">
              Back to plans
            </Link>
          </div>
        </div>

        <ConfirmDialog
          open={showDeleteConfirm}
          title="Delete this nutrition plan?"
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

        {saving ? (
          <div className="mt-4">
            <ActionNotice title="Saving updates" message="Updating your nutrition plan details." loading />
          </div>
        ) : null}

        {plan.dailyTargets ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Calories</div>
              {editing ? (
                <input
                  className="field mt-2"
                  type="number"
                  value={draft?.dailyTargets?.calories ?? ''}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      dailyTargets: { ...prev?.dailyTargets, calories: event.target.value ? Number(event.target.value) : undefined },
                    }))
                  }
                />
              ) : (
                <div className="mt-2 text-lg font-semibold">{plan.dailyTargets.calories ?? '--'}</div>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Protein</div>
              {editing ? (
                <input
                  className="field mt-2"
                  type="number"
                  value={draft?.dailyTargets?.proteinGrams ?? ''}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      dailyTargets: { ...prev?.dailyTargets, proteinGrams: event.target.value ? Number(event.target.value) : undefined },
                    }))
                  }
                />
              ) : (
                <div className="mt-2 text-lg font-semibold">{plan.dailyTargets.proteinGrams ?? '--'} g</div>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Carbs</div>
              {editing ? (
                <input
                  className="field mt-2"
                  type="number"
                  value={draft?.dailyTargets?.carbsGrams ?? ''}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      dailyTargets: { ...prev?.dailyTargets, carbsGrams: event.target.value ? Number(event.target.value) : undefined },
                    }))
                  }
                />
              ) : (
                <div className="mt-2 text-lg font-semibold">{plan.dailyTargets.carbsGrams ?? '--'} g</div>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Fats</div>
              {editing ? (
                <input
                  className="field mt-2"
                  type="number"
                  value={draft?.dailyTargets?.fatGrams ?? ''}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      dailyTargets: { ...prev?.dailyTargets, fatGrams: event.target.value ? Number(event.target.value) : undefined },
                    }))
                  }
                />
              ) : (
                <div className="mt-2 text-lg font-semibold">{plan.dailyTargets.fatGrams ?? '--'} g</div>
              )}
            </div>
          </div>
        ) : null}

        {plan.unhealthyFoodsLiked ? (
          <div className="mt-6">
            <ActionNotice title="Treats included" message={plan.unhealthyFoodsLiked} />
          </div>
        ) : null}
      </section>

      {plan.days.map((day, dayIndex) => {
        const dayDraft = draft.days?.[dayIndex] ?? day

        return (
        <section key={`${plan.id}-${day.day}`} className="section-shell">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{day.day}</div>
            {editing ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button className="action-secondary" type="button" onClick={() => copyDay(dayDraft)}>
                  Copy day
                </button>
                {copiedDay ? (
                  <button className="action-secondary" type="button" onClick={() => pasteDay(dayIndex)}>
                    Paste day
                  </button>
                ) : null}
                {copiedDay && dayIndex === 0 ? (
                  <button className="action-secondary" type="button" onClick={pasteAllDays}>
                    Paste all
                  </button>
                ) : null}
                {lastPasteDays && dayIndex === 0 ? (
                  <button className="action-secondary" type="button" onClick={undoPaste}>
                    Undo paste
                  </button>
                ) : null}
                {copiedDay ? <span className="text-xs text-slate-500">Copied: {copiedDay.day}</span> : null}
              </div>
            ) : null}
          </div>
          {day.dayTargets ? (
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
              <span>{day.dayTargets.calories ?? '--'} kcal</span>
              <span>{day.dayTargets.proteinGrams ?? '--'} g protein</span>
              <span>{day.dayTargets.carbsGrams ?? '--'} g carbs</span>
              <span>{day.dayTargets.fatGrams ?? '--'} g fats</span>
            </div>
          ) : null}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {day.meals.map((meal, mealIndex) => (
              <article key={`${day.day}-${meal.name}-${mealIndex}`} className="theme-accent-card p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{meal.name}</div>
                {editing ? (
                  <textarea
                    className="field mt-2 min-h-[72px]"
                    value={draft?.days?.[dayIndex]?.meals?.[mealIndex]?.items?.join(', ') || meal.items.join(', ')}
                    onChange={(event) => {
                      const items = event.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                      setDraft((prev) => {
                        if (!prev?.days) {
                          return prev
                        }
                        const updatedDays = [...prev.days]
                        const updatedMeals = [...updatedDays[dayIndex].meals]
                        updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], items }
                        updatedDays[dayIndex] = { ...updatedDays[dayIndex], meals: updatedMeals }
                        return { ...prev, days: updatedDays }
                      })
                    }}
                  />
                ) : (
                  <div className="mt-2 text-base font-semibold">{meal.items.join(', ')}</div>
                )}
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  {meal.proteinGrams ? <span>{meal.proteinGrams} g protein</span> : null}
                  {meal.calories ? <span>{meal.calories} kcal</span> : null}
                </div>
              </article>
            ))}
          </div>
          {day.snacks && day.snacks.length > 0 ? (
            editing ? (
              <input
                className="field mt-4"
                value={draft?.days?.[dayIndex]?.snacks?.join(', ') || day.snacks.join(', ')}
                onChange={(event) => {
                  const snacks = event.target.value.split(',').map((item) => item.trim()).filter(Boolean)
                  setDraft((prev) => {
                    if (!prev?.days) {
                      return prev
                    }
                    const updatedDays = [...prev.days]
                    updatedDays[dayIndex] = { ...updatedDays[dayIndex], snacks }
                    return { ...prev, days: updatedDays }
                  })
                }}
                placeholder="Snacks"
              />
            ) : (
              <div className="mt-4 text-sm text-slate-500">Snacks: {day.snacks.join(', ')}</div>
            )
          ) : null}
          {day.micronutrients && day.micronutrients.length > 0 ? (
            <div className="mt-3 text-xs text-slate-500">Micronutrients: {day.micronutrients.join(', ')}</div>
          ) : null}
          {day.notes ? (
            editing ? (
              <input
                className="field mt-3"
                value={draft?.days?.[dayIndex]?.notes ?? day.notes}
                onChange={(event) => {
                  setDraft((prev) => {
                    if (!prev?.days) {
                      return prev
                    }
                    const updatedDays = [...prev.days]
                    updatedDays[dayIndex] = { ...updatedDays[dayIndex], notes: event.target.value }
                    return { ...prev, days: updatedDays }
                  })
                }}
                placeholder="Notes"
              />
            ) : (
              <div className="mt-3 text-sm text-slate-500">{day.notes}</div>
            )
          ) : null}
        </section>
        )
      })}
      </div>
    </>
  )
}

function buildPrintableHtml(plan: NutritionPlan) {
  const daysHtml = plan.days
    .map(
      (day) => `
      <section class="day">
        <h2>${escapeHtml(day.day)}</h2>
        ${day.dayTargets ? `
          <div class="meal-meta">
            <span>${day.dayTargets.calories ?? '--'} kcal</span>
            <span>${day.dayTargets.proteinGrams ?? '--'} g protein</span>
            <span>${day.dayTargets.carbsGrams ?? '--'} g carbs</span>
            <span>${day.dayTargets.fatGrams ?? '--'} g fats</span>
          </div>
        ` : ''}
        <div class="meal-grid">
          ${day.meals
            .map(
              (meal) => `
              <div class="meal">
                <div class="meal-name">${escapeHtml(meal.name)}</div>
                <div class="meal-items">${escapeHtml(meal.items.join(', '))}</div>
                <div class="meal-meta">
                  ${meal.proteinGrams ? `<span>${meal.proteinGrams} g protein</span>` : ''}
                  ${meal.calories ? `<span>${meal.calories} kcal</span>` : ''}
                </div>
              </div>
            `,
            )
            .join('')}
        </div>
        ${day.snacks && day.snacks.length > 0 ? `<div class="snacks">Snacks: ${escapeHtml(day.snacks.join(', '))}</div>` : ''}
        ${day.micronutrients && day.micronutrients.length > 0 ? `<div class="snacks">Micronutrients: ${escapeHtml(day.micronutrients.join(', '))}</div>` : ''}
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
          h2 { font-size: 16px; margin-bottom: 10px; }
          .meta { color: #475569; font-size: 12px; margin-bottom: 12px; }
          .chip { display: inline-block; border: 1px solid #e2e8f0; border-radius: 999px; padding: 4px 10px; margin-right: 6px; }
          .targets { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
          .day { margin-bottom: 18px; }
          .meal-grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
          .meal { border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; background: #ffffff; }
          .meal-name { font-weight: 700; font-size: 13px; }
          .meal-items { font-size: 12px; color: #475569; margin-top: 6px; }
          .meal-meta { font-size: 11px; color: #64748b; margin-top: 6px; display: flex; gap: 8px; flex-wrap: wrap; }
          .snacks { font-size: 12px; color: #475569; margin-top: 8px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(plan.title)}</h1>
        <div class="meta">${escapeHtml(plan.goalTimeline || plan.goal || '')}</div>
        <div class="meta">
          ${plan.dietaryPreference ? `<span class="chip">${escapeHtml(plan.dietaryPreference)}</span>` : ''}
          ${plan.mealsPerDay ? `<span class="chip">${plan.mealsPerDay} meals/day</span>` : ''}
          ${plan.weeklyBudget ? `<span class="chip">INR ${plan.weeklyBudget}/week</span>` : ''}
        </div>
        ${plan.dailyTargets ? `
          <div class="targets">
            <span class="chip">${plan.dailyTargets.calories ?? '--'} kcal</span>
            <span class="chip">${plan.dailyTargets.proteinGrams ?? '--'} g protein</span>
            <span class="chip">${plan.dailyTargets.carbsGrams ?? '--'} g carbs</span>
            <span class="chip">${plan.dailyTargets.fatGrams ?? '--'} g fats</span>
          </div>
        ` : ''}
        ${daysHtml}
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

function buildDraft(plan: NutritionPlan): UpdateNutritionPayload {
  return {
    title: plan.title,
    goal: plan.goal,
    goalTimeline: plan.goalTimeline,
    dietaryPreference: plan.dietaryPreference,
    lactoseIntolerant: plan.lactoseIntolerant,
    currentWeight: plan.currentWeight,
    height: plan.height,
    proteinGoalGrams: plan.proteinGoalGrams,
    activityLevel: plan.activityLevel,
    unhealthyFoodsLiked: plan.unhealthyFoodsLiked,
    healthyFoodsDisliked: plan.healthyFoodsDisliked,
    weeklyBudget: plan.weeklyBudget,
    mealsPerDay: plan.mealsPerDay,
    cookingAbility: plan.cookingAbility,
    dailyTargets: plan.dailyTargets,
    days: plan.days,
  }
}

function cloneDay(source: NutritionDay, targetDayLabel: string): NutritionDay {
  return {
    ...source,
    day: targetDayLabel,
    meals: source.meals.map((meal) => ({
      ...meal,
      items: [...meal.items],
    })),
    snacks: source.snacks ? [...source.snacks] : undefined,
    micronutrients: source.micronutrients ? [...source.micronutrients] : undefined,
    dayTargets: source.dayTargets ? { ...source.dayTargets } : undefined,
  }
}

function cloneDays(days: NutritionDay[]): NutritionDay[] {
  return days.map((day) => cloneDay(day, day.day))
}
