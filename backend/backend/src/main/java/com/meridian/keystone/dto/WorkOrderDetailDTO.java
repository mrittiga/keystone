package com.meridian.keystone.dto;

import com.meridian.keystone.domain.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderDetailDTO {
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
    private String siteAddress;
    private Long assignedToId;
    private String assignedToName;
    private LocalDateTime slaDueDate;
    private Boolean slaBreached;
    private BigDecimal totalPartsPrice;
    private Long totalMinutesWorked;
    private List<StatusHistoryDTO> statusHistory;
    private List<PartUsageDTO> partsUsed;
    private List<TimeLogDTO> timeLogs;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WorkOrderDetailDTO from(WorkOrder w) {
        return WorkOrderDetailDTO.builder()
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
                .siteAddress(w.getSite() != null ? w.getSite().getAddress() : null)
                .assignedToId(w.getAssignedTo() != null ? w.getAssignedTo().getId() : null)
                .assignedToName(w.getAssignedTo() != null ? w.getAssignedTo().getName() : null)
                .slaDueDate(w.getSlaDueDate())
                .slaBreached(w.getSlaBreached())
                .totalPartsPrice(w.getTotalPartsPrice())
                .totalMinutesWorked(w.getTotalMinutesWorked())
                .statusHistory(w.getStatusHistory().stream()
                        .map(StatusHistoryDTO::from)
                        .sorted((a, b) -> b.getChangedAt().compareTo(a.getChangedAt()))
                        .collect(Collectors.toList()))
                .partsUsed(w.getPartsUsed().stream()
                        .map(PartUsageDTO::from)
                        .collect(Collectors.toList()))
                .timeLogs(w.getTimeLogs().stream()
                        .map(TimeLogDTO::from)
                        .collect(Collectors.toList()))
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}
