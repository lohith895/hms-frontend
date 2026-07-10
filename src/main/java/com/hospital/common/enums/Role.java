package com.hospital.common.enums;

import java.util.Set;

public enum Role {
    ROLE_ADMIN(Set.of(
            "admin:all", 
            "patient:read", "patient:write", "patient:delete",
            "doctor:read", "doctor:write", "doctor:delete",
            "nurse:read", "nurse:write", "nurse:delete",
            "appointment:read", "appointment:write",
            "billing:read", "billing:write",
            "pharmacy:read", "pharmacy:write",
            "lab:read", "lab:write",
            "audit:read"
    )),
    ROLE_DOCTOR(Set.of(
            "doctor:read",
            "patient:read",
            "appointment:read", "appointment:write",
            "medicalrecord:read", "medicalrecord:write",
            "prescription:read", "prescription:write"
    )),
    ROLE_NURSE(Set.of(
            "nurse:read",
            "patient:read",
            "appointment:read",
            "medicalrecord:read",
            "prescription:read"
    )),
    ROLE_PATIENT(Set.of(
            "patient:read", "patient:write",
            "appointment:read", "appointment:write",
            "medicalrecord:read",
            "prescription:read",
            "billing:read"
    )),
    ROLE_PHARMACIST(Set.of(
            "pharmacy:read", "pharmacy:write",
            "prescription:read", "prescription:write"
    )),
    ROLE_LAB_TECHNICIAN(Set.of(
            "lab:read", "lab:write"
    ));

    private final Set<String> permissions;

    Role(Set<String> permissions) {
        this.permissions = permissions;
    }

    public Set<String> getPermissions() {
        return permissions;
    }
}
