package com.fitness.aiservice.dto;

import lombok.Data;

@Data
public class GenerateCombinedPlanRequest {
    private GeneratePlanRequest workout;
    private GenerateNutritionPlanRequest nutrition;
}
