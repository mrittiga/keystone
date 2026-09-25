package com.meridian.keystone.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

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

    private String name;

    @Column(name = "password_hash")
    private String passwordHash;

    @Builder.Default
    private Boolean active = true;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Builder.Default
    private Set roles = new HashSet<>();

    @ManyToMany
    @JoinTable(
        name = "user_sites",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "site_id")
    )
    @Builder.Default
    private Set sites = new HashSet<>();

    public void setPassword(String password) {
        this.passwordHash = password;
    }

    public String getPassword() {
        return this.passwordHash;
    }
}