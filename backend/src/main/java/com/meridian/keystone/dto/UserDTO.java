package com.meridian.keystone.dto;

import com.meridian.keystone.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String email;
    private String name;
    private String role;
    private Boolean active;
    private Long customerId;
    private String customerName;
    private LocalDateTime createdAt;

    public static UserDTO from(User u) {
        return UserDTO.builder()
                .id(u.getId())
                .email(u.getEmail())
                .name(u.getName())
                .role(u.getRole().toString())
                .active(u.getActive())
                .customerId(u.getCustomerOrg() != null ? u.getCustomerOrg().getId() : null)
                .customerName(u.getCustomerOrg() != null ? u.getCustomerOrg().getName() : null)
                .createdAt(u.getCreatedAt())
                .build();
    }
}
