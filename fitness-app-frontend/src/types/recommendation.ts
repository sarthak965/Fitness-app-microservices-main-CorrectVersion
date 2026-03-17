export type Recommendation = {
  id: string
  activityId: string
  userId: string
  activityType: string
  recommendation: string
  improvements: string[]
  suggestions: string[]
  safety: string[]
  createdAt: string
}

export type ChatResponse = {
  answer: string
}
