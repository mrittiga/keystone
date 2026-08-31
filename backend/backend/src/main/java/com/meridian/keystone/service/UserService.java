package com.meridian.keystone.service;

import com.meridian.keystone.domain.Customer;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.domain.UserRole;
import com.meridian.keystone.dto.CreateUserRequest;
import com.meridian.keystone.dto.UserDTO;
import com.meridian.keystone.repository.CustomerRepository;
import com.meridian.keystone.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDTO::from)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserDTO.from(user);
    }

    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return UserDTO.from(user);
    }

    public List<UserDTO> getTechnicians() {
        return userRepository.findByRoleAndActiveTrue(UserRole.TECHNICIAN)
                .stream()
                .map(UserDTO::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use: " + request.getEmail());
        }

        UserRole role;
        try {
            role = UserRole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + request.getRole());
        }

        Customer customerOrg = null;
        if (request.getCustomerId() != null) {
            customerOrg = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found: " + request.getCustomerId()));
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .customerOrg(customerOrg)
                .build();

        User saved = userRepository.save(user);
        log.info("User created: {} with role: {}", saved.getEmail(), saved.getRole());
        return UserDTO.from(saved);
    }

    @Transactional
    public UserDTO toggleUserActive(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setActive(!user.getActive());
        User saved = userRepository.save(user);
        log.info("User {} active status changed to: {}", saved.getEmail(), saved.getActive());
        return UserDTO.from(saved);
    }
}
