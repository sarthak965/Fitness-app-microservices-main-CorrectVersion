package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Activity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityHistoryService {
    private final ActivityContextService activityContextService;

    public ActivityHistorySummary summarize(String userId) {
        try {
            List<Activity> activities = activityContextService.getUserActivities(userId);
            if (activities == null || activities.isEmpty()) {
                return ActivityHistorySummary.empty();
            }

            List<Activity> recent = activities.stream()
                    .sorted(Comparator.comparing(Activity::getStartTime, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    .limit(30)
                    .toList();

            int totalSessions = recent.size();
            int totalDuration = recent.stream()
                    .map(Activity::getDuration)
                    .filter(duration -> duration != null && duration > 0)
                    .mapToInt(Integer::intValue)
                    .sum();
            double avgDuration = totalSessions == 0 ? 0 : (double) totalDuration / totalSessions;

            int totalCalories = recent.stream()
                    .map(Activity::getCaloriesBurned)
                    .filter(calories -> calories != null && calories > 0)
                    .mapToInt(Integer::intValue)
                    .sum();
            double avgCalories = totalSessions == 0 ? 0 : (double) totalCalories / totalSessions;

            Map<String, Long> typeCounts = recent.stream()
                    .map(Activity::getType)
                    .filter(type -> type != null && !type.isBlank())
                    .collect(Collectors.groupingBy(type -> type, Collectors.counting()));

            List<String> topTypes = typeCounts.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                    .limit(3)
                    .map(entry -> entry.getKey() + " (" + entry.getValue() + ")")
                    .toList();

            Optional<LocalDateTime> latest = recent.stream()
                    .map(Activity::getStartTime)
                    .filter(time -> time != null)
                    .max(Comparator.naturalOrder());

            Optional<LocalDateTime> earliest = recent.stream()
                    .map(Activity::getStartTime)
                    .filter(time -> time != null)
                    .min(Comparator.naturalOrder());

            String summary = buildSummary(totalSessions, totalDuration, avgDuration, avgCalories, topTypes, earliest, latest);
            return new ActivityHistorySummary(summary, totalSessions);
        } catch (Exception ex) {
            log.warn("Failed to summarize activity history for userId={}", userId, ex);
            return ActivityHistorySummary.empty();
        }
    }

    private String buildSummary(
            int totalSessions,
            int totalDuration,
            double avgDuration,
            double avgCalories,
            List<String> topTypes,
            Optional<LocalDateTime> earliest,
            Optional<LocalDateTime> latest
    ) {
        StringBuilder summary = new StringBuilder();
        summary.append("Recent activity history summary: ");
        summary.append(totalSessions).append(" sessions logged. ");

        if (!topTypes.isEmpty()) {
            summary.append("Top activity types: ").append(String.join(", ", topTypes)).append(". ");
        }

        if (totalDuration > 0) {
            summary.append("Total duration ").append(totalDuration).append(" min");
            if (avgDuration > 0) {
                summary.append(", avg ").append(Math.round(avgDuration)).append(" min/session");
            }
            summary.append(". ");
        }

        if (avgCalories > 0) {
            summary.append("Average calories burned ").append(Math.round(avgCalories)).append(". ");
        }

        earliest.ifPresent(value -> summary.append("Earliest session on ").append(value).append(". "));
        latest.ifPresent(value -> summary.append("Most recent session on ").append(value).append(". "));

        summary.append("Use this as trend context, not a full log.");
        return summary.toString();
    }

    public record ActivityHistorySummary(String summary, int sessionCount) {
        public static ActivityHistorySummary empty() {
            return new ActivityHistorySummary("No tracked activities yet.", 0);
        }
    }
}
