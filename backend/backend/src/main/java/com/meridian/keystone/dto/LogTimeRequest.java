package com.meridian.keystone.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LogTimeRequest {

    @NotNull(message = "Minutes worked is required")
    @Min(value = 1, message = "Minutes must be at least 1")
    private Long minutesWorked;

    private String note;
}
