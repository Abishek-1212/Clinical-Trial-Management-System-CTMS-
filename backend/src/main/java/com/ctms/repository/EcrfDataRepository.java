package com.ctms.repository;

import com.ctms.entity.EcrfData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EcrfDataRepository extends JpaRepository<EcrfData, Long> {
    List<EcrfData> findByParticipantIdAndVisitId(Long participantId, Long visitId);
    List<EcrfData> findByParticipantId(Long participantId);
    long countByParticipantIdAndVisitId(Long participantId, Long visitId);
}
