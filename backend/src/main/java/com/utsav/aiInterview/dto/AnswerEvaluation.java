package com.utsav.aiInterview.dto;

import java.util.List;

/**
 * Structured evaluation of a candidate's interview answer, produced by the
 * Gemini model. Also returned to the client as the answer-submission payload.
 */
public record AnswerEvaluation(
        int score,
        String summary,
        List<String> strengths,
        List<String> weaknesses,
        List<String> suggestions
) {
}
