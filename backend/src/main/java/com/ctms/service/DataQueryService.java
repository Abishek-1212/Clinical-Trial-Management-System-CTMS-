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
public class DataQueryService {

    private final DataQueryRepository queryRepository;
    private final EcrfDataRepository ecrfDataRepository;
    private final StudyRepository studyRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public DataQuery raiseQuery(QueryRequest req, String username) {
        EcrfData ecrfData = ecrfDataRepository.findById(req.getEcrfDataId())
                .orElseThrow(() -> new IllegalArgumentException("eCRF record not found"));
        Study study = studyRepository.findById(req.getStudyId())
                .orElseThrow(() -> new IllegalArgumentException("Study not found"));
        Users raiser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        DataQuery query = DataQuery.builder()
                .ecrfData(ecrfData)
                .study(study)
                .queryText(req.getQueryText())
                .raisedBy(raiser)
                .build();

        queryRepository.save(query);

        // Update eCRF query status
        ecrfData.setQueryStatus(EcrfData.QueryStatus.OPEN);
        ecrfDataRepository.save(ecrfData);

        auditService.log(username, study, "RAISE_QUERY", "DataQuery",
                String.valueOf(query.getId()), null, req.getQueryText(), "system");
        return query;
    }

    @Transactional
    public DataQuery respondToQuery(Long id, QueryResponseRequest req, String username) {
        DataQuery query = queryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Query not found"));
        Users responder = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        query.setResponseText(req.getResponseText());
        query.setRespondedBy(responder);
        query.setRespondedAt(LocalDateTime.now());
        query.setQueryStatus(DataQuery.QueryStatus.RESPONDED);

        queryRepository.save(query);

        // Update eCRF query status
        EcrfData ecrfData = query.getEcrfData();
        ecrfData.setQueryStatus(EcrfData.QueryStatus.RESPONDED);
        ecrfDataRepository.save(ecrfData);

        auditService.log(username, query.getStudy(), "RESPOND_QUERY", "DataQuery",
                String.valueOf(id), "OPEN", "RESPONDED", "system");
        return query;
    }

    public List<DataQuery> getByStudy(Long studyId) {
        return queryRepository.findByStudyId(studyId);
    }
}
