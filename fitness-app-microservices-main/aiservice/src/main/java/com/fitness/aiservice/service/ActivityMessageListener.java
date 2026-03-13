package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Activity;
import com.fitness.aiservice.model.Recommendation;
import com.fitness.aiservice.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityMessageListener {

    private final ActivityAIService aiService;
    private final RecommendationRepository recommendationRepository;
    private final ActivityStatusService activityStatusService;

    @RabbitListener(queues = "activity.queue")
    public void processActivity(Activity activity) {
        log.info("Received activity for processing: {}", activity.getId());
        if (recommendationRepository.findByActivityId(activity.getId()).isPresent()) {
            log.info("Recommendation already exists for activity {}, skipping duplicate message", activity.getId());
            activityStatusService.markReady(activity.getId());
            return;
        }
        try {
            Recommendation recommendation = aiService.generateRecommendation(activity);
            recommendationRepository.save(recommendation);
            activityStatusService.markReady(activity.getId());
        } catch (Exception ex) {
            log.error("Failed to generate recommendation for activity {}", activity.getId(), ex);
            activityStatusService.markFailed(activity.getId());
        }
    }
}
