package com.utsav.aiInterview.controller;

import com.utsav.aiInterview.dto.ApiResponse;
import com.utsav.aiInterview.dto.JobRoleResponse;
import com.utsav.aiInterview.service.JobRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Interview role catalog (protected — requires a valid JWT).
 * Roles are managed directly in the {@code job_roles} MongoDB collection.
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class JobRoleController {

    private final JobRoleService jobRoleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobRoleResponse>>> list() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Available roles", jobRoleService.listActive()));
    }
}
