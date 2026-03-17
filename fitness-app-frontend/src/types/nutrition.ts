export type NutritionTargets = {
  calories?: number
  proteinGrams?: number
  carbsGrams?: number
  fatGrams?: number
}

export type NutritionMeal = {
  name: string
  items: string[]
  proteinGrams?: number
  calories?: number
}

export type NutritionDay = {
  day: string
  meals: NutritionMeal[]
  snacks?: string[]
  notes?: string
  dayTargets?: NutritionTargets
  micronutrients?: string[]
}

export type NutritionPlan = {
  id: string
  userId?: string
  title: string
  goal?: string
  goalTimeline?: string
  dietaryPreference?: string
  lactoseIntolerant?: boolean
  currentWeight?: number
  height?: number
  proteinGoalGrams?: number
  activityLevel?: string
  unhealthyFoodsLiked?: string
  healthyFoodsDisliked?: string
  weeklyBudget?: number
  mealsPerDay?: number
  cookingAbility?: string
  dailyTargets?: NutritionTargets
  source?: 'AI' | 'TEMPLATE'
  days: NutritionDay[]
  createdAt?: string
}

export type UpdateNutritionPayload = {
  title?: string
  goal?: string
  goalTimeline?: string
  dietaryPreference?: string
  lactoseIntolerant?: boolean
  currentWeight?: number
  height?: number
  proteinGoalGrams?: number
  activityLevel?: string
  unhealthyFoodsLiked?: string
  healthyFoodsDisliked?: string
  weeklyBudget?: number
  mealsPerDay?: number
  cookingAbility?: string
  dailyTargets?: NutritionTargets
  days?: NutritionDay[]
}

export type GenerateNutritionPayload = {
  goal: string
  weightLossTargetKg?: number
  weightLossTimelineWeeks?: number
  dietaryPreference: string
  lactoseIntolerant: boolean
  currentWeight?: number
  height?: number
  proteinGoalGrams?: number
  activityLevel: string
  unhealthyFoodsLiked?: string
  healthyFoodsDisliked?: string
  weeklyBudget?: number
  mealsPerDay?: number
  cookingAbility: string
}

export type GenerateCombinedPayload = {
  workout: GeneratePlanPayload
  nutrition: GenerateNutritionPayload
}
import type { GeneratePlanPayload } from './plan'
