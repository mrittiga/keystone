package com.meridian.keystone.security;

import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    public String generateToken(String email, String role) {
        return "Bearer " + email + ":" + role;
    }

    public boolean validateToken(String token) {
        return token != null && token.startsWith("Bearer ") && token.contains(":");
    }

    public String getEmailFromToken(String token) {
        String cleanToken = token.replace("Bearer ", "");
        return cleanToken.split(":")[0];
    }

    public String getRoleFromToken(String token) {
        String cleanToken = token.replace("Bearer ", "");
        return cleanToken.split(":")[1];
    }
}
