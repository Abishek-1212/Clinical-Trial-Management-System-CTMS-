package com.ctms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "regulatory_documents")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegulatoryDocument {

    public enum ApprovalStatus {
        SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, EXPIRED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Study study;

    @Column(nullable = false)
    private String documentType;

    @Column(nullable = false)
    private String documentTitle;

    private String version;
    private LocalDate effectiveDate;
    private String submittedTo;
    private LocalDate submissionDate;

    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus;

    private String fileReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users uploadedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
