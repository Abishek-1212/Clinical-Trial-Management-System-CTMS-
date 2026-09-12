package com.ctms.repository;

import com.ctms.entity.DataQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DataQueryRepository extends JpaRepository<DataQuery, Long> {
    List<DataQuery> findByStudyId(Long studyId);
    List<DataQuery> findByStudyIdAndQueryStatus(Long studyId, DataQuery.QueryStatus queryStatus);
    List<DataQuery> findByEcrfDataId(Long ecrfDataId);
}
