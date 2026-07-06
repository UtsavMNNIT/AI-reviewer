package com.utsav.aiInterview.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * JWT helper: token generation, validation and claim extraction.
 * Skeleton only; no business logic yet.
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public String generateToken(String subject) {
        // TODO: build and sign a JWT using jjwt
        throw new UnsupportedOperationException("TODO");
    }

    public boolean validateToken(String token) {
        // TODO: verify signature and expiration
        throw new UnsupportedOperationException("TODO");
    }

    public String getEmailFromToken(String token) {
        // TODO: parse claims and return subject
        throw new UnsupportedOperationException("TODO");
    }
}
