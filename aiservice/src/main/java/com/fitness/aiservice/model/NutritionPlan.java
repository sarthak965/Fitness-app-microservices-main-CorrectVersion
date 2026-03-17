package com.fitness.aiservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "nutrition_plans")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NutritionPlan {
    @Id
    private String id;
    private String userId;
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
    private PlanSource source;
    private List<NutritionDay> days;

    @CreatedDate
    private LocalDateTime createdAt;
}
