package com.hospital.pharmacy.dto;

import com.hospital.common.enums.PharmacyInvoicePaymentStatus;

import java.time.LocalDateTime;
import java.util.List;

public class PharmacyInvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long prescriptionId;
    private Long patientId;
    private String patientName;
    private Double subtotal;
    private Double discountPercent;
    private Double discountAmount;
    private Double gstPercent;
    private Double gstAmount;
    private Double grandTotal;
    private PharmacyInvoicePaymentStatus paymentStatus;
    private LocalDateTime createdAt;
    private List<PharmacyInvoiceItemResponse> items;

    public PharmacyInvoiceResponse() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Long getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Long prescriptionId) { this.prescriptionId = prescriptionId; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Double discountPercent) { this.discountPercent = discountPercent; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getGstPercent() { return gstPercent; }
    public void setGstPercent(Double gstPercent) { this.gstPercent = gstPercent; }

    public Double getGstAmount() { return gstAmount; }
    public void setGstAmount(Double gstAmount) { this.gstAmount = gstAmount; }

    public Double getGrandTotal() { return grandTotal; }
    public void setGrandTotal(Double grandTotal) { this.grandTotal = grandTotal; }

    public PharmacyInvoicePaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PharmacyInvoicePaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<PharmacyInvoiceItemResponse> getItems() { return items; }
    public void setItems(List<PharmacyInvoiceItemResponse> items) { this.items = items; }
}
