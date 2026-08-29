package com.meridian.keystone.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "work_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "site_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User assignedTo;

    @Column(name = "sla_due_date")
    private LocalDateTime slaDueDate;

    @Column(name = "sla_breached")
    private Boolean slaBreached;

    @Column(name = "total_parts_price", precision = 12, scale = 2)
    private BigDecimal totalPartsPrice;

    @Column(name = "total_minutes_worked")
    private Long totalMinutesWorked;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private Set<WorkOrderStatusHistory> statusHistory = new HashSet<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private Set<PartUsage> partsUsed = new HashSet<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private Set<TimeLog> timeLogs = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = WorkOrderStatus.NEW;
        if (this.priority == null) this.priority = Priority.MEDIUM;
        if (this.slaBreached == null) this.slaBreached = false;
        if (this.totalPartsPrice == null) this.totalPartsPrice = BigDecimal.ZERO;
        if (this.totalMinutesWorked == null) this.totalMinutesWorked = 0L;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
