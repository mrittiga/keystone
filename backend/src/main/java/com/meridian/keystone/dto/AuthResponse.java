package com.keystone.dto;

import lombok.Data;
import java.util.Set;

public class AuthResponse {

    @Data
    public static class RegisterDTO {
        private String email;
        private String password;
        private Set roles; // e.g., ["ROLE_MANAGER"] or ["ROLE_CUSTOMER"]
    }

    @Data
    public static class LoginDTO {
        private String email;
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String email;
        private Set roles;

        public AuthResponse(String token, String email, Set roles) {
            this.token = token;
            this.email = email;
            this.roles = roles;
        }
    }
}