package com.hospital.medicalrecords.entity;

import com.hospital.appointments.entity.Appointment;
import com.hospital.doctors.entity.Doctor;
import com.hospital.patients.entity.Patient;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @NotBlank
    @Size(max = 1000)
    @Column(nullable = false, length = 1000)
    private String diagnosis;

    @NotBlank
    @Size(max = 1000)
    @Column(nullable = false, length = 1000)
    private String symptoms;

    @Size(max = 2000)
    @Column(name = "treatment_plan", length = 2000)
    private String treatmentPlan;

    @Size(max = 2000)
    @Column(length = 2000)
    private String notes;

    @Size(max = 1000)
    @Column(length = 1000)
    private String allergies;

    @Size(max = 2000)
    @Column(name = "medical_history", length = 2000)
    private String medicalHistory;

    @Column(name = "follow_up_date")
    private java.time.LocalDate followUpDate;

    @Column(name = "chronic_conditions", length = 2000)
    private String chronicConditions;

    @Column(name = "vaccination_records", length = 2000)
    private String vaccinationRecords;

    @Column(name = "surgical_history", length = 2000)
    private String surgicalHistory;

    @CreationTimestamp
    @Column(name = "record_date", nullable = false, updatable = false)
    private LocalDateTime recordDate;

    // Constructors
    public MedicalRecord() {
    }

    public MedicalRecord(Patient patient, Doctor doctor, Appointment appointment, String diagnosis, String symptoms, String treatmentPlan, String allergies, String medicalHistory, String notes, java.time.LocalDate followUpDate, String chronicConditions, String vaccinationRecords, String surgicalHistory) {
        this.patient = patient;
        this.doctor = doctor;
        this.appointment = appointment;
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

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
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

    public LocalDateTime getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDateTime recordDate) {
        this.recordDate = recordDate;
    }
}
