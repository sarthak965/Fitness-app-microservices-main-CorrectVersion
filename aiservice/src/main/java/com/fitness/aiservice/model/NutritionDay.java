package com.fitness.aiservice.model;

import lombok.Data;

import java.util.List;

@Data
public class NutritionDay {
    private String day;
    private List<NutritionMeal> meals;
    private List<String> snacks;
    private String notes;
    private NutritionTargets dayTargets;
    private List<String> micronutrients;
}
