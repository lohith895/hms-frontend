package com.hospital.billing.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class InvoiceRequest {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Total Amount is required")
    private Double totalAmount;

    private Double discountAmount = 0.0;
    private Double taxAmount = 0.0;

    @NotNull(message = "Due Date is required")
    private LocalDate dueDate;

    public InvoiceRequest() {}

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
    public Double getTaxAmount() { return taxAmount; }
    public void setTaxAmount(Double taxAmount) { this.taxAmount = taxAmount; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
}
