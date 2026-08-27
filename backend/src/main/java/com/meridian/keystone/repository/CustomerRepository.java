package com.meridian.keystone.repository;

import com.meridian.keystone.domain.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByCode(String code);
    Page<Customer> findByNameContainingIgnoreCase(String name, Pageable pageable);
    boolean existsByCode(String code);
}
