package com.ctms.service;

import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.entity.Participant.ParticipantStatus;
import com.ctms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
@RequiredArgsConstructor
public class AnalyticsService {
    private final StudyRepository studyRepository;
    private final ParticipantRepository participantRepository;
    private final AdverseEventRepository aeRepository;
    private final DataQueryRepository queryRepository;
    private final UserRepository userRepository;

    public List<EnrollmentAnalytics> getEnrollmentAnalytics() {
        return studyRepository.findAll().stream().map(study -> {
            EnrollmentAnalytics a = new EnrollmentAnalytics();
            a.setStudyId(study.getId());
            a.setStudyTitle(study.getStudyTitle());
            a.setTargetEnrollment(study.getTargetEnrollment() != null ? study.getTargetEnrollment() : 0);
            a.setActualEnrollment(study.getActualEnrollment());

            double pct = a.getTargetEnrollment() > 0
                    ? (a.getActualEnrollment() * 100.0 / a.getTargetEnrollment()) : 0;
            a.setEnrollmentPercentage(Math.min(100.0, pct));

            // Enrollment by site
            Map<String, Long> bySite = participantRepository.findByStudyId(study.getId()).stream()
                    .filter(p -> p.getSite() != null)
                    .collect(Collectors.groupingBy(p -> p.getSite().getSiteName(), Collectors.counting()));
            a.setEnrollmentBySite(bySite);

            // Status breakdown
            Map<String, Long> statusMap = Arrays.stream(ParticipantStatus.values())
                    .collect(Collectors.toMap(
                            Enum::name,
                            s -> participantRepository.countByStudyIdAndStatus(study.getId(), s)
                    ));
            a.setStatusBreakdown(statusMap);
            return a;
        }).toList();
    }

    public SystemHealth getSystemHealth() {
        SystemHealth h = new SystemHealth();
        h.setStatus("UP");
        h.setTotalUsers(userRepository.count());
        h.setActiveStudies(studyRepository.findActiveStudies().size());
        h.setTotalParticipants(participantRepository.count());
        h.setOpenQueries(queryRepository.findAll().stream()
                .filter(q -> q.getQueryStatus() == com.ctms.entity.DataQuery.QueryStatus.OPEN).count());
        h.setOverdueSAEs(aeRepository.findOverdueSAEs(LocalDateTime.now().minusHours(24)).size());
        h.setTimestamp(LocalDateTime.now());
        return h;
    }
}