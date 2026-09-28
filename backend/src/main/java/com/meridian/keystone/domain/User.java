package com.meridian.keystone.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false, unique = true)
private String email;

@Column(nullable = false)
private String name;

@Column(name = "password_hash", nullable = false)
private String passwordHash;

@Builder.Default
@Column(nullable = false)
private Boolean active = true;

@Enumerated(EnumType.STRING)
@Column(nullable = false)
private UserRole role;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "customer_id")
private Customer customerOrg;

@CreationTimestamp
@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;

@Column(name = "updated_at")
private LocalDateTime updatedAt;

public void setPassword(String password) {
    this.passwordHash = password;
}

public String getPassword() {
    return this.passwordHash;
}
}
