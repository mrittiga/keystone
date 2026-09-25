package com.meridian.keystone.controller;

import com.meridian.keystone.domain.Site;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.dto.AuthResponse;
import com.meridian.keystone.dto.LoginDTO;
import com.meridian.keystone.dto.RegisterDTO;
import com.meridian.keystone.repository.SiteRepository;
import com.meridian.keystone.repository.UserRepository;
import com.meridian.keystone.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity registerUser(@RequestBody RegisterDTO dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        Set assignedRoles = (dto.getRoles() == null || dto.getRoles().isEmpty()) 
                ? Set.of("ROLE_CUSTOMER") 
                : dto.getRoles();
        user.setRoles(assignedRoles);

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

        String primaryRole = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_CUSTOMER");

        String token = jwtTokenProvider.generateToken(authentication.getName(), primaryRole);

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRoles()));
    }
}