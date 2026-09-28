package com.meridian.keystone.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sites")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(nullable = false)
private String name;

private String address;

private String city;

private String postcode;

@Column(name = "contact_person")
private String contactPerson;

@Column(name = "contact_phone")
private String contactPhone;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "customer_id")
@ToString.Exclude
@EqualsAndHashCode.Exclude
private Customer customer;

@Column(name = "created_at", nullable = false, updatable = false)
private LocalDateTime createdAt;

@Column(name = "updated_at")
private LocalDateTime updatedAt;

@PrePersist
public void prePersist() {
    if (createdAt == null) {
        createdAt = LocalDateTime.now();
    }
}

@PreUpdate
public void preUpdate() {
    updatedAt = LocalDateTime.now();
}

}
