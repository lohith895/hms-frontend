package com.hospital.laboratory.dto;

import com.hospital.common.enums.LaboratoryReportStatus;
import java.time.LocalDateTime;

public class LaboratoryReportResponse {
    private Long id;
    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long labTestId;
    private String labTestName;
    private String labTestCode;
    private String referenceRange;
    private Double cost;
    private LocalDateTime testDate;
    private String resultValue;
    private String comments;
    private LaboratoryReportStatus status;
    private String doctorRemarks;
    private String techRemarks;
    private String reportFileUrl;

    public LaboratoryReportResponse() {
    }

    public LaboratoryReportResponse(Long id, Long patientId, String patientName, Long doctorId, String doctorName, Long labTestId, String labTestName, String labTestCode, String referenceRange, Double cost, LocalDateTime testDate, String resultValue, String comments, LaboratoryReportStatus status, String doctorRemarks, String techRemarks, String reportFileUrl) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.labTestId = labTestId;
        this.labTestName = labTestName;
        this.labTestCode = labTestCode;
        this.referenceRange = referenceRange;
        this.cost = cost;
        this.testDate = testDate;
        this.resultValue = resultValue;
        this.comments = comments;
        this.status = status;
        this.doctorRemarks = doctorRemarks;
        this.techRemarks = techRemarks;
        this.reportFileUrl = reportFileUrl;
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

    public Long getLabTestId() {
        return labTestId;
    }

    public void setLabTestId(Long labTestId) {
        this.labTestId = labTestId;
    }

    public String getLabTestName() {
        return labTestName;
    }

    public void setLabTestName(String labTestName) {
        this.labTestName = labTestName;
    }

    public String getLabTestCode() {
        return labTestCode;
    }

    public void setLabTestCode(String labTestCode) {
        this.labTestCode = labTestCode;
    }

    public String getReferenceRange() {
        return referenceRange;
    }

    public void setReferenceRange(String referenceRange) {
        this.referenceRange = referenceRange;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
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
