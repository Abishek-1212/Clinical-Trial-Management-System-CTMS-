package com.ctms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "data_queries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DataQuery {

    public enum QueryStatus {
        OPEN, RESPONDED, CLOSED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ecrf_data_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private EcrfData ecrfData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Study study;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String queryText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users raisedBy;

    private LocalDateTime raisedAt;

    @Column(columnDefinition = "TEXT")
    private String responseText;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responded_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Users respondedBy;

    private LocalDateTime respondedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private QueryStatus queryStatus = QueryStatus.OPEN;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
