package com.ctms.service;

import com.ctms.audit.AuditService;
import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.entity.*;
import com.ctms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdverseEventService {

    private final AdverseEventRepository aeRepository;
    private final ParticipantRepository participantRepository;
    private final StudyRepository studyRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public AEResponse reportAE(AERequest req, String username) {
        Participant participant = participantRepository.findById(req.getParticipantId())
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        Study study = studyRepository.findById(req.getStudyId())
                .orElseThrow(() -> new IllegalArgumentException("Study not found"));
        Users reporter = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (req.getOnsetDate().isAfter(java.time.LocalDate.now()))
            throw new IllegalArgumentException("AE onset date cannot be in the future");
        if (participant.getEnrollmentDate() != null && req.getOnsetDate().isBefore(participant.getEnrollmentDate()))
            throw new IllegalArgumentException("AE onset date cannot precede enrollment date");

        String desc = req.getEventTerm() != null && !req.getEventTerm().isBlank() 
                ? req.getEventTerm() : (req.getAeDescription() != null && !req.getAeDescription().isBlank() ? req.getAeDescription() : "AE Event");

        AdverseEvent ae = AdverseEvent.builder()
                .participant(participant)
                .study(study)
                .aeDescription(desc)
                .onsetDate(req.getOnsetDate())
                .resolutionDate(req.getResolutionDate())
                .severity(req.getSeverity())
                .causality(req.getCausality())
                .isSerious(req.isSerious())
                .seriousCriteria(req.getSeriousCriteria())
                .outcome(req.getOutcome())
                .reportedBy(reporter)
                .saeEscalatedAt(req.isSerious() ? LocalDateTime.now() : null)
                .build();

        aeRepository.save(ae);
        auditService.log(username, study, "REPORT_AE", "AdverseEvent",
                String.valueOf(ae.getId()), null, ae.getAeDescription(), "system");

        return toResponse(ae);
    }

    public List<AEResponse> getByStudy(Long studyId) {
        return aeRepository.findByStudyId(studyId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public AEResponse escalateToSAE(Long id, String username) {
        AdverseEvent ae = aeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("AE not found"));
        ae.setSerious(true);
        ae.setSaeEscalatedAt(LocalDateTime.now());
        aeRepository.save(ae);
        auditService.log(username, ae.getStudy(), "ESCALATE_SAE", "AdverseEvent",
                String.valueOf(id), "NOT_SERIOUS", "SERIOUS", "system");
        return toResponse(ae);
    }

    // Scheduled job — flags overdue SAEs every 5 minutes
    @Scheduled(fixedDelay = 300000)
    public void checkOverdueSAEs() {
        LocalDateTime deadline = LocalDateTime.now().minusHours(24);
        List<AdverseEvent> overdue = aeRepository.findOverdueSAEs(deadline);
        // TODO: integrate real notification service — currently logs to audit
        overdue.forEach(ae -> auditService.log("SYSTEM", ae.getStudy(),
                "SAE_OVERDUE", "AdverseEvent", String.valueOf(ae.getId()),
                null, "SAE overdue — 24h reporting window exceeded", "system"));
    }

    public AEResponse toResponse(AdverseEvent ae) {
        AEResponse r = new AEResponse();
        r.setId(ae.getId());
        r.setSubjectId(ae.getParticipant().getSubjectId());
        r.setStudyId(ae.getStudy().getId());
        r.setAeDescription(ae.getAeDescription());
        r.setEventTerm(ae.getAeDescription());
        r.setOnsetDate(ae.getOnsetDate());
        r.setResolutionDate(ae.getResolutionDate());
        r.setSeverity(ae.getSeverity());
        r.setCausality(ae.getCausality());
        r.setSerious(ae.isSerious());
        r.setSeriousCriteria(ae.getSeriousCriteria());
        r.setOutcome(ae.getOutcome());
        r.setReportedBy(ae.getReportedBy().getUsername());
        r.setReportedAt(ae.getReportedAt());
        r.setSaeEscalatedAt(ae.getSaeEscalatedAt());
        r.setSusarSubmitted(ae.isSusarSubmitted());
        if (ae.isSerious() && ae.getSaeEscalatedAt() != null && !ae.isSusarSubmitted()) {
            long hoursElapsed = ChronoUnit.HOURS.between(ae.getSaeEscalatedAt(), LocalDateTime.now());
            r.setHoursUntilDeadline(Math.max(0, 24 - hoursElapsed));
        }
        return r;
    }
}
