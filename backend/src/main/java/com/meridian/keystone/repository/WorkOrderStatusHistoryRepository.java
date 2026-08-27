package com.meridian.keystone.repository;

import com.meridian.keystone.domain.WorkOrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkOrderStatusHistoryRepository extends JpaRepository<WorkOrderStatusHistory, Long> {
    List<WorkOrderStatusHistory> findByWorkOrderIdOrderByChangedAtDesc(Long workOrderId);
}
