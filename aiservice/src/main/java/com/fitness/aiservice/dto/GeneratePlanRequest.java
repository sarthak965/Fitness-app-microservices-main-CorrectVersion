package com.fitness.aiservice.dto;

import lombok.Data;

@Data
public class GeneratePlanRequest {
    private String goal;
    private Integer age;
    private Integer daysPerWeek;
    private Integer planLengthWeeks;
    private String schedule;
    private String historyNotes;
    private Integer recoveryRating;
    private String recoveryNotes;
}
