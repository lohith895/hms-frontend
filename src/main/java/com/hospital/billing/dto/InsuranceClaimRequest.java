package com.hospital.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InsuranceClaimRequest {
    @NotNull(message = "Invoice ID is required")
    private Long invoiceId;

    @NotBlank(message = "Provider Name is required")
    private String providerName;

    @NotBlank(message = "Policy Number is required")
    private String policyNumber;

    @NotNull(message = "Claim Amount is required")
    private Double claimAmount;

    public InsuranceClaimRequest() {}

    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }
    public Double getClaimAmount() { return claimAmount; }
    public void setClaimAmount(Double claimAmount) { this.claimAmount = claimAmount; }
}
