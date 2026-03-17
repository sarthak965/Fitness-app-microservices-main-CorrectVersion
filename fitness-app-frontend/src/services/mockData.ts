import type { Activity } from '../types/activity'
import type { NutritionPlan } from '../types/nutrition'
import type { WorkoutPlan } from '../types/plan'
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

export const mockPlanTemplates: WorkoutPlan[] = [
  {
    id: 'template-strength',
    title: 'Strength Foundation (4 weeks)',
    goal: 'Build full-body strength with progressive volume.',
    source: 'TEMPLATE',
    planLengthWeeks: 4,
    daysPerWeek: 4,
    weeks: [
      {
        weekNumber: 1,
        theme: 'Technique + base volume',
        days: [
          { day: 'Mon', focus: 'Lower body', session: 'Squat focus + posterior chain', durationMinutes: 55, intensity: 'Moderate' },
          { day: 'Wed', focus: 'Upper body', session: 'Press + pull balance', durationMinutes: 50, intensity: 'Moderate' },
          { day: 'Fri', focus: 'Lower body', session: 'Hinge focus + core', durationMinutes: 50, intensity: 'Moderate' },
          { day: 'Sat', focus: 'Accessory', session: 'Unilateral + mobility', durationMinutes: 40, intensity: 'Easy' },
        ],
      },
    ],
  },
  {
    id: 'template-endurance',
    title: 'Endurance Base (4 weeks)',
    goal: 'Build aerobic capacity with steady progress.',
    source: 'TEMPLATE',
    planLengthWeeks: 4,
    daysPerWeek: 4,
    weeks: [
      {
        weekNumber: 1,
        theme: 'Establish baseline',
        days: [
          { day: 'Mon', focus: 'Easy cardio', session: 'Zone 2 session', durationMinutes: 35, intensity: 'Easy' },
          { day: 'Wed', focus: 'Technique', session: 'Form drills + short strides', durationMinutes: 30, intensity: 'Easy' },
          { day: 'Fri', focus: 'Steady', session: 'Moderate steady-state', durationMinutes: 40, intensity: 'Moderate' },
          { day: 'Sun', focus: 'Long', session: 'Long easy session', durationMinutes: 50, intensity: 'Easy' },
        ],
      },
    ],
  },
  {
    id: 'template-mobility',
    title: 'Mobility Reset (3 weeks)',
    goal: 'Improve flexibility, joint control, and recovery.',
    source: 'TEMPLATE',
    planLengthWeeks: 3,
    daysPerWeek: 3,
    weeks: [
      {
        weekNumber: 1,
        theme: 'Reset',
        days: [
          { day: 'Mon', focus: 'Mobility', session: 'Hip + ankle flow', durationMinutes: 30, intensity: 'Easy' },
          { day: 'Wed', focus: 'Stability', session: 'Core + shoulder stability', durationMinutes: 35, intensity: 'Easy' },
          { day: 'Fri', focus: 'Mobility', session: 'Spine + hamstring flow', durationMinutes: 30, intensity: 'Easy' },
        ],
      },
    ],
  },
]

export const mockPlans: WorkoutPlan[] = [
  {
    id: 'plan-1',
    userId: 'demo-user',
    title: 'Tempo Run Progression (4 weeks)',
    goal: 'Improve 5K pace with steady tempo work.',
    age: 29,
    daysPerWeek: 4,
    planLengthWeeks: 4,
    schedule: 'Runs on Mon/Wed/Fri, long run on Sat.',
    historyNotes: 'Mostly running and cycling, want more structure.',
    historySummary: 'Recent activity history summary: 3 sessions logged. Top activity types: RUNNING (2), CYCLING (1).',
    recoveryRating: 4,
    source: 'AI',
    weeks: [
      {
        weekNumber: 1,
        theme: 'Baseline tempo control',
        days: [
          { day: 'Mon', focus: 'Tempo', session: '3 x 6 min tempo with 2 min easy jog', durationMinutes: 45, intensity: 'Moderate' },
          { day: 'Wed', focus: 'Easy', session: 'Easy aerobic run', durationMinutes: 35, intensity: 'Easy' },
          { day: 'Fri', focus: 'Intervals', session: '6 x 400m at 5K pace', durationMinutes: 40, intensity: 'Hard' },
          { day: 'Sat', focus: 'Long', session: 'Long easy run', durationMinutes: 55, intensity: 'Easy' },
        ],
      },
    ],
    createdAt: '2026-03-12T09:15:00',
  },
]

