package com.hospital.pharmacy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Entity
@Table(name = "medicine_inventory")
public class MedicineInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;

    @NotBlank
    @Size(max = 50)
    @Column(name = "batch_number", nullable = false, length = 50)
    private String batchNumber;

    @NotNull
    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @NotNull
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @NotNull
    @Column(name = "price_per_unit", nullable = false)
    private Double pricePerUnit;

    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "supplier_contact")
    private String supplierContact;

    @Column(name = "reorder_threshold")
    private Integer reorderThreshold = 50;

    // Constructors
    public MedicineInventory() {
    }

    public MedicineInventory(Medicine medicine, String batchNumber, LocalDate expiryDate, Integer stockQuantity, Double pricePerUnit) {
        this.medicine = medicine;
        this.batchNumber = batchNumber;
        this.expiryDate = expiryDate;
        this.stockQuantity = stockQuantity;
        this.pricePerUnit = pricePerUnit;
        this.reorderThreshold = 50;
    }

    public MedicineInventory(Medicine medicine, String batchNumber, LocalDate expiryDate, Integer stockQuantity, Double pricePerUnit, String supplierName, String supplierContact, Integer reorderThreshold) {
        this.medicine = medicine;
        this.batchNumber = batchNumber;
        this.expiryDate = expiryDate;
        this.stockQuantity = stockQuantity;
        this.pricePerUnit = pricePerUnit;
        this.supplierName = supplierName;
        this.supplierContact = supplierContact;
        this.reorderThreshold = reorderThreshold != null ? reorderThreshold : 50;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
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

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getSupplierContact() {
        return supplierContact;
    }

    public void setSupplierContact(String supplierContact) {
        this.supplierContact = supplierContact;
    }

    public Integer getReorderThreshold() {
        return reorderThreshold;
    }

    public void setReorderThreshold(Integer reorderThreshold) {
        this.reorderThreshold = reorderThreshold != null ? reorderThreshold : 50;
    }
}
