package com.ctms.service;

import com.ctms.audit.AuditService;
import com.ctms.dto.AuthDTOs.*;
import com.ctms.entity.Participant;
import com.ctms.entity.Role;
import com.ctms.entity.Users;
import com.ctms.exception.GCPComplianceException;
import com.ctms.repository.ParticipantRepository;
import com.ctms.repository.UserRepository;
import com.ctms.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ParticipantRepository participantRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AuditService auditService;

    @Value("${app.max-login-attempts}")
    private int maxLoginAttempts;

    @Transactional
    public LoginResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("Username already taken");
        if (userRepository.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already registered");

        // GCP cert required for clinical staff
        if (req.getRole() != Role.PARTICIPANT && req.getRole() != Role.ADMIN) {
            if (req.getGcpCertNumber() == null || req.getGcpCertNumber().isBlank())
                throw new GCPComplianceException("GCP certification number is required for clinical staff");
        }

        Users user = Users.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .institutionalAffiliation(req.getInstitutionalAffiliation())
                .gcpCertNumber(req.getGcpCertNumber())
                .gcpExpiryDate(req.getGcpExpiryDate() != null ? LocalDate.parse(req.getGcpExpiryDate()) : null)
                .isActive(true)
                .passwordChangedAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        auditService.log(req.getUsername(), null, "REGISTER", "Users", null, null, req.getUsername(), "system");

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getUsername(), user.getEmail(), user.getRole(), user.getId());
    }

    @Transactional
    public LoginResponse login(LoginRequest req, String ipAddress) {
        String identifier = req.getUsername();
        Users user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseGet(() -> participantRepository.findBySubjectId(identifier)
                        .map(Participant::getUser)
                        .filter(Objects::nonNull)
                        .orElseThrow(() -> new BadCredentialsException("Invalid credentials")));

        if (!user.isActive())
            throw new DisabledException("Account is disabled");

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now()))
            throw new LockedException("Account locked until " + user.getLockedUntil());

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            auditService.log(user.getUsername(), null, "LOGIN", "Users", String.valueOf(user.getId()), null, "LOGIN_SUCCESS", ipAddress);

            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            return new LoginResponse(token, user.getUsername(), user.getEmail(), user.getRole(), user.getId());

        } catch (BadCredentialsException e) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= maxLoginAttempts) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(30));
            }
            userRepository.save(user);
            auditService.log(user.getUsername(), null, "LOGIN_FAILED", "Users", String.valueOf(user.getId()), null, "FAILED_ATTEMPT_" + attempts, ipAddress);
            throw e;
        }
    }
}
