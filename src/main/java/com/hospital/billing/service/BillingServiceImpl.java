package com.hospital.billing.service;

import com.hospital.billing.dto.*;
import com.hospital.billing.entity.InsuranceClaim;
import com.hospital.billing.entity.Invoice;
import com.hospital.billing.entity.Payment;
import com.hospital.billing.repository.InsuranceClaimRepository;
import com.hospital.billing.repository.InvoiceRepository;
import com.hospital.billing.repository.PaymentRepository;
import com.hospital.common.enums.InsuranceClaimStatus;
import com.hospital.common.enums.InvoiceStatus;
import com.hospital.common.enums.PaymentStatus;
import com.hospital.notifications.service.NotificationService;
import com.hospital.patients.entity.Patient;
import com.hospital.patients.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillingServiceImpl implements BillingService {

    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final InsuranceClaimRepository insuranceClaimRepository;
    private final PatientRepository patientRepository;
    private final NotificationService notificationService;

    public BillingServiceImpl(InvoiceRepository invoiceRepository,
                              PaymentRepository paymentRepository,
                              InsuranceClaimRepository insuranceClaimRepository,
                              PatientRepository patientRepository,
                              NotificationService notificationService) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.insuranceClaimRepository = insuranceClaimRepository;
        this.patientRepository = patientRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public InvoiceResponse createInvoice(InvoiceRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Double net = request.getTotalAmount() - request.getDiscountAmount() + request.getTaxAmount();

        Invoice invoice = new Invoice(
                patient,
                request.getTotalAmount(),
                request.getDiscountAmount(),
                request.getTaxAmount(),
                net,
                InvoiceStatus.UNPAID,
                request.getDueDate()
        );

        invoice = invoiceRepository.save(invoice);
        
        notificationService.createSystemNotification(
                patient.getUser().getUsername(),
                "New Invoice Generated",
                "A new invoice for $" + net + " has been generated and is due on " + request.getDueDate()
        );

        return mapToResponse(invoice);
    }

    @Override
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<InvoiceResponse> getMyInvoices(String username) {
        return invoiceRepository.findByPatientUserUsernameOrderByCreatedAtDesc(username)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<InvoiceResponse> getPatientInvoices(Long patientId) {
        return invoiceRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(Long invoiceId, PaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        Payment payment = new Payment(
                invoice,
                request.getAmount(),
                request.getPaymentMethod(),
                request.getTransactionId(),
                PaymentStatus.SUCCESS
        );

        payment = paymentRepository.save(payment);
        updateInvoiceStatus(invoice);

        notificationService.createSystemNotification(
                invoice.getPatient().getUser().getUsername(),
                "Payment Received",
                "Payment of $" + request.getAmount() + " has been successfully processed for your invoice."
        );

        return mapToPaymentResponse(payment);
    }

    @Override
    public List<PaymentResponse> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::mapToPaymentResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InsuranceClaimResponse fileInsuranceClaim(InsuranceClaimRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        InsuranceClaim claim = new InsuranceClaim(
                invoice,
                request.getProviderName(),
                request.getPolicyNumber(),
                request.getClaimAmount(),
                InsuranceClaimStatus.PENDING
        );

        claim = insuranceClaimRepository.save(claim);
        return mapToClaimResponse(claim);
    }

    @Override
    public List<InsuranceClaimResponse> getClaimsByInvoice(Long invoiceId) {
        return insuranceClaimRepository.findByInvoiceId(invoiceId).stream()
                .map(this::mapToClaimResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InsuranceClaimResponse approveClaim(Long claimId, Double approvedAmount) {
        InsuranceClaim claim = insuranceClaimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setApprovedAmount(approvedAmount);
        claim.setStatus(InsuranceClaimStatus.APPROVED);
        claim = insuranceClaimRepository.save(claim);

        // Record a mock payment representing the insurance company payout
        Payment payment = new Payment(
                claim.getInvoice(),
                approvedAmount,
                com.hospital.common.enums.PaymentMethod.INSURANCE,
                "CLAIM-" + claim.getId(),
                PaymentStatus.SUCCESS
        );
        paymentRepository.save(payment);

        updateInvoiceStatus(claim.getInvoice());

        notificationService.createSystemNotification(
                claim.getInvoice().getPatient().getUser().getUsername(),
                "Insurance Claim Approved",
                "Your insurance claim for $" + approvedAmount + " has been approved and applied to your invoice."
        );

        return mapToClaimResponse(claim);
    }

    @Override
    @Transactional
    public InsuranceClaimResponse rejectClaim(Long claimId) {
        InsuranceClaim claim = insuranceClaimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        claim.setStatus(InsuranceClaimStatus.REJECTED);
        claim = insuranceClaimRepository.save(claim);
        
        notificationService.createSystemNotification(
                claim.getInvoice().getPatient().getUser().getUsername(),
                "Insurance Claim Rejected",
                "Your insurance claim to " + claim.getProviderName() + " was rejected."
        );

        return mapToClaimResponse(claim);
    }

    private void updateInvoiceStatus(Invoice invoice) {
        List<Payment> payments = paymentRepository.findByInvoiceId(invoice.getId());
        double totalPaid = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();

        if (totalPaid >= invoice.getNetAmount()) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else if (totalPaid > 0) {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        } else {
            invoice.setStatus(InvoiceStatus.UNPAID);
        }
        invoiceRepository.save(invoice);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.setId(invoice.getId());
        response.setPatientId(invoice.getPatient().getId());
        response.setPatientName(invoice.getPatient().getUser().getUsername());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setDiscountAmount(invoice.getDiscountAmount());
        response.setTaxAmount(invoice.getTaxAmount());
        response.setNetAmount(invoice.getNetAmount());
        response.setStatus(invoice.getStatus());
        response.setDueDate(invoice.getDueDate());
        response.setCreatedAt(invoice.getCreatedAt());
        return response;
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setInvoiceId(payment.getInvoice().getId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setTransactionId(payment.getTransactionId());
        response.setStatus(payment.getStatus());
        response.setPaymentDate(payment.getPaymentDate());
        return response;
    }

    private InsuranceClaimResponse mapToClaimResponse(InsuranceClaim claim) {
        InsuranceClaimResponse response = new InsuranceClaimResponse();
        response.setId(claim.getId());
        response.setInvoiceId(claim.getInvoice().getId());
        response.setProviderName(claim.getProviderName());
        response.setPolicyNumber(claim.getPolicyNumber());
        response.setClaimAmount(claim.getClaimAmount());
        response.setApprovedAmount(claim.getApprovedAmount());
        response.setStatus(claim.getStatus());
        response.setSubmissionDate(claim.getSubmissionDate());
        return response;
    }
}
