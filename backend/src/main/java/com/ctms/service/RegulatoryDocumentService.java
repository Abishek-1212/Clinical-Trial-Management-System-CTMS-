package com.ctms.service;

import com.ctms.audit.AuditService;
import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.entity.*;
import com.ctms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RegulatoryDocumentService {

    private final RegulatoryDocumentRepository docRepository;
    private final StudyRepository studyRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public RegulatoryDocument upload(DocumentRequest req, String username) {
        Study study = studyRepository.findById(req.getStudyId())
                .orElseThrow(() -> new IllegalArgumentException("Study not found"));
        Users uploader = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        RegulatoryDocument doc = RegulatoryDocument.builder()
                .study(study)
                .documentType(req.getDocumentType())
                .documentTitle(req.getDocumentTitle())
                .version(req.getVersion())
                .effectiveDate(req.getEffectiveDate())
                .submittedTo(req.getSubmittedTo())
                .submissionDate(req.getSubmissionDate())
                .approvalStatus(req.getApprovalStatus() != null
                        ? RegulatoryDocument.ApprovalStatus.valueOf(req.getApprovalStatus())
                        : null)
                .fileReference(req.getFileReference())
                .uploadedBy(uploader)
                .build();

        docRepository.save(doc);
        auditService.log(username, study, "UPLOAD_DOCUMENT", "RegulatoryDocument",
                String.valueOf(doc.getId()), null, doc.getDocumentTitle(), "system");
        return doc;
    }

    public List<RegulatoryDocument> getByStudy(Long studyId) {
        return docRepository.findByStudyId(studyId);
    }
}
