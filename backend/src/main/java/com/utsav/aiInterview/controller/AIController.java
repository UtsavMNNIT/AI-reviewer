package com.utsav.aiInterview.controller;

import com.utsav.aiInterview.dto.AnalyzeResumeRequest;
import com.utsav.aiInterview.dto.ApiResponse;
import com.utsav.aiInterview.dto.ResumeAnalysis;
import com.utsav.aiInterview.service.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * AI endpoints (protected — require a valid JWT).
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/analyzeResume")
    public ResponseEntity<ApiResponse<ResumeAnalysis>> analyzeResume(
            @Valid @RequestBody AnalyzeResumeRequest request) {
        ResumeAnalysis analysis = aiService.analyzeResume(request.resumeText());
        return ResponseEntity.ok(new ApiResponse<>(true, "Resume analyzed", analysis));
    }
}
