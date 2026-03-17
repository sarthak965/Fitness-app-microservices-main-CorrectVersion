package com.fitness.aiservice.controller;

import com.fitness.aiservice.dto.CombinedPlanResponse;
import com.fitness.aiservice.dto.GenerateCombinedPlanRequest;
import com.fitness.aiservice.dto.GenerateNutritionPlanRequest;
import com.fitness.aiservice.dto.GeneratePlanRequest;
import com.fitness.aiservice.dto.UpdateNutritionPlanRequest;
import com.fitness.aiservice.model.NutritionPlan;
import com.fitness.aiservice.model.WorkoutPlan;
import com.fitness.aiservice.service.NutritionPlanService;
import com.fitness.aiservice.service.PlanExplanationService;
import com.fitness.aiservice.service.NutritionTemplateService;
import com.fitness.aiservice.service.PlanTemplateService;
import com.fitness.aiservice.service.WorkoutPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/plans")
public class WorkoutPlanController {
    private final WorkoutPlanService workoutPlanService;
    private final NutritionPlanService nutritionPlanService;
    private final NutritionTemplateService nutritionTemplateService;
    private final PlanTemplateService planTemplateService;
    private final PlanExplanationService planExplanationService;

    @PostMapping("/generate")
    public ResponseEntity<WorkoutPlan> generatePlan(
            @RequestHeader("X-User-ID") String userId,
            @RequestBody GeneratePlanRequest request
    ) {
        return ResponseEntity.ok(workoutPlanService.generatePlan(userId, request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WorkoutPlan>> getPlansByUser(@PathVariable String userId) {
        return ResponseEntity.ok(workoutPlanService.getPlansByUser(userId));
    }

    @GetMapping("/{planId}")
    public ResponseEntity<WorkoutPlan> getPlanById(@PathVariable String planId) {
        return ResponseEntity.ok(workoutPlanService.getPlanById(planId));
    }

    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable String planId) {
        workoutPlanService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{planId}/explain")
    public ResponseEntity<String> explainWorkoutPlan(@PathVariable String planId) {
        WorkoutPlan plan = workoutPlanService.getPlanById(planId);
        return ResponseEntity.ok(planExplanationService.explainWorkoutPlan(plan));
    }

    @PostMapping("/nutrition/generate")
    public ResponseEntity<NutritionPlan> generateNutritionPlan(
            @RequestHeader("X-User-ID") String userId,
            @RequestBody GenerateNutritionPlanRequest request
    ) {
        return ResponseEntity.ok(nutritionPlanService.generatePlan(userId, request));
    }

    @GetMapping("/nutrition/user/{userId}")
    public ResponseEntity<List<NutritionPlan>> getNutritionPlansByUser(@PathVariable String userId) {
        return ResponseEntity.ok(nutritionPlanService.getPlansByUser(userId));
    }

    @GetMapping("/nutrition/{planId}")
    public ResponseEntity<NutritionPlan> getNutritionPlanById(@PathVariable String planId) {
        return ResponseEntity.ok(nutritionPlanService.getPlanById(planId));
    }

    @DeleteMapping("/nutrition/{planId}")
    public ResponseEntity<Void> deleteNutritionPlan(@PathVariable String planId) {
        nutritionPlanService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/nutrition/{planId}/explain")
    public ResponseEntity<String> explainNutritionPlan(@PathVariable String planId) {
        NutritionPlan plan = nutritionPlanService.getPlanById(planId);
        return ResponseEntity.ok(planExplanationService.explainNutritionPlan(plan));
    }

    @GetMapping("/nutrition/templates")
    public ResponseEntity<List<NutritionPlan>> getNutritionTemplates() {
        return ResponseEntity.ok(nutritionTemplateService.getTemplates());
    }

    @PutMapping("/nutrition/{planId}")
    public ResponseEntity<NutritionPlan> updateNutritionPlan(
            @PathVariable String planId,
            @RequestBody UpdateNutritionPlanRequest request
    ) {
        return ResponseEntity.ok(nutritionPlanService.updatePlan(planId, request));
    }

    @PostMapping("/combined/generate")
    public ResponseEntity<CombinedPlanResponse> generateCombinedPlan(
            @RequestHeader("X-User-ID") String userId,
            @RequestBody GenerateCombinedPlanRequest request
    ) {
        WorkoutPlan workoutPlan = workoutPlanService.generatePlan(userId, request.getWorkout());
        NutritionPlan nutritionPlan = nutritionPlanService.generatePlan(userId, request.getNutrition());
        return ResponseEntity.ok(new CombinedPlanResponse(workoutPlan, nutritionPlan));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<WorkoutPlan>> getTemplates() {
        return ResponseEntity.ok(planTemplateService.getTemplates());
    }
}
