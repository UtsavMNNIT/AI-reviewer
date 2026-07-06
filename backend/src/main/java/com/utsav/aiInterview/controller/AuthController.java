package com.utsav.aiInterview.controller;

import com.utsav.aiInterview.dto.AuthResponse;
import com.utsav.aiInterview.dto.LoginRequest;
import com.utsav.aiInterview.dto.RegisterRequest;
import com.utsav.aiInterview.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Authentication endpoints.
 * Skeleton only; no business logic yet.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }
}
