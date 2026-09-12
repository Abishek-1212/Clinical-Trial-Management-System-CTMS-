package com.ctms.repository;

import com.ctms.entity.IpAccountability;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface IpAccountabilityRepository extends JpaRepository<IpAccountability, Long> {
    List<IpAccountability> findByStudyId(Long studyId);
    List<IpAccountability> findByStudyIdAndSiteId(Long studyId, Long siteId);
    Optional<IpAccountability> findByKitNumber(String kitNumber);
    List<IpAccountability> findByExpiryDateBefore(LocalDate date);
}
