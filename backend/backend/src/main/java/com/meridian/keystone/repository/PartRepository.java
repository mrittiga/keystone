package com.meridian.keystone.repository;

import com.meridian.keystone.domain.Part;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PartRepository extends JpaRepository<Part, Long> {
    Optional<Part> findBySku(String sku);
    Page<Part> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT p FROM Part p WHERE p.stockQuantity <= p.minStockLevel")
    List<Part> findLowStockParts();

    boolean existsBySku(String sku);
}
