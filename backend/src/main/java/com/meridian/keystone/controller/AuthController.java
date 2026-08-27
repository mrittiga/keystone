package com.meridian.keystone.controller;

import com.meridian.keystone.dto.AuthResponse;
import com.meridian.keystone.dto.LoginRequest;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email or password"));

        if (!"Test@123".equals(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email or password");
        }

        String roleStr = user.getRole() != null ? user.getRole().name() : "USER";

        AuthResponse response = new AuthResponse(
                "mock-jwt-token-key",
                user.getId(),
                user.getEmail(),
                user.getName(),
                roleStr,
                null
        );

        return ResponseEntity.ok(response);
    }
}
