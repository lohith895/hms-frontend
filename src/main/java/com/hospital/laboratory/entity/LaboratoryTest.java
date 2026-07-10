package com.hospital.laboratory.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "laboratory_tests")
public class LaboratoryTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "test_name", nullable = false, length = 100)
    private String testName;

    @NotBlank
    @Size(max = 50)
    @Column(name = "test_code", nullable = false, unique = true, length = 50)
    private String testCode;

    @NotBlank
    @Size(max = 100)
    @Column(name = "reference_range", nullable = false, length = 100)
    private String referenceRange;

    @NotNull
    @Column(nullable = false)
    private Double cost;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // Constructors
    public LaboratoryTest() {
    }

    public LaboratoryTest(String testName, String testCode, String referenceRange, Double cost, boolean isActive) {
        this.testName = testName;
        this.testCode = testCode;
        this.referenceRange = referenceRange;
        this.cost = cost;
        this.isActive = isActive;
    }

    // Getters and Setters
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
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}
