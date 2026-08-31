package com.meridian.keystone.dto;

import com.meridian.keystone.domain.Site;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SiteDTO {
    private Long id;
    private String name;
    private String address;
    private String city;
    private String postcode;
    private String contactPerson;
    private String contactPhone;
    private Long customerId;
    private String customerName;
    private LocalDateTime createdAt;

    public static SiteDTO from(Site s) {
        return SiteDTO.builder()
                .id(s.getId())
                .name(s.getName())
                .address(s.getAddress())
                .city(s.getCity())
                .postcode(s.getPostcode())
                .contactPerson(s.getContactPerson())
                .contactPhone(s.getContactPhone())
                .customerId(s.getCustomer() != null ? s.getCustomer().getId() : null)
                .customerName(s.getCustomer() != null ? s.getCustomer().getName() : null)
                .createdAt(s.getCreatedAt())
                .build();
    }
}
