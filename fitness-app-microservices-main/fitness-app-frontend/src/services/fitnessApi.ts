import { apiRequest } from './apiClient'
import { env } from './env'
import { mockActivities, mockRecommendations, mockUserProfile } from './mockData'
import type { Activity, ActivityPayload } from '../types/activity'
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
}
