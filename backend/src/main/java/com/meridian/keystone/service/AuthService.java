package com.meridian.keystone.service;

import com.meridian.keystone.domain.User;
import com.meridian.keystone.dto.AuthResponse;
import com.meridian.keystone.dto.LoginRequest;
import com.meridian.keystone.repository.UserRepository;
import com.meridian.keystone.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!user.getActive()) {
            throw new RuntimeException("Your account is disabled. Contact admin.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user);

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().toString())
                .customerId(user.getCustomerOrg() != null
                        ? user.getCustomerOrg().getId() : null)
                .build();
    }
}
