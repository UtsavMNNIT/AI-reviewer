package com.utsav.aiInterview.dto;

import java.time.Instant;

/**
 * Safe, path-free projection of a resume for API responses.
 */
public record ResumeResponse(
        String id,
        String originalFilename,
        String contentType,
        long fileSize,
        String extractedText,
        Instant uploadedAt
) {
}
