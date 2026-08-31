package com.meridian.keystone.repository;

import com.meridian.keystone.domain.User;
import com.meridian.keystone.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByRoleAndActiveTrue(UserRole role);
    boolean existsByEmail(String email);
}
