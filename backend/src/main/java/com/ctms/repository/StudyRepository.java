package com.ctms.repository;

import com.ctms.entity.Study;
import com.ctms.entity.Study.StudyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface StudyRepository extends JpaRepository<Study, Long> {
    List<Study> findBySponsorId(Long sponsorId);
    List<Study> findByStudyStatus(StudyStatus status);
    @Query("SELECT s FROM Study s WHERE s.studyStatus IN ('ACTIVE', 'SETUP') AND (s.databaseLocked IS NULL OR s.databaseLocked = false)")
    List<Study> findActiveStudies();
}
