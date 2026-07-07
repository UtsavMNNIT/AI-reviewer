package com.utsav.aiInterview.controller;

import com.utsav.aiInterview.dto.AnalyzeResumeRequest;
import com.utsav.aiInterview.dto.ApiResponse;
import com.utsav.aiInterview.dto.AtsReport;
import com.utsav.aiInterview.dto.AtsScoreRequest;
import com.utsav.aiInterview.dto.ResumeAnalysis;
import com.utsav.aiInterview.dto.ResumeResponse;
import com.utsav.aiInterview.service.AIService;
import com.utsav.aiInterview.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    private final ResumeService resumeService;

    @PostMapping("/analyzeResume")
    public ResponseEntity<ApiResponse<ResumeAnalysis>> analyzeResume(
            @Valid @RequestBody AnalyzeResumeRequest request) {
        ResumeAnalysis analysis = aiService.analyzeResume(request.resumeText());
        return ResponseEntity.ok(new ApiResponse<>(true, "Resume analyzed", analysis));
    }

    @PostMapping("/ats-score")
    public ResponseEntity<ApiResponse<AtsReport>> atsScore(
            @Valid @RequestBody AtsScoreRequest request,
            Authentication authentication) {
        ResumeResponse resume = resumeService.getById(request.resumeId(), authentication.getName());
        AtsReport report = aiService.atsScore(resume.extractedText(), request.role());
        return ResponseEntity.ok(new ApiResponse<>(true, "ATS score", report));
    }
}
