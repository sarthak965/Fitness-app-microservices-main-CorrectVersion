package com.fitness.aiservice.service;

import com.fitness.aiservice.model.NutritionDay;
import com.fitness.aiservice.model.NutritionMeal;
import com.fitness.aiservice.model.NutritionPlan;
import com.fitness.aiservice.model.NutritionTargets;
import com.fitness.aiservice.model.PlanSource;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NutritionTemplateService {

    public List<NutritionPlan> getTemplates() {
        return List.of(
                buildLeanProteinTemplate(),
                buildWeightLossTemplate(),
                buildVeganBudgetTemplate()
        );
    }

    private NutritionPlan buildLeanProteinTemplate() {
        return NutritionPlan.builder()
                .title("Lean Protein Boost (7 days)")
                .goal("Build muscle with higher protein intake.")
                .dietaryPreference("EGGTARIAN")
                .lactoseIntolerant(false)
                .weeklyBudget(1800)
                .mealsPerDay(4)
                .source(PlanSource.TEMPLATE)
                .dailyTargets(targets(2400, 140, 280, 70))
                .days(List.of(daySample("Mon")))
                .build();
    }

    private NutritionPlan buildWeightLossTemplate() {
        return NutritionPlan.builder()
                .title("Weight Loss Base (7 days)")
                .goal("Lose weight with balanced meals.")
                .dietaryPreference("VEG")
                .lactoseIntolerant(false)
                .weeklyBudget(1400)
                .mealsPerDay(3)
                .source(PlanSource.TEMPLATE)
                .dailyTargets(targets(1900, 110, 200, 60))
                .days(List.of(daySample("Mon")))
                .build();
    }

    private NutritionPlan buildVeganBudgetTemplate() {
        return NutritionPlan.builder()
                .title("Vegan Budget Plan (7 days)")
                .goal("Affordable vegan nutrition with sufficient protein.")
                .dietaryPreference("VEGAN")
                .lactoseIntolerant(true)
                .weeklyBudget(1200)
                .mealsPerDay(3)
                .source(PlanSource.TEMPLATE)
                .dailyTargets(targets(2100, 100, 260, 65))
                .days(List.of(daySample("Mon")))
                .build();
    }

    private NutritionDay daySample(String day) {
        NutritionMeal breakfast = new NutritionMeal();
        breakfast.setName("Breakfast");
        breakfast.setItems(List.of("Oats", "Fruit", "Protein source"));
        breakfast.setProteinGrams(25);
        breakfast.setCalories(420);

        NutritionDay nutritionDay = new NutritionDay();
        nutritionDay.setDay(day);
        nutritionDay.setMeals(List.of(breakfast));
        nutritionDay.setSnacks(List.of("Nuts", "Fruit"));
        nutritionDay.setNotes("Swap items based on preference.");
        nutritionDay.setDayTargets(targets(2000, 110, 220, 60));
        nutritionDay.setMicronutrients(List.of("Iron-rich foods", "Calcium source", "Vitamin C fruit"));
        return nutritionDay;
    }

    private NutritionTargets targets(int calories, int protein, int carbs, int fats) {
        NutritionTargets targets = new NutritionTargets();
        targets.setCalories(calories);
        targets.setProteinGrams(protein);
        targets.setCarbsGrams(carbs);
        targets.setFatGrams(fats);
        return targets;
    }
}
