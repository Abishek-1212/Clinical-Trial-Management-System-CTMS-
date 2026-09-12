package com.ctms.controller;

import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.entity.IpAccountability;
import com.ctms.service.IpAccountabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ip")
@RequiredArgsConstructor
public class IpController {

    private final IpAccountabilityService ipService;

    @PostMapping("/receipt")
    @PreAuthorize("hasAnyRole('ADMIN','SITE_COORDINATOR','PRINCIPAL_INVESTIGATOR')")
    public ResponseEntity<IpAccountability> receipt(@Valid @RequestBody IpReceiptRequest req,
                                                     @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ipService.recordReceipt(req, user.getUsername()));
    }

    @PostMapping("/dispense")
    @PreAuthorize("hasAnyRole('ADMIN','SUB_INVESTIGATOR','SITE_COORDINATOR')")
    public ResponseEntity<IpAccountability> dispense(@Valid @RequestBody IpDispenseRequest req,
                                                      @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ipService.dispense(req, user.getUsername()));
    }

    @GetMapping("/accountability/{studyId}")
    @PreAuthorize("hasAnyRole('ADMIN','SITE_COORDINATOR','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR','SPONSOR')")
    public ResponseEntity<List<IpAccountability>> accountability(@PathVariable Long studyId) {
        return ResponseEntity.ok(ipService.getAccountability(studyId));
    }
}
