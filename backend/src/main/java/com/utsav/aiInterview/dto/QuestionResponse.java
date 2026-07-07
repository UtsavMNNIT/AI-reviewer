package com.utsav.aiInterview.dto;

/**
 * Single interview question in API responses. {@code answer} and {@code evaluation}
 * are present only once the candidate's answer has been submitted and scored.
 */
public record QuestionResponse(
        String question,
        String topic,
        String answer,
        EvaluationResponse evaluation
) {
}
