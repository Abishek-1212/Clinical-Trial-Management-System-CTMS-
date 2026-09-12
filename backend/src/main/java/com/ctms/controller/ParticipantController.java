package com.ctms.controller;

import com.ctms.dto.ParticipantDTOs.*;
import com.ctms.service.ParticipantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SITE_COORDINATOR','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR')")
    public ResponseEntity<ParticipantResponse> register(@Valid @RequestBody RegisterParticipantRequest req,
                                                         @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(participantService.register(req, user.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SITE_COORDINATOR','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR','DATA_MANAGER','SPONSOR')")
    public ResponseEntity<List<ParticipantResponse>> getAll() {
        return ResponseEntity.ok(participantService.getAll());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('PARTICIPANT','ADMIN','SITE_COORDINATOR','PRINCIPAL_INVESTIGATOR','SUB_INVESTIGATOR','DATA_MANAGER')")
    public ResponseEntity<ParticipantResponse> getMyParticipant(@AuthenticationPrincipal UserDetails user) {
        try {
            return ResponseEntity.ok(participantService.getMyParticipant(user.getUsername()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SITE_COORDINATOR','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR','DATA_MANAGER','SPONSOR','PARTICIPANT')")
    public ResponseEntity<ParticipantResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(participantService.getParticipant(id));
    }

    @GetMapping("/study/{studyId}")
    @PreAuthorize("hasAnyRole('ADMIN','SITE_COORDINATOR','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR','DATA_MANAGER','SPONSOR','PARTICIPANT')")
    public ResponseEntity<List<ParticipantResponse>> getByStudy(@PathVariable Long studyId) {
        return ResponseEntity.ok(participantService.getByStudy(studyId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SITE_COORDINATOR','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR')")
    public ResponseEntity<ParticipantResponse> updateStatus(@PathVariable Long id,
                                                             @Valid @RequestBody StatusUpdateRequest req,
                                                             @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(participantService.updateStatus(id, req, user.getUsername()));
    }

    @PostMapping("/{id}/consent")
    @PreAuthorize("hasAnyRole('ADMIN','SITE_COORDINATOR','SUB_INVESTIGATOR','PRINCIPAL_INVESTIGATOR')")
    public ResponseEntity<ParticipantResponse> recordConsent(@PathVariable Long id,
                                                              @Valid @RequestBody ConsentRequest req,
                                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(participantService.recordConsent(id, req, user.getUsername()));
    }
}
