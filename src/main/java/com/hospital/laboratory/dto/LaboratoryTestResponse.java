package com.hospital.laboratory.dto;

public class LaboratoryTestResponse {
    private Long id;
    private String testName;
    private String testCode;
    private String referenceRange;
    private Double cost;
    private boolean active;

    public LaboratoryTestResponse() {
    }

    public LaboratoryTestResponse(Long id, String testName, String testCode, String referenceRange, Double cost, boolean active) {
        this.id = id;
        this.testName = testName;
        this.testCode = testCode;
        this.referenceRange = referenceRange;
        this.cost = cost;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
