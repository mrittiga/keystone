package com.meridian.keystone.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull @DecimalMin("0.00")
    private BigDecimal amount;
    private String providerReference;
}
