package com.meridian.keystone.service;

import com.meridian.keystone.domain.Customer;
import com.meridian.keystone.domain.Site;
import com.meridian.keystone.dto.*;
import com.meridian.keystone.repository.CustomerRepository;
import com.meridian.keystone.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;

    public PageResponse<CustomerDTO> getAllCustomers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<CustomerDTO> result = customerRepository.findAll(pageable)
                .map(CustomerDTO::from);
        return PageResponse.from(result);
    }

    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return CustomerDTO.from(customer);
    }

    @Transactional
    public CustomerDTO createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Customer code already exists: " + request.getCode());
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .code(request.getCode().toUpperCase())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .address(request.getAddress())
                .build();

        Customer saved = customerRepository.save(customer);
        log.info("Customer created: {}", saved.getCode());
        return CustomerDTO.from(saved);
    }

    @Transactional
    public CustomerDTO updateCustomer(Long id, CreateCustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        customer.setName(request.getName());
        customer.setContactEmail(request.getContactEmail());
        customer.setContactPhone(request.getContactPhone());
        customer.setAddress(request.getAddress());

        Customer saved = customerRepository.save(customer);
        log.info("Customer updated: {}", saved.getCode());
        return CustomerDTO.from(saved);
    }

    public PageResponse<SiteDTO> getSitesByCustomer(Long customerId, int page, int size) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        Page<SiteDTO> result = siteRepository.findByCustomerId(customerId, pageable)
                .map(SiteDTO::from);
        return PageResponse.from(result);
    }

    @Transactional
    public SiteDTO createSite(Long customerId, CreateSiteRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId));

        Site site = Site.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .postcode(request.getPostcode())
                .contactPerson(request.getContactPerson())
                .contactPhone(request.getContactPhone())
                .customer(customer)
                .build();

        Site saved = siteRepository.save(site);
        log.info("Site created: {} for customer: {}", saved.getName(), customer.getCode());
        return SiteDTO.from(saved);
    }
}
