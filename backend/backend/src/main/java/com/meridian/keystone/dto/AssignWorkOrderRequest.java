package com.meridian.keystone.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignWorkOrderRequest {

    @NotNull(message = "Technician ID is required")
    private Long technicianId;

    private String note;
}
