package com.meridian.keystone.dto;

import com.meridian.keystone.domain.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserResponse {
    private Long id;
    private String email;
    private String name;
    private String role;
    private Long customerId;

    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getCustomerOrg() != null ? user.getCustomerOrg().getId() : null
        );
    }
}