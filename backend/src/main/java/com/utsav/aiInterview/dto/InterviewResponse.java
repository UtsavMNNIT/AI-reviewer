package com.utsav.aiInterview.dto;

import com.utsav.aiInterview.model.Difficulty;
import com.utsav.aiInterview.model.InterviewStatus;

import java.time.Instant;
import java.util.List;

/**
 * Projection of an interview for API responses.
 */
public record InterviewResponse(
        String id,
        String resumeId,
        String role,
        Difficulty difficulty,
        InterviewStatus status,
        List<QuestionResponse> questions,
        Instant createdAt,
        Instant startedAt,
        Instant completedAt
) {
}
