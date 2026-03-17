package com.fitness.activityservice.service;

import com.fitness.activityservice.ActivityRepository;
import com.fitness.activityservice.dto.ActivityRequest;
import com.fitness.activityservice.dto.ActivityResponse;
import com.fitness.activityservice.model.Activity;
import com.fitness.activityservice.model.RecommendationStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final UserValidationService userValidationService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.name}")
    private String exchange;

    @Value("${rabbitmq.routing.key}")
    private String routingKey;

    public ActivityResponse trackActivity(ActivityRequest request) {

        boolean isValidUser = userValidationService.validateUser(request.getUserId());
        if (!isValidUser) {
            throw new RuntimeException("Invalid User: " + request.getUserId());
        }

        Integer caloriesBurned = request.getCaloriesBurned() != null ? request.getCaloriesBurned() : 0;

        Activity activity = Activity.builder()
                .userId(request.getUserId())
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .duration(request.getDuration())
                .caloriesBurned(caloriesBurned)
                .startTime(request.getStartTime())
                .additionalMetrics(request.getAdditionalMetrics())
                .recommendationStatus(RecommendationStatus.PENDING)
                .build();

        Activity savedActivity = activityRepository.save(activity);

        // Publish to RabbitMQ for AI Processing
        try {
            rabbitTemplate.convertAndSend(exchange, routingKey, savedActivity);
        } catch(Exception e) {
            savedActivity.setRecommendationStatus(RecommendationStatus.FAILED);
            activityRepository.save(savedActivity);
            log.error("Failed to publish activity to RabbitMQ : ", e);
        }

        return mapToResponse(savedActivity);
    }

    private ActivityResponse mapToResponse(Activity activity){
        ActivityResponse response = new ActivityResponse();
        response.setId(activity.getId());
        response.setUserId(activity.getUserId());
        response.setName(activity.getName());
        response.setDescription(activity.getDescription());
        response.setType(activity.getType());
        response.setDuration(activity.getDuration());
        response.setCaloriesBurned(activity.getCaloriesBurned());
        response.setStartTime(activity.getStartTime());
        response.setAdditionalMetrics(activity.getAdditionalMetrics());
        response.setRecommendationStatus(activity.getRecommendationStatus());
        response.setCreatedAt(activity.getCreatedAt());
        response.setUpdatedAt(activity.getUpdatedAt());
        return response;
    }

    public List<ActivityResponse> getUserActivities(String userId) {
        List<Activity> activities = activityRepository.findByUserId(userId);
        return activities.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ActivityResponse getActivityById(String activityId) {
        return activityRepository.findById(activityId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
    }

    public ActivityResponse updateRecommendationStatus(String activityId, RecommendationStatus status) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));

        activity.setRecommendationStatus(status);
        Activity updatedActivity = activityRepository.save(activity);
        log.info("Updated recommendation status for activity {} to {}", activityId, status);
        return mapToResponse(updatedActivity);
    }

    public void deleteActivity(String activityId) {
        if (!activityRepository.existsById(activityId)) {
            throw new RuntimeException("Activity not found with id: " + activityId);
        }
        activityRepository.deleteById(activityId);
        log.info("Deleted activity {}", activityId);
    }
}
