package com.ctms.controller;

import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.entity.RegulatoryDocument;
import com.ctms.service.RegulatoryDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final RegulatoryDocumentService docService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','REGULATORY_AFFAIRS','SITE_COORDINATOR')")
    public ResponseEntity<RegulatoryDocument> upload(@Valid @RequestBody DocumentRequest req,
                                                      @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(docService.upload(req, user.getUsername()));
    }

    @GetMapping("/{studyId}")
    @PreAuthorize("hasAnyRole('ADMIN','REGULATORY_AFFAIRS','PRINCIPAL_INVESTIGATOR','SPONSOR','SITE_COORDINATOR')")
    public ResponseEntity<List<RegulatoryDocument>> list(@PathVariable Long studyId) {
        return ResponseEntity.ok(docService.getByStudy(studyId));
    }
}
