export type RecommendationStatus = 'PENDING' | 'FAILED' | 'READY'

export type ActivityType =
  | 'RUNNING'
  | 'WALKING'
  | 'CYCLING'
  | 'SWIMMING'
  | 'WEIGHT_TRAINING'
  | 'YOGA'
  | 'HIIT'
  | 'CARDIO'
  | 'STRETCHING'
  | 'OTHER'

export type Activity = {
  id: string
  userId: string
  name?: string
  description?: string
  type: ActivityType
  duration: number
  caloriesBurned?: number
  startTime: string
  additionalMetrics?: Record<string, string | number>
  recommendationStatus?: RecommendationStatus
  createdAt?: string
  updatedAt?: string
}

export type ActivityPayload = Omit<Activity, 'id' | 'recommendationStatus' | 'createdAt' | 'updatedAt'>
