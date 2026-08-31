package com.meridian.keystone.repository;

import com.meridian.keystone.domain.Site;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SiteRepository extends JpaRepository<Site, Long> {
    Page<Site> findByCustomerId(Long customerId, Pageable pageable);
    List<Site> findByCustomerIdAndNameContainingIgnoreCase(Long customerId, String name);
}
