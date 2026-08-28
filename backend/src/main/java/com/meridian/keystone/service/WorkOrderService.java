package com.meridian.keystone.service;

import com.meridian.keystone.domain.*;
import com.meridian.keystone.dto.*;
import com.meridian.keystone.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final PartRepository partRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;

    private static final Map<Priority, Integer> SLA_HOURS = Map.of(
            Priority.URGENT, 4,
            Priority.HIGH, 8,
            Priority.MEDIUM, 24,
            Priority.LOW, 48
    );

    // ── GET LIST ────────────────────────────────────────────────────────────

    public PageResponse<WorkOrderDTO> getAllWorkOrders(
            int page, int size, String status, String priority) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());

        Page<WorkOrder> result;

        if (status != null && !status.isEmpty()) {
            WorkOrderStatus s = WorkOrderStatus.valueOf(status.toUpperCase());
            result = workOrderRepository.findByStatus(s, pageable);
        } else {
            result = workOrderRepository.findAll(pageable);
        }

        return PageResponse.from(result.map(WorkOrderDTO::from));
    }

    public PageResponse<WorkOrderDTO> getWorkOrdersByCustomer(
            Long customerId, int page, int size) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());
        Page<WorkOrderDTO> result = workOrderRepository
                .findByCustomerId(customerId, pageable)
                .map(WorkOrderDTO::from);
        return PageResponse.from(result);
    }

    public List<WorkOrderDTO> getMyAssignedWorkOrders() {
        User me = getCurrentUser();
        Pageable pageable = PageRequest.of(0, 100,
                Sort.by("createdAt").descending());
        return workOrderRepository.findByAssignedToId(me.getId(), pageable)
                .stream()
                .map(WorkOrderDTO::from)
                .collect(Collectors.toList());
    }

    // ── GET ONE ─────────────────────────────────────────────────────────────

    public WorkOrderDetailDTO getWorkOrderDetail(Long id) {
        WorkOrder order = findOrder(id);
        order.getStatusHistory().size();
        order.getPartsUsed().size();
        order.getTimeLogs().size();
        return WorkOrderDetailDTO.from(order);
    }

    // ── CREATE ───────────────────────────────────────────────────────────────

    @Transactional
    public WorkOrderDTO createWorkOrder(CreateWorkOrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException(
                        "Customer not found: " + request.getCustomerId()));

        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException(
                        "Site not found: " + request.getSiteId()));

        Priority priority = Priority.valueOf(
                request.getPriority().toUpperCase());

        String code = generateCode();

        WorkOrder order = WorkOrder.builder()
                .code(code)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(priority)
                .status(WorkOrderStatus.NEW)
                .customer(customer)
                .site(site)
                .slaBreached(false)
                .totalPartsPrice(BigDecimal.ZERO)
                .totalMinutesWorked(0L)
                .build();

        WorkOrder saved = workOrderRepository.save(order);

        recordHistory(saved, WorkOrderStatus.NEW, WorkOrderStatus.NEW,
                "Work order created", getCurrentUser());

        log.info("Work order created: {} by {}", code, getCurrentUserEmail());
        return WorkOrderDTO.from(saved);
    }

    // ── UPDATE ───────────────────────────────────────────────────────────────

    @Transactional
    public WorkOrderDTO updateWorkOrder(Long id, UpdateWorkOrderRequest request) {
        WorkOrder order = findOrder(id);

        if (order.getStatus() == WorkOrderStatus.CLOSED ||
            order.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new RuntimeException(
                    "Cannot edit a " + order.getStatus() + " work order");
        }

        if (request.getTitle() != null) order.setTitle(request.getTitle());
        if (request.getDescription() != null) order.setDescription(request.getDescription());
        if (request.getPriority() != null) {
            order.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));
        }

        WorkOrder saved = workOrderRepository.save(order);
        log.info("Work order updated: {}", saved.getCode());
        return WorkOrderDTO.from(saved);
    }

    // ── ASSIGN ───────────────────────────────────────────────────────────────

    @Transactional
    public WorkOrderDTO assignWorkOrder(Long id, AssignWorkOrderRequest request) {
        WorkOrder order = findOrder(id);
        User technician = userRepository.findById(request.getTechnicianId())
                .orElseThrow(() -> new RuntimeException(
                        "Technician not found: " + request.getTechnicianId()));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new RuntimeException("User is not a technician");
        }
        if (!technician.getActive()) {
            throw new RuntimeException("Technician account is inactive");
        }

        WorkOrderStatus oldStatus = order.getStatus();

        if (!canTransition(oldStatus, WorkOrderStatus.ASSIGNED)) {
            throw new RuntimeException(
                    "Cannot assign from status: " + oldStatus);
        }

        order.setAssignedTo(technician);
        order.setStatus(WorkOrderStatus.ASSIGNED);
        order.setSlaDueDate(calculateSlaDueDate(order.getPriority()));

        WorkOrder saved = workOrderRepository.save(order);

        String note = request.getNote() != null ? request.getNote()
                : "Assigned to " + technician.getName();
        recordHistory(saved, oldStatus, WorkOrderStatus.ASSIGNED,
                note, getCurrentUser());

        log.info("Work order {} assigned to {}", saved.getCode(), technician.getEmail());
        return WorkOrderDTO.from(saved);
    }

    // ── CHANGE STATUS ────────────────────────────────────────────────────────

    @Transactional
    public WorkOrderDTO changeStatus(Long id, ChangeStatusRequest request) {
        WorkOrder order = findOrder(id);
        User me = getCurrentUser();

        WorkOrderStatus newStatus;
        try {
            newStatus = WorkOrderStatus.valueOf(request.getNewStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status: " + request.getNewStatus());
        }

        WorkOrderStatus oldStatus = order.getStatus();

        if (!canTransition(oldStatus, newStatus)) {
            throw new RuntimeException(
                    "Invalid transition: " + oldStatus + " → " + newStatus);
        }

        validateRoleForTransition(newStatus, order, me);

        order.setStatus(newStatus);
        WorkOrder saved = workOrderRepository.save(order);

        recordHistory(saved, oldStatus, newStatus, request.getNote(), me);

        log.info("Work order {} status: {} → {} by {}",
                saved.getCode(), oldStatus, newStatus, me.getEmail());
        return WorkOrderDTO.from(saved);
    }

    // ── LOG PARTS ────────────────────────────────────────────────────────────

    @Transactional
    public void logPartUsage(Long workOrderId, LogPartUsageRequest request) {
        WorkOrder order = findOrder(workOrderId);
        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new RuntimeException(
                        "Part not found: " + request.getPartId()));

        if (part.getStockQuantity() < request.getQuantityUsed()) {
            throw new RuntimeException(
                    "Insufficient stock. Available: " + part.getStockQuantity());
        }

        PartUsage usage = PartUsage.builder()
                .workOrder(order)
                .part(part)
                .quantityUsed(request.getQuantityUsed())
                .unitPrice(part.getUnitCost())
                .build();

        part.setStockQuantity(part.getStockQuantity() - request.getQuantityUsed());

        BigDecimal lineTotal = usage.getTotalPrice();
        order.setTotalPartsPrice(order.getTotalPartsPrice().add(lineTotal));

        partRepository.save(part);
        partUsageRepository.save(usage);
        workOrderRepository.save(order);

        log.info("Parts logged on {}: {} x {}",
                order.getCode(), part.getSku(), request.getQuantityUsed());
    }

    // ── LOG TIME ─────────────────────────────────────────────────────────────

    @Transactional
    public void logTimeWorked(Long workOrderId, LogTimeRequest request) {
        WorkOrder order = findOrder(workOrderId);
        User me = getCurrentUser();

        TimeLog timeLog = TimeLog.builder()
                .workOrder(order)
                .technician(me)
                .minutesWorked(request.getMinutesWorked())
                .note(request.getNote())
                .build();

        order.setTotalMinutesWorked(
                order.getTotalMinutesWorked() + request.getMinutesWorked());

        timeLogRepository.save(timeLog);
        workOrderRepository.save(order);

        log.info("Time logged on {}: {} mins by {}",
                order.getCode(), request.getMinutesWorked(), me.getEmail());
    }

    // ── SLA CHECK ────────────────────────────────────────────────────────────

    @Transactional
    public void checkAndUpdateSlaBreaches() {
        List<WorkOrder> toCheck = workOrderRepository.findOrdersToCheckForSLABreach();
        int count = 0;
        for (WorkOrder order : toCheck) {
            if (LocalDateTime.now().isAfter(order.getSlaDueDate())) {
                order.setSlaBreached(true);
                workOrderRepository.save(order);
                count++;
                log.warn("SLA BREACHED: {} - {} ({})",
                        order.getCode(), order.getTitle(), order.getPriority());
            }
        }
        if (count > 0) log.warn("SLA check: {} breach(es) flagged", count);
    }

    // ── REPORTS ──────────────────────────────────────────────────────────────

    public Map<String, Long> getStatusCounts() {
        Map<String, Long> counts = new java.util.LinkedHashMap<>();
        for (WorkOrderStatus s : WorkOrderStatus.values()) {
            counts.put(s.toString(), workOrderRepository.countByStatus(s));
        }
        return counts;
    }

    public List<WorkOrderDTO> getOverdueOrders() {
        return workOrderRepository.findOverdueOrders()
                .stream().map(WorkOrderDTO::from).collect(Collectors.toList());
    }

    public List<WorkOrderDTO> getSlaBreaches() {
        return workOrderRepository.findActiveSlaBreaches()
                .stream().map(WorkOrderDTO::from).collect(Collectors.toList());
    }

    // ── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private boolean canTransition(WorkOrderStatus from, WorkOrderStatus to) {
        return switch (from) {
            case NEW -> to == WorkOrderStatus.ASSIGNED
                     || to == WorkOrderStatus.CANCELLED;
            case ASSIGNED -> to == WorkOrderStatus.IN_PROGRESS
                          || to == WorkOrderStatus.CANCELLED;
            case IN_PROGRESS -> to == WorkOrderStatus.ON_HOLD
                             || to == WorkOrderStatus.COMPLETED;
            case ON_HOLD -> to == WorkOrderStatus.IN_PROGRESS;
            case COMPLETED -> to == WorkOrderStatus.CLOSED;
            default -> false;
        };
    }

    private void validateRoleForTransition(
            WorkOrderStatus newStatus, WorkOrder order, User user) {

        switch (newStatus) {
            case IN_PROGRESS, ON_HOLD, COMPLETED -> {
                if (user.getRole() != UserRole.TECHNICIAN)
                    throw new RuntimeException(
                            "Only technicians can start, hold, or complete jobs");
                if (order.getAssignedTo() == null ||
                    !order.getAssignedTo().getId().equals(user.getId()))
                    throw new RuntimeException(
                            "You can only update jobs assigned to you");
            }
            case CLOSED -> {
                if (user.getRole() != UserRole.MANAGER)
                    throw new RuntimeException(
                            "Only managers can close work orders");
            }
            case CANCELLED -> {
                if (user.getRole() != UserRole.MANAGER &&
                    user.getRole() != UserRole.DISPATCHER)
                    throw new RuntimeException(
                            "Only managers or dispatchers can cancel work orders");
            }
            default -> { }
        }
    }

    private void recordHistory(WorkOrder order, WorkOrderStatus from,
                               WorkOrderStatus to, String note, User changedBy) {
        WorkOrderStatusHistory history = WorkOrderStatusHistory.builder()
                .workOrder(order)
                .fromStatus(from)
                .toStatus(to)
                .changedBy(changedBy)
                .note(note)
                .build();
        historyRepository.save(history);
    }

    private LocalDateTime calculateSlaDueDate(Priority priority) {
        int hours = switch (priority) {
            case URGENT -> 4;
            case HIGH -> 8;
            case MEDIUM -> 24;
            case LOW -> 48;
        };
        return LocalDateTime.now().plusHours(hours);
    }

    private String generateCode() {
        long count = workOrderRepository.count() + 1;
        return "WO-%d-%05d".formatted(LocalDateTime.now().getYear(), count);
    }

    private WorkOrder findOrder(Long id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Work order not found: " + id));
    }

    private User getCurrentUser() {
        String email = getCurrentUserEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "Authenticated user not found"));
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
