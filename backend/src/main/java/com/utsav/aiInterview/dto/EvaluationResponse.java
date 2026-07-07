package com.utsav.aiInterview.dto;

import java.util.List;

/**
 * AI evaluation of a candidate's answer, exposed on API reads.
 */
public record EvaluationResponse(
        int score,
        String summary,
        List<String> strengths,
        List<String> weaknesses,
        List<String> suggestions
) {
}
