import { apiRequest } from './apiClient'
import { env } from './env'
import { mockActivities, mockNutritionPlans, mockNutritionTemplates, mockPlans, mockPlanTemplates, mockRecommendations, mockUserProfile } from './mockData'
import type { Activity, ActivityPayload } from '../types/activity'
import type { GenerateCombinedPayload, GenerateNutritionPayload, NutritionPlan, UpdateNutritionPayload } from '../types/nutrition'
import type { GeneratePlanPayload, WorkoutPlan } from '../types/plan'
import type { ChatResponse, Recommendation } from '../types/recommendation'
import type { UserProfile } from '../types/user'

function withReadyStatus(activity: Activity): Activity {
  if (activity.recommendationStatus) {
    return activity
  }

  const hasRecommendation = mockRecommendations.some((item) => item.activityId === activity.id)
  return { ...activity, recommendationStatus: hasRecommendation ? 'READY' : 'PENDING' }
}

async function withMockFallback<T>(callback: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await callback()
  } catch (error) {
    if (!env.enableMockFallback) {
      throw error
    }
    return fallback
  }
}

export const fitnessApi = {
  async getUserProfile(userId: string, token: string) {
    return withMockFallback<UserProfile>(
      () => apiRequest(`/api/users/${userId}`, { token }),
      mockUserProfile,
    )
  },

  async getActivities(token: string) {
    const activities = await withMockFallback<Activity[]>(
      () => apiRequest('/api/activities', { token }),
      mockActivities,
    )
    return activities.map(withReadyStatus)
  },

  async getActivityById(activityId: string, token: string) {
    return withMockFallback<Activity>(
      async () => withReadyStatus(await apiRequest(`/api/activities/${activityId}`, { token })),
      withReadyStatus(mockActivities.find((item) => item.id === activityId) || mockActivities[0]),
    )
  },

  async createActivity(payload: ActivityPayload, token: string) {
    const fallback: Activity = {
      ...payload,
      id: `local-${Date.now()}`,
      recommendationStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return withMockFallback<Activity>(
      async () => withReadyStatus(await apiRequest('/api/activities', { method: 'POST', token, body: payload })),
      fallback,
    )
  },

  async deleteActivity(activityId: string, token: string) {
    await withMockFallback(
      () => apiRequest(`/api/activities/${activityId}`, { method: 'DELETE', token }),
      null,
    )

    await withMockFallback(
      () => apiRequest(`/api/recommendations/activity/${activityId}`, { method: 'DELETE', token }),
      null,
    )
  },

  async getRecommendationsByUser(userId: string, token: string) {
    return withMockFallback<Recommendation[]>(
      () => apiRequest(`/api/recommendations/user/${userId}`, { token }),
      mockRecommendations,
    )
  },

  async getRecommendationByActivity(activityId: string, token: string) {
    return withMockFallback<Recommendation | null>(
      async () => apiRequest(`/api/recommendations/activity/${activityId}`, { token }),
      mockRecommendations.find((item) => item.activityId === activityId) || null,
    )
  },

  async chat(message: string, token: string, activityId?: string) {
    return withMockFallback<ChatResponse>(
      () => apiRequest('/api/recommendations/chat', { method: 'POST', token, body: { message, activityId } }),
      {
        answer:
          'Focus on consistency, controlled progression, and recovery quality. Balance your harder sessions with lighter endurance or mobility work so training stays sustainable.',
      },
    )
  },

  async getPlanTemplates(token: string) {
    return withMockFallback<WorkoutPlan[]>(
      () => apiRequest('/api/plans/templates', { token }),
      mockPlanTemplates,
    )
  },

  async getPlansByUser(userId: string, token: string) {
    return withMockFallback<WorkoutPlan[]>(
      () => apiRequest(`/api/plans/user/${userId}`, { token }),
      mockPlans,
    )
  },

  async getPlanById(planId: string, token: string) {
    const fallback = mockPlans.find((plan) => plan.id === planId) || mockPlans[0]
    return withMockFallback<WorkoutPlan>(
      () => apiRequest(`/api/plans/${planId}`, { token }),
      fallback,
    )
  },

  async explainWorkoutPlan(planId: string, token: string) {
    return withMockFallback<string>(
      () => apiRequest(`/api/plans/${planId}/explain`, { token, responseType: 'text' }),
      'This plan balances intensity and recovery to move you toward your goal while keeping weekly load sustainable.',
    )
  },

  async deleteWorkoutPlan(planId: string, token: string) {
    await withMockFallback(
      () => apiRequest(`/api/plans/${planId}`, { method: 'DELETE', token }),
      null,
    )
  },

  async getNutritionPlansByUser(userId: string, token: string) {
    return withMockFallback<NutritionPlan[]>(
      () => apiRequest(`/api/plans/nutrition/user/${userId}`, { token }),
      mockNutritionPlans,
    )
  },

  async getNutritionTemplates(token: string) {
    return withMockFallback<NutritionPlan[]>(
      () => apiRequest('/api/plans/nutrition/templates', { token }),
      mockNutritionTemplates,
    )
  },

  async getNutritionPlanById(planId: string, token: string) {
    const fallback = mockNutritionPlans.find((plan) => plan.id === planId) || mockNutritionPlans[0]
    return withMockFallback<NutritionPlan>(
      () => apiRequest(`/api/plans/nutrition/${planId}`, { token }),
      fallback,
    )
  },

  async explainNutritionPlan(planId: string, token: string) {
    return withMockFallback<string>(
      () => apiRequest(`/api/plans/nutrition/${planId}/explain`, { token, responseType: 'text' }),
      'This nutrition plan aligns your goals with your preferences, keeping protein consistent and meals realistic for your budget.',
    )
  },

  async deleteNutritionPlan(planId: string, token: string) {
    await withMockFallback(
      () => apiRequest(`/api/plans/nutrition/${planId}`, { method: 'DELETE', token }),
      null,
    )
  },

  async generateNutritionPlan(payload: GenerateNutritionPayload, token: string) {
    const fallback: NutritionPlan = {
      id: `nutrition-${Date.now()}`,
      title: 'Nutrition Plan (Local Preview)',
      goal: payload.goal,
      dietaryPreference: payload.dietaryPreference,
      lactoseIntolerant: payload.lactoseIntolerant,
      currentWeight: payload.currentWeight,
      height: payload.height,
      proteinGoalGrams: payload.proteinGoalGrams,
      activityLevel: payload.activityLevel,
      unhealthyFoodsLiked: payload.unhealthyFoodsLiked,
      healthyFoodsDisliked: payload.healthyFoodsDisliked,
      weeklyBudget: payload.weeklyBudget,
      mealsPerDay: payload.mealsPerDay,
      cookingAbility: payload.cookingAbility,
      dailyTargets: mockNutritionPlans[0]?.dailyTargets,
      days: mockNutritionPlans[0]?.days || [],
      source: 'AI',
      createdAt: new Date().toISOString(),
    }

    return withMockFallback<NutritionPlan>(
      () => apiRequest('/api/plans/nutrition/generate', { method: 'POST', token, body: payload }),
      fallback,
    )
  },

  async updateNutritionPlan(planId: string, payload: UpdateNutritionPayload, token: string) {
    return withMockFallback<NutritionPlan>(
      () => apiRequest(`/api/plans/nutrition/${planId}`, { method: 'PUT', token, body: payload }),
      {
        ...(mockNutritionPlans.find((plan) => plan.id === planId) || mockNutritionPlans[0]),
        ...payload,
      },
    )
  },

  async generateCombinedPlan(payload: GenerateCombinedPayload, token: string) {
    return withMockFallback<{ workoutPlan: WorkoutPlan; nutritionPlan: NutritionPlan }>(
      () => apiRequest('/api/plans/combined/generate', { method: 'POST', token, body: payload }),
      {
        workoutPlan: mockPlans[0],
        nutritionPlan: mockNutritionPlans[0],
      },
    )
  },

  async generatePlan(payload: GeneratePlanPayload, token: string) {
    const fallback: WorkoutPlan = {
      id: `plan-${Date.now()}`,
      title: 'Personalized Plan (Local Preview)',
      goal: payload.goal,
      age: payload.age,
      daysPerWeek: payload.daysPerWeek,
      planLengthWeeks: payload.planLengthWeeks,
      schedule: payload.schedule,
      historyNotes: payload.historyNotes,
      recoveryRating: payload.recoveryRating,
      recoveryNotes: payload.recoveryNotes,
      source: 'AI',
      weeks: mockPlans[0]?.weeks || [],
      createdAt: new Date().toISOString(),
    }

    return withMockFallback<WorkoutPlan>(
      () => apiRequest('/api/plans/generate', { method: 'POST', token, body: payload }),
      fallback,
    )
  },
}
