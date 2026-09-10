package com.meridian.keystone.config;

import com.meridian.keystone.model.User;
import com.meridian.keystone.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            createOrUpdateUser(userRepository, passwordEncoder, "manager@meridian.com", "Test@123", "MANAGER");
            createOrUpdateUser(userRepository, passwordEncoder, "dispatcher@meridian.com", "Test@123", "DISPATCHER");
            createOrUpdateUser(userRepository, passwordEncoder, "technician@meridian.com", "Test@123", "TECHNICIAN");
            createOrUpdateUser(userRepository, passwordEncoder, "customer@meridian.com", "Test@123", "CUSTOMER");
        };
    }

    private void createOrUpdateUser(UserRepository repo, PasswordEncoder encoder, String email, String rawPassword, String role) {
        repo.findByEmail(email).ifPresentOrElse(
            user -> {
                user.setPassword(encoder.encode(rawPassword));
                repo.save(user);
            },
            () -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setPassword(encoder.encode(rawPassword));
                newUser.setRole(role);
                repo.save(newUser);
            }
        );
    }
}