export const mockNutritionPlans: NutritionPlan[] = [
  {
    id: 'nutrition-1',
    userId: 'demo-user',
    title: 'Lean Muscle Fuel Plan',
    goal: 'Build muscle',
    goalTimeline: 'Not specified',
    dietaryPreference: 'EGGTARIAN',
    lactoseIntolerant: false,
    currentWeight: 72,
    height: 176,
    proteinGoalGrams: 130,
    activityLevel: 'Moderately active',
    unhealthyFoodsLiked: 'Pizza',
    healthyFoodsDisliked: 'Raw salads',
    weeklyBudget: 1500,
    mealsPerDay: 4,
    cookingAbility: 'Can cook moderately',
    dailyTargets: {
      calories: 2400,
      proteinGrams: 130,
      carbsGrams: 280,
      fatGrams: 70,
    },
    source: 'AI',
    days: [
      {
        day: 'Mon',
        meals: [
          { name: 'Breakfast', items: ['Oats with milk', 'Banana', 'Almonds'], proteinGrams: 28, calories: 480 },
          { name: 'Lunch', items: ['Paneer bowl', 'Brown rice', 'Veggies'], proteinGrams: 35, calories: 650 },
        ],
        snacks: ['Greek yogurt', 'Fruit'],
        notes: 'Swap paneer with tofu if needed.',
      },
    ],
    createdAt: '2026-03-16T13:20:00',
  },
]

export const mockNutritionTemplates: NutritionPlan[] = [
  {
    id: 'nutrition-template-1',
    title: 'Lean Protein Boost (7 days)',
    goal: 'Build muscle with higher protein intake.',
    dietaryPreference: 'EGGTARIAN',
    lactoseIntolerant: false,
    weeklyBudget: 1800,
    mealsPerDay: 4,
    source: 'TEMPLATE',
    dailyTargets: { calories: 2400, proteinGrams: 140, carbsGrams: 280, fatGrams: 70 },
    days: [
      {
        day: 'Mon',
        meals: [{ name: 'Breakfast', items: ['Oats', 'Milk', 'Banana'], proteinGrams: 28, calories: 450 }],
        snacks: ['Greek yogurt', 'Fruit'],
        micronutrients: ['Calcium', 'Iron'],
        dayTargets: { calories: 2350, proteinGrams: 135, carbsGrams: 270, fatGrams: 68 },
      },
    ],
  },
  {
    id: 'nutrition-template-2',
    title: 'Weight Loss Base (7 days)',
    goal: 'Lose weight with balanced meals.',
    dietaryPreference: 'VEG',
    lactoseIntolerant: false,
    weeklyBudget: 1400,
    mealsPerDay: 3,
    source: 'TEMPLATE',
    dailyTargets: { calories: 1900, proteinGrams: 110, carbsGrams: 200, fatGrams: 60 },
    days: [
      {
        day: 'Mon',
        meals: [{ name: 'Breakfast', items: ['Poha', 'Fruit'], proteinGrams: 18, calories: 350 }],
        snacks: ['Nuts'],
        micronutrients: ['Vitamin C', 'Magnesium'],
        dayTargets: { calories: 1850, proteinGrams: 105, carbsGrams: 190, fatGrams: 58 },
      },
    ],
  },
  {
    id: 'nutrition-template-3',
    title: 'Vegan Budget Plan (7 days)',
    goal: 'Affordable vegan nutrition with sufficient protein.',
    dietaryPreference: 'VEGAN',
    lactoseIntolerant: true,
    weeklyBudget: 1200,
    mealsPerDay: 3,
    source: 'TEMPLATE',
    dailyTargets: { calories: 2100, proteinGrams: 100, carbsGrams: 260, fatGrams: 65 },
    days: [
      {
        day: 'Mon',
        meals: [{ name: 'Breakfast', items: ['Oats', 'Soy milk', 'Peanut butter'], proteinGrams: 24, calories: 420 }],
        snacks: ['Roasted chana'],
        micronutrients: ['Iron', 'Zinc'],
        dayTargets: { calories: 2050, proteinGrams: 98, carbsGrams: 250, fatGrams: 62 },
      },
    ],
  },
]
