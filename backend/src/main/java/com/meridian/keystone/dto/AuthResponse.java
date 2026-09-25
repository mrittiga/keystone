package com.meridian.keystone.dto;

import lombok.Data;
import java.util.Set;

@Data
public class RegisterDTO {
    private String email;
    private String password;
    private Set roles;
}

@Data
class LoginDTO {
    private String email;
    private String password;
}

@Data
class AuthResponse {
    private String token;
    private String email;
    private Set roles;

    public AuthResponse(String token, String email, Set roles) {
        this.token = token;
        this.email = email;
        this.roles = roles;
    }
}