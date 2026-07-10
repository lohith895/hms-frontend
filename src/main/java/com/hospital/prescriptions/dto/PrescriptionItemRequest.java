package com.hospital.prescriptions.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PrescriptionItemRequest {

    @NotNull(message = "Medicine ID is required")
    private Long medicineId;

    @NotBlank(message = "Dosage details are required")
    @Size(max = 100)
    private String dosage;

    @NotBlank(message = "Frequency is required")
    @Size(max = 100)
    private String frequency;

    @NotNull(message = "Duration in days is required")
    private Integer durationDays;

    @NotNull(message = "Total quantity is required")
    private Integer quantity;

    public PrescriptionItemRequest() {
    }

    public PrescriptionItemRequest(Long medicineId, String dosage, String frequency, Integer durationDays, Integer quantity) {
        this.medicineId = medicineId;
        this.dosage = dosage;
        this.frequency = frequency;
        this.durationDays = durationDays;
        this.quantity = quantity;
    }

    public Long getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public Integer getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(Integer durationDays) {
        this.durationDays = durationDays;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
