package com.ctms.repository;

import com.ctms.entity.Participant;
import com.ctms.entity.Participant.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ParticipantRepository extends JpaRepository<Participant, Long> {
    List<Participant> findByStudyId(Long studyId);
    List<Participant> findBySiteId(Long siteId);
    List<Participant> findByStudyIdAndStatus(Long studyId, ParticipantStatus status);
    Optional<Participant> findBySubjectId(String subjectId);
    Optional<Participant> findByUserId(Long userId);
    long countByStudyId(Long studyId);
    long countByStudyIdAndStatus(Long studyId, ParticipantStatus status);
}
