package com.utsav.aiInterview.dto;

/**
 * Single interview question in API responses.
 */
public record QuestionResponse(
        String question,
        String topic
) {
}
