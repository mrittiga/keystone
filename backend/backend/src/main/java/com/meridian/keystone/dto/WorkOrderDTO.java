package com.meridian.keystone.dto;

import com.meridian.keystone.domain.WorkOrder;
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
public class WorkOrderDTO {
    private Long id;
    private String code;
    private String title;
    private String description;
    private String status;
    private String priority;
    private Long customerId;
    private String customerName;
    private Long siteId;
    private String siteName;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime slaDueDate;
    private Boolean slaBreached;
    private BigDecimal totalPartsPrice;
    private Long totalMinutesWorked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WorkOrderDTO from(WorkOrder w) {
        return WorkOrderDTO.builder()
                .id(w.getId())
                .code(w.getCode())
                .title(w.getTitle())
                .description(w.getDescription())
                .status(w.getStatus().toString())
                .priority(w.getPriority().toString())
                .customerId(w.getCustomer() != null ? w.getCustomer().getId() : null)
                .customerName(w.getCustomer() != null ? w.getCustomer().getName() : null)
                .siteId(w.getSite() != null ? w.getSite().getId() : null)
                .siteName(w.getSite() != null ? w.getSite().getName() : null)
                .assignedToId(w.getAssignedTo() != null ? w.getAssignedTo().getId() : null)
                .assignedToName(w.getAssignedTo() != null ? w.getAssignedTo().getName() : null)
                .slaDueDate(w.getSlaDueDate())
                .slaBreached(w.getSlaBreached())
                .totalPartsPrice(w.getTotalPartsPrice())
                .totalMinutesWorked(w.getTotalMinutesWorked())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}
