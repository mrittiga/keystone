package com.meridian.keystone.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "part_usage")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "part_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Part part;

    @Column(name = "quantity_used", nullable = false)
    private Long quantityUsed;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(name = "used_at", nullable = false, updatable = false)
    private LocalDateTime usedAt;

    @PrePersist
    public void prePersist() {
        if (this.usedAt == null) this.usedAt = LocalDateTime.now();
    }

    public BigDecimal getTotalPrice() {
        if (unitPrice == null || quantityUsed == null) return BigDecimal.ZERO;
        return unitPrice.multiply(BigDecimal.valueOf(quantityUsed));
    }
}
