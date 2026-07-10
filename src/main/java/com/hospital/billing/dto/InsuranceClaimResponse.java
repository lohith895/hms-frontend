package com.hospital.billing.dto;

import com.hospital.common.enums.InsuranceClaimStatus;
import java.time.LocalDateTime;

public class InsuranceClaimResponse {
    private Long id;
    private Long invoiceId;
    private String providerName;
    private String policyNumber;
    private Double claimAmount;
    private Double approvedAmount;
    private InsuranceClaimStatus status;
    private LocalDateTime submissionDate;

    public InsuranceClaimResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }
    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }
    public String getPolicyNumber() { return policyNumber; }
    public void setPolicyNumber(String policyNumber) { this.policyNumber = policyNumber; }
    public Double getClaimAmount() { return claimAmount; }
    public void setClaimAmount(Double claimAmount) { this.claimAmount = claimAmount; }
    public Double getApprovedAmount() { return approvedAmount; }
    public void setApprovedAmount(Double approvedAmount) { this.approvedAmount = approvedAmount; }
    public InsuranceClaimStatus getStatus() { return status; }
    public void setStatus(InsuranceClaimStatus status) { this.status = status; }
    public LocalDateTime getSubmissionDate() { return submissionDate; }
    public void setSubmissionDate(LocalDateTime submissionDate) { this.submissionDate = submissionDate; }
}
