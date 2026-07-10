package com.hospital.medicalrecords.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class LabTestOrderRequest {

    @NotNull(message = "Lab test ID is required")
    private Long testId;

    @Size(max = 1000)
    private String remarks;

    public LabTestOrderRequest() {}

    public Long getTestId() {
        return testId;
    }

    public void setTestId(Long testId) {
        this.testId = testId;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
