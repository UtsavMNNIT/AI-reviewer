package com.utsav.aiInterview.service;

import com.utsav.aiInterview.dto.AuthResponse;
import com.utsav.aiInterview.dto.LoginRequest;
import com.utsav.aiInterview.dto.RegisterRequest;
import com.utsav.aiInterview.exception.BadRequestException;
import com.utsav.aiInterview.exception.ResourceNotFoundException;
import com.utsav.aiInterview.model.Role;
import com.utsav.aiInterview.model.User;
import com.utsav.aiInterview.repository.UserRepository;
import com.utsav.aiInterview.util.AppConstants;
import com.utsav.aiInterview.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authentication service — registration and login.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user with the default {@link Role#USER} role.
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build();

        User saved = userRepository.save(user);
        return buildAuthResponse(saved);
    }

    /**
     * Authenticates credentials and issues a JWT access token.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, AppConstants.TOKEN_TYPE, user.getEmail(), user.getRole().name());
    }
}
