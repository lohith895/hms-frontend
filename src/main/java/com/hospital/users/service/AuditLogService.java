package com.hospital.users.service;

public interface AuditLogService {
    void log(String username, String action, String details, String ipAddress);
}
