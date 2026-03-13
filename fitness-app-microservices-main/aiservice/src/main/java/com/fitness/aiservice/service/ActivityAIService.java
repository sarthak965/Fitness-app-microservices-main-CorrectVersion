package com.fitness.aiservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityAIService {
    private final GeminiService geminiService;

    public Recommendation generateRecommendation(Activity activity) {
        try {
            String prompt = createPromptForActivity(activity);
            String aiResponse = geminiService.getRawResponse(prompt);
            return processAiResponse(activity, aiResponse);
        } catch (Exception ex) {
            log.error("Falling back to default recommendation for activity {}", activity.getId(), ex);
            return createDefaultRecommendation(activity);
        }
    }

    private Recommendation processAiResponse(Activity activity, String aiResponse) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(aiResponse);

            JsonNode textNode = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");

            String jsonContent = textNode.asText()
                    .replaceAll("```json\\n","")
                    .replaceAll("\\n```", "")
                    .trim();

//            log.info("PARSED RESPONSE FROM AI: {} ", jsonContent);

            JsonNode analysisJson = mapper.readTree(jsonContent);
            JsonNode analysisNode = analysisJson.path("analysis");
            
            StringBuilder fullAnalysis = new StringBuilder();
            addAnalysisSection(fullAnalysis, analysisNode, "overall", "Overall:");
            addAnalysisSection(fullAnalysis, analysisNode, "performance", "Performance:");
            addAnalysisSection(fullAnalysis, analysisNode, "recovery", "Recovery:");
            addAnalysisSection(fullAnalysis, analysisNode, "nextFocus", "Next focus:");

            if (fullAnalysis.length() == 0) {
                addAnalysisSection(fullAnalysis, analysisNode, "pace", "Pace:");
                addAnalysisSection(fullAnalysis, analysisNode, "heartRate", "Heart Rate:");
                addAnalysisSection(fullAnalysis, analysisNode, "caloriesBurned", "Calories:");
            }

            List<String> improvements = extractImprovements(analysisJson.path("improvements"));
            List<String> suggestions = extractSuggestions(analysisJson.path("suggestions"));
            List<String> safety = extractSafetyGuidelines(analysisJson.path("safety"));

            return Recommendation.builder()
                    .activityId(activity.getId())
                    .userId(activity.getUserId())
                    .activityType(activity.getType())
                    .recommendation(fullAnalysis.toString().trim())
                    .improvements(improvements)
                    .suggestions(suggestions)
                    .safety(safety)
                    .createdAt(LocalDateTime.now())
                    .build();
            
        } catch (Exception e) {
            log.error("Failed to parse AI response for activity {}", activity.getId(), e);
            return createDefaultRecommendation(activity);
        }
    }

    private Recommendation createDefaultRecommendation(Activity activity) {
        return Recommendation.builder()
                .activityId(activity.getId())
                .userId(activity.getUserId())
                .activityType(activity.getType())
                .recommendation("""
                        Overall: Detailed AI analysis is temporarily unavailable, but your activity has been recorded successfully.

                        Performance: Use your duration, notes, and metrics to judge whether execution felt strong, controlled, and repeatable.

                        Recovery: Keep the next session lighter if soreness, fatigue, or poor sleep is still present.

                        Next focus: Progress only one variable next time, such as intensity, volume, or technique quality.
                        """.trim())
                .improvements(Collections.singletonList("Use your notes, duration, and metrics to compare effort and recovery before the next session"))
                .suggestions(Collections.singletonList("Repeat this activity with a moderate progression only if recovery feels good"))
                .safety(Arrays.asList(
                        "Always warm up before exercise",
                        "Stay hydrated",
                        "Listen to your body"
                ))
                .createdAt(LocalDateTime.now())
                .build();
    }

    private List<String> extractSafetyGuidelines(JsonNode safetyNode) {
        List<String> safety = new ArrayList<>();
        if (safetyNode.isArray()) {
            safetyNode.forEach(item -> safety.add(item.asText()));
        }
        return safety.isEmpty() ?
                Collections.singletonList("Follow general safety guidelines") :
                safety;
    }

    private List<String> extractSuggestions(JsonNode suggestionsNode) {
        List<String> suggestions = new ArrayList<>();
        if (suggestionsNode.isArray()) {
            suggestionsNode.forEach(suggestion -> {
                String workout = suggestion.path("workout").asText();
                String description = suggestion.path("description").asText();
                suggestions.add(String.format("%s: %s", workout, description));
            });
        }
        return suggestions.isEmpty() ?
                Collections.singletonList("No specific suggestions provided") :
                suggestions;
    }

    private List<String> extractImprovements(JsonNode improvementsNode) {
        List<String> improvements = new ArrayList<>();
        if (improvementsNode.isArray()) {
            improvementsNode.forEach(improvement -> {
                String area = improvement.path("area").asText();
                String detail = improvement.path("recommendation").asText();
                improvements.add(String.format("%s: %s", area, detail));
            });
        }
        return improvements.isEmpty() ?
                Collections.singletonList("No specific improvements provided") :
                improvements;
    }

    private void addAnalysisSection(StringBuilder fullAnalysis, JsonNode analysisNode, String key, String prefix) {
        if (!analysisNode.path(key).isMissingNode()) {
            fullAnalysis.append(prefix)
                    .append(analysisNode.path(key).asText())
                    .append("\n\n");
        }
    }

    private String createPromptForActivity(Activity activity) {
        return String.format("""
        Analyze this fitness activity and provide valuable, practical recommendations in the following EXACT JSON format:
        {
          "analysis": {
            "overall": "2 to 3 sentences with specific observations",
            "performance": "2 to 3 sentences with specific observations",
            "recovery": "2 to 3 sentences with specific observations",
            "nextFocus": "2 to 3 sentences with specific observations"
          },
          "improvements": [
            {
              "area": "Short area name",
              "recommendation": "Actionable recommendation with useful detail"
            }
          ],
          "suggestions": [
            {
              "workout": "Workout name",
              "description": "Actionable description with useful detail"
            }
          ],
          "safety": [
            "Useful safety point 1",
            "Useful safety point 2"
          ]
        }

        Analyze this activity:
        Activity Type: %s
        Duration: %d minutes
        Calories Burned: %s
        Description: %s
        Additional Metrics: %s
        
        Keep every field valuable and practical. Avoid generic filler and broad theory.
        For yoga, strength, stretching, or other non-cardio sessions, do not force pace or heart-rate analysis.
        Use the description and additional metrics when available.
        Focus on performance, technique, recovery, improvements, next workout suggestions, and safety guidelines.
        Ensure the response follows the EXACT JSON format shown above.
        """,
                activity.getType(),
                activity.getDuration(),
                formatValue(activity.getCaloriesBurned(), "Not provided"),
                formatValue(activity.getDescription(), "Not provided"),
                formatValue(activity.getAdditionalMetrics(), "None")
        );
    }

    private String formatValue(Object value, String fallback) {
        return value == null ? fallback : value.toString();
    }
}
