package com.meridian.keystone.dto;

import com.meridian.keystone.domain.TimeLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeLogDTO {
    private Long id;
    private Long technicianId;
    private String technicianName;
    private Long minutesWorked;
    private String note;
    private LocalDateTime loggedAt;

    public static TimeLogDTO from(TimeLog t) {
        return TimeLogDTO.builder()
                .id(t.getId())
                .technicianId(t.getTechnician() != null ? t.getTechnician().getId() : null)
                .technicianName(t.getTechnician() != null ? t.getTechnician().getName() : null)
                .minutesWorked(t.getMinutesWorked())
                .note(t.getNote())
                .loggedAt(t.getLoggedAt())
                .build();
    }
}
