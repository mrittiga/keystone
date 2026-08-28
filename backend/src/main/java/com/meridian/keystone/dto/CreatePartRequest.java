package com.meridian.keystone.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePartRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Part name is required")
    private String name;

    private String description;

    @NotNull(message = "Unit cost is required")
    @DecimalMin(value = "0.0", message = "Unit cost must be zero or greater")
    private BigDecimal unitCost;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity must be zero or greater")
    private Long stockQuantity;

    @Min(value = 0, message = "Min stock level must be zero or greater")
    private Long minStockLevel = 0L;
}
