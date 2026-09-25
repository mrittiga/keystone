package com.meridian.keystone.controller;

import com.meridian.keystone.dto.*;
import com.meridian.keystone.service.CustomerInteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerInteractionController {
    private final CustomerInteractionService service;

    @PostMapping("/work-orders/{workOrderId}/feedback")
    public ResponseEntity<Map<String, Object>> feedback(@PathVariable Long workOrderId, @Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.ok(service.saveFeedback(workOrderId, request));
    }

    @PostMapping("/work-orders/{workOrderId}/payment")
    public ResponseEntity<Map<String, Object>> payment(@PathVariable Long workOrderId, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(service.createPayment(workOrderId, request));
    }

    @PostMapping("/work-orders/{workOrderId}/photos")
    public ResponseEntity<Map<String, Object>> photo(@PathVariable Long workOrderId, @Valid @RequestBody PhotoMetadataRequest request) {
        return ResponseEntity.ok(service.savePhoto(workOrderId, request));
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@Valid @RequestBody ChatMessageRequest request) {
        return ResponseEntity.ok(service.saveChat(request));
    }

    @GetMapping("/chat")
    public ResponseEntity<List<Map<String, Object>>> chatHistory() {
        return ResponseEntity.ok(service.getChatHistory());
    }
}
