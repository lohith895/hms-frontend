package com.hospital.medicalrecords.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MedicalRecordRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private Long appointmentId;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Symptoms are required")
    private String symptoms;

    private String treatmentPlan;
    private String allergies;
    private String medicalHistory;
    private String notes;
    private java.time.LocalDate followUpDate;
    private String chronicConditions;
    private String vaccinationRecords;
    private String surgicalHistory;

    public MedicalRecordRequest() {
    }

    public MedicalRecordRequest(Long patientId, Long doctorId, Long appointmentId, String diagnosis, String symptoms, String treatmentPlan, String allergies, String medicalHistory, String notes, java.time.LocalDate followUpDate, String chronicConditions, String vaccinationRecords, String surgicalHistory) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentId = appointmentId;
        this.diagnosis = diagnosis;
        this.symptoms = symptoms;
        this.treatmentPlan = treatmentPlan;
        this.allergies = allergies;
        this.medicalHistory = medicalHistory;
        this.notes = notes;
        this.followUpDate = followUpDate;
        this.chronicConditions = chronicConditions;
        this.vaccinationRecords = vaccinationRecords;
        this.surgicalHistory = surgicalHistory;
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

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getTreatmentPlan() {
        return treatmentPlan;
    }

    public void setTreatmentPlan(String treatmentPlan) {
        this.treatmentPlan = treatmentPlan;
    }

    public String getAllergies() {
        return allergies;
    }

    public void setAllergies(String allergies) {
        this.allergies = allergies;
    }

    public String getMedicalHistory() {
        return medicalHistory;
    }

    public void setMedicalHistory(String medicalHistory) {
        this.medicalHistory = medicalHistory;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public java.time.LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(java.time.LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public String getChronicConditions() {
        return chronicConditions;
    }

    public void setChronicConditions(String chronicConditions) {
        this.chronicConditions = chronicConditions;
    }

    public String getVaccinationRecords() {
        return vaccinationRecords;
    }

    public void setVaccinationRecords(String vaccinationRecords) {
        this.vaccinationRecords = vaccinationRecords;
    }

    public String getSurgicalHistory() {
        return surgicalHistory;
    }

    public void setSurgicalHistory(String surgicalHistory) {
        this.surgicalHistory = surgicalHistory;
    }
}
