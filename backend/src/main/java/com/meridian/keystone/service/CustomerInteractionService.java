package com.meridian.keystone.service;

import com.meridian.keystone.domain.User;
import com.meridian.keystone.domain.UserRole;
import com.meridian.keystone.dto.*;
import com.meridian.keystone.repository.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class CustomerInteractionService {
    private final JdbcTemplate jdbc;
    private final UserRepository userRepository;
    private final RestClient restClient;
    private final String chatProviderUrl;
    private final String chatProviderApiKey;
    private final String chatProvider;

    public CustomerInteractionService(
            JdbcTemplate jdbc,
            UserRepository userRepository,
            RestClient.Builder restClientBuilder,
            @Value("${chat.provider-url:}") String chatProviderUrl,
            @Value("${chat.provider-api-key:}") String chatProviderApiKey,
            @Value("${chat.provider:gemini}") String chatProvider) {
        this.jdbc = jdbc;
        this.userRepository = userRepository;
        this.restClient = restClientBuilder.build();
        this.chatProviderUrl = chatProviderUrl;
        this.chatProviderApiKey = chatProviderApiKey;
        this.chatProvider = chatProvider;
    }

    @Transactional
    public Map<String, Object> saveFeedback(Long workOrderId, FeedbackRequest request) {
        User user = customerUser();
        verifyOwnership(workOrderId, user);
        jdbc.update("""
                INSERT INTO customer_feedback(work_order_id, customer_id, rating, comment)
                VALUES (?, ?, ?, ?)
                ON CONFLICT (work_order_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
                """, workOrderId, user.getCustomerOrg().getId(), request.getRating(), request.getComment());
        return Map.of("workOrderId", workOrderId, "rating", request.getRating(), "status", "SAVED");
    }

    @Transactional
    public Map<String, Object> createPayment(Long workOrderId, PaymentRequest request) {
        User user = customerUser();
        verifyOwnership(workOrderId, user);
        throw new IllegalStateException("Payment provider is not configured");
    }

    @Transactional
    public Map<String, Object> savePhoto(Long workOrderId, PhotoMetadataRequest request) {
        User user = customerUser();
        verifyOwnership(workOrderId, user);
        if (!request.getStorageKey().startsWith("customer/" + user.getCustomerOrg().getId() + "/")) {
            throw new AccessDeniedException("Photo storage key is not valid for this customer");
        }
        jdbc.update("INSERT INTO work_order_photos(work_order_id, customer_id, file_name, storage_key, content_type) VALUES (?, ?, ?, ?, ?)",
                workOrderId, user.getCustomerOrg().getId(), request.getFileName(), request.getStorageKey(), request.getContentType());
        return Map.of("workOrderId", workOrderId, "fileName", request.getFileName(), "storageKey", request.getStorageKey());
    }

    @Transactional
    public Map<String, Object> saveChat(ChatMessageRequest request) {
        User user = customerUser();
        jdbc.update("INSERT INTO customer_chat_messages(customer_id, sender, message) VALUES (?, 'CUSTOMER', ?)", user.getCustomerOrg().getId(), request.getMessage());
        String reply = answerAccountQuestion(user, request.getMessage());
        if (reply == null) {
            if (chatProviderUrl.isBlank() || chatProviderApiKey.isBlank()) {
                throw new IllegalStateException("Chat provider is not configured");
            }
                reply = requestChatProvider(request.getMessage(), user);
        }
        jdbc.update("INSERT INTO customer_chat_messages(customer_id, sender, message) VALUES (?, 'BOT', ?)", user.getCustomerOrg().getId(), reply);
        return Map.of("reply", reply);
    }

        private String requestChatProvider(String message, User user) {
        Map<?, ?> response;
        if ("gemini".equalsIgnoreCase(chatProvider)) {
            response = restClient.post()
                    .uri(chatProviderUrl + "?key={key}", chatProviderApiKey)
                .body(Map.of("contents", List.of(Map.of("parts", List.of(Map.of(
                    "text", "You are Keystone customer support. Answer concisely and safely. Customer id: "
                        + user.getCustomerOrg().getId() + ". Question: " + message))))))
                .retrieve()
                .body(Map.class);
            return extractGeminiReply(response);
        }
        response = restClient.post()
            .uri(chatProviderUrl)
            .header("Authorization", "Bearer " + chatProviderApiKey)
            .body(Map.of("message", message, "customerId", user.getCustomerOrg().getId()))
            .retrieve()
            .body(Map.class);
        return response == null || response.get("reply") == null
            ? "Support is temporarily unavailable. Please submit a service request."
            : response.get("reply").toString();
        }

        private String extractGeminiReply(Map<?, ?> response) {
        if (response == null) return "Support is temporarily unavailable. Please submit a service request.";
        List<?> candidates = (List<?>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) return "Support is temporarily unavailable. Please submit a service request.";
        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
        List<?> parts = content == null ? List.of() : (List<?>) content.get("parts");
        if (parts.isEmpty()) return "Support is temporarily unavailable. Please submit a service request.";
        return String.valueOf(((Map<?, ?>) parts.get(0)).get("text"));
        }

    private String answerAccountQuestion(User user, String message) {
        String question = message.toLowerCase();
        Long customerId = user.getCustomerOrg().getId();
        if (question.contains("status") || question.contains("request") || question.contains("order")) {
            Integer open = jdbc.queryForObject("SELECT COUNT(*) FROM work_orders WHERE customer_id = ? AND status NOT IN ('CLOSED','CANCELLED')", Integer.class, customerId);
            List<String> latestRows = jdbc.query("SELECT code || ' is ' || LOWER(REPLACE(status, '_', ' ')) AS summary FROM work_orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1", (result, row) -> result.getString("summary"), customerId);
            String latest = latestRows.isEmpty() ? null : latestRows.get(0);
            return latest == null ? "You do not have any service requests yet." : "You have " + open + " open request(s). Your latest request, " + latest + ".";
        }
        if (question.contains("site") || question.contains("location")) {
            List<String> sites = jdbc.query("SELECT name FROM sites WHERE customer_id = ? ORDER BY name", (result, row) -> result.getString("name"), customerId);
            return sites.isEmpty() ? "There are no sites linked to your account yet." : "Your linked sites are: " + String.join(", ", sites) + ".";
        }
        if (question.contains("pay") || question.contains("invoice") || question.contains("cost")) {
            Integer completed = jdbc.queryForObject("SELECT COUNT(*) FROM work_orders WHERE customer_id = ? AND status = 'COMPLETED'", Integer.class, customerId);
            return completed == 0 ? "There are no completed invoices ready for payment." : "You have " + completed + " completed invoice(s). Open a completed request to review payment options.";
        }
        return null;
    }

    public List<Map<String, Object>> getChatHistory() {
        User user = customerUser();
        return jdbc.queryForList("SELECT id, sender, message, created_at FROM customer_chat_messages WHERE customer_id = ? ORDER BY created_at", user.getCustomerOrg().getId());
    }

    private User customerUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));
        if (user.getRole() != UserRole.CUSTOMER || user.getCustomerOrg() == null) throw new AccessDeniedException("Customer account required");
        return user;
    }

    private void verifyOwnership(Long workOrderId, User user) {
        Integer count = jdbc.queryForObject("SELECT COUNT(*) FROM work_orders WHERE id = ? AND customer_id = ?", Integer.class, workOrderId, user.getCustomerOrg().getId());
        if (count == null || count != 1) throw new AccessDeniedException("Work order is not owned by this customer");
    }
}
