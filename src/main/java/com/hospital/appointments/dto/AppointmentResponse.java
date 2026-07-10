package com.hospital.appointments.dto;

import com.hospital.common.enums.AppointmentStatus;
import com.hospital.common.enums.PatientVisitStatus;
import java.time.LocalDateTime;

public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private LocalDateTime appointmentDateTime;
    private AppointmentStatus status;
    private PatientVisitStatus visitStatus;
    private String reason;
    private String notes;

    // Constructors
    public AppointmentResponse() {
    }

    public AppointmentResponse(Long id, Long patientId, String patientName, Long doctorId, String doctorName, LocalDateTime appointmentDateTime, AppointmentStatus status, PatientVisitStatus visitStatus, String reason, String notes) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.appointmentDateTime = appointmentDateTime;
        this.status = status;
        this.visitStatus = visitStatus;
        this.reason = reason;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public LocalDateTime getAppointmentDateTime() {
        return appointmentDateTime;
    }

    public void setAppointmentDateTime(LocalDateTime appointmentDateTime) {
        this.appointmentDateTime = appointmentDateTime;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public PatientVisitStatus getVisitStatus() {
        return visitStatus;
    }

    public void setVisitStatus(PatientVisitStatus visitStatus) {
        this.visitStatus = visitStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
