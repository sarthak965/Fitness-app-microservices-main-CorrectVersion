package com.fitness.aiservice.model;

import lombok.Data;

import java.util.List;

@Data
public class NutritionMeal {
    private String name;
    private List<String> items;
    private Integer proteinGrams;
    private Integer calories;
}
