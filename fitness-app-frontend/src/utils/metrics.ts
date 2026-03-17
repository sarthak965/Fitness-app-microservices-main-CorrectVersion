import type { Activity } from '../types/activity'
import type { Recommendation } from '../types/recommendation'

export function summariseActivities(activities: Activity[]) {
  const totalMinutes = activities.reduce((sum, item) => sum + item.duration, 0)
  const totalCalories = activities.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0)
  const pending = activities.filter((item) => item.recommendationStatus === 'PENDING').length

  return {
    totalActivities: activities.length,
    totalMinutes,
    totalCalories,
    pendingRecommendations: pending,
  }
}

export function summariseRecommendations(recommendations: Recommendation[]) {
  return {
    total: recommendations.length,
    latest: recommendations[0] || null,
  }
}
