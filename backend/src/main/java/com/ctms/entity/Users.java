package com.ctms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String institutionalAffiliation;
    private String gcpCertNumber;
    private LocalDate gcpExpiryDate;
    private String electronicSignatureHash;

    @CreationTimestamp
    private LocalDateTime createdDate;

    private LocalDateTime lastLogin;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private int failedLoginAttempts = 0;
    private LocalDateTime lockedUntil;
    private LocalDateTime passwordChangedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean mfaEnabled = false;
    private String mfaSecret;
}
