package com.meridian.keystone.dto;

import lombok.Data;

@Data
public class UpdateWorkOrderRequest {
    private String title;
    private String description;
    private String priority;
}
