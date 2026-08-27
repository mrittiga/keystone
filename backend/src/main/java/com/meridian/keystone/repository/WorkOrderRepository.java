package com.meridian.keystone.repository;

import com.meridian.keystone.domain.WorkOrder;
import com.meridian.keystone.domain.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    Optional<WorkOrder> findByCode(String code);

    Page<WorkOrder> findByCustomerId(Long customerId, Pageable pageable);

    Page<WorkOrder> findByAssignedToId(Long userId, Pageable pageable);

    Page<WorkOrder> findByStatus(WorkOrderStatus status, Pageable pageable);

    Page<WorkOrder> findByCustomerIdAndStatus(Long customerId, WorkOrderStatus status, Pageable pageable);

    @Query("SELECT w FROM WorkOrder w WHERE w.slaBreached = true AND w.status NOT IN ('CLOSED','CANCELLED')")
    List<WorkOrder> findActiveSlaBreaches();

    @Query("SELECT w FROM WorkOrder w WHERE w.slaDueDate < CURRENT_TIMESTAMP AND w.status NOT IN ('CLOSED','CANCELLED') AND w.slaDueDate IS NOT NULL")
    List<WorkOrder> findOverdueOrders();

    @Query("SELECT w FROM WorkOrder w WHERE w.slaDueDate IS NOT NULL AND w.slaBreached = false AND w.status NOT IN ('CLOSED','CANCELLED')")
    List<WorkOrder> findOrdersToCheckForSLABreach();

    long countByStatus(WorkOrderStatus status);
}
