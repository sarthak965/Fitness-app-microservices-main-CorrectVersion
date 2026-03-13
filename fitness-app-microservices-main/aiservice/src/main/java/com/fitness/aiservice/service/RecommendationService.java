package com.fitness.aiservice.service;

import com.fitness.aiservice.dto.ChatResponse;
import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;
    private final GeminiService geminiService;
    private final ActivityContextService activityContextService;

    public List<Recommendation> getUserRecommendation(String userId) {
        return recommendationRepository.findByUserId(userId);
    }

    public Recommendation getActivityRecommendation(String activityId) {
        return recommendationRepository.findByActivityId(activityId)
                .orElseThrow(() -> new RuntimeException("No recommendation found for this activity: " + activityId));
    }

    public void deleteActivityRecommendation(String activityId) {
        recommendationRepository.deleteByActivityId(activityId);
    }

    public ChatResponse chat(String message, String activityId) {
        try {
            String prompt = buildPrompt(message, activityId);
            return new ChatResponse(geminiService.getAnswer(prompt));
        } catch (WebClientResponseException.TooManyRequests ex) {
            log.warn("Gemini rate limit hit for activityId={}", activityId);
            return new ChatResponse(buildRateLimitFallbackChatAnswer(activityId));
        } catch (Exception ex) {
            log.error("Falling back to canned chat response for activityId={}", activityId, ex);
            return new ChatResponse(buildFallbackChatAnswer(activityId));
        }
    }

    private String buildPrompt(String message, String activityId) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a practical fitness coach. Respond in plain text only. ");
        prompt.append("Do not use markdown, asterisks, or heading markers. ");
        prompt.append("Keep the response natural, useful, and directly actionable. ");
        prompt.append("Give a normal-sized answer with concrete observations from the activity context. ");
        prompt.append("Avoid generic filler, long theory, or overly long explanations.");

        if (activityId != null && !activityId.isBlank()) {
            try {
                Activity activity = activityContextService.getActivity(activityId);
                if (activity != null) {
                    prompt.append("\n\nActivity context:");
                    prompt.append("\nActivity ID: ").append(activity.getId());
                    prompt.append("\nActivity name: ").append(orFallback(activity.getName(), "Not named"));
                    prompt.append("\nActivity description: ").append(orFallback(activity.getDescription(), "No description provided"));
                    prompt.append("\nActivity type: ").append(orFallback(activity.getType(), "Unknown"));
                    prompt.append("\nStart time: ").append(activity.getStartTime());
                    prompt.append("\nDuration: ").append(activity.getDuration()).append(" minutes");
                    prompt.append("\nCalories burned: ").append(activity.getCaloriesBurned());
                    prompt.append("\nRecommendation status: ").append(orFallback(activity.getRecommendationStatus(), "Unknown"));
                    prompt.append("\nAdditional metrics: ").append(formatMetrics(activity.getAdditionalMetrics()));
                    prompt.append("\nUse this activity data as the main context for the answer.");
                }
            } catch (Exception ex) {
                log.warn("Unable to load activity context for chat activityId={}", activityId, ex);
            }
        }

        prompt.append("\n\nUser question: ").append(message);
        return prompt.toString();
    }

    private String formatMetrics(Map<String, Object> metrics) {
        if (metrics == null || metrics.isEmpty()) {
            return "None";
        }

        return metrics.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .collect(Collectors.joining(", "));
    }

    private String orFallback(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String buildFallbackChatAnswer(String activityId) {
        if (activityId != null && !activityId.isBlank()) {
            try {
                Activity activity = activityContextService.getActivity(activityId);
                if (activity != null) {
                    return String.format(
                            "What went well: you completed your %s session%s. What to improve: review your notes and recorded metrics for weak points. Next workout: keep the next session slightly easier if fatigue is still present. Recovery: prioritize sleep, hydration, mobility, and a proper warmup.",
                            orFallback(activity.getType(), "training"),
                            activity.getName() != null && !activity.getName().isBlank() ? " called " + activity.getName() : ""
                    );
                }
            } catch (Exception ex) {
                log.warn("Unable to build activity-aware fallback chat response for activityId={}", activityId, ex);
            }
        }

        return "What went well: your activity was recorded successfully. What to improve: review your latest notes and metrics for weak points. Next workout: choose easier, similar, or slightly harder based on recovery. Recovery: prioritize sleep, hydration, and mobility.";
    }

    private String buildRateLimitFallbackChatAnswer(String activityId) {
        if (activityId != null && !activityId.isBlank()) {
            try {
                Activity activity = activityContextService.getActivity(activityId);
                if (activity != null) {
                    return String.format(
                            "What went well: your %s session%s is logged. What to improve: review your description and recorded metrics for fatigue or form issues. Next workout: keep it controlled if soreness is still present. Recovery: prioritize sleep, hydration, mobility, and a proper warmup.",
                            orFallback(activity.getType(), "training"),
                            activity.getName() != null && !activity.getName().isBlank() ? " called " + activity.getName() : ""
                    );
                }
            } catch (Exception ex) {
                log.warn("Unable to build rate-limit fallback chat response for activityId={}", activityId, ex);
            }
        }

        return "What went well: your activity data is available. What to improve: review notes and metrics for weak points. Next workout: choose easier, similar, or slightly harder based on recovery. Recovery: prioritize sleep, hydration, and mobility.";
    }
}
