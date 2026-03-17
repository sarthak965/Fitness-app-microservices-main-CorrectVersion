export type PlanSource = 'AI' | 'TEMPLATE'

export type PlanDay = {
  day: string
  focus: string
  session: string
  durationMinutes?: number
  intensity?: string
  notes?: string
}

export type PlanWeek = {
  weekNumber: number
  theme?: string
  days: PlanDay[]
}

export type WorkoutPlan = {
  id: string
  userId?: string
  title: string
  goal?: string
  age?: number
  daysPerWeek?: number
  planLengthWeeks?: number
  schedule?: string
  historyNotes?: string
  historySummary?: string
  recoveryRating?: number
  recoveryNotes?: string
  source: PlanSource
  weeks: PlanWeek[]
  createdAt?: string
}

export type GeneratePlanPayload = {
  goal: string
  age?: number
  daysPerWeek?: number
  planLengthWeeks?: number
  schedule?: string
  historyNotes?: string
  recoveryRating?: number
  recoveryNotes?: string
}
