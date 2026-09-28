package com.meridian.keystone.dto;

import com.meridian.keystone.domain.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthUserResponse {

private Long id;
private String email;
private String name;
private Set<String> roles;
private Long customerOrgId;
private String customerOrgName;

public static AuthUserResponse from(User user) {

    if (user == null) {
        return null;
    }

    Long orgId = user.getCustomerOrg() != null
            ? user.getCustomerOrg().getId()
            : null;

    String orgName = user.getCustomerOrg() != null
            ? user.getCustomerOrg().getName()
            : null;

    String userRole = user.getRole() != null
            ? user.getRole().name()
            : null;

    Set<String> userRoles = userRole != null
            ? Set.of(userRole)
            : Set.of();

    return AuthUserResponse.builder()
            .id(user.getId())
            .email(user.getEmail())
            .name(user.getName())
            .roles(userRoles)
            .customerOrgId(orgId)
            .customerOrgName(orgName)
            .build();
}

}
