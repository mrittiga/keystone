package com.meridian.keystone.dto;

import com.meridian.keystone.domain.Part;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartDTO {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal unitCost;
    private Long stockQuantity;
    private Long minStockLevel;
    private Boolean lowStock;
    private LocalDateTime createdAt;

    public static PartDTO from(Part p) {
        return PartDTO.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .description(p.getDescription())
                .unitCost(p.getUnitCost())
                .stockQuantity(p.getStockQuantity())
                .minStockLevel(p.getMinStockLevel())
                .lowStock(p.getStockQuantity() <= p.getMinStockLevel())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
