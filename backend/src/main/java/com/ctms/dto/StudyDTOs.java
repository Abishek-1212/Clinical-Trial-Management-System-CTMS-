package com.ctms.dto;

import com.ctms.entity.Study.Phase;
import com.ctms.entity.Study.StudyStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class StudyDTOs {

    @Data
    public static class CreateStudyRequest {
        @NotBlank
        @Size(max = 500)
        private String studyTitle;

        private Long sponsorId;

        @NotNull
        private Phase phase;

        private String therapeuticArea;

        @Pattern(regexp = "^v\\d+\\.\\d+$", message = "Invalid protocol version format")
        private String protocolVersion;
        private Integer targetEnrollment;
        private LocalDate irbApprovalDate;
        private LocalDate regulatoryApprovalDate;
        private String primaryEndpoint;
    }

    @Data
    public static class StudyResponse {
        private Long id;
        private String studyTitle;
        private String sponsorName;
        private Phase phase;
        private String therapeuticArea;
        private StudyStatus studyStatus;
        private String protocolVersion;
        private Integer targetEnrollment;
        private Integer actualEnrollment;
        private LocalDate irbApprovalDate;
        private LocalDate regulatoryApprovalDate;
        private LocalDate firstParticipantIn;
        private LocalDate lastParticipantOut;
        private String primaryEndpoint;
        private boolean databaseLocked;
        private LocalDateTime createdAt;
    }
}
