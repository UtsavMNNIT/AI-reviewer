package com.utsav.aiInterview.dto;

/**
 * Response returned after successful authentication.
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        String email,
        String role
) {
}
