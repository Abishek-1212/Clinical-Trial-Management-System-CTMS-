package com.ctms.repository;

import com.ctms.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByStudyId(Long studyId, Pageable pageable);
    Page<AuditLog> findByUserId(Long userId, Pageable pageable);
    Page<AuditLog> findByEntityType(String entityType, Pageable pageable);

    @Query("SELECT a FROM AuditLog a ORDER BY a.id DESC LIMIT 1")
    Optional<AuditLog> findLatest();
}
