package com.ctms.audit;

import com.ctms.entity.AuditLog;
import com.ctms.entity.Study;
import com.ctms.entity.Users;
import com.ctms.repository.AuditLogRepository;
import com.ctms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(String username, Study study, String action, String entityType,
                    String entityId, String oldValue, String newValue, String ipAddress) {
        Users user = username != null
                ? userRepository.findByUsername(username).orElse(null)
                : null;

        String previousHash = auditLogRepository.findLatest()
                .map(AuditLog::getCurrentHash)
                .orElse("GENESIS");

        String rawData = (username + action + entityType + entityId + newValue + LocalDateTime.now());
        String currentHash = sha256(previousHash + rawData);

        AuditLog log = AuditLog.builder()
                .user(user)
                .study(study)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .previousHash(previousHash)
                .currentHash(currentHash)
                .ipAddress(ipAddress)
                .timestamp(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Hashing failed", e);
        }
    }
}
