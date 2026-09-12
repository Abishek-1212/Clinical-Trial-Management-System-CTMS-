package com.ctms.controller;

import com.ctms.dto.ClinicalDTOs.*;
import com.ctms.entity.DataQuery;
import com.ctms.service.DataQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/queries")
@RequiredArgsConstructor
public class QueryController {

    private final DataQueryService queryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DATA_MANAGER')")
    public ResponseEntity<DataQuery> raise(@Valid @RequestBody QueryRequest req,
                                            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(queryService.raiseQuery(req, user.getUsername()));
    }

    @PutMapping("/{id}/respond")
    @PreAuthorize("hasAnyRole('ADMIN','SUB_INVESTIGATOR','SITE_COORDINATOR','DATA_MANAGER')")
    public ResponseEntity<DataQuery> respond(@PathVariable Long id,
                                              @Valid @RequestBody QueryResponseRequest req,
                                              @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(queryService.respondToQuery(id, req, user.getUsername()));
    }
}
