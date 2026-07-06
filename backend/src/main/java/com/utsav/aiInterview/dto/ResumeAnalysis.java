package com.utsav.aiInterview.dto;

import java.util.List;

/**
 * Structured resume analysis produced by the Gemini model.
 */
public record ResumeAnalysis(
        List<String> skills,
        List<String> projects,
        List<String> technologies,
        String experienceSummary,
        List<String> strengths,
        List<String> weaknesses
) {
}
