package com.ctms.controller;

import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.service.EcrfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ecrf")
@RequiredArgsConstructor
public class EcrfController {

    private final EcrfService ecrfService;

    @GetMapping("/{participantId}/{visitId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUB_INVESTIGATOR','SITE_COORDINATOR','DATA_MANAGER','PRINCIPAL_INVESTIGATOR','PARTICIPANT')")
    public ResponseEntity<List<EcrfResponse>> get(@PathVariable Long participantId, @PathVariable Long visitId) {
        return ResponseEntity.ok(ecrfService.getForVisit(participantId, visitId));
    }

    @PostMapping("/data")
    @PreAuthorize("hasAnyRole('ADMIN','SUB_INVESTIGATOR','SITE_COORDINATOR')")
    public ResponseEntity<EcrfResponse> save(@Valid @RequestBody EcrfSaveRequest req,
                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ecrfService.saveEntry(req, user.getUsername()));
    }

    @PutMapping("/data/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SITE_COORDINATOR','PRINCIPAL_INVESTIGATOR','SUB_INVESTIGATOR','DATA_MANAGER')")
    public ResponseEntity<EcrfResponse> modify(@PathVariable Long id,
                                                @Valid @RequestBody EcrfModifyRequest req,
                                                @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ecrfService.modifyEntry(id, req, user.getUsername()));
    }
}
