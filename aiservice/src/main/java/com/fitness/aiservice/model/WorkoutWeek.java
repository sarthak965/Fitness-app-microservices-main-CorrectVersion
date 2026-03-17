package com.fitness.aiservice.model;

import lombok.Data;

import java.util.List;

@Data
public class WorkoutWeek {
    private Integer weekNumber;
    private String theme;
    private List<WorkoutDay> days;
}
