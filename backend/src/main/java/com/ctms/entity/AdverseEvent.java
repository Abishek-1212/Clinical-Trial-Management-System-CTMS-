package com.ctms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "adverse_events")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdverseEvent {

    public enum Severity {
        MILD, MODERATE, SEVERE, LIFE_THREATENING, FATAL
    }

    public enum Causality {
        UNRELATED, UNLIKELY, POSSIBLE, PROBABLE, DEFINITE
    }

    public enum Outcome {
        RECOVERED, RECOVERING, NOT_RECOVERED, SEQUELAE, FATAL, UNKNOWN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Participant participant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Study study;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String aeDescription;

    @Column(nullable = false)
    private LocalDate onsetDate;

    private LocalDate resolutionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Causality causality;

    @Column(nullable = false)
    @Builder.Default
    private boolean isSerious = false;

    private String seriousCriteria;

    @Enumerated(EnumType.STRING)
    private Outcome outcome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users reportedBy;

    @CreationTimestamp
    private LocalDateTime reportedAt;

    // Timestamp when SAE was escalated — used for 24-hour rule
    private LocalDateTime saeEscalatedAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean susarSubmitted = false;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
