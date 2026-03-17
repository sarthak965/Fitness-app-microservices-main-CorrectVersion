import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ActionNotice } from '../components/ui/ActionNotice'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingOverlay } from '../components/ui/LoadingOverlay'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { useAppAuth } from '../context/AppAuthContext'
import { fitnessApi } from '../services/fitnessApi'
import type { GenerateNutritionPayload, NutritionPlan } from '../types/nutrition'
import type { GeneratePlanPayload, WorkoutPlan } from '../types/plan'

type PlanTab = 'workout' | 'nutrition' | 'combined'

const defaultWorkoutForm: GeneratePlanPayload = {
  goal: '',
  age: undefined,
  daysPerWeek: 4,
  planLengthWeeks: 4,
  schedule: '',
  historyNotes: '',
  recoveryRating: 3,
  recoveryNotes: '',
}

const defaultNutritionForm: GenerateNutritionPayload = {
  goal: 'LOSE_WEIGHT',
  weightLossTargetKg: undefined,
  weightLossTimelineWeeks: undefined,
  dietaryPreference: 'VEG',
  lactoseIntolerant: false,
  currentWeight: undefined,
  height: undefined,
  proteinGoalGrams: undefined,
  activityLevel: 'MODERATELY_ACTIVE',
  unhealthyFoodsLiked: '',
  healthyFoodsDisliked: '',
  weeklyBudget: 1000,
  mealsPerDay: 3,
  cookingAbility: 'CAN_COOK_MODERATELY',
}

