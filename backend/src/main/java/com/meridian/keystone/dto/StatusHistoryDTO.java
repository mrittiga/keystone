package com.meridian.keystone.dto;

import com.meridian.keystone.domain.WorkOrderStatusHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistoryDTO {
    private Long id;
    private String fromStatus;
    private String toStatus;
    private Long changedById;
    private String changedByName;
    private String note;
    private LocalDateTime changedAt;

    public static StatusHistoryDTO from(WorkOrderStatusHistory h) {
        return StatusHistoryDTO.builder()
                .id(h.getId())
                .fromStatus(h.getFromStatus().toString())
                .toStatus(h.getToStatus().toString())
                .changedById(h.getChangedBy() != null ? h.getChangedBy().getId() : null)
                .changedByName(h.getChangedBy() != null ? h.getChangedBy().getName() : null)
                .note(h.getNote())
                .changedAt(h.getChangedAt())
                .build();
    }
}
