package com.utsav.aiInterview.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for submitting an answer to a specific interview question.
 */
public record EvaluateAnswerRequest(
        @NotNull(message = "Question index is required")
        @Min(value = 0, message = "Question index must be zero or greater")
        Integer questionIndex,

        @NotBlank(message = "Answer is required")
        String answer
) {
}
