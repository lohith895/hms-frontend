package com.hospital.billing.entity;

import com.hospital.common.enums.InsuranceClaimStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "insurance_claims")
public class InsuranceClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @NotBlank
    @Column(name = "provider_name", nullable = false, length = 100)
    private String providerName;

    @NotBlank
    @Column(name = "policy_number", nullable = false, length = 50)
    private String policyNumber;

    @NotNull
    @Column(name = "claim_amount", nullable = false)
    private Double claimAmount;

    @Column(name = "approved_amount")
    private Double approvedAmount = 0.0;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private InsuranceClaimStatus status = InsuranceClaimStatus.PENDING;

    @CreationTimestamp
    @Column(name = "submission_date", nullable = false, updatable = false)
    private LocalDateTime submissionDate;

    public InsuranceClaim() {
    }

    public InsuranceClaim(Invoice invoice, String providerName, String policyNumber, Double claimAmount, InsuranceClaimStatus status) {
        this.invoice = invoice;
        this.providerName = providerName;
        this.policyNumber = policyNumber;
        this.claimAmount = claimAmount;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }

    public Double getClaimAmount() {
        return claimAmount;
    }

    public void setClaimAmount(Double claimAmount) {
        this.claimAmount = claimAmount;
    }

    public Double getApprovedAmount() {
        return approvedAmount;
    }

    public void setApprovedAmount(Double approvedAmount) {
        this.approvedAmount = approvedAmount;
    }

    public InsuranceClaimStatus getStatus() {
        return status;
    }

    public void setStatus(InsuranceClaimStatus status) {
        this.status = status;
    }

    public LocalDateTime getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDateTime submissionDate) {
        this.submissionDate = submissionDate;
    }
}
