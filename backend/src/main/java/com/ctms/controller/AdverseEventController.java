package com.ctms.controller;
import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.service.AdverseEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/adverse-events")
@RequiredArgsConstructor
public class AdverseEventController {
    private final AdverseEventService aeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR')")
    public ResponseEntity<AEResponse> report(@Valid @RequestBody AERequest req,
                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(aeService.reportAE(req, user.getUsername()));
    }
    @GetMapping("/study/{studyId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR','SPONSOR','SITE_COORDINATOR')")
    public ResponseEntity<List<AEResponse>> getByStudy(@PathVariable Long studyId) {
        return ResponseEntity.ok(aeService.getByStudy(studyId));
    }
    @PutMapping("/{id}/sae")
    @PreAuthorize("hasAnyRole('ADMIN','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR')")
    public ResponseEntity<AEResponse> escalate(@PathVariable Long id,
                                                @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(aeService.escalateToSAE(id, user.getUsername()));
    }
}