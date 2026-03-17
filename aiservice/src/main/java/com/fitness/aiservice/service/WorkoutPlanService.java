package com.fitness.aiservice.service;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.dto.GeneratePlanRequest;
import com.fitness.aiservice.model.PlanSource;
import com.fitness.aiservice.model.WorkoutPlan;
import com.fitness.aiservice.model.WorkoutWeek;
import com.fitness.aiservice.repository.WorkoutPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkoutPlanService {
    private final WorkoutPlanRepository workoutPlanRepository;
    private final GeminiService geminiService;
    private final ActivityHistoryService activityHistoryService;
    private final PlanTemplateService planTemplateService;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public WorkoutPlan generatePlan(String userId, GeneratePlanRequest request) {
        ActivityHistoryService.ActivityHistorySummary summary = activityHistoryService.summarize(userId);
        String prompt = buildPrompt(request, summary.summary());

        try {
            String rawText = geminiService.getAnswer(prompt);
            GeneratedPlan generatedPlan = parsePlan(rawText);
            if (generatedPlan.weeks() == null || generatedPlan.weeks().isEmpty()) {
                throw new IllegalStateException("AI plan did not include weeks");
            }
            WorkoutPlan workoutPlan = mapToWorkoutPlan(userId, request, summary.summary(), generatedPlan);
            return workoutPlanRepository.save(workoutPlan);
        } catch (Exception ex) {
            log.error("Failed to generate plan with AI, using template fallback", ex);
            WorkoutPlan fallback = planTemplateService.pickFallbackTemplate(request.getGoal());
            WorkoutPlan plan = mapToWorkoutPlan(userId, request, summary.summary(), new GeneratedPlan(fallback.getTitle(), fallback.getWeeks()));
            plan.setSource(PlanSource.TEMPLATE);
            return workoutPlanRepository.save(plan);
        }
    }

    public List<WorkoutPlan> getPlansByUser(String userId) {
        return workoutPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public WorkoutPlan getPlanById(String planId) {
        return workoutPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found with id: " + planId));
    }

    public void deletePlan(String planId) {
        WorkoutPlan plan = getPlanById(planId);
        workoutPlanRepository.deleteById(plan.getId());
    }

    private WorkoutPlan mapToWorkoutPlan(String userId, GeneratePlanRequest request, String historySummary, GeneratedPlan generatedPlan) {
        return WorkoutPlan.builder()
                .userId(userId)
                .title(generatedPlan.title() != null && !generatedPlan.title().isBlank() ? generatedPlan.title() : "Personalized Plan")
                .goal(request.getGoal())
                .age(request.getAge())
                .daysPerWeek(request.getDaysPerWeek())
                .planLengthWeeks(request.getPlanLengthWeeks())
                .schedule(request.getSchedule())
                .historyNotes(request.getHistoryNotes())
                .historySummary(historySummary)
                .recoveryRating(request.getRecoveryRating())
                .recoveryNotes(request.getRecoveryNotes())
                .source(PlanSource.AI)
                .weeks(generatedPlan.weeks())
                .build();
    }

    private String buildPrompt(GeneratePlanRequest request, String historySummary) {
        int planWeeks = request.getPlanLengthWeeks() != null && request.getPlanLengthWeeks() > 0
                ? request.getPlanLengthWeeks()
                : 4;
        int daysPerWeek = request.getDaysPerWeek() != null && request.getDaysPerWeek() > 0
                ? request.getDaysPerWeek()
                : 4;

        return String.format("""
                You are a practical fitness coach. Generate a personalized multi-week plan in the EXACT JSON format below.
                Return JSON only. Do not wrap in markdown or code fences.

                JSON format:
                {
                  "title": "Short plan title",
                  "weeks": [
                    {
                      "weekNumber": 1,
                      "theme": "Weekly focus",
                      "days": [
                        {
                          "day": "Mon",
                          "focus": "Short focus area",
                          "session": "Session details in 1-2 sentences",
                          "durationMinutes": 45,
                          "intensity": "Easy/Moderate/Hard",
                          "notes": "Short coaching cue"
                        }
                      ]
                    }
                  ]
                }

                Constraints:
                - Plan length: %d weeks
                - Training days per week: %d
                - Include at least one rest or recovery day per week
                - Use schedule and recovery information to set intensity and rest days
                - Keep sessions safe, realistic, and actionable

                User goal: %s
                Age: %s
                Schedule/availability: %s
                Self-reported recovery rating (1-5): %s
                Recovery notes: %s
                User-provided history notes: %s
                Activity history summary: %s

                Make the plan specific and progressive but sustainable.
                """,
                planWeeks,
                daysPerWeek,
                safe(request.getGoal()),
                safe(request.getAge()),
                safe(request.getSchedule()),
                safe(request.getRecoveryRating()),
                safe(request.getRecoveryNotes()),
                safe(request.getHistoryNotes()),
                safe(historySummary)
        );
    }

    private GeneratedPlan parsePlan(String rawText) {
        String sanitized = rawText
                .replaceAll("```json", "")
                .replaceAll("```", "")
                .trim();
        try {
            return objectMapper.readValue(sanitized, GeneratedPlan.class);
        } catch (Exception ex) {
            log.error("Failed to parse plan JSON from AI response: {}", rawText, ex);
            throw new RuntimeException("Invalid AI plan format", ex);
        }
    }

    private String safe(Object value) {
        return value == null ? "Not provided" : value.toString();
    }

    private record GeneratedPlan(String title, List<WorkoutWeek> weeks) {
    }
}
