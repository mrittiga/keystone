package com.meridian.keystone.controller;

import com.meridian.keystone.service.CustomerInteractionService;
import com.meridian.keystone.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CustomerInteractionControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private CustomerInteractionService service;
    @MockBean private JwtTokenProvider jwtTokenProvider;

    @Test
    void unauthenticatedCustomerInteractionIsRejected() throws Exception {
        mockMvc.perform(post("/api/customer/chat")
            .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"status\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void nonCustomerRoleCannotUseCustomerInteractionApi() throws Exception {
        mockMvc.perform(post("/api/customer/chat")
                        .with(user("manager@example.com").roles("MANAGER"))
            .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"status\"}"))
                .andExpect(status().isForbidden());
    }
}
