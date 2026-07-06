package com.utsav.aiInterview.controller;

import com.utsav.aiInterview.model.User;
import com.utsav.aiInterview.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * User endpoints.
 * Skeleton only; no business logic yet.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable String id) {
        // TODO: implement
        throw new UnsupportedOperationException("TODO");
    }
}
