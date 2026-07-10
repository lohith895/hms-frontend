package com.hospital.pharmacy.dto;

public class PharmacyInvoiceItemResponse {
    private Long id;
    private String medicineName;
    private String medicineCode;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;

    public PharmacyInvoiceItemResponse() {}

    public PharmacyInvoiceItemResponse(Long id, String medicineName, String medicineCode, Integer quantity, Double unitPrice, Double totalPrice) {
        this.id = id;
        this.medicineName = medicineName;
        this.medicineCode = medicineCode;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getMedicineCode() { return medicineCode; }
    public void setMedicineCode(String medicineCode) { this.medicineCode = medicineCode; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
}
