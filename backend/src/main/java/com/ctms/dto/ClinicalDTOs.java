package com.ctms.dto;

import com.ctms.entity.AdverseEvent.*;
import com.ctms.entity.EcrfData.QueryStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ClinicalDTOs {

    // ---- eCRF ----
    @Data
    public static class EcrfSaveRequest {
        @NotNull private Long participantId;
        @NotNull private Long visitId;
        private String formId;
        private String fieldId;
        private String fieldName;
        private String fieldValue;
        private String unit;
        private String electronicSignature;
    }

    @Data
    public static class EcrfModifyRequest {
        private String fieldValue;
        @NotBlank private String modificationReason;
        private String electronicSignature;
    }

    @Data
    public static class EcrfResponse {
        private Long id;
        private Long participantId;
        private Long visitId;
        private String formId;
        private String fieldId;
        private String fieldName;
        private String fieldValue;
        private String unit;
        private String enteredBy;
        private LocalDateTime enteredAt;
        private String modifiedBy;
        private LocalDateTime modifiedAt;
        private String modificationReason;
        private QueryStatus queryStatus;
    }

    // ---- Adverse Events ----
    @Data
    public static class AERequest {
        @NotNull private Long participantId;
        @NotNull private Long studyId;
        private String aeDescription;
        private String eventTerm;
        @NotNull private LocalDate onsetDate;
        private LocalDate resolutionDate;
        @NotNull private Severity severity;
        @NotNull private Causality causality;
        private boolean isSerious;
        private String seriousCriteria;
        private Outcome outcome;
    }

    @Data
    public static class AEResponse {
        private Long id;
        private String subjectId;
        private Long studyId;
        private String aeDescription;
        private String eventTerm;
        private LocalDate onsetDate;
        private LocalDate resolutionDate;
        private Severity severity;
        private Causality causality;
        private boolean isSerious;
        private String seriousCriteria;
        private Outcome outcome;
        private String reportedBy;
        private LocalDateTime reportedAt;
        private LocalDateTime saeEscalatedAt;
        private boolean susarSubmitted;
        private Long hoursUntilDeadline;
    }

    // ---- IP Accountability ----
    @Data
    public static class IpReceiptRequest {
        @NotNull private Long studyId;
        private Long siteId;
        @NotBlank private String batchNumber;
        @NotBlank private String kitNumber;
        @NotNull @Min(1) private Integer quantityReceived;
        private LocalDate expiryDate;
    }

    @Data
    public static class IpDispenseRequest {
        private Long ipRecordId;
        private String kitNumber;
        private Long studyId;
        private Long participantId;
        private Integer quantity;
        private Integer quantityDispensed;
        private String dosageInstruction;
    }

    // ---- Data Query ----
    @Data
    public static class QueryRequest {
        @NotNull private Long ecrfDataId;
        @NotNull private Long studyId;
        @NotBlank private String queryText;
    }

    @Data
    public static class QueryResponseRequest {
        @NotBlank private String responseText;
        @NotBlank private String electronicSignature;
    }

    // ---- Regulatory Document ----
    @Data
    public static class DocumentRequest {
        @NotNull private Long studyId;
        @NotBlank private String documentType;
        @NotBlank private String documentTitle;
        private String version;
        private LocalDate effectiveDate;
        private String submittedTo;
        private LocalDate submissionDate;
        private String approvalStatus;
        private String fileReference;
    }

    // ---- Analytics ----
    @Data
    public static class EnrollmentAnalytics {
        private Long studyId;
        private String studyTitle;
        private Integer targetEnrollment;
        private Integer actualEnrollment;
        private double enrollmentPercentage;
        private Map<String, Long> enrollmentBySite;
        private Map<String, Long> statusBreakdown;
    }

    @Data
    public static class SystemHealth {
        private String status;
        private long totalUsers;
        private long activeStudies;
        private long totalParticipants;
        private long openQueries;
        private long overdueSAEs;
        private LocalDateTime timestamp;
    }
}
