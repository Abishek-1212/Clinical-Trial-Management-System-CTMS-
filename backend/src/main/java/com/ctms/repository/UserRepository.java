package com.ctms.repository;

import com.ctms.entity.Users;
import com.ctms.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<Users, Long> {
    Optional<Users> findByUsername(String username);
    Optional<Users> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<Users> findByRole(Role role);
    List<Users> findByIsActiveTrue();
}
