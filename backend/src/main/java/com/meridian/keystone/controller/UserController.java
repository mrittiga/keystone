package com.meridian.keystone.controller;

import com.meridian.keystone.dto.CreateUserRequest;
import com.meridian.keystone.dto.UserDTO;
import com.meridian.keystone.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "List all users — Manager only")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/me")
    @PreAuthorize("authenticated")
    @Operation(summary = "Get current logged-in user profile")
    public ResponseEntity<UserDTO> getMe(Authentication auth) {
        return ResponseEntity.ok(userService.getCurrentUser(auth.getName()));
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "List all active technicians")
    public ResponseEntity<List<UserDTO>> getTechnicians() {
        return ResponseEntity.ok(userService.getTechnicians());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get user by ID — Manager only")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Create a new user — Manager only")
    public ResponseEntity<UserDTO> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.createUser(request));
    }

    @PutMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Toggle user active status — Manager only")
    public ResponseEntity<UserDTO> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserActive(id));
    }
}
