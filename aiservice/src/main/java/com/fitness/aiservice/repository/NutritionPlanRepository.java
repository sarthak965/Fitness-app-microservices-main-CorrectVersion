package com.fitness.aiservice.repository;

import com.fitness.aiservice.model.NutritionPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NutritionPlanRepository extends MongoRepository<NutritionPlan, String> {
    List<NutritionPlan> findByUserIdOrderByCreatedAtDesc(String userId);
}
