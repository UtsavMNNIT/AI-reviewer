package com.utsav.aiInterview.controller;

import com.utsav.aiInterview.dto.ApiResponse;
import com.utsav.aiInterview.dto.CreateInterviewRequest;
import com.utsav.aiInterview.dto.InterviewResponse;
import com.utsav.aiInterview.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Interview endpoints (protected — require a valid JWT).
 * Interviews are scoped to the authenticated user.
 */
@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<InterviewResponse>> create(
            @Valid @RequestBody CreateInterviewRequest request,
            Authentication authentication) {
        InterviewResponse interview = interviewService.create(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Interview created", interview));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<InterviewResponse>>> getAll(Authentication authentication) {
        List<InterviewResponse> interviews = interviewService.listForUser(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "All interviews", interviews));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InterviewResponse>> getById(
            @PathVariable String id,
            Authentication authentication) {
        InterviewResponse interview = interviewService.getById(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Interview details", interview));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<ApiResponse<InterviewResponse>> start(
            @PathVariable String id,
            Authentication authentication) {
        InterviewResponse interview = interviewService.start(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Interview started", interview));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<InterviewResponse>> complete(
            @PathVariable String id,
            Authentication authentication) {
        InterviewResponse interview = interviewService.complete(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Interview completed", interview));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable String id,
            Authentication authentication) {
        interviewService.delete(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Interview deleted", null));
    }
}
