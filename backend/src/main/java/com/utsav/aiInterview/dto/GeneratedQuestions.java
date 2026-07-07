package com.utsav.aiInterview.dto;

import java.util.List;

/**
 * Structured set of interview questions produced by the Gemini model.
 */
public record GeneratedQuestions(
        List<QuestionItem> questions
) {

    /**
     * A single generated question with its topic/skill area.
     */
    public record QuestionItem(
            String question,
            String topic
    ) {
    }
}
