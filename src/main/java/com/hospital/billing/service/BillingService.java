package com.hospital.billing.service;

import com.hospital.billing.dto.*;
import java.util.List;

public interface BillingService {
    InvoiceResponse createInvoice(InvoiceRequest request);
    List<InvoiceResponse> getAllInvoices();
    List<InvoiceResponse> getMyInvoices(String username);
    List<InvoiceResponse> getPatientInvoices(Long patientId);

    PaymentResponse processPayment(Long invoiceId, PaymentRequest request);
    List<PaymentResponse> getPaymentsByInvoice(Long invoiceId);

    InsuranceClaimResponse fileInsuranceClaim(InsuranceClaimRequest request);
    List<InsuranceClaimResponse> getClaimsByInvoice(Long invoiceId);
    InsuranceClaimResponse approveClaim(Long claimId, Double approvedAmount);
    InsuranceClaimResponse rejectClaim(Long claimId);
}
