package com.fitness.activityservice.dto;

import com.fitness.activityservice.model.ActivityType;
import com.fitness.activityservice.model.RecommendationStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class ActivityResponse {
    private String id;
    private String userId;
    private String name;
    private String description;
    private ActivityType type;
    private Integer duration;
    private Integer caloriesBurned;
    private LocalDateTime startTime;
    private Map<String, Object> additionalMetrics;
    private RecommendationStatus recommendationStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
