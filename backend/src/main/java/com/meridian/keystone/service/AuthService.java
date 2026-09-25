package com.meridian.keystone.service;

import com.meridian.keystone.dto.AuthResponse;
import com.meridian.keystone.dto.LoginRequest;
import com.meridian.keystone.dto.RegisterRequest;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.repository.UserRepository;
import com.meridian.keystone.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.getActive())
            || !passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, AuthUserResponse.from(user));
    }

    public void register(RegisterRequest registerRequest) {
        String email = registerRequest.getEmail().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already in use: " + email);
        }

        User user = User.builder()
                .email(email)
                .name(registerRequest.getName())
                .passwordHash(passwordEncoder.encode(registerRequest.getPassword()))
                .role(com.meridian.keystone.domain.UserRole.CUSTOMER)
                .active(true)
                .build();

        userRepository.save(user);
    }
}
