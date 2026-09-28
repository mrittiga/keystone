package com.meridian.keystone.dto;

import com.meridian.keystone.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

private Long id;
private String email;
private String name;
private String role;
private Set<String> roles;
private Long customerOrgId;
private String customerOrgName;
private LocalDateTime createdAt;

public static UserDTO from(User u) {
    if (u == null) {
        return null;
    }

    Long orgId = (u.getCustomerOrg() != null)
            ? u.getCustomerOrg().getId()
            : null;

    String orgName = (u.getCustomerOrg() != null)
            ? u.getCustomerOrg().getName()
            : null;

    String userRole = (u.getRole() != null)
            ? u.getRole().name()
            : null;

    Set<String> userRoles = userRole != null
            ? Set.of(userRole)
            : Set.of();

    return UserDTO.builder()
            .id(u.getId())
            .email(u.getEmail())
            .name(u.getName())
            .role(userRole)
            .roles(userRoles)
            .customerOrgId(orgId)
            .customerOrgName(orgName)
            .createdAt(u.getCreatedAt())
            .build();
}

}
