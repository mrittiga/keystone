package com.meridian.keystone.controller;

import com.meridian.keystone.dto.*;
import com.meridian.keystone.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer and site management")
@SecurityRequirement(name = "bearerAuth")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "List all customers")
    public ResponseEntity<PageResponse<CustomerDTO>> getAllCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(customerService.getAllCustomers(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<CustomerDTO> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "Create a new customer")
    public ResponseEntity<CustomerDTO> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerService.createCustomer(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "Update a customer")
    public ResponseEntity<CustomerDTO> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.ok(customerService.updateCustomer(id, request));
    }

    @GetMapping("/{id}/sites")
    @PreAuthorize("authenticated")
    @Operation(summary = "List sites for a customer")
    public ResponseEntity<PageResponse<SiteDTO>> getSites(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(customerService.getSitesByCustomer(id, page, size));
    }

    @PostMapping("/{id}/sites")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "Create a site for a customer")
    public ResponseEntity<SiteDTO> createSite(
            @PathVariable Long id,
            @Valid @RequestBody CreateSiteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerService.createSite(id, request));
    }
}
