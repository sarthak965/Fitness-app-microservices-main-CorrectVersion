package com.fitness.aiservice.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.dto.GenerateNutritionPlanRequest;
import com.fitness.aiservice.model.NutritionDay;
import com.fitness.aiservice.model.NutritionMeal;
import com.fitness.aiservice.model.NutritionPlan;
import com.fitness.aiservice.model.NutritionTargets;
import com.fitness.aiservice.model.PlanSource;
import com.fitness.aiservice.repository.NutritionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NutritionPlanService {
    private final NutritionPlanRepository nutritionPlanRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public NutritionPlan generatePlan(String userId, GenerateNutritionPlanRequest request) {
        String prompt = buildPrompt(request);
        try {
            String rawText = geminiService.getAnswer(prompt);
            GeneratedNutritionPlan generatedPlan = parsePlan(rawText);
            if (generatedPlan.days() == null || generatedPlan.days().isEmpty()) {
                throw new IllegalStateException("Nutrition plan missing days");
            }
            NutritionPlan plan = mapToPlan(userId, request, generatedPlan);
            return nutritionPlanRepository.save(plan);
        } catch (Exception ex) {
            log.error("Failed to generate nutrition plan with AI, using fallback", ex);
            NutritionPlan fallback = defaultPlan(request);
            fallback.setUserId(userId);
            return nutritionPlanRepository.save(fallback);
        }
    }

    public List<NutritionPlan> getPlansByUser(String userId) {
        return nutritionPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public NutritionPlan getPlanById(String planId) {
        return nutritionPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Nutrition plan not found with id: " + planId));
    }

    public void deletePlan(String planId) {
        NutritionPlan plan = getPlanById(planId);
        nutritionPlanRepository.deleteById(plan.getId());
    }

    public NutritionPlan updatePlan(String planId, com.fitness.aiservice.dto.UpdateNutritionPlanRequest request) {
        NutritionPlan existing = getPlanById(planId);
        existing.setTitle(request.getTitle());
        existing.setGoal(request.getGoal());
        existing.setGoalTimeline(request.getGoalTimeline());
        existing.setDietaryPreference(request.getDietaryPreference());
        existing.setLactoseIntolerant(request.getLactoseIntolerant());
        existing.setCurrentWeight(request.getCurrentWeight());
        existing.setHeight(request.getHeight());
        existing.setProteinGoalGrams(request.getProteinGoalGrams());
        existing.setActivityLevel(request.getActivityLevel());
        existing.setUnhealthyFoodsLiked(request.getUnhealthyFoodsLiked());
        existing.setHealthyFoodsDisliked(request.getHealthyFoodsDisliked());
        existing.setWeeklyBudget(request.getWeeklyBudget());
        existing.setMealsPerDay(request.getMealsPerDay());
        existing.setCookingAbility(request.getCookingAbility());
        existing.setDailyTargets(request.getDailyTargets());
        existing.setDays(request.getDays());
        return nutritionPlanRepository.save(existing);
    }

    private NutritionPlan mapToPlan(String userId, GenerateNutritionPlanRequest request, GeneratedNutritionPlan generatedPlan) {
        return NutritionPlan.builder()
                .userId(userId)
                .title(generatedPlan.title() != null && !generatedPlan.title().isBlank()
                        ? generatedPlan.title()
                        : "Personalized Nutrition Plan")
                .goal(request.getGoal())
                .goalTimeline(formatGoalTimeline(request))
                .dietaryPreference(request.getDietaryPreference())
                .lactoseIntolerant(request.getLactoseIntolerant())
                .currentWeight(request.getCurrentWeight())
                .height(request.getHeight())
                .proteinGoalGrams(request.getProteinGoalGrams())
                .activityLevel(request.getActivityLevel())
                .unhealthyFoodsLiked(request.getUnhealthyFoodsLiked())
                .healthyFoodsDisliked(request.getHealthyFoodsDisliked())
                .weeklyBudget(request.getWeeklyBudget())
                .mealsPerDay(request.getMealsPerDay())
                .cookingAbility(request.getCookingAbility())
                .dailyTargets(generatedPlan.dailyTargets())
                .source(PlanSource.AI)
                .days(generatedPlan.days())
                .build();
    }

    private String buildPrompt(GenerateNutritionPlanRequest request) {
        return String.format("""
                You are a practical sports nutrition coach. Create a 7-day nutrition plan in the EXACT JSON format below.
                Return JSON only. Do not wrap in markdown or code fences.

                JSON format:
                {
                  "title": "Short plan title",
                  "dailyTargets": {
                    "calories": 2200,
                    "proteinGrams": 140,
                    "carbsGrams": 220,
                    "fatGrams": 70
                  },
                  "days": [
                    {
                      "day": "Mon",
                      "meals": [
                        {
                          "name": "Breakfast",
                          "items": ["Item 1", "Item 2"],
                          "proteinGrams": 30,
                          "calories": 450
                        }
                      ],
                      "snacks": ["Snack 1", "Snack 2"],
                      "notes": "Short note",
                      "dayTargets": {
                        "calories": 2100,
                        "proteinGrams": 130,
                        "carbsGrams": 210,
                        "fatGrams": 65
                      },
                      "micronutrients": ["Iron-rich foods", "Calcium source", "Vitamin C fruit"]
                    }
                  ]
                }

                Requirements:
                - Respect dietary preference and lactose intolerance
                - If vegetarian and lactose tolerant, include milk products for protein
                - Include unhealthy foods the user likes 1-2 times per week for sustainability
                - Avoid healthy foods the user dislikes
                - Keep meals simple and realistic based on cooking ability
                - Stay mindful of weekly budget (rupees)
                - Meals per day must match the user preference
                - Include dayTargets and micronutrients for each day

                User goal: %s
                Weight loss target and timeline: %s
                Dietary preference: %s
                Lactose intolerant: %s
                Current weight (kg): %s
                Height (cm): %s
                Protein goal (grams/day): %s
                Activity level: %s
                Unhealthy foods liked: %s
                Healthy foods disliked: %s
                Weekly budget (INR): %s
                Meals per day: %s
                Cooking ability: %s

                Make the plan specific, affordable, and sustainable.
                """,
                safe(request.getGoal()),
                formatGoalTimeline(request),
                safe(request.getDietaryPreference()),
                safe(request.getLactoseIntolerant()),
                safe(request.getCurrentWeight()),
                safe(request.getHeight()),
                safe(request.getProteinGoalGrams()),
                safe(request.getActivityLevel()),
                safe(request.getUnhealthyFoodsLiked()),
                safe(request.getHealthyFoodsDisliked()),
                safe(request.getWeeklyBudget()),
                safe(request.getMealsPerDay()),
                safe(request.getCookingAbility())
        );
    }

    private GeneratedNutritionPlan parsePlan(String rawText) {
        String sanitized = rawText
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();
        try {
            return objectMapper.readValue(sanitized, GeneratedNutritionPlan.class);
        } catch (Exception ex) {
            log.error("Failed to parse nutrition plan JSON from AI response: {}", rawText, ex);
            throw new RuntimeException("Invalid AI nutrition plan format", ex);
        }
    }

    private NutritionPlan defaultPlan(GenerateNutritionPlanRequest request) {
        NutritionTargets targets = new NutritionTargets();
        targets.setCalories(2000);
        targets.setProteinGrams(request.getProteinGoalGrams() != null ? request.getProteinGoalGrams() : 120);
        targets.setCarbsGrams(220);
        targets.setFatGrams(60);

        NutritionMeal breakfast = new NutritionMeal();
        breakfast.setName("Breakfast");
        breakfast.setItems(List.of("Oats", "Banana", "Protein source"));
        breakfast.setProteinGrams(25);
        breakfast.setCalories(450);

        NutritionDay day = new NutritionDay();
        day.setDay("Mon");
        day.setMeals(List.of(breakfast));
        day.setSnacks(List.of("Fruit", "Nuts"));
        day.setNotes("Use this as a starting template until AI plan is available.");
        day.setDayTargets(targets);
        day.setMicronutrients(List.of("Iron source", "Calcium source", "Vitamin C fruit"));

        return NutritionPlan.builder()
                .title("Nutrition Foundation")
                .goal(request.getGoal())
                .goalTimeline(formatGoalTimeline(request))
                .dietaryPreference(request.getDietaryPreference())
                .lactoseIntolerant(request.getLactoseIntolerant())
                .currentWeight(request.getCurrentWeight())
                .height(request.getHeight())
                .proteinGoalGrams(request.getProteinGoalGrams())
                .activityLevel(request.getActivityLevel())
                .unhealthyFoodsLiked(request.getUnhealthyFoodsLiked())
                .healthyFoodsDisliked(request.getHealthyFoodsDisliked())
                .weeklyBudget(request.getWeeklyBudget())
                .mealsPerDay(request.getMealsPerDay())
                .cookingAbility(request.getCookingAbility())
                .dailyTargets(targets)
                .source(PlanSource.TEMPLATE)
                .days(List.of(day))
                .build();
    }

    private String formatGoalTimeline(GenerateNutritionPlanRequest request) {
        if (request.getWeightLossTargetKg() != null && request.getWeightLossTimelineWeeks() != null) {
            return request.getWeightLossTargetKg() + " kg in " + request.getWeightLossTimelineWeeks() + " weeks";
        }
        return "Not specified";
    }

    private String safe(Object value) {
        return value == null ? "Not provided" : value.toString();
    }

    private record GeneratedNutritionPlan(String title, NutritionTargets dailyTargets, List<NutritionDay> days) {
    }
}
