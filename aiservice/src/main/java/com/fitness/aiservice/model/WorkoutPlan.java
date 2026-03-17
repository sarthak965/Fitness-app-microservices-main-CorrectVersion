package com.fitness.aiservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "workout_plans")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkoutPlan {
    @Id
    private String id;
    private String userId;
    private String title;
    private String goal;
    private Integer age;
    private Integer daysPerWeek;
    private Integer planLengthWeeks;
    private String schedule;
    private String historyNotes;
    private String historySummary;
    private Integer recoveryRating;
    private String recoveryNotes;
    private PlanSource source;
    private List<WorkoutWeek> weeks;

    @CreatedDate
    private LocalDateTime createdAt;
}
