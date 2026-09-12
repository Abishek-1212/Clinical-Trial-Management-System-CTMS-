package com.ctms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "participants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Participant {

    public enum ParticipantStatus {
        SCREENING, ENROLLED, ACTIVE, COMPLETED, WITHDRAWN, SCREEN_FAILED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Study study;

    @Column(name = "subject_id", unique = true, nullable = false, length = 50)
    private String subjectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Site site;

    private LocalDate enrollmentDate;

    // AES-256 encrypted — blinded access only
    @Column(name = "arm_assignment")
    private String armAssignment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ParticipantStatus status = ParticipantStatus.SCREENING;

    private String consentVersion;

    @Column(nullable = false)
    private LocalDate consentDate;

    private LocalDate screeningDate;
    private LocalDate withdrawalDate;
    private String withdrawalReason;

    // FK to the Users table for the participant's portal account
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users user;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
