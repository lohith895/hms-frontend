package com.hospital.prescriptions.dto;

import com.hospital.common.enums.PrescriptionStatus;
import java.time.LocalDateTime;
import java.util.List;

public class PrescriptionResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long medicalRecordId;
    private LocalDateTime prescribedDate;
    private PrescriptionStatus status;
    private List<PrescriptionItemResponse> items;

    public PrescriptionResponse() {
    }

    public PrescriptionResponse(Long id, Long patientId, String patientName, Long doctorId, String doctorName, Long medicalRecordId, LocalDateTime prescribedDate, PrescriptionStatus status, List<PrescriptionItemResponse> items) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.medicalRecordId = medicalRecordId;
        this.prescribedDate = prescribedDate;
        this.status = status;
        this.items = items;
    }

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

    public Long getMedicalRecordId() {
        return medicalRecordId;
    }

    public void setMedicalRecordId(Long medicalRecordId) {
        this.medicalRecordId = medicalRecordId;
    }

    public LocalDateTime getPrescribedDate() {
        return prescribedDate;
    }

    public void setPrescribedDate(LocalDateTime prescribedDate) {
        this.prescribedDate = prescribedDate;
    }

    public PrescriptionStatus getStatus() {
        return status;
    }

    public void setStatus(PrescriptionStatus status) {
        this.status = status;
    }

    public List<PrescriptionItemResponse> getItems() {
        return items;
    }

    public void setItems(List<PrescriptionItemResponse> items) {
        this.items = items;
    }
}
