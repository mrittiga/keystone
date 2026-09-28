package com.meridian.keystone.service;

import com.meridian.keystone.domain.Customer;
import com.meridian.keystone.domain.Site;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.dto.CreateCustomerRequest;
import com.meridian.keystone.dto.CreateSiteRequest;
import com.meridian.keystone.dto.CustomerDTO;
import com.meridian.keystone.dto.SiteDTO;
import com.meridian.keystone.repository.CustomerRepository;
import com.meridian.keystone.repository.SiteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

private final CustomerRepository customerRepository;
private final SiteRepository siteRepository;

public Page<CustomerDTO> getAllCustomers(int page, int size) {
    return customerRepository
            .findAll(PageRequest.of(page, size))
            .map(CustomerDTO::from);
}

public CustomerDTO getCustomerById(Long id) {
    Customer customer = customerRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Customer not found with id: " + id
                    ));

    return CustomerDTO.from(customer);
}

@Transactional
public CustomerDTO createCustomer(CreateCustomerRequest request) {

    Customer customer = Customer.builder()
            .name(request.getName())
            .code(request.getCode())
            .email(request.getEmail())
            .phone(request.getPhone())
            .address(request.getAddress())
            .build();

    Customer savedCustomer =
            customerRepository.save(customer);

    return CustomerDTO.from(savedCustomer);
}

@Transactional
public CustomerDTO updateCustomer(
        Long id,
        CreateCustomerRequest request) {

    Customer customer = customerRepository.findById(id)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Customer not found with id: " + id
                    ));

    customer.setName(request.getName());
    customer.setCode(request.getCode());
    customer.setEmail(request.getEmail());
    customer.setPhone(request.getPhone());
    customer.setAddress(request.getAddress());

    Customer updatedCustomer =
            customerRepository.save(customer);

    return CustomerDTO.from(updatedCustomer);
}

public Page<SiteDTO> getSitesByCustomer(
        Long customerId,
        int page,
        int size) {

    return siteRepository
            .findByCustomerId(
                    customerId,
                    PageRequest.of(page, size)
            )
            .map(SiteDTO::from);
}

@Transactional
public SiteDTO createSite(
        Long customerId,
        CreateSiteRequest request) {

    Customer customer =
            customerRepository.findById(customerId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Customer not found with id: "
                                            + customerId
                            ));

    Site site = Site.builder()
            .name(request.getName())
            .address(request.getAddress())
            .city(request.getCity())
            .postcode(request.getPostcode())
            .contactPerson(request.getContactPerson())
            .contactPhone(request.getContactPhone())
            .customer(customer)
            .build();

    Site savedSite = siteRepository.save(site);

    return SiteDTO.from(savedSite);
}

public List<SiteDTO> getCustomerSites(User user) {

    List<SiteDTO> result = new ArrayList<>();

    if (user == null || user.getCustomerOrg() == null) {
        return result;
    }

    Long customerId = user.getCustomerOrg().getId();

    if (customerId == null) {
        return result;
    }

    List<Site> sites = siteRepository.findByCustomerId(
            customerId,
            PageRequest.of(0, Integer.MAX_VALUE)
    ).getContent();

    for (Site site : sites) {
        if (site != null) {
            result.add(SiteDTO.from(site));
        }
    }

    return result;
}

public boolean hasAccessToSite(
        User user,
        Long siteId) {

    if (user == null
            || siteId == null
            || user.getCustomerOrg() == null) {
        return false;
    }

    Long customerId = user.getCustomerOrg().getId();

    if (customerId == null) {
        return false;
    }

    return siteRepository.findById(siteId)
            .map(site ->
                    site.getCustomer() != null
                            && site.getCustomer().getId() != null
                            && site.getCustomer().getId().equals(customerId)
            )
            .orElse(false);
}

}
