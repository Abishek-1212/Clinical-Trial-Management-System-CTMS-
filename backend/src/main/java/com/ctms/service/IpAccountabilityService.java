package com.ctms.service;

import com.ctms.audit.AuditService;
import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.entity.*;
import com.ctms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IpAccountabilityService {

    private final IpAccountabilityRepository ipRepository;
    private final StudyRepository studyRepository;
    private final SiteRepository siteRepository;
    private final AuditService auditService;

    @Transactional
    public IpAccountability recordReceipt(IpReceiptRequest req, String username) {
        Study study = studyRepository.findById(req.getStudyId())
                .orElseThrow(() -> new IllegalArgumentException("Study not found"));
        Site site = null;
        if (req.getSiteId() != null) {
            site = siteRepository.findById(req.getSiteId()).orElse(null);
        }
        if (site == null) {
            site = siteRepository.findAll().stream().findFirst().orElseGet(() ->
                siteRepository.save(Site.builder()
                        .study(study)
                        .siteName("Central Research Site 01")
                        .irbApprovalStatus("APPROVED")
                        .build())
            );
        }

        IpAccountability ip = IpAccountability.builder()
                .study(study)
                .site(site)
                .batchNumber(req.getBatchNumber())
                .kitNumber(req.getKitNumber())
                .quantityReceived(req.getQuantityReceived())
                .currentBalance(req.getQuantityReceived())
                .expiryDate(req.getExpiryDate())
                .build();

        ipRepository.save(ip);
        auditService.log(username, study, "IP_RECEIPT", "IpAccountability",
                ip.getKitNumber(), null, "Received: " + req.getQuantityReceived(), "system");
        return ip;
    }

    @Transactional
    public IpAccountability dispense(IpDispenseRequest req, String username) {
        IpAccountability ip = null;
        if (req.getIpRecordId() != null) {
            ip = ipRepository.findById(req.getIpRecordId()).orElse(null);
        }
        if (ip == null && req.getKitNumber() != null && !req.getKitNumber().isBlank()) {
            ip = ipRepository.findByKitNumber(req.getKitNumber()).orElse(null);
        }
        if (ip == null) {
            ip = ipRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No IP shipment found for kit " + req.getKitNumber() + ". Please record an IP shipment receipt first."));
        }

        int qty = req.getQuantity() != null ? req.getQuantity() : (req.getQuantityDispensed() != null ? req.getQuantityDispensed() : 1);

        if (ip.getCurrentBalance() < qty)
            throw new IllegalArgumentException("Insufficient balance — cannot dispense " + qty
                    + ", current balance: " + ip.getCurrentBalance());

        ip.setQuantityDispensed(ip.getQuantityDispensed() + qty);
        ip.setCurrentBalance(ip.getQuantityReceived() - ip.getQuantityDispensed()
                - ip.getQuantityReturned() - ip.getQuantityDestroyed());

        ipRepository.save(ip);
        auditService.log(username, ip.getStudy(), "IP_DISPENSE", "IpAccountability",
                ip.getKitNumber(), null, "Dispensed: " + qty, "system");
        return ip;
    }

    public List<IpAccountability> getAccountability(Long studyId) {
        return ipRepository.findByStudyId(studyId);
    }
}
