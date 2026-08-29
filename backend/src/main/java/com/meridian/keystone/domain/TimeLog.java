package com.meridian.keystone.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "time_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimeLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "technician_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User technician;

    @Column(name = "minutes_worked", nullable = false)
    private Long minutesWorked;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "logged_at", nullable = false, updatable = false)
    private LocalDateTime loggedAt;

    @PrePersist
    public void prePersist() {
        if (this.loggedAt == null) this.loggedAt = LocalDateTime.now();
    }
}
