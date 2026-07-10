package com.hospital.laboratory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class LaboratoryTestRequest {

    @NotBlank(message = "Test name is required")
    @Size(max = 100, message = "Test name must not exceed 100 characters")
    private String testName;

    @NotBlank(message = "Test code is required")
    @Size(max = 50, message = "Test code must not exceed 50 characters")
    private String testCode;

    @NotBlank(message = "Reference range is required")
    @Size(max = 100, message = "Reference range must not exceed 100 characters")
    private String referenceRange;

    @NotNull(message = "Cost is required")
    private Double cost;

    private boolean active = true;

    public LaboratoryTestRequest() {
    }

    public LaboratoryTestRequest(String testName, String testCode, String referenceRange, Double cost, boolean active) {
        this.testName = testName;
        this.testCode = testCode;
        this.referenceRange = referenceRange;
        this.cost = cost;
        this.active = active;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public String getTestCode() {
        return testCode;
    }

    public void setTestCode(String testCode) {
        this.testCode = testCode;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
