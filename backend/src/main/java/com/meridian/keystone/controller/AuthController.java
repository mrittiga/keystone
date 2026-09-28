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

@RestController
@RequestMapping("/api/v1/auth")
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
