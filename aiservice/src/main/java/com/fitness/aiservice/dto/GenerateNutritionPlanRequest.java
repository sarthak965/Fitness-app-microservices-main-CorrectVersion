package com.fitness.aiservice.dto;

import lombok.Data;

@Data
public class GenerateNutritionPlanRequest {
    private String goal;
    private Double weightLossTargetKg;
    private Integer weightLossTimelineWeeks;
    private String dietaryPreference;
    private Boolean lactoseIntolerant;
    private Double currentWeight;
    private Double height;
    private Integer proteinGoalGrams;
    private String activityLevel;
    private String unhealthyFoodsLiked;
    private String healthyFoodsDisliked;
    private Integer weeklyBudget;
    private Integer mealsPerDay;
    private String cookingAbility;
}
