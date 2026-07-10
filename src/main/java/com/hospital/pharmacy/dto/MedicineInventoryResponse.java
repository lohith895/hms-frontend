package com.hospital.pharmacy.dto;

import java.time.LocalDate;

public class MedicineInventoryResponse {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String medicineCode;
    private String medicineCategory;
    private String batchNumber;
    private LocalDate expiryDate;
    private Integer stockQuantity;
    private Double pricePerUnit;

    public MedicineInventoryResponse() {
    }

    public MedicineInventoryResponse(Long id, Long medicineId, String medicineName, String medicineCode, String medicineCategory, String batchNumber, LocalDate expiryDate, Integer stockQuantity, Double pricePerUnit) {
        this.id = id;
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.medicineCode = medicineCode;
        this.medicineCategory = medicineCategory;
        this.batchNumber = batchNumber;
        this.expiryDate = expiryDate;
        this.stockQuantity = stockQuantity;
        this.pricePerUnit = pricePerUnit;
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

    public String getMedicineCategory() {
        return medicineCategory;
    }

    public void setMedicineCategory(String medicineCategory) {
        this.medicineCategory = medicineCategory;
    }

    public String getBatchNumber() {
        return batchNumber;
    }

    public void setBatchNumber(String batchNumber) {
        this.batchNumber = batchNumber;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Double getPricePerUnit() {
        return pricePerUnit;
    }

    public void setPricePerUnit(Double pricePerUnit) {
        this.pricePerUnit = pricePerUnit;
    }
}
