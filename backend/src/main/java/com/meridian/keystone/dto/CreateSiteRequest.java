package com.meridian.keystone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSiteRequest {

    @NotBlank(message = "Site name is required")
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;

    private String address;
    private String city;
    private String postcode;
    private String contactPerson;
    private String contactPhone;
}
