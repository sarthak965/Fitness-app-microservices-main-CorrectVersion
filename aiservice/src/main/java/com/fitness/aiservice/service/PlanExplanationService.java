package com.fitness.aiservice.service;

import com.fitness.aiservice.model.NutritionDay;
import com.fitness.aiservice.model.NutritionPlan;
import com.fitness.aiservice.model.WorkoutDay;
import com.fitness.aiservice.model.WorkoutPlan;
import com.fitness.aiservice.model.WorkoutWeek;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanExplanationService {
    private final GeminiService geminiService;

    public String explainWorkoutPlan(WorkoutPlan plan) {
        String prompt = buildWorkoutPrompt(plan);
        try {
            return geminiService.getAnswer(prompt);
        } catch (Exception ex) {
            log.warn("Falling back to default workout plan explanation for planId={}", plan.getId(), ex);
            return buildWorkoutFallback(plan);
        }
    }

    public String explainNutritionPlan(NutritionPlan plan) {
        String prompt = buildNutritionPrompt(plan);
        try {
            return geminiService.getAnswer(prompt);
        } catch (Exception ex) {
            log.warn("Falling back to default nutrition plan explanation for planId={}", plan.getId(), ex);
            return buildNutritionFallback(plan);
        }
    }

    private String buildWorkoutPrompt(WorkoutPlan plan) {
        return String.format("""
                You are a practical fitness coach. Explain this workout plan in simple terms.
                Keep it short: 4-6 sentences, plain text only. No markdown, no bullets.
                Focus on why the weekly structure and intensity make sense for the goal and recovery.

                Plan details:
                Title: %s
                Goal: %s
                Plan length: %s weeks
                Days per week: %s
                Schedule: %s
                Recovery rating: %s
                History notes: %s

                Week structure summary:
                %s
                """,
                safe(plan.getTitle()),
                safe(plan.getGoal()),
                safe(plan.getPlanLengthWeeks()),
                safe(plan.getDaysPerWeek()),
                safe(plan.getSchedule()),
                safe(plan.getRecoveryRating()),
                safe(plan.getHistoryNotes()),
                summarizeWeeks(plan)
        );
    }

    private String buildNutritionPrompt(NutritionPlan plan) {
        return String.format("""
                You are a practical sports nutrition coach. Explain this nutrition plan in simple terms.
                Keep it short: 4-6 sentences, plain text only. No markdown, no bullets.
                Explain how the plan matches the goal, budget, dietary preference, and protein target.

                Plan details:
                Title: %s
                Goal: %s
                Goal timeline: %s
                Dietary preference: %s
                Lactose intolerant: %s
                Meals per day: %s
                Weekly budget (INR): %s
                Protein goal (g/day): %s
                Activity level: %s
                Unhealthy foods liked: %s
                Healthy foods disliked: %s
                Daily targets: %s
                Sample day: %s
                """,
                safe(plan.getTitle()),
                safe(plan.getGoal()),
                safe(plan.getGoalTimeline()),
                safe(plan.getDietaryPreference()),
                safe(plan.getLactoseIntolerant()),
                safe(plan.getMealsPerDay()),
                safe(plan.getWeeklyBudget()),
                safe(plan.getProteinGoalGrams()),
                safe(plan.getActivityLevel()),
                safe(plan.getUnhealthyFoodsLiked()),
                safe(plan.getHealthyFoodsDisliked()),
                plan.getDailyTargets() != null
                        ? String.format("%s kcal, %s g protein, %s g carbs, %s g fats",
                        safe(plan.getDailyTargets().getCalories()),
                        safe(plan.getDailyTargets().getProteinGrams()),
                        safe(plan.getDailyTargets().getCarbsGrams()),
                        safe(plan.getDailyTargets().getFatGrams()))
                        : "Not provided",
                summarizeNutritionDay(plan)
        );
    }

    private String summarizeWeeks(WorkoutPlan plan) {
        if (plan.getWeeks() == null || plan.getWeeks().isEmpty()) {
            return "No weekly structure provided.";
        }

        return plan.getWeeks().stream()
                .limit(4)
                .map(week -> formatWeek(week))
                .collect(Collectors.joining("\n"));
    }

    private String formatWeek(WorkoutWeek week) {
        String daySummary = "No days listed.";
        if (week.getDays() != null && !week.getDays().isEmpty()) {
            daySummary = week.getDays().stream()
                    .limit(6)
                    .map(this::formatDay)
                    .collect(Collectors.joining(", "));
        }
        return "Week " + safe(week.getWeekNumber()) + " (" + safe(week.getTheme()) + "): " + daySummary;
    }

    private String formatDay(WorkoutDay day) {
        return safe(day.getDay()) + " " + safe(day.getFocus());
    }

    private String summarizeNutritionDay(NutritionPlan plan) {
        if (plan.getDays() == null || plan.getDays().isEmpty()) {
            return "No day meals provided.";
        }
        NutritionDay day = plan.getDays().get(0);
        if (day.getMeals() == null || day.getMeals().isEmpty()) {
            return "No meals listed.";
        }
        return day.getMeals().stream()
                .limit(3)
                .map(meal -> meal.getName() + ": " + String.join(", ", meal.getItems()))
                .collect(Collectors.joining(" | "));
    }

    private String buildWorkoutFallback(WorkoutPlan plan) {
        return String.format(
                "This plan targets %s over %s weeks with %s training days per week. " +
                        "The structure spreads effort across the week to balance progress and recovery. " +
                        "Weekly themes guide focus while keeping variety so you can improve without overloading. " +
                        "Use the schedule and recovery notes to keep intensity sustainable.",
                safe(plan.getGoal()),
                safe(plan.getPlanLengthWeeks()),
                safe(plan.getDaysPerWeek())
        );
    }

    private String buildNutritionFallback(NutritionPlan plan) {
        return String.format(
                "This nutrition plan supports %s while matching your dietary preference and budget. " +
                        "Meals are spaced across %s meals per day to keep energy steady and protein consistent. " +
                        "Daily targets guide portion sizes and keep the plan sustainable. " +
                        "It includes foods you enjoy while avoiding items you dislike.",
                safe(plan.getGoal()),
                safe(plan.getMealsPerDay())
        );
    }

    private String safe(Object value) {
        return value == null ? "Not provided" : value.toString();
    }
}
