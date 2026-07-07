package com.utsav.aiInterview.repository;

import com.utsav.aiInterview.model.JobRole;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * MongoDB repository for {@link JobRole}.
 */
@Repository
public interface JobRoleRepository extends MongoRepository<JobRole, String> {

    List<JobRole> findByActiveTrueOrderByDisplayOrderAscNameAsc();
}
