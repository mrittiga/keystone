package com.meridian.keystone.service;

import com.meridian.keystone.domain.User;
import com.meridian.keystone.domain.UserRole;
import com.meridian.keystone.dto.AuthResponse;
import com.meridian.keystone.dto.LoginRequest;
import com.meridian.keystone.repository.UserRepository;
import com.meridian.keystone.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginReturnsCustomerIdentityForValidCredentials() {
        User user = User.builder()
                .id(7L)
                .email("customer@example.com")
                .name("Customer")
                .passwordHash("hashed")
                .role(UserRole.CUSTOMER)
                .active(true)
                .build();
        LoginRequest request = new LoginRequest();
        request.setEmail(user.getEmail());
        request.setPassword("correct");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correct", "hashed")).thenReturn(true);
        when(tokenProvider.generateToken(user.getEmail(), "CUSTOMER")).thenReturn("Bearer token");

        AuthResponse response = authService.login(request);

        assertEquals("Bearer token", response.getToken());
        assertEquals(user.getEmail(), response.getEmail());
    }

    @Test
    void loginRejectsInvalidPassword() {
        User user = User.builder()
                .email("customer@example.com")
                .passwordHash("hashed")
                .role(UserRole.CUSTOMER)
                .active(true)
                .build();
        LoginRequest request = new LoginRequest();
        request.setEmail(user.getEmail());
        request.setPassword("wrong");

        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.login(request));
    }
}
