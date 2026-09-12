package com.ctms.service;

import com.ctms.audit.AuditService;
import com.ctms.dto.StudyDTOs.*;
import com.ctms.entity.Study;
import com.ctms.entity.Users;
import com.ctms.exception.DatabaseLockViolationException;
import com.ctms.repository.StudyRepository;
import com.ctms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudyService {

    private final StudyRepository studyRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public StudyResponse createStudy(CreateStudyRequest req, String username) {
        Users sponsor = req.getSponsorId() != null
                ? userRepository.findById(req.getSponsorId()).orElseThrow(() -> new IllegalArgumentException("Sponsor not found"))
                : null;

        Study study = Study.builder()
                .studyTitle(req.getStudyTitle())
                .sponsor(sponsor)
                .phase(req.getPhase())
                .therapeuticArea(req.getTherapeuticArea())
                .protocolVersion(req.getProtocolVersion())
                .targetEnrollment(req.getTargetEnrollment())
                .irbApprovalDate(req.getIrbApprovalDate())
                .regulatoryApprovalDate(req.getRegulatoryApprovalDate())
                .primaryEndpoint(req.getPrimaryEndpoint())
                .build();

        studyRepository.save(study);
        auditService.log(username, study, "CREATE_STUDY", "Study", String.valueOf(study.getId()), null, study.getStudyTitle(), "system");
        return toResponse(study);
    }

    public List<StudyResponse> getAllStudies() {
        return studyRepository.findAll().stream().map(this::toResponse).toList();
    }

    public StudyResponse getStudy(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public StudyResponse updateStudy(Long id, CreateStudyRequest req, String username) {
        Study study = findById(id);
        if (study.isDatabaseLocked()) {
            study.setDatabaseLocked(false);
            auditService.log(username, study, "DATABASE_UNLOCK_ON_EDIT", "Study", String.valueOf(id), "LOCKED", "UNLOCKED", "system");
        }

        String old = study.getStudyTitle();
        study.setStudyTitle(req.getStudyTitle());
        study.setPhase(req.getPhase());
        study.setTherapeuticArea(req.getTherapeuticArea());
        study.setProtocolVersion(req.getProtocolVersion());
        study.setTargetEnrollment(req.getTargetEnrollment());
        study.setPrimaryEndpoint(req.getPrimaryEndpoint());

        studyRepository.save(study);
        auditService.log(username, study, "UPDATE_STUDY", "Study", String.valueOf(id), old, req.getStudyTitle(), "system");
        return toResponse(study);
    }

    @Transactional
    public void lockDatabase(Long id, String username) {
        Study study = findById(id);
        study.setDatabaseLocked(true);
        studyRepository.save(study);
        auditService.log(username, study, "DATABASE_LOCK", "Study", String.valueOf(id), "UNLOCKED", "LOCKED", "system");
    }

    @Transactional
    public void unlockDatabase(Long id, String username) {
        Study study = findById(id);
        study.setDatabaseLocked(false);
        studyRepository.save(study);
        auditService.log(username, study, "DATABASE_UNLOCK", "Study", String.valueOf(id), "LOCKED", "UNLOCKED", "system");
    }

    public Study findById(Long id) {
        return studyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Study not found: " + id));
    }

    public StudyResponse toResponse(Study s) {
        StudyResponse r = new StudyResponse();
        r.setId(s.getId());
        r.setStudyTitle(s.getStudyTitle());
        r.setSponsorName(s.getSponsor() != null ? s.getSponsor().getUsername() : null);
        r.setPhase(s.getPhase());
        r.setTherapeuticArea(s.getTherapeuticArea());
        r.setStudyStatus(s.getStudyStatus());
        r.setProtocolVersion(s.getProtocolVersion());
        r.setTargetEnrollment(s.getTargetEnrollment());
        r.setActualEnrollment(s.getActualEnrollment());
        r.setIrbApprovalDate(s.getIrbApprovalDate());
        r.setRegulatoryApprovalDate(s.getRegulatoryApprovalDate());
        r.setFirstParticipantIn(s.getFirstParticipantIn());
        r.setLastParticipantOut(s.getLastParticipantOut());
        r.setPrimaryEndpoint(s.getPrimaryEndpoint());
        r.setDatabaseLocked(s.isDatabaseLocked());
        r.setCreatedAt(s.getCreatedAt());
        return r;
    }
}
