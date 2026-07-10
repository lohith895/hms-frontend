package com.hospital.users.service;

import com.hospital.users.entity.AuditLog;
import com.hospital.users.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void log(String username, String action, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog(username, action, details, ipAddress);
        auditLogRepository.save(auditLog);
    }
}
