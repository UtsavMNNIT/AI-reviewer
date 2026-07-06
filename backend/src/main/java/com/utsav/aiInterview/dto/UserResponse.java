package com.utsav.aiInterview.dto;

import com.utsav.aiInterview.model.Role;

/**
 * Safe, password-free projection of a user for API responses.
 */
public record UserResponse(
        String id,
        String name,
        String email,
        Role role
) {
}
