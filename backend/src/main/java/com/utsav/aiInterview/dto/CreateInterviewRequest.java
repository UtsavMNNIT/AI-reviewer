package com.utsav.aiInterview.dto;

import com.utsav.aiInterview.model.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Payload for creating a new interview.
 */
public record CreateInterviewRequest(

        @NotBlank(message = "Resume id is required")
        String resumeId,

        @NotBlank(message = "Role is required")
        String role,

        @NotNull(message = "Difficulty is required")
        Difficulty difficulty
) {
}
