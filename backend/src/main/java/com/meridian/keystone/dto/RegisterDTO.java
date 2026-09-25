package com.meridian.keystone.dto;

import lombok.Data;
import java.util.Set;

@Data
public class RegisterDTO {
    private String email;
    private String password;
    private Set roles;
}