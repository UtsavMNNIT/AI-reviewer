package com.utsav.aiInterview.dto;

/**
 * A newly generated interview question plus its position in the interview.
 * Returned one at a time as the candidate progresses.
 */
public record NextQuestionResponse(
        String question,
        String topic,
        int questionNumber,
        int totalQuestions
) {
}
