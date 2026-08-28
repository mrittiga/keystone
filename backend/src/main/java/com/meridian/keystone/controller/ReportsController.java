package com.meridian.keystone.controller;

import com.meridian.keystone.dto.WorkOrderDTO;
import com.meridian.keystone.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Dashboard metrics and reporting")
@SecurityRequirement(name = "bearerAuth")
public class ReportsController {

    private final WorkOrderService workOrderService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('MANAGER') or hasRole('DISPATCHER')")
    @Operation(summary = "Dashboard summary — counts, SLA compliance, overdue")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Long> counts = workOrderService.getStatusCounts();
        List<WorkOrderDTO> overdue = workOrderService.getOverdueOrders();
        List<WorkOrderDTO> breaches = workOrderService.getSlaBreaches();

        long total = counts.values().stream().mapToLong(Long::longValue).sum();
        long closed = counts.getOrDefault("CLOSED", 0L);
        long metSla = breaches.isEmpty() ? closed : Math.max(0, closed - breaches.size());
        double compliance = closed > 0
                ? Math.round((double) metSla / closed * 100.0) : 100.0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalOrders", total);
        result.put("countByStatus", counts);
        result.put("newOrders", counts.getOrDefault("NEW", 0L));
        result.put("assignedOrders", counts.getOrDefault("ASSIGNED", 0L));
        result.put("inProgressOrders", counts.getOrDefault("IN_PROGRESS", 0L));
        result.put("onHoldOrders", counts.getOrDefault("ON_HOLD", 0L));
        result.put("completedOrders", counts.getOrDefault("COMPLETED", 0L));
        result.put("closedOrders", counts.getOrDefault("CLOSED", 0L));
        result.put("cancelledOrders", counts.getOrDefault("CANCELLED", 0L));
        result.put("overdueCount", overdue.size());
        result.put("slaBreachCount", breaches.size());
        result.put("slaCompliancePercent", compliance);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get all overdue work orders")
    public ResponseEntity<List<WorkOrderDTO>> getOverdue() {
        return ResponseEntity.ok(workOrderService.getOverdueOrders());
    }

    @GetMapping("/sla-status")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get all SLA breached work orders")
    public ResponseEntity<List<WorkOrderDTO>> getSlaBreaches() {
        return ResponseEntity.ok(workOrderService.getSlaBreaches());
    }
}
