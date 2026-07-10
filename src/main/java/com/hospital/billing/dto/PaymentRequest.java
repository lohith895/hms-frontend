package com.hospital.billing.dto;

import com.hospital.common.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentRequest {
    @NotNull(message = "Amount is required")
    private Double amount;

    @NotNull(message = "Payment Method is required")
    private PaymentMethod paymentMethod;

    @NotBlank(message = "Transaction ID is required")
    private String transactionId;

    public PaymentRequest() {}

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}
