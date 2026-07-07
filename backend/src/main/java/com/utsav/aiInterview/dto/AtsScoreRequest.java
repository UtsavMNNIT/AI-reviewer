package com.utsav.aiInterview.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Payload for scoring a resume against a target role.
 */
public record AtsScoreRequest(

        @NotBlank(message = "Resume id is required")
        String resumeId,

        @NotBlank(message = "Role is required")
        String role
) {
}
