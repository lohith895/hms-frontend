package com.hospital.billing.controller;

import com.hospital.billing.dto.*;
import com.hospital.billing.service.BillingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('FINANCE_MANAGER', 'ADMIN')")
    public ResponseEntity<InvoiceResponse> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.createInvoice(request));
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('FINANCE_MANAGER', 'ADMIN')")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        return ResponseEntity.ok(billingService.getAllInvoices());
    }

    @GetMapping("/invoices/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<InvoiceResponse>> getMyInvoices(Authentication authentication) {
        return ResponseEntity.ok(billingService.getMyInvoices(authentication.getName()));
    }
    
    @GetMapping("/invoices/patient/{patientId}")
    @PreAuthorize("hasAnyRole('FINANCE_MANAGER', 'ADMIN', 'DOCTOR')")
    public ResponseEntity<List<InvoiceResponse>> getPatientInvoices(@PathVariable Long patientId) {
        return ResponseEntity.ok(billingService.getPatientInvoices(patientId));
    }

    @PostMapping("/invoices/{id}/payments")
    @PreAuthorize("hasAnyRole('FINANCE_MANAGER', 'ADMIN', 'PATIENT')")
    public ResponseEntity<PaymentResponse> processPayment(@PathVariable Long id, @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.processPayment(id, request));
    }

    @GetMapping("/invoices/{id}/payments")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getPaymentsByInvoice(id));
    }

    @PostMapping("/claims")
    @PreAuthorize("hasAnyRole('FINANCE_MANAGER', 'ADMIN')")
    public ResponseEntity<InsuranceClaimResponse> fileInsuranceClaim(@Valid @RequestBody InsuranceClaimRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.fileInsuranceClaim(request));
    }

    @GetMapping("/invoices/{id}/claims")
    public ResponseEntity<List<InsuranceClaimResponse>> getClaimsByInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getClaimsByInvoice(id));
    }

    @PostMapping("/claims/{id}/approve")
    @PreAuthorize("hasAnyRole('FINANCE_MANAGER', 'ADMIN')")
    public ResponseEntity<InsuranceClaimResponse> approveClaim(@PathVariable Long id, @RequestParam Double approvedAmount) {
        return ResponseEntity.ok(billingService.approveClaim(id, approvedAmount));
    }

    @PostMapping("/claims/{id}/reject")
    @PreAuthorize("hasAnyRole('FINANCE_MANAGER', 'ADMIN')")
    public ResponseEntity<InsuranceClaimResponse> rejectClaim(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.rejectClaim(id));
    }
}
