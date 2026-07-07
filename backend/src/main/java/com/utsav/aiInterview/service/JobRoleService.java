package com.utsav.aiInterview.service;

import com.utsav.aiInterview.dto.JobRoleResponse;
import com.utsav.aiInterview.repository.JobRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Serves the catalog of selectable interview roles. The catalog lives entirely
 * in MongoDB ({@code job_roles}); this service just reads the active entries.
 */
@Service
@RequiredArgsConstructor
public class JobRoleService {

    private final JobRoleRepository jobRoleRepository;

    /** Active roles, ordered for display. */
    public List<JobRoleResponse> listActive() {
        return jobRoleRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc().stream()
                .map(role -> new JobRoleResponse(role.getId(), role.getName()))
                .toList();
    }
}
