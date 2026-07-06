package com.utsav.aiInterview.exception;

/**
 * Thrown when the upstream AI (Gemini) call fails or returns an unusable response.
 */
public class AIServiceException extends RuntimeException {

    public AIServiceException(String message) {
        super(message);
    }

    public AIServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
