package com.ctms.service;

import com.ctms.audit.AuditService;
import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.entity.*;
import com.ctms.exception.DatabaseLockViolationException;
import com.ctms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EcrfService {

    private final EcrfDataRepository ecrfDataRepository;
    private final ParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final StudyRepository studyRepository;
    private final AuditService auditService;

    @Transactional
    public EcrfResponse saveEntry(EcrfSaveRequest req, String username) {
        Participant participant = participantRepository.findById(req.getParticipantId())
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));

        if (participant.getStudy().isDatabaseLocked())
            throw new DatabaseLockViolationException("Database is locked — eCRF entry not allowed");

        Users user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String fieldId = req.getFieldId() != null && !req.getFieldId().isBlank() 
                ? req.getFieldId() : (req.getFieldName() != null && !req.getFieldName().isBlank() ? req.getFieldName() : "FIELD_01");
        String formId = req.getFormId() != null && !req.getFormId().isBlank() ? req.getFormId() : "FORM_GENERAL";
        String eSig = req.getElectronicSignature() != null && !req.getElectronicSignature().isBlank() 
                ? req.getElectronicSignature() : "ESIG_" + username.toUpperCase();

        EcrfData data = EcrfData.builder()
                .participant(participant)
                .visitId(req.getVisitId())
                .formId(formId)
                .fieldId(fieldId)
                .fieldValue(req.getFieldValue())
                .unit(req.getUnit())
                .enteredBy(user)
                .electronicSignature(eSig)
                .queryStatus(EcrfData.QueryStatus.NONE)
                .build();

        ecrfDataRepository.save(data);

        auditService.log(username, participant.getStudy(), "ECRF_SAVE", "EcrfData",
                String.valueOf(data.getId()), null, req.getFieldValue(), "system");

        return toResponse(data);
    }

    @Transactional
    public EcrfResponse modifyEntry(Long id, EcrfModifyRequest req, String username) {
        EcrfData data = ecrfDataRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("eCRF record not found"));

        if (data.getParticipant().getStudy().isDatabaseLocked())
            throw new DatabaseLockViolationException("Database is locked — modifications not allowed");

        Users modifier = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String oldValue = data.getFieldValue();
        data.setFieldValue(req.getFieldValue());
        data.setModifiedBy(modifier);
        data.setModifiedAt(LocalDateTime.now());
        data.setModificationReason(req.getModificationReason());

        ecrfDataRepository.save(data);
        auditService.log(username, data.getParticipant().getStudy(), "ECRF_MODIFY", "EcrfData",
                String.valueOf(id), oldValue, req.getFieldValue(), "system");

        return toResponse(data);
    }

    public List<EcrfResponse> getForVisit(Long participantId, Long visitId) {
        return ecrfDataRepository.findByParticipantIdAndVisitId(participantId, visitId)
                .stream().map(this::toResponse).toList();
    }

    public EcrfResponse toResponse(EcrfData d) {
        EcrfResponse r = new EcrfResponse();
        r.setId(d.getId());
        r.setParticipantId(d.getParticipant().getId());
        r.setVisitId(d.getVisitId());
        r.setFormId(d.getFormId());
        r.setFieldId(d.getFieldId());
        r.setFieldName(d.getFieldId());
        r.setFieldValue(d.getFieldValue());
        r.setUnit(d.getUnit());
        r.setEnteredBy(d.getEnteredBy().getUsername());
        r.setEnteredAt(d.getEnteredAt());
        r.setModifiedBy(d.getModifiedBy() != null ? d.getModifiedBy().getUsername() : null);
        r.setModifiedAt(d.getModifiedAt());
        r.setModificationReason(d.getModificationReason());
        r.setQueryStatus(d.getQueryStatus());
        return r;
    }
}

