package com.ctms.repository;

import com.ctms.entity.Site;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findByStudyId(Long studyId);
    List<Site> findBySiteInvestigatorId(Long investigatorId);
}
