package com.utsav.aiInterview.controller;

import com.utsav.aiInterview.dto.ApiResponse;
import com.utsav.aiInterview.dto.UserResponse;
import com.utsav.aiInterview.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * User endpoints (protected — require a valid JWT).
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(Authentication authentication) {
        UserResponse user = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Current user", user));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        List<UserResponse> users = userService.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "All users", users));
    }
}
