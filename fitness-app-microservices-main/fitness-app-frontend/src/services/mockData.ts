import type { Activity } from '../types/activity'
import type { Recommendation } from '../types/recommendation'
import type { UserProfile } from '../types/user'

export const mockUserProfile: UserProfile = {
  id: 'demo-user',
  keycloakId: 'demo-keycloak',
  email: 'athlete@fittrack.ai',
  firstName: 'Avery',
  lastName: 'Stone',
}

export const mockActivities: Activity[] = [
  {
    id: 'activity-1',
    userId: 'demo-user',
    name: 'Morning Tempo Run',
    description: 'Started controlled, pushed the final 15 minutes, and felt strong overall. Slight calf tightness during cooldown.',
    type: 'RUNNING',
    duration: 42,
    caloriesBurned: 388,
    startTime: '2026-03-12T06:30:00',
    recommendationStatus: 'READY',
    additionalMetrics: { distanceKm: 8.3, avgHeartRate: 152 },
    createdAt: '2026-03-12T06:30:00',
    updatedAt: '2026-03-12T07:12:00',
  },
  {
    id: 'activity-2',
    userId: 'demo-user',
    name: 'Mobility Reset',
    description: 'Focused on hips, hamstrings, and lower back. Kept the effort light and tried to improve range of motion.',
    type: 'YOGA',
    duration: 28,
    caloriesBurned: 112,
    startTime: '2026-03-11T19:00:00',
    recommendationStatus: 'PENDING',
    additionalMetrics: { flexibilityScore: 'Improving' },
    createdAt: '2026-03-11T19:00:00',
    updatedAt: '2026-03-11T19:28:00',
  },
  {
    id: 'activity-3',
    userId: 'demo-user',
    name: 'Hill Ride',
    description: 'Longer ride with a few hard climbs. Legs felt heavy on the last hill and cadence dropped late.',
    type: 'CYCLING',
    duration: 61,
    caloriesBurned: 540,
    startTime: '2026-03-10T07:10:00',
    recommendationStatus: 'FAILED',
    additionalMetrics: { cadence: 88, elevationGain: 142 },
    createdAt: '2026-03-10T07:10:00',
    updatedAt: '2026-03-10T08:11:00',
  },
]

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    activityId: 'activity-1',
    userId: 'demo-user',
    activityType: 'RUNNING',
    recommendation:
      'Your endurance is trending upward. Keep the tempo in the second half of the session slightly more controlled to unlock better recovery.',
    improvements: ['Pacing: Hold back the first 10 minutes by 5%', 'Recovery: Add a cooldown walk after hard sessions'],
    suggestions: ['Interval Run: 5 x 3 minute threshold reps', 'Mobility Reset: 12 minute hip and ankle flow'],
    safety: ['Hydrate before longer sessions', 'Reduce intensity if soreness remains above moderate'],
    createdAt: '2026-03-12T07:15:00',
  },
  {
    id: 'rec-2',
    activityId: 'activity-3',
    userId: 'demo-user',
    activityType: 'CYCLING',
    recommendation: 'This ride showed solid volume. Keep the next session light, protect recovery, and return with a steadier climbing rhythm.',
    improvements: ['Technique: Keep upper body relaxed on climbs'],
    suggestions: ['Recovery Ride: 20 minutes easy spin'],
    safety: ['Check knee discomfort before your next ride'],
    createdAt: '2026-03-10T08:20:00',
  },
]
