package com.utsav.aiInterview.repository;

import com.utsav.aiInterview.model.Resume;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * MongoDB repository for {@link Resume}.
 */
@Repository
public interface ResumeRepository extends MongoRepository<Resume, String> {

    List<Resume> findByUserEmail(String userEmail);

    Optional<Resume> findByIdAndUserEmail(String id, String userEmail);
}
