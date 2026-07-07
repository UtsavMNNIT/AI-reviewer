package com.utsav.aiInterview.controller;

import com.utsav.aiInterview.dto.ApiResponse;
import com.utsav.aiInterview.dto.ResumeResponse;
import com.utsav.aiInterview.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Resume endpoints (protected — require a valid JWT).
 * Resumes are scoped to the authenticated user.
 */
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ResumeResponse>> upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        ResumeResponse resume = resumeService.upload(file, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Resume uploaded", resume));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeResponse>> getById(
            @PathVariable String id,
            Authentication authentication) {
        ResumeResponse resume = resumeService.getById(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Resume details", resume));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeResponse>>> getAll(Authentication authentication) {
        List<ResumeResponse> resumes = resumeService.listForUser(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "All resumes", resumes));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            Authentication authentication) {
        resumeService.delete(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Resume deleted", null));
    }
}
