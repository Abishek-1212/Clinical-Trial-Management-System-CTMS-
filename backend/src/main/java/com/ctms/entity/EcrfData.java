package com.ctms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ecrf_data")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EcrfData {

    public enum QueryStatus {
        NONE, OPEN, RESPONDED, CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Participant participant;

    @Column(name = "visit_id", nullable = false)
    private Long visitId;

    @Column(nullable = false)
    private String formId;

    @Column(nullable = false)
    private String fieldId;

    @Column(columnDefinition = "TEXT")
    private String fieldValue;

    private String unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entered_by", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users enteredBy;

    @CreationTimestamp
    private LocalDateTime enteredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users modifiedBy;

    private LocalDateTime modifiedAt;

    @Column(columnDefinition = "TEXT")
    private String modificationReason;

    @Column(nullable = false)
    private String electronicSignature;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QueryStatus queryStatus = QueryStatus.NONE;
}
