package com.fitness.aiservice.model;

import lombok.Data;

@Data
public class WorkoutDay {
    private String day;
    private String focus;
    private String session;
    private Integer durationMinutes;
    private String intensity;
    private String notes;
}
