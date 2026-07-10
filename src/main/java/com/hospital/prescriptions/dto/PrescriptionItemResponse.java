package com.hospital.prescriptions.dto;

public class PrescriptionItemResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private Integer quantity;

    public PrescriptionItemResponse() {
    }

    public PrescriptionItemResponse(Long id, Long medicineId, String medicineName, String medicineCode, String dosage, String frequency, Integer durationDays, Integer quantity) {
        this.id = id;
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.medicineCode = medicineCode;
        this.dosage = dosage;
        this.frequency = frequency;
        this.durationDays = durationDays;
        this.quantity = quantity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMedicineId() {
        return medicineId;
    }

    public void setMedicineId(Long medicineId) {
        this.medicineId = medicineId;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getMedicineCode() {
        return medicineCode;
    }

    public void setMedicineCode(String medicineCode) {
        this.medicineCode = medicineCode;
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
