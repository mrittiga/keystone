package com.meridian.keystone.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangeStatusRequest {

    @NotBlank(message = "New status is required")
    private String newStatus;

    private String note;
}
