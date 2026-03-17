package com.fitness.aiservice.dto;

import com.fitness.aiservice.model.NutritionDay;
import com.fitness.aiservice.model.NutritionTargets;
import lombok.Data;

import java.util.List;

@Data
public class UpdateNutritionPlanRequest {
    private String title;
    private String goal;
    private String goalTimeline;
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
    private NutritionTargets dailyTargets;
    private List<NutritionDay> days;
}
