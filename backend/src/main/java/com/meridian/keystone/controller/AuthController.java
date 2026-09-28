package com.meridian.keystone.controller;

import com.meridian.keystone.domain.User;
import com.meridian.keystone.dto.AuthRequest;
import com.meridian.keystone.dto.AuthResponse;
import com.meridian.keystone.dto.AuthUserResponse;
import com.meridian.keystone.dto.LoginRequest;
import com.meridian.keystone.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.meridian.keystone.dto.RegisterRequest;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
@RequiredArgsConstructor
public class AuthController {

private final AuthService authService;

@PostMapping("/login")
public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody AuthRequest request) {

    LoginRequest loginRequest = new LoginRequest();

    loginRequest.setEmail(request.getEmail());
    loginRequest.setPassword(request.getPassword());

    AuthResponse response =
            authService.login(loginRequest);

    return ResponseEntity.ok(response);
}

@PostMapping("/register")
public ResponseEntity<AuthResponse> register(
        @Valid @RequestBody RegisterRequest request) {

    AuthResponse response =
            authService.register(request);

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}

@GetMapping("/me")
public ResponseEntity<?> getCurrentUser(
        @RequestAttribute(
                value = "currentUser",
                required = false
        )
        User user) {

    if (user == null) {
        return ResponseEntity
                .status(401)
                .build();
    }

    AuthUserResponse response =
            AuthUserResponse.from(user);

    return ResponseEntity.ok(response);
}

}
