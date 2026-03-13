package com.fitness.activityservice.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ActivityType {
    RUNNING,
    WALKING,
    CYCLING,
    SWIMMING,
    WEIGHT_TRAINING,
    YOGA,
    HIIT,
    CARDIO,
    STRETCHING,
    OTHER;

    @JsonCreator
    public static ActivityType fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String normalized = value.trim()
                .toUpperCase()
                .replace('-', '_')
                .replace(' ', '_');

        if ("STRENGTH".equals(normalized)) {
            return WEIGHT_TRAINING;
        }

        return ActivityType.valueOf(normalized);
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}
