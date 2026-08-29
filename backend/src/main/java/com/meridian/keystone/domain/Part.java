package com.meridian.keystone.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "parts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "unit_cost", nullable = false)
    private BigDecimal unitCost;

    @Column(name = "stock_quantity", nullable = false)
    private Long stockQuantity;

    @Column(name = "min_stock_level", nullable = false)
    private Long minStockLevel;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.unitCost == null) this.unitCost = BigDecimal.ZERO;
        if (this.stockQuantity == null) this.stockQuantity = 0L;
        if (this.minStockLevel == null) this.minStockLevel = 0L;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
