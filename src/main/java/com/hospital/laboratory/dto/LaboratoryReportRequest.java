package com.hospital.laboratory.dto;

import jakarta.validation.constraints.NotNull;

public class LaboratoryReportRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @NotNull(message = "Laboratory Test ID is required")
    private Long labTestId;

    public LaboratoryReportRequest() {
    }

    public LaboratoryReportRequest(Long patientId, Long doctorId, Long labTestId) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.labTestId = labTestId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Long getLabTestId() {
        return labTestId;
    }

    public void setLabTestId(Long labTestId) {
        this.labTestId = labTestId;
    }
}
