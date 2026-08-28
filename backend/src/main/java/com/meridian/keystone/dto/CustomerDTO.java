package com.meridian.keystone.dto;

import com.meridian.keystone.domain.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Long id;
    private String name;
    private String code;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private LocalDateTime createdAt;

    public static CustomerDTO from(Customer c) {
        return CustomerDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .code(c.getCode())
                .contactEmail(c.getContactEmail())
                .contactPhone(c.getContactPhone())
                .address(c.getAddress())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