export function PlansPage() {
  const { token, user } = useAppAuth()
  const [activeTab, setActiveTab] = useState<PlanTab>('workout')
  const [workoutForm, setWorkoutForm] = useState<GeneratePlanPayload>(defaultWorkoutForm)
  const [nutritionForm, setNutritionForm] = useState<GenerateNutritionPayload>(defaultNutritionForm)
  const [templates, setTemplates] = useState<WorkoutPlan[]>([])
  const [nutritionTemplates, setNutritionTemplates] = useState<NutritionPlan[]>([])
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>([])
  const [selectedWorkoutPlanId, setSelectedWorkoutPlanId] = useState<string>('')
  const [selectedNutritionPlanId, setSelectedNutritionPlanId] = useState<string>('')
  const [combinedResult, setCombinedResult] = useState<{ workoutPlan: WorkoutPlan; nutritionPlan: NutritionPlan } | null>(null)
  const [loading, setLoading] = useState(true)
  const [workoutSubmitting, setWorkoutSubmitting] = useState(false)
  const [nutritionSubmitting, setNutritionSubmitting] = useState(false)
  const [combinedSubmitting, setCombinedSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!token || !user) {
        return
      }

      setLoading(true)
      const [templateData, workoutData, nutritionData, nutritionTemplateData] = await Promise.all([
        fitnessApi.getPlanTemplates(token),
        fitnessApi.getPlansByUser(user.id, token),
        fitnessApi.getNutritionPlansByUser(user.id, token),
        fitnessApi.getNutritionTemplates(token),
      ])
      setTemplates(templateData)
      setWorkoutPlans(workoutData)
      setNutritionPlans(nutritionData)
      setNutritionTemplates(nutritionTemplateData)
      setSelectedWorkoutPlanId(workoutData[0]?.id || '')
      setSelectedNutritionPlanId(nutritionData[0]?.id || '')
      setLoading(false)
    }

    void load()
  }, [token, user])

  const selectedWorkoutPlan = useMemo(
    () => workoutPlans.find((plan) => plan.id === selectedWorkoutPlanId) || workoutPlans[0],
    [workoutPlans, selectedWorkoutPlanId],
  )
  const selectedNutritionPlan = useMemo(
    () => nutritionPlans.find((plan) => plan.id === selectedNutritionPlanId) || nutritionPlans[0],
    [nutritionPlans, selectedNutritionPlanId],
  )

  async function handleWorkoutSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) {
      return
    }

    if (!workoutForm.goal.trim()) {
      setError('Please enter a primary workout goal.')
      return
    }

    setWorkoutSubmitting(true)
    setError(null)

    try {
      const newPlan = await fitnessApi.generatePlan(workoutForm, token)
      setWorkoutPlans((prev) => [newPlan, ...prev])
      setSelectedWorkoutPlanId(newPlan.id)
      setWorkoutForm(defaultWorkoutForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate workout plan')
    } finally {
      setWorkoutSubmitting(false)
    }
  }

  async function handleNutritionSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) {
      return
    }

    if (!nutritionForm.goal) {
      setError('Please select a nutrition goal.')
      return
    }

    setNutritionSubmitting(true)
    setError(null)

    try {
      const newPlan = await fitnessApi.generateNutritionPlan(nutritionForm, token)
      setNutritionPlans((prev) => [newPlan, ...prev])
      setSelectedNutritionPlanId(newPlan.id)
      setNutritionForm(defaultNutritionForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate nutrition plan')
    } finally {
      setNutritionSubmitting(false)
    }
  }

  async function handleCombinedSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) {
      return
    }

    if (!workoutForm.goal.trim()) {
      setError('Please enter a workout goal for the combined plan.')
      return
    }

    setCombinedSubmitting(true)
    setError(null)

    try {
      const result = await fitnessApi.generateCombinedPlan(
        {
          workout: workoutForm,
          nutrition: nutritionForm,
        },
        token,
      )
      setWorkoutPlans((prev) => [result.workoutPlan, ...prev])
      setNutritionPlans((prev) => [result.nutritionPlan, ...prev])
      setSelectedWorkoutPlanId(result.workoutPlan.id)
      setSelectedNutritionPlanId(result.nutritionPlan.id)
      setCombinedResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate combined plan')
    } finally {
      setCombinedSubmitting(false)
    }
  }

  const overlayMessage = combinedSubmitting
    ? 'Generating workout + nutrition plan...'
    : workoutSubmitting
      ? 'Generating workout plan...'
      : nutritionSubmitting
        ? 'Generating nutrition plan...'
        : ''

  return (
    <>
      <LoadingOverlay active={Boolean(overlayMessage)} message={overlayMessage || 'Working on it...'} />
      <div className="space-y-6">
      <section className="section-shell">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="eyebrow">Plans</div>
            <h1 className="mt-4 page-title">Personalized planning studio</h1>
            <p className="mt-3 text-sm leading-7">
              Build workout plans, nutrition plans, or both together. Your data and preferences shape each outcome.
            </p>
          </div>

          <div className="plan-tab-toggle inline-flex flex-wrap gap-2 rounded-full p-2">
            {(['workout', 'nutrition', 'combined'] as PlanTab[]).map((tab) => (
              <button
                key={tab}
                className={`plan-tab-button rounded-full px-4 py-2 text-sm font-semibold transition ${activeTab === tab ? 'is-active' : ''}`}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab === 'workout' ? 'Workout plan' : tab === 'nutrition' ? 'Nutrition plan' : 'Workout + nutrition'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeTab === 'workout' ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="section-shell">
              <div className="eyebrow">Workout builder</div>
              <h2 className="mt-4 text-2xl font-bold">Personalized workout plans</h2>
              <p className="mt-3 text-sm leading-7">
                Tell us your goals, schedule, and recovery status. We will blend your activity history with your notes to create a multi-week plan.
              </p>

              <form className="mt-6 grid gap-4" onSubmit={handleWorkoutSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-500">Primary goal</label>
                  <input
                    className="field"
                    value={workoutForm.goal}
                    onChange={(event) => setWorkoutForm((prev) => ({ ...prev, goal: event.target.value }))}
                    placeholder="Improve 5K pace, build muscle, lose weight..."
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Age</label>
                    <input
                      className="field"
                      type="number"
                      min={13}
                      max={90}
                      value={workoutForm.age ?? ''}
                      onChange={(event) =>
                        setWorkoutForm((prev) => ({ ...prev, age: event.target.value ? Number(event.target.value) : undefined }))
                      }
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Days per week</label>
                    <select
                      className="field"
                      value={workoutForm.daysPerWeek ?? 4}
                      onChange={(event) => setWorkoutForm((prev) => ({ ...prev, daysPerWeek: Number(event.target.value) }))}
                    >
                      {[2, 3, 4, 5, 6].map((value) => (
                        <option key={value} value={value}>
                          {value} days
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Plan length</label>
                    <select
                      className="field"
                      value={workoutForm.planLengthWeeks ?? 4}
                      onChange={(event) => setWorkoutForm((prev) => ({ ...prev, planLengthWeeks: Number(event.target.value) }))}
                    >
                      {[3, 4, 6, 8].map((value) => (
                        <option key={value} value={value}>
                          {value} weeks
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Recovery rating</label>
                    <select
                      className="field"
                      value={workoutForm.recoveryRating ?? 3}
                      onChange={(event) => setWorkoutForm((prev) => ({ ...prev, recoveryRating: Number(event.target.value) }))}
                    >
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value} / 5
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-500">Schedule / availability</label>
                  <textarea
                    className="field min-h-[96px]"
                    value={workoutForm.schedule ?? ''}
                    onChange={(event) => setWorkoutForm((prev) => ({ ...prev, schedule: event.target.value }))}
                    placeholder="Example: Mon/Wed/Fri evenings, Saturday mornings. 45-60 min per session."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-500">History notes</label>
                  <textarea
                    className="field min-h-[96px]"
                    value={workoutForm.historyNotes ?? ''}
                    onChange={(event) => setWorkoutForm((prev) => ({ ...prev, historyNotes: event.target.value }))}
                    placeholder="Share context about past training, injuries, equipment, or preferences."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-500">Recovery notes</label>
                  <input
                    className="field"
                    value={workoutForm.recoveryNotes ?? ''}
                    onChange={(event) => setWorkoutForm((prev) => ({ ...prev, recoveryNotes: event.target.value }))}
                    placeholder="Soreness, sleep quality, stress, or anything we should know."
                  />
                </div>

                {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                <button className="action-primary w-full" type="submit" disabled={workoutSubmitting}>
                  {workoutSubmitting ? 'Generating plan...' : 'Generate workout plan'}
                </button>

                {workoutSubmitting ? (
                  <ActionNotice
                    title="Generating workout plan"
                    message="Analyzing your history and recovery signals."
                    loading
                  />
                ) : null}
              </form>
            </section>

            <section className="section-shell">
              <div className="eyebrow">Templates</div>
              <h2 className="mt-4 text-2xl font-bold">Multi-week program ideas</h2>
              <p className="mt-3 text-sm leading-7">
                Use these as non-AI baselines. Mix and match to shape your next training block.
              </p>
              {loading ? (
                <div className="mt-6 grid gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : templates.length === 0 ? (
                <EmptyState title="No templates yet" description="Templates will appear here once available." />
              ) : (
                <div className="mt-6 grid gap-4">
                  {templates.map((template) => (
                    <article key={template.id} className="plan-template-card rounded-[24px] p-5">
                      <div className="plan-template-eyebrow text-xs font-semibold uppercase tracking-[0.2em]">Template</div>
                      <h3 className="plan-template-title mt-2 text-xl font-semibold">{template.title}</h3>
                      <p className="plan-template-goal mt-2 text-sm">{template.goal}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs">
                        <span className="plan-template-chip rounded-full px-3 py-1">{template.planLengthWeeks} weeks</span>
                        <span className="plan-template-chip rounded-full px-3 py-1">{template.daysPerWeek} days/week</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="section-shell">
              <div className="eyebrow">Your workout plans</div>
              <h2 className="mt-4 text-2xl font-bold">Generated plans</h2>
              {loading ? (
                <div className="mt-6 grid gap-4">
                  <SkeletonCard />
                </div>
              ) : workoutPlans.length === 0 ? (
                <EmptyState title="No plans yet" description="Generate a plan to see it here." />
              ) : (
                <>
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Select plan</label>
                    <select
                      className="field"
                      value={selectedWorkoutPlan?.id || ''}
                      onChange={(event) => setSelectedWorkoutPlanId(event.target.value)}
                    >
                      {workoutPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedWorkoutPlan ? (
                    <div className="mt-6 space-y-4">
                      <div className="plan-template-card rounded-[24px] p-5">
                        <div className="plan-template-eyebrow text-xs font-semibold uppercase tracking-[0.2em]">
                          {selectedWorkoutPlan.source === 'AI' ? 'AI Plan' : 'Template'}
                        </div>
                        <h3 className="plan-template-title mt-2 text-2xl font-bold">{selectedWorkoutPlan.title}</h3>
                        <p className="plan-template-goal mt-3 text-sm">{selectedWorkoutPlan.goal}</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs">
                          {selectedWorkoutPlan.planLengthWeeks ? (
                            <span className="plan-template-chip rounded-full px-3 py-1">{selectedWorkoutPlan.planLengthWeeks} weeks</span>
                          ) : null}
                          {selectedWorkoutPlan.daysPerWeek ? (
                            <span className="plan-template-chip rounded-full px-3 py-1">{selectedWorkoutPlan.daysPerWeek} days/week</span>
                          ) : null}
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <Link className="action-primary" to={`/app/plans/${selectedWorkoutPlan.id}`}>
                            Open full plan
                          </Link>
                          {selectedWorkoutPlan.historySummary ? (
                            <span className="text-xs text-slate-500">{selectedWorkoutPlan.historySummary}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </div>
      ) : null}

      {activeTab === 'nutrition' ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="section-shell">
              <div className="eyebrow">Nutrition builder</div>
              <h2 className="mt-4 text-2xl font-bold">Personalized nutrition plan</h2>
              <p className="mt-3 text-sm leading-7">
                Capture your dietary preference, budget, and protein goals so the plan matches your lifestyle.
              </p>

              <form className="mt-6 grid gap-4" onSubmit={handleNutritionSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Goal</label>
                    <select
                      className="field"
                      value={nutritionForm.goal}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, goal: event.target.value }))}
                    >
                      <option value="LOSE_WEIGHT">Lose weight</option>
                      <option value="BUILD_MUSCLE">Build muscle</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Meals per day</label>
                    <select
                      className="field"
                      value={nutritionForm.mealsPerDay ?? 3}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, mealsPerDay: Number(event.target.value) }))}
                    >
                      {[2, 3, 4, 5, 6].map((value) => (
                        <option key={value} value={value}>
                          {value} meals
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {nutritionForm.goal === 'LOSE_WEIGHT' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-500">Weight loss target (kg)</label>
                      <input
                        className="field"
                        type="number"
                        min={1}
                        value={nutritionForm.weightLossTargetKg ?? ''}
                        onChange={(event) =>
                          setNutritionForm((prev) => ({
                            ...prev,
                            weightLossTargetKg: event.target.value ? Number(event.target.value) : undefined,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-500">Timeline (weeks)</label>
                      <input
                        className="field"
                        type="number"
                        min={2}
                        value={nutritionForm.weightLossTimelineWeeks ?? ''}
                        onChange={(event) =>
                          setNutritionForm((prev) => ({
                            ...prev,
                            weightLossTimelineWeeks: event.target.value ? Number(event.target.value) : undefined,
                          }))
                        }
                      />
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Dietary preference</label>
                    <select
                      className="field"
                      value={nutritionForm.dietaryPreference}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, dietaryPreference: event.target.value }))}
                    >
                      <option value="VEG">Veg</option>
                      <option value="NON_VEG">Non-veg</option>
                      <option value="EGGTARIAN">Eggtarian</option>
                      <option value="VEGAN">Vegan</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Lactose intolerance</label>
                    <select
                      className="field"
                      value={nutritionForm.lactoseIntolerant ? 'YES' : 'NO'}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, lactoseIntolerant: event.target.value === 'YES' }))}
                    >
                      <option value="NO">No</option>
                      <option value="YES">Yes</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Current weight (kg)</label>
                    <input
                      className="field"
                      type="number"
                      min={30}
                      value={nutritionForm.currentWeight ?? ''}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, currentWeight: event.target.value ? Number(event.target.value) : undefined }))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Height (cm)</label>
                    <input
                      className="field"
                      type="number"
                      min={120}
                      value={nutritionForm.height ?? ''}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, height: event.target.value ? Number(event.target.value) : undefined }))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Protein goal (g/day)</label>
                    <input
                      className="field"
                      type="number"
                      min={40}
                      value={nutritionForm.proteinGoalGrams ?? ''}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, proteinGoalGrams: event.target.value ? Number(event.target.value) : undefined }))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Activity level</label>
                    <select
                      className="field"
                      value={nutritionForm.activityLevel}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, activityLevel: event.target.value }))}
                    >
                      <option value="SEDENTARY">Sedentary</option>
                      <option value="LIGHTLY_ACTIVE">Lightly active</option>
                      <option value="MODERATELY_ACTIVE">Moderately active</option>
                      <option value="VERY_ACTIVE">Very active</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Unhealthy food you like</label>
                    <input
                      className="field"
                      value={nutritionForm.unhealthyFoodsLiked ?? ''}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, unhealthyFoodsLiked: event.target.value }))}
                      placeholder="Pizza, biryani, sweets..."
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Healthy food you dislike</label>
                    <input
                      className="field"
                      value={nutritionForm.healthyFoodsDisliked ?? ''}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, healthyFoodsDisliked: event.target.value }))}
                      placeholder="Raw salads, spinach..."
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Budget per week (INR)</label>
                    <input
                      className="field"
                      type="number"
                      min={500}
                      value={nutritionForm.weeklyBudget ?? ''}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, weeklyBudget: event.target.value ? Number(event.target.value) : undefined }))}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Cooking ability</label>
                    <select
                      className="field"
                      value={nutritionForm.cookingAbility}
                      onChange={(event) => setNutritionForm((prev) => ({ ...prev, cookingAbility: event.target.value }))}
                    >
                      <option value="CAN_COOK_PERFECTLY">Can cook perfectly</option>
                      <option value="HOSTEL_FOOD_ONLY">Only hostel food</option>
                      <option value="CAN_COOK_MODERATELY">Can cook moderately</option>
                    </select>
                  </div>
                </div>

                {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                <button className="action-primary w-full" type="submit" disabled={nutritionSubmitting}>
                  {nutritionSubmitting ? 'Generating plan...' : 'Generate nutrition plan'}
                </button>

                {nutritionSubmitting ? (
                  <ActionNotice
                    title="Generating nutrition plan"
                    message="Building meals with your budget and preferences."
                    loading
                  />
                ) : null}
              </form>
            </section>

            <section className="section-shell">
              <div className="eyebrow">Nutrition templates</div>
              <h2 className="mt-4 text-2xl font-bold">Suggested nutrition plans</h2>
              <p className="mt-3 text-sm leading-7">
                Use these as a baseline if you want a quick starting point.
              </p>
              {loading ? (
                <div className="mt-6 grid gap-4">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : nutritionTemplates.length === 0 ? (
                <EmptyState title="No templates yet" description="Templates will appear here once available." />
              ) : (
                <div className="mt-6 grid gap-4">
                  {nutritionTemplates.map((template) => (
                    <article key={template.id} className="plan-template-card rounded-[24px] p-5">
                      <div className="plan-template-eyebrow text-xs font-semibold uppercase tracking-[0.2em]">Template</div>
                      <h3 className="plan-template-title mt-2 text-xl font-semibold">{template.title}</h3>
                      <p className="plan-template-goal mt-2 text-sm">{template.goal}</p>
                      <div className="mt-4 flex flex-wrap gap-3 text-xs">
                        {template.mealsPerDay ? <span className="plan-template-chip rounded-full px-3 py-1">{template.mealsPerDay} meals/day</span> : null}
                        {template.weeklyBudget ? <span className="plan-template-chip rounded-full px-3 py-1">INR {template.weeklyBudget}/week</span> : null}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <section className="section-shell">
              <div className="eyebrow">Your nutrition plans</div>
              <h2 className="mt-4 text-2xl font-bold">Generated plans</h2>
              {loading ? (
                <div className="mt-6 grid gap-4">
                  <SkeletonCard />
                </div>
              ) : nutritionPlans.length === 0 ? (
                <EmptyState title="No plans yet" description="Generate a nutrition plan to see it here." />
              ) : (
                <>
                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-500">Select plan</label>
                    <select
                      className="field"
                      value={selectedNutritionPlan?.id || ''}
                      onChange={(event) => setSelectedNutritionPlanId(event.target.value)}
                    >
                      {nutritionPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedNutritionPlan ? (
                    <div className="mt-6 space-y-4">
                      <div className="plan-template-card rounded-[24px] p-5">
                        <div className="plan-template-eyebrow text-xs font-semibold uppercase tracking-[0.2em]">
                          {selectedNutritionPlan.source === 'AI' ? 'AI Plan' : 'Template'}
                        </div>
                        <h3 className="plan-template-title mt-2 text-2xl font-bold">{selectedNutritionPlan.title}</h3>
                        <p className="plan-template-goal mt-3 text-sm">{selectedNutritionPlan.goal}</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-xs">
                          {selectedNutritionPlan.mealsPerDay ? (
                            <span className="plan-template-chip rounded-full px-3 py-1">{selectedNutritionPlan.mealsPerDay} meals/day</span>
                          ) : null}
                          {selectedNutritionPlan.weeklyBudget ? (
                            <span className="plan-template-chip rounded-full px-3 py-1">INR {selectedNutritionPlan.weeklyBudget}/week</span>
                          ) : null}
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <Link className="action-primary" to={`/app/plans/nutrition/${selectedNutritionPlan.id}`}>
                            Open full plan
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </div>
      ) : null}

      {activeTab === 'combined' ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <section className="section-shell">
              <div className="eyebrow">Combined builder</div>
              <h2 className="mt-4 text-2xl font-bold">Workout + nutrition together</h2>
              <p className="mt-3 text-sm leading-7">
                Fill both sections and generate a synchronized workout and nutrition plan in one run.
              </p>

              <form className="mt-6 grid gap-6" onSubmit={handleCombinedSubmit}>
                <div className="rounded-[24px] border border-slate-200 bg-white/80 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workout inputs</div>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-500">Primary goal</label>
                      <input
                        className="field"
                        value={workoutForm.goal}
                        onChange={(event) => setWorkoutForm((prev) => ({ ...prev, goal: event.target.value }))}
                        placeholder="Improve 5K pace, build muscle, lose weight..."
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Age</label>
                        <input
                          className="field"
                          type="number"
                          min={13}
                          max={90}
                          value={workoutForm.age ?? ''}
                          onChange={(event) =>
                            setWorkoutForm((prev) => ({ ...prev, age: event.target.value ? Number(event.target.value) : undefined }))
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Recovery rating</label>
                        <select
                          className="field"
                          value={workoutForm.recoveryRating ?? 3}
                          onChange={(event) => setWorkoutForm((prev) => ({ ...prev, recoveryRating: Number(event.target.value) }))}
                        >
                          {[1, 2, 3, 4, 5].map((value) => (
                            <option key={value} value={value}>
                              {value} / 5
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Days per week</label>
                        <select
                          className="field"
                          value={workoutForm.daysPerWeek ?? 4}
                          onChange={(event) => setWorkoutForm((prev) => ({ ...prev, daysPerWeek: Number(event.target.value) }))}
                        >
                          {[2, 3, 4, 5, 6].map((value) => (
                            <option key={value} value={value}>
                              {value} days
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Plan length</label>
                        <select
                          className="field"
                          value={workoutForm.planLengthWeeks ?? 4}
                          onChange={(event) => setWorkoutForm((prev) => ({ ...prev, planLengthWeeks: Number(event.target.value) }))}
                        >
                          {[3, 4, 6, 8].map((value) => (
                            <option key={value} value={value}>
                              {value} weeks
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-500">Schedule / availability</label>
                      <textarea
                        className="field min-h-[96px]"
                        value={workoutForm.schedule ?? ''}
                        onChange={(event) => setWorkoutForm((prev) => ({ ...prev, schedule: event.target.value }))}
                        placeholder="Example: Mon/Wed/Fri evenings, Saturday mornings."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-500">History notes</label>
                      <textarea
                        className="field min-h-[96px]"
                        value={workoutForm.historyNotes ?? ''}
                        onChange={(event) => setWorkoutForm((prev) => ({ ...prev, historyNotes: event.target.value }))}
                        placeholder="Past training, injuries, equipment, or preferences."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-500">Recovery notes</label>
                      <input
                        className="field"
                        value={workoutForm.recoveryNotes ?? ''}
                        onChange={(event) => setWorkoutForm((prev) => ({ ...prev, recoveryNotes: event.target.value }))}
                        placeholder="Soreness, sleep quality, stress, or anything we should know."
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white/80 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Nutrition inputs</div>
                  <div className="mt-4 grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Goal</label>
                        <select
                          className="field"
                          value={nutritionForm.goal}
                          onChange={(event) => setNutritionForm((prev) => ({ ...prev, goal: event.target.value }))}
                        >
                          <option value="LOSE_WEIGHT">Lose weight</option>
                          <option value="BUILD_MUSCLE">Build muscle</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Dietary preference</label>
                        <select
                          className="field"
                          value={nutritionForm.dietaryPreference}
                          onChange={(event) => setNutritionForm((prev) => ({ ...prev, dietaryPreference: event.target.value }))}
                        >
                          <option value="VEG">Veg</option>
                          <option value="NON_VEG">Non-veg</option>
                          <option value="EGGTARIAN">Eggtarian</option>
                          <option value="VEGAN">Vegan</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Lactose intolerance</label>
                        <select
                          className="field"
                          value={nutritionForm.lactoseIntolerant ? 'YES' : 'NO'}
                          onChange={(event) => setNutritionForm((prev) => ({ ...prev, lactoseIntolerant: event.target.value === 'YES' }))}
                        >
                          <option value="NO">No</option>
                          <option value="YES">Yes</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Activity level</label>
                        <select
                          className="field"
                          value={nutritionForm.activityLevel}
                          onChange={(event) => setNutritionForm((prev) => ({ ...prev, activityLevel: event.target.value }))}
                        >
                          <option value="SEDENTARY">Sedentary</option>
                          <option value="LIGHTLY_ACTIVE">Lightly active</option>
                          <option value="MODERATELY_ACTIVE">Moderately active</option>
                          <option value="VERY_ACTIVE">Very active</option>
                        </select>
                      </div>
                    </div>
                    {nutritionForm.goal === 'LOSE_WEIGHT' ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-500">Weight loss target (kg)</label>
                          <input
                            className="field"
                            type="number"
                            min={1}
                            value={nutritionForm.weightLossTargetKg ?? ''}
                            onChange={(event) =>
                              setNutritionForm((prev) => ({
                                ...prev,
                                weightLossTargetKg: event.target.value ? Number(event.target.value) : undefined,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-500">Timeline (weeks)</label>
                          <input
                            className="field"
                            type="number"
                            min={2}
                            value={nutritionForm.weightLossTimelineWeeks ?? ''}
                            onChange={(event) =>
                              setNutritionForm((prev) => ({
                                ...prev,
                                weightLossTimelineWeeks: event.target.value ? Number(event.target.value) : undefined,
                              }))
                            }
                          />
                        </div>
                      </div>
                    ) : null}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Current weight (kg)</label>
                        <input
                          className="field"
                          type="number"
                          min={30}
                          value={nutritionForm.currentWeight ?? ''}
                          onChange={(event) =>
                            setNutritionForm((prev) => ({ ...prev, currentWeight: event.target.value ? Number(event.target.value) : undefined }))
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Height (cm)</label>
                        <input
                          className="field"
                          type="number"
                          min={120}
                          value={nutritionForm.height ?? ''}
                          onChange={(event) =>
                            setNutritionForm((prev) => ({ ...prev, height: event.target.value ? Number(event.target.value) : undefined }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Protein goal (g/day)</label>
                        <input
                          className="field"
                          type="number"
                          min={40}
                          value={nutritionForm.proteinGoalGrams ?? ''}
                          onChange={(event) => setNutritionForm((prev) => ({ ...prev, proteinGoalGrams: event.target.value ? Number(event.target.value) : undefined }))}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Budget per week (INR)</label>
                        <input
                          className="field"
                          type="number"
                          min={500}
                          value={nutritionForm.weeklyBudget ?? ''}
                          onChange={(event) => setNutritionForm((prev) => ({ ...prev, weeklyBudget: event.target.value ? Number(event.target.value) : undefined }))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Meals per day</label>
                        <select
                          className="field"
                          value={nutritionForm.mealsPerDay ?? 3}
                          onChange={(event) => setNutritionForm((prev) => ({ ...prev, mealsPerDay: Number(event.target.value) }))}
                        >
                          {[2, 3, 4, 5, 6].map((value) => (
                            <option key={value} value={value}>
                              {value} meals
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-500">Cooking ability</label>
                        <select
                          className="field"
                          value={nutritionForm.cookingAbility}
                          onChange={(event) => setNutritionForm((prev) => ({ ...prev, cookingAbility: event.target.value }))}
                        >
                          <option value="CAN_COOK_PERFECTLY">Can cook perfectly</option>
                          <option value="HOSTEL_FOOD_ONLY">Only hostel food</option>
                          <option value="CAN_COOK_MODERATELY">Can cook moderately</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-500">Unhealthy food you like</label>
                      <input
                        className="field"
                        value={nutritionForm.unhealthyFoodsLiked ?? ''}
                        onChange={(event) => setNutritionForm((prev) => ({ ...prev, unhealthyFoodsLiked: event.target.value }))}
                        placeholder="Pizza, biryani, sweets..."
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-500">Healthy food you dislike</label>
                      <input
                        className="field"
                        value={nutritionForm.healthyFoodsDisliked ?? ''}
                        onChange={(event) => setNutritionForm((prev) => ({ ...prev, healthyFoodsDisliked: event.target.value }))}
                        placeholder="Raw salads, spinach..."
                      />
                    </div>
                  </div>
                </div>

                {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

                <button className="action-primary w-full" type="submit" disabled={combinedSubmitting}>
                  {combinedSubmitting ? 'Generating both plans...' : 'Generate workout + nutrition plan'}
                </button>

                {combinedSubmitting ? (
                  <ActionNotice
                    title="Generating combined plan"
                    message="Creating a workout plan and nutrition plan together. This can take a moment."
                    loading
                  />
                ) : null}
              </form>
            </section>
          </div>

          <div className="space-y-6">
            <section className="section-shell">
              <div className="eyebrow">Latest combined result</div>
              <h2 className="mt-4 text-2xl font-bold">Quick access</h2>
              {combinedResult ? (
                <div className="mt-6 grid gap-4">
                  <div className="rounded-[24px] border border-slate-200 bg-white/80 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Workout plan</div>
                    <h3 className="mt-2 text-xl font-semibold">{combinedResult.workoutPlan.title}</h3>
                    <Link className="action-primary mt-4 inline-flex" to={`/app/plans/${combinedResult.workoutPlan.id}`}>
                      Open workout plan
                    </Link>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-white/80 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Nutrition plan</div>
                    <h3 className="mt-2 text-xl font-semibold">{combinedResult.nutritionPlan.title}</h3>
                    <Link className="action-primary mt-4 inline-flex" to={`/app/plans/nutrition/${combinedResult.nutritionPlan.id}`}>
                      Open nutrition plan
                    </Link>
                  </div>
                </div>
              ) : (
                <EmptyState title="No combined run yet" description="Generate both plans to see them here." />
              )}
            </section>
          </div>
        </div>
      ) : null}
      </div>
    </>
  )
}
