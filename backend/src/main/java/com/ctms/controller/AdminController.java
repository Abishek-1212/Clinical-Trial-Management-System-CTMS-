package com.ctms.controller;

import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.entity.AuditLog;
import com.ctms.repository.AuditLogRepository;
import com.ctms.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuditLogRepository auditLogRepository;
    private final AnalyticsService analyticsService;

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AuditLog>> auditLogs(Pageable pageable) {
        return ResponseEntity.ok(auditLogRepository.findAll(pageable));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasAnyRole('ADMIN','SPONSOR','PRINCIPAL_INVESTIGATOR','DATA_MANAGER')")
    public ResponseEntity<List<EnrollmentAnalytics>> analytics() {
        return ResponseEntity.ok(analyticsService.getEnrollmentAnalytics());
    }

    @GetMapping("/system-health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemHealth> systemHealth() {
        return ResponseEntity.ok(analyticsService.getSystemHealth());
    }
}
