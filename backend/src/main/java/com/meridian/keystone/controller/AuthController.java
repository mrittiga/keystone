package com.meridian.keystone.controller;

import com.meridian.keystone.domain.*;
import com.meridian.keystone.dto.*;
import com.meridian.keystone.repository.*;
import com.meridian.keystone.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final SiteRepository siteRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity registerUser(@RequestBody RegisterDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        // Default to ROLE_CUSTOMER if no role provided
        Set assignedRoles = (dto.getRoles() == null || dto.getRoles().isEmpty()) 
                ? Set.of("ROLE_CUSTOMER") 
                : dto.getRoles();
        user.setRoles(assignedRoles);

        // Auto-assign default site so new accounts do not throw 400 Bad Request
        Site defaultSite = siteRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> {
                    Site site = new Site();
                    site.setName("Default Operations HQ");
                    site.setAddress("Headquarters");
                    return siteRepository.save(site);
                });
        user.getSites().add(defaultSite);

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity authenticateUser(@RequestBody LoginDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtils.generateToken(authentication);

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRoles()));
    }
}