package com.utsav.aiInterview.dto;

/**
 * Generic wrapper for API responses.
 *
 * @param <T> the payload type
 */
public record ApiResponse<T>(
        boolean success,
        String message,
        T data
) {
}
