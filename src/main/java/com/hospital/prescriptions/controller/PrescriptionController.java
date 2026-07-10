package com.hospital.prescriptions.controller;

import com.hospital.prescriptions.dto.PrescriptionRequest;
import com.hospital.prescriptions.dto.PrescriptionResponse;
import com.hospital.prescriptions.service.PrescriptionPdfService;
import com.hospital.prescriptions.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:3000")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;
    private final PrescriptionPdfService prescriptionPdfService;

    public PrescriptionController(PrescriptionService prescriptionService,
                                   PrescriptionPdfService prescriptionPdfService) {
        this.prescriptionService = prescriptionService;
        this.prescriptionPdfService = prescriptionPdfService;
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<PrescriptionResponse> createPrescription(@Valid @RequestBody PrescriptionRequest request) {
        PrescriptionResponse response = prescriptionService.createPrescription(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('PHARMACIST')")
    public ResponseEntity<List<PrescriptionResponse>> getPendingPrescriptions() {
        List<PrescriptionResponse> responses = prescriptionService.getPendingPrescriptions();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PHARMACIST','PATIENT')")
    public ResponseEntity<List<PrescriptionResponse>> getPatientPrescriptions(@PathVariable Long patientId) {
        List<PrescriptionResponse> responses = prescriptionService.getPatientPrescriptions(patientId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PrescriptionResponse>> getMyPrescriptions(@AuthenticationPrincipal UserDetails userDetails) {
        List<PrescriptionResponse> responses = prescriptionService.getMyPrescriptions(userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/dispense")
    @PreAuthorize("hasRole('PHARMACIST')")
    public ResponseEntity<PrescriptionResponse> dispensePrescription(@PathVariable Long id) {
        PrescriptionResponse response = prescriptionService.dispensePrescription(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','PHARMACIST','PATIENT')")
    public ResponseEntity<byte[]> downloadPrescriptionPdf(@PathVariable Long id) {
        byte[] pdf = prescriptionPdfService.generatePrescriptionPdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "prescription-RX-" + id + ".pdf");
        headers.setContentLength(pdf.length);
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}

