package com.hospital.medicalrecords.controller;

import com.hospital.medicalrecords.dto.MedicalRecordRequest;
import com.hospital.medicalrecords.dto.MedicalRecordResponse;
import com.hospital.medicalrecords.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "http://localhost:3000")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecordResponse> createRecord(@Valid @RequestBody MedicalRecordRequest request) {
        MedicalRecordResponse response = medicalRecordService.createMedicalRecord(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/consultation")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<MedicalRecordResponse> createConsultation(
            @Valid @RequestBody com.hospital.medicalrecords.dto.ConsultationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        MedicalRecordResponse response = medicalRecordService.createConsultation(request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<List<MedicalRecordResponse>> getPatientRecords(@PathVariable Long patientId) {
        List<MedicalRecordResponse> responses = medicalRecordService.getRecordsForPatient(patientId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<List<MedicalRecordResponse>> getMyRecords(@AuthenticationPrincipal UserDetails userDetails) {
        List<MedicalRecordResponse> responses = medicalRecordService.getMyRecords(userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }
}
