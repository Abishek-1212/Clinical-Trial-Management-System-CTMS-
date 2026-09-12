package com.ctms.dto;

import com.ctms.entity.Participant.ParticipantStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ParticipantDTOs {

    @Data
    public static class RegisterParticipantRequest {
        @NotNull
        private Long studyId;

        private Long siteId;

        @NotNull
        private LocalDate consentDate;

        private String consentVersion;
        private LocalDate screeningDate;
    }

    @Data
    public static class ConsentRequest {
        @NotBlank
        private String consentVersion;

        @NotNull
        private LocalDate consentDate;

        @NotBlank
        private String electronicSignature;
    }

    @Data
    public static class StatusUpdateRequest {
        @NotNull
        private ParticipantStatus status;

        private String withdrawalReason;
    }

    @Data
    public static class ParticipantResponse {
        private Long id;
        private String subjectId;
        private Long studyId;
        private String studyTitle;
        private Long siteId;
        private String siteName;
        private LocalDate enrollmentDate;
        private ParticipantStatus status;
        private String consentVersion;
        private LocalDate consentDate;
        private LocalDate screeningDate;
        private LocalDate withdrawalDate;
        private String withdrawalReason;
        private LocalDateTime createdAt;
        // arm_assignment intentionally omitted — served only via blinded endpoint
    }
}
