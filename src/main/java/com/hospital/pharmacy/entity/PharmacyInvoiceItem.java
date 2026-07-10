package com.hospital.pharmacy.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "pharmacy_invoice_items")
public class PharmacyInvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacy_invoice_id", nullable = false)
    private PharmacyInvoice pharmacyInvoice;

    @NotBlank
    @Size(max = 100)
    @Column(name = "medicine_name", nullable = false, length = 100)
    private String medicineName;

    @Size(max = 50)
    @Column(name = "medicine_code", length = 50)
    private String medicineCode;

    @NotNull
    @Column(nullable = false)
    private Integer quantity;

    @NotNull
    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @NotNull
    @Column(name = "total_price", nullable = false)
    private Double totalPrice;

    public PharmacyInvoiceItem() {}

    public PharmacyInvoiceItem(PharmacyInvoice pharmacyInvoice, String medicineName, String medicineCode, Integer quantity, Double unitPrice, Double totalPrice) {
        this.pharmacyInvoice = pharmacyInvoice;
        this.medicineName = medicineName;
        this.medicineCode = medicineCode;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PharmacyInvoice getPharmacyInvoice() { return pharmacyInvoice; }
    public void setPharmacyInvoice(PharmacyInvoice pharmacyInvoice) { this.pharmacyInvoice = pharmacyInvoice; }

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
