package com.fitness.aiservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@Slf4j
@RequiredArgsConstructor
public class ActivityStatusService {

    private final WebClient activityServiceWebClient;

    public void markReady(String activityId) {
        activityServiceWebClient.put()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/activities/{activityId}/status")
                        .queryParam("status", "READY")
                        .build(activityId))
                .retrieve()
                .toBodilessEntity()
                .block();

        log.info("Marked activity {} as READY", activityId);
    }

    public void markFailed(String activityId) {
        activityServiceWebClient.put()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/activities/{activityId}/status")
                        .queryParam("status", "FAILED")
                        .build(activityId))
                .retrieve()
                .toBodilessEntity()
                .block();

        log.info("Marked activity {} as FAILED", activityId);
    }
}
