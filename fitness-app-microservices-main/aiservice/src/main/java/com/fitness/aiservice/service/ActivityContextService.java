package com.fitness.aiservice.service;

import com.fitness.aiservice.model.Activity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
@RequiredArgsConstructor
public class ActivityContextService {

    private final WebClient activityServiceWebClient;

    public Activity getActivity(String activityId) {
        return activityServiceWebClient.get()
                .uri("/api/activities/{activityId}", activityId)
                .retrieve()
                .bodyToMono(Activity.class)
                .block();
    }
}
