package com.meridian.keystone.controller;

import com.meridian.keystone.domain.UserRole;
import com.meridian.keystone.dto.AuthRequest;
import com.meridian.keystone.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerAndLoginAsManagerDispatcherTechnicianAndCustomer() throws Exception {
        UserRole[] roles = {UserRole.MANAGER, UserRole.DISPATCHER, UserRole.TECHNICIAN, UserRole.CUSTOMER};

        for (UserRole role : roles) {
            String email = role.name().toLowerCase() + "_test@example.com";

            RegisterRequest regReq = new RegisterRequest();
            regReq.setName(role.name() + " User");
            regReq.setEmail(email);
            regReq.setPassword("password123");
            regReq.setRole(role);

            mockMvc.perform(post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(regReq)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.user.email").value(email))
                    .andExpect(jsonPath("$.user.roles[0]").value(role.name()));

            AuthRequest loginReq = new AuthRequest();
            loginReq.setEmail(email);
            loginReq.setPassword("password123");

            mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(loginReq)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").exists())
                    .andExpect(jsonPath("$.user.email").value(email))
                    .andExpect(jsonPath("$.user.roles[0]").value(role.name()));
        }
    }
}
