package com.ctms.repository;

import com.ctms.entity.RegulatoryDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RegulatoryDocumentRepository extends JpaRepository<RegulatoryDocument, Long> {
    List<RegulatoryDocument> findByStudyId(Long studyId);
    List<RegulatoryDocument> findByStudyIdAndDocumentType(Long studyId, String documentType);
}
