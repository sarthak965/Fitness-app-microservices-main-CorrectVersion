package com.fitness.aiservice.repository;

import com.fitness.aiservice.model.WorkoutPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkoutPlanRepository extends MongoRepository<WorkoutPlan, String> {
    List<WorkoutPlan> findByUserIdOrderByCreatedAtDesc(String userId);
}
