package com.meridian.keystone.service;

import com.meridian.keystone.domain.Customer;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.domain.UserRole;
import com.meridian.keystone.repository.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkOrderServiceAccessTest {
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private WorkOrderStatusHistoryRepository historyRepository;
    @Mock private UserRepository userRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private SiteRepository siteRepository;
    @Mock private PartRepository partRepository;
    @Mock private PartUsageRepository partUsageRepository;
    @Mock private TimeLogRepository timeLogRepository;

    @InjectMocks private WorkOrderService service;

    @AfterEach
    void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @Test
    void customerListQueriesOnlyItsOwnCustomer() {
        Customer customer = Customer.builder().id(11L).name("Customer").code("C11").build();
        User user = User.builder().email("customer@example.com").role(UserRole.CUSTOMER).active(true).customerOrg(customer).build();
        authenticate(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(workOrderRepository.findByCustomerId(any(), any())).thenReturn(new PageImpl<>(List.of()));

        service.getAllWorkOrders(0, 20, null, null);

        verify(workOrderRepository).findByCustomerId(eq(11L), any());
        verify(workOrderRepository, never()).findAll(any(org.springframework.data.domain.Pageable.class));
    }

    private void authenticate(String email) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null, List.of()));
    }
}
