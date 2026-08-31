package com.meridian.keystone.dto;

import com.meridian.keystone.domain.PartUsage;
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
public class PartUsageDTO {
    private Long id;
    private Long partId;
    private String partSku;
    private String partName;
    private Long quantityUsed;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private LocalDateTime usedAt;

    public static PartUsageDTO from(PartUsage u) {
        return PartUsageDTO.builder()
                .id(u.getId())
                .partId(u.getPart() != null ? u.getPart().getId() : null)
                .partSku(u.getPart() != null ? u.getPart().getSku() : null)
                .partName(u.getPart() != null ? u.getPart().getName() : null)
                .quantityUsed(u.getQuantityUsed())
                .unitPrice(u.getUnitPrice())
                .totalPrice(u.getTotalPrice())
                .usedAt(u.getUsedAt())
                .build();
    }
}
