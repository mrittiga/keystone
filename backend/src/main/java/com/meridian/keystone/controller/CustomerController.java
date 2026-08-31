package com.meridian.keystone.controller;

import com.meridian.keystone.domain.Customer;
import com.meridian.keystone.domain.Site;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.repository.CustomerRepository;
import com.meridian.keystone.repository.SiteRepository;
import com.meridian.keystone.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customers", description = "Customer and site management")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("authenticated")
    @Operation(summary = "List customers")
    public ResponseEntity<List<Map<String, Object>>> listCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        Page<Customer> customers = customerRepository.findAll(PageRequest.of(page, size));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Customer c : customers.getContent()) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", c.getId());
            m.put("name", c.getName());
            m.put("code", c.getCode());
            m.put("contactEmail", c.getContactEmail() != null ? c.getContactEmail() : "");
            m.put("contactPhone", c.getContactPhone() != null ? c.getContactPhone() : "");
            m.put("address", c.getAddress() != null ? c.getAddress() : "");
            m.put("createdAt", c.getCreatedAt() != null ? c.getCreatedAt().toString() : "");
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "Create customer")
    public ResponseEntity<Map<String, Object>> createCustomer(
            @RequestBody Map<String, String> body) {

        Customer customer = Customer.builder()
                .name(body.get("name"))
                .code(body.getOrDefault("code", "CUST_" + System.currentTimeMillis()))
                .contactEmail(body.get("contactEmail"))
                .contactPhone(body.get("contactPhone"))
                .address(body.get("address"))
                .build();

        Customer saved = customerRepository.save(customer);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        result.put("code", saved.getCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("authenticated")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<Map<String, Object>> getCustomer(@PathVariable Long id) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));
        Map<String, Object> result = new HashMap<>();
        result.put("id", c.getId());
        result.put("name", c.getName());
        result.put("code", c.getCode());
        result.put("contactEmail", c.getContactEmail() != null ? c.getContactEmail() : "");
        result.put("address", c.getAddress() != null ? c.getAddress() : "");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/sites")
    @PreAuthorize("authenticated")
    @Operation(summary = "List sites for customer")
    public ResponseEntity<List<Map<String, Object>>> listSites(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        Page<Site> sites = siteRepository.findByCustomerId(id, PageRequest.of(page, size));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Site s : sites.getContent()) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("name", s.getName());
            m.put("address", s.getAddress() != null ? s.getAddress() : "");
            m.put("city", s.getCity() != null ? s.getCity() : "");
            m.put("postcode", s.getPostcode() != null ? s.getPostcode() : "");
            m.put("customerId", s.getCustomer().getId());
            m.put("customerName", s.getCustomer().getName());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/sites")
    @PreAuthorize("hasRole('DISPATCHER') or hasRole('MANAGER')")
    @Operation(summary = "Create site for customer")
    public ResponseEntity<Map<String, Object>> createSite(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + id));

        Site site = Site.builder()
                .name(body.get("name"))
                .address(body.get("address"))
                .city(body.get("city"))
                .postcode(body.get("postcode"))
                .contactPerson(body.get("contactPerson"))
                .contactPhone(body.get("contactPhone"))
                .customer(customer)
                .build();

        Site saved = siteRepository.save(site);
        Map<String, Object> result = new HashMap<>();
        result.put("id", saved.getId());
        result.put("name", saved.getName());
        result.put("customerId", saved.getCustomer().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/my-sites")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(summary = "Get sites for currently logged in customer")
    public ResponseEntity<List<Map<String, Object>>> getMySites(Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (user.getCustomerOrg() == null) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        Long customerId = user.getCustomerOrg().getId();
        Page<Site> sites = siteRepository.findByCustomerId(customerId, PageRequest.of(0, 100));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Site s : sites.getContent()) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("name", s.getName());
            m.put("address", s.getAddress() != null ? s.getAddress() : "");
            m.put("city", s.getCity() != null ? s.getCity() : "");
            m.put("postcode", s.getPostcode() != null ? s.getPostcode() : "");
            m.put("customerId", s.getCustomer().getId());
            m.put("customerName", s.getCustomer().getName());
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }
}

