package com.fitness.aiservice.dto;

import com.fitness.aiservice.model.NutritionPlan;
import com.fitness.aiservice.model.WorkoutPlan;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CombinedPlanResponse {
    private WorkoutPlan workoutPlan;
    private NutritionPlan nutritionPlan;
}
