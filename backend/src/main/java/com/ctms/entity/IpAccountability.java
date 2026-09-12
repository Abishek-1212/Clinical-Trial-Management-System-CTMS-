package com.ctms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ip_accountability")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IpAccountability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "study_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Study study;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Site site;

    @Column(nullable = false)
    private String batchNumber;

    @Column(nullable = false)
    private String kitNumber;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantityReceived = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantityDispensed = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantityReturned = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantityDestroyed = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer currentBalance = 0;

    private LocalDate expiryDate;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
