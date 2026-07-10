package com.hospital.medicalrecords.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ConsultationRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotBlank(message = "Symptoms are required")
    private String symptoms;

    private String treatmentPlan;
    private String notes;
    private String allergies;
    private String medicalHistory;
    private java.time.LocalDate followUpDate;
    private String chronicConditions;
    private String vaccinationRecords;
    private String surgicalHistory;

    private List<PrescriptionItemRequest> medicines;
    private List<LabTestOrderRequest> labTests;

    public ConsultationRequest() {}

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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

    public List<PrescriptionItemRequest> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<PrescriptionItemRequest> medicines) {
        this.medicines = medicines;
    }

    public List<LabTestOrderRequest> getLabTests() {
        return labTests;
    }

    public void setLabTests(List<LabTestOrderRequest> labTests) {
        this.labTests = labTests;
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
