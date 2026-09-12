package com.ctms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "studies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Study {

    public enum Phase {
        PHASE_1, PHASE_2, PHASE_3, PHASE_4, PHASE_1_2, OBSERVATIONAL
    }

    public enum StudyStatus {
        SETUP, ACTIVE, SUSPENDED, COMPLETED, TERMINATED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "study_title", nullable = false, length = 500)
    private String studyTitle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sponsor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users sponsor;

    @Enumerated(EnumType.STRING)
    private Phase phase;

    private String therapeuticArea;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StudyStatus studyStatus = StudyStatus.SETUP;

    private String protocolVersion;

    private Integer targetEnrollment;

    @Column(nullable = false)
    @Builder.Default
    private Integer actualEnrollment = 0;

    private LocalDate irbApprovalDate;
    private LocalDate regulatoryApprovalDate;
    private LocalDate firstParticipantIn;
    private LocalDate lastParticipantOut;

    @Column(length = 1000)
    private String primaryEndpoint;

    @Column(nullable = false)
    @Builder.Default
    private boolean databaseLocked = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
