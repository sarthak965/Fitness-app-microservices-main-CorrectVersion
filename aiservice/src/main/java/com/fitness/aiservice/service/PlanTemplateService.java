package com.fitness.aiservice.service;

import com.fitness.aiservice.model.PlanSource;
import com.fitness.aiservice.model.WorkoutDay;
import com.fitness.aiservice.model.WorkoutPlan;
import com.fitness.aiservice.model.WorkoutWeek;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanTemplateService {

    public List<WorkoutPlan> getTemplates() {
        return List.of(
                buildStrengthFoundation(),
                buildEnduranceBase(),
                buildMobilityReset()
        );
    }

    public WorkoutPlan pickFallbackTemplate(String goal) {
        if (goal != null) {
            String normalized = goal.toLowerCase();
            if (normalized.contains("strength") || normalized.contains("muscle")) {
                return buildStrengthFoundation();
            }
            if (normalized.contains("run") || normalized.contains("endurance") || normalized.contains("cardio")) {
                return buildEnduranceBase();
            }
        }
        return buildMobilityReset();
    }

    private WorkoutPlan buildStrengthFoundation() {
        return WorkoutPlan.builder()
                .title("Strength Foundation (4 weeks)")
                .goal("Build full-body strength with progressive volume.")
                .planLengthWeeks(4)
                .daysPerWeek(4)
                .schedule("4 sessions per week")
                .source(PlanSource.TEMPLATE)
                .weeks(List.of(
                        week(1, "Technique + base volume", List.of(
                                day("Mon", "Lower body", "Squat focus + posterior chain", 55, "Moderate", "Keep RPE 6-7"),
                                day("Wed", "Upper body", "Press + pull balance", 50, "Moderate", "Leave 2 reps in reserve"),
                                day("Fri", "Lower body", "Hinge focus + core", 50, "Moderate", "Controlled tempo"),
                                day("Sat", "Accessory", "Unilateral + mobility", 40, "Easy", "Quality reps")
                        )),
                        week(2, "Volume build", List.of(
                                day("Mon", "Lower body", "Add 1 set to main lifts", 60, "Moderate", "Track load"),
                                day("Wed", "Upper body", "Add 1 set to rows and presses", 55, "Moderate", "Keep form clean"),
                                day("Fri", "Lower body", "Split squat emphasis", 55, "Moderate", "Smooth reps"),
                                day("Sat", "Accessory", "Core + conditioning circuit", 40, "Easy", "Keep it sustainable")
                        )),
                        week(3, "Intensity focus", List.of(
                                day("Mon", "Lower body", "Slightly heavier sets", 60, "Hard", "RPE 7-8"),
                                day("Wed", "Upper body", "Heavier press + pull", 55, "Hard", "Full range"),
                                day("Fri", "Lower body", "Deadlift emphasis", 55, "Hard", "Perfect setup"),
                                day("Sat", "Accessory", "Mobility + light core", 35, "Easy", "Recovery day")
                        )),
                        week(4, "Deload + consolidate", List.of(
                                day("Mon", "Lower body", "Reduce volume by 30%", 45, "Easy", "Reset form"),
                                day("Wed", "Upper body", "Reduce volume by 30%", 45, "Easy", "Controlled pace"),
                                day("Fri", "Lower body", "Technique + mobility", 40, "Easy", "Focus on movement quality")
                        ))
                ))
                .build();
    }

    private WorkoutPlan buildEnduranceBase() {
        return WorkoutPlan.builder()
                .title("Endurance Base (4 weeks)")
                .goal("Build aerobic capacity with steady progress.")
                .planLengthWeeks(4)
                .daysPerWeek(4)
                .schedule("3 easy sessions + 1 quality session per week")
                .source(PlanSource.TEMPLATE)
                .weeks(List.of(
                        week(1, "Establish baseline", List.of(
                                day("Mon", "Easy cardio", "Zone 2 session", 35, "Easy", "Nasal breathing if possible"),
                                day("Wed", "Technique", "Form drills + short strides", 30, "Easy", "Stay relaxed"),
                                day("Fri", "Steady", "Moderate steady-state", 40, "Moderate", "Comfortable pace"),
                                day("Sun", "Long", "Long easy session", 50, "Easy", "Keep it conversational")
                        )),
                        week(2, "Build volume", List.of(
                                day("Mon", "Easy cardio", "Zone 2 session", 40, "Easy", "Smooth pacing"),
                                day("Wed", "Tempo", "Short tempo intervals", 35, "Moderate", "RPE 6-7"),
                                day("Fri", "Steady", "Moderate steady-state", 45, "Moderate", "Even splits"),
                                day("Sun", "Long", "Long easy session", 55, "Easy", "Stay controlled")
                        )),
                        week(3, "Add quality", List.of(
                                day("Mon", "Easy cardio", "Zone 2 session", 40, "Easy", "Relax shoulders"),
                                day("Wed", "Intervals", "4 x 4 minute efforts", 40, "Hard", "Full recovery"),
                                day("Fri", "Steady", "Moderate steady-state", 45, "Moderate", "Consistent pace"),
                                day("Sun", "Long", "Long easy session", 60, "Easy", "Focus on endurance")
                        )),
                        week(4, "Consolidate", List.of(
                                day("Mon", "Easy cardio", "Zone 2 session", 30, "Easy", "Short and smooth"),
                                day("Wed", "Technique", "Form drills + strides", 30, "Easy", "Light day"),
                                day("Sun", "Long", "Long easy session", 45, "Easy", "Finish strong")
                        ))
                ))
                .build();
    }

    private WorkoutPlan buildMobilityReset() {
        return WorkoutPlan.builder()
                .title("Mobility Reset (3 weeks)")
                .goal("Improve flexibility, joint control, and recovery.")
                .planLengthWeeks(3)
                .daysPerWeek(3)
                .schedule("3 sessions per week")
                .source(PlanSource.TEMPLATE)
                .weeks(List.of(
                        week(1, "Reset", List.of(
                                day("Mon", "Mobility", "Hip + ankle flow", 30, "Easy", "Slow breathing"),
                                day("Wed", "Stability", "Core + shoulder stability", 35, "Easy", "Control the range"),
                                day("Fri", "Mobility", "Spine + hamstring flow", 30, "Easy", "No pain")
                        )),
                        week(2, "Build", List.of(
                                day("Mon", "Mobility", "Hip opener + glute activation", 35, "Easy", "Add light holds"),
                                day("Wed", "Stability", "Core circuit + balance", 35, "Easy", "Smooth movement"),
                                day("Fri", "Mobility", "Thoracic + ankle focus", 30, "Easy", "Gentle range")
                        )),
                        week(3, "Integrate", List.of(
                                day("Mon", "Mobility", "Full-body flow", 35, "Easy", "Keep it fluid"),
                                day("Wed", "Stability", "Core + posture reset", 30, "Easy", "Alignment first"),
                                day("Fri", "Recovery", "Light stretch + breath", 25, "Easy", "Finish refreshed")
                        ))
                ))
                .build();
    }

    private WorkoutWeek week(int weekNumber, String theme, List<WorkoutDay> days) {
        WorkoutWeek week = new WorkoutWeek();
        week.setWeekNumber(weekNumber);
        week.setTheme(theme);
        week.setDays(days);
        return week;
    }

    private WorkoutDay day(String day, String focus, String session, int duration, String intensity, String notes) {
        WorkoutDay workoutDay = new WorkoutDay();
        workoutDay.setDay(day);
        workoutDay.setFocus(focus);
        workoutDay.setSession(session);
        workoutDay.setDurationMinutes(duration);
        workoutDay.setIntensity(intensity);
        workoutDay.setNotes(notes);
        return workoutDay;
    }
}
