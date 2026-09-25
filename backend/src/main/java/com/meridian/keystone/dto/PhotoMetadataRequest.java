package com.meridian.keystone.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhotoMetadataRequest {
    @NotBlank
    private String fileName;
    @NotBlank
    private String storageKey;
    private String contentType;
}
