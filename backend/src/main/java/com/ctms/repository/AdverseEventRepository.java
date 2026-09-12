package com.ctms.repository;

import com.ctms.entity.AdverseEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface AdverseEventRepository extends JpaRepository<AdverseEvent, Long> {
    List<AdverseEvent> findByStudyId(Long studyId);
    List<AdverseEvent> findByParticipantId(Long participantId);
    List<AdverseEvent> findByStudyIdAndIsSerious(Long studyId, boolean isSerious);

    @Query("SELECT ae FROM AdverseEvent ae WHERE ae.isSerious = true AND ae.susarSubmitted = false AND ae.saeEscalatedAt < :deadline")
    List<AdverseEvent> findOverdueSAEs(LocalDateTime deadline);
}