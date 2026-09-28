package com.meridian.keystone.dto;

import com.meridian.keystone.domain.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {

    private Long id;
    private String name;
    private String code;
    private String email;
    private String phone;
    private String address;

    public static CustomerDTO from(Customer c) {
        if (c == null) {
            return null;
        }

        return CustomerDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .code(c.getCode())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .build();
    }
}
