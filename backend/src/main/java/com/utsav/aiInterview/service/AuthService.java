package com.utsav.aiInterview.service;

import com.utsav.aiInterview.dto.AuthResponse;
import com.utsav.aiInterview.dto.LoginRequest;
import com.utsav.aiInterview.dto.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Authentication service — registration and login.
 * Skeleton only; no business logic yet.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    public AuthResponse register(RegisterRequest request) {
        // TODO: implement user registration
        throw new UnsupportedOperationException("TODO");
    }

    public AuthResponse login(LoginRequest request) {
        // TODO: implement authentication and token issuance
        throw new UnsupportedOperationException("TODO");
    }
}
