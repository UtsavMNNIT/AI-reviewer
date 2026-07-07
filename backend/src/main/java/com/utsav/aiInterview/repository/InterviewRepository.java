package com.utsav.aiInterview.repository;

import com.utsav.aiInterview.model.Interview;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MongoDB repository for {@link Interview}.
 */
@Repository
public interface InterviewRepository extends MongoRepository<Interview, String> {

    List<Interview> findByUserEmail(String userEmail);

    Optional<Interview> findByIdAndUserEmail(String id, String userEmail);
}
