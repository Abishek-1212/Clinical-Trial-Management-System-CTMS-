package com.ctms.controller;

import com.ctms.dto.StudyDTOs.*;
import com.ctms.service.StudyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/studies")
@RequiredArgsConstructor
public class StudyController {

    private final StudyService studyService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SPONSOR')")
    public ResponseEntity<StudyResponse> create(@Valid @RequestBody CreateStudyRequest req,
                                                 @AuthenticationPrincipal UserDetails user) {
        String username = user != null ? user.getUsername() : "admin";
        return ResponseEntity.ok(studyService.createStudy(req, username));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StudyResponse>> list() {
        return ResponseEntity.ok(studyService.getAllStudies());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StudyResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(studyService.getStudy(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SPONSOR','PRINCIPAL_INVESTIGATOR')")
    public ResponseEntity<StudyResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody CreateStudyRequest req,
                                                 @AuthenticationPrincipal UserDetails user) {
        String username = user != null ? user.getUsername() : "admin";
        return ResponseEntity.ok(studyService.updateStudy(id, req, username));
    }

    @PostMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('ADMIN','SPONSOR','DATA_MANAGER')")
    public ResponseEntity<Void> lockDatabase(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails user) {
        String username = user != null ? user.getUsername() : "admin";
        studyService.lockDatabase(id, username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN','SPONSOR','DATA_MANAGER')")
    public ResponseEntity<Void> unlockDatabase(@PathVariable Long id,
                                                @AuthenticationPrincipal UserDetails user) {
        String username = user != null ? user.getUsername() : "admin";
        studyService.unlockDatabase(id, username);
        return ResponseEntity.ok().build();
    }
}
