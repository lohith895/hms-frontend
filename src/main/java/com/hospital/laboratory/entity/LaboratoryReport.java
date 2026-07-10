package com.hospital.laboratory.entity;

import com.hospital.common.enums.LaboratoryReportStatus;
import com.hospital.doctors.entity.Doctor;
import com.hospital.patients.entity.Patient;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "laboratory_reports")
public class LaboratoryReport {

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

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_test_id", nullable = false)
    private LaboratoryTest labTest;

    @CreationTimestamp
    @Column(name = "test_date", nullable = false, updatable = false)
    private LocalDateTime testDate;

    @Size(max = 255)
    @Column(name = "result_value", length = 255)
    private String resultValue;

    @Size(max = 1000)
    @Column(length = 1000)
    private String comments;

    @Size(max = 1000)
    @Column(name = "doctor_remarks", length = 1000)
    private String doctorRemarks;

    @Size(max = 1000)
    @Column(name = "tech_remarks", length = 1000)
    private String techRemarks;

    @Size(max = 500)
    @Column(name = "report_file_url", length = 500)
    private String reportFileUrl;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private LaboratoryReportStatus status = LaboratoryReportStatus.PENDING;

    // Constructors
    public LaboratoryReport() {
    }

    public LaboratoryReport(Patient patient, Doctor doctor, LaboratoryTest labTest, String resultValue, String comments, LaboratoryReportStatus status, String doctorRemarks) {
        this.patient = patient;
        this.doctor = doctor;
        this.labTest = labTest;
        this.resultValue = resultValue;
        this.comments = comments;
        this.status = status;
        this.doctorRemarks = doctorRemarks;
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

    public LaboratoryTest getLabTest() {
        return labTest;
    }

    public void setLabTest(LaboratoryTest labTest) {
        this.labTest = labTest;
    }

    public LocalDateTime getTestDate() {
        return testDate;
    }

    public void setTestDate(LocalDateTime testDate) {
        this.testDate = testDate;
    }

    public String getResultValue() {
        return resultValue;
    }

    public void setResultValue(String resultValue) {
        this.resultValue = resultValue;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public LaboratoryReportStatus getStatus() {
        return status;
    }

    public void setStatus(LaboratoryReportStatus status) {
        this.status = status;
    }

    public String getDoctorRemarks() {
        return doctorRemarks;
    }

    public void setDoctorRemarks(String doctorRemarks) {
        this.doctorRemarks = doctorRemarks;
    }

    public String getTechRemarks() {
        return techRemarks;
    }

    public void setTechRemarks(String techRemarks) {
        this.techRemarks = techRemarks;
    }

    public String getReportFileUrl() {
        return reportFileUrl;
    }

    public void setReportFileUrl(String reportFileUrl) {
        this.reportFileUrl = reportFileUrl;
    }
}
