package com.utsav.aiInterview.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload for AI resume analysis.
 */
public record AnalyzeResumeRequest(

        @NotBlank(message = "Resume text is required")
        String resumeText
) {
}
