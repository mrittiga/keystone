package com.meridian.keystone.controller;

import com.meridian.keystone.dto.*;
import com.meridian.keystone.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@RequiredArgsConstructor
@Tag(name = "Work Orders", description = "Work order management and lifecycle")
@SecurityRequirement(name = "bearerAuth")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    @GetMapping
    @PreAuthorize("authenticated")
    @Operation(summary = "List work orders — role scoped and paginated")
    public ResponseEntity<PageResponse<WorkOrderDTO>> getAllWorkOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return ResponseEntity.ok(
                workOrderService.getAllWorkOrders(page, size, status, priority));
    }

    @GetMapping("/my-assigned")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @Operation(summary = "Get work orders assigned to current technician")
    public ResponseEntity<List<WorkOrderDTO>> getMyAssigned() {
        return ResponseEntity.ok(workOrderService.getMyAssignedWorkOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("authenticated")
    @Operation(summary = "Get work order with full history, parts, and time logs")
    public ResponseEntity<WorkOrderDetailDTO> getWorkOrder(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getWorkOrderDetail(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER') or hasRole('CUSTOMER')")
    @Operation(summary = "Create a new work order")
    public ResponseEntity<WorkOrderDTO> createWorkOrder(
            @Valid @RequestBody CreateWorkOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workOrderService.createWorkOrder(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "Update work order — only while open")
    public ResponseEntity<WorkOrderDTO> updateWorkOrder(
            @PathVariable Long id,
            @RequestBody UpdateWorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.updateWorkOrder(id, request));
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "Assign work order to a technician")
    public ResponseEntity<WorkOrderDTO> assignWorkOrder(
            @PathVariable Long id,
            @Valid @RequestBody AssignWorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.assignWorkOrder(id, request));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("authenticated")
    @Operation(summary = "Change work order status — validated against lifecycle")
    public ResponseEntity<WorkOrderDTO> changeStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeStatusRequest request) {
        return ResponseEntity.ok(workOrderService.changeStatus(id, request));
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @Operation(summary = "Log parts used — transactional stock decrement")
    public ResponseEntity<Void> logParts(
            @PathVariable Long id,
            @Valid @RequestBody LogPartUsageRequest request) {
        workOrderService.logPartUsage(id, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/time")
    @PreAuthorize("hasRole('TECHNICIAN')")
    @Operation(summary = "Log time worked on a work order")
    public ResponseEntity<Void> logTime(
            @PathVariable Long id,
            @Valid @RequestBody LogTimeRequest request) {
        workOrderService.logTimeWorked(id, request);
        return ResponseEntity.noContent().build();
    }
}
