package com.ctms.config;

import com.ctms.entity.*;
import com.ctms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudyRepository studyRepository;
    private final RegulatoryDocumentRepository regulatoryDocumentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Checking user directory in MySQL database...");

        String defaultPassword = passwordEncoder.encode("Demo@1234");

        seedUserIfMissing("sponsor", "sponsor@ctms.com", defaultPassword, Role.SPONSOR, "PharmaCorp", "GCPSP001");
        seedUserIfMissing("admin", "admin@ctms.com", defaultPassword, Role.ADMIN, "PharmaCorp", null);
        seedUserIfMissing("pi_user", "pi@ctms.com", defaultPassword, Role.PRINCIPAL_INVESTIGATOR, "City Hospital", "GCPPI002");
        seedUserIfMissing("subinv", "subinv@ctms.com", defaultPassword, Role.SUB_INVESTIGATOR, "City Hospital", "GCPSI003");
        seedUserIfMissing("coordinator", "coord@ctms.com", defaultPassword, Role.SITE_COORDINATOR, "City Hospital", "GCPSC004");
        seedUserIfMissing("datamanager", "dm@ctms.com", defaultPassword, Role.DATA_MANAGER, "DataCRO", "GCPDM005");
        seedUserIfMissing("regaffairs", "reg@ctms.com", defaultPassword, Role.REGULATORY_AFFAIRS, "Regulatory Board", "GCPRA006");
        seedUserIfMissing("participant1", "participant@ctms.com", defaultPassword, Role.PARTICIPANT, "Patient", null);
        

        log.info("User directory seeding verified in MySQL database.");
    }

    private void seedUserIfMissing(String username, String email, String passwordHash, Role role, String affiliation, String gcpCert) {
        if (!userRepository.existsByUsername(username)) {
            Users u = Users.builder()
                    .username(username)
                    .email(email)
                    .passwordHash(passwordHash)
                    .role(role)
                    .institutionalAffiliation(affiliation)
                    .gcpCertNumber(gcpCert)
                    .gcpExpiryDate(gcpCert != null ? LocalDate.of(2026, 12, 31) : null)
                    .isActive(true)
                    .passwordChangedAt(LocalDateTime.now())
                    .build();
            userRepository.save(u);
            log.info("Seeded user into database: {} ({})", username, role);
        }
    }
}

