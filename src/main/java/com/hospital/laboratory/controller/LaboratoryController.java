package com.hospital.laboratory.controller;

import com.hospital.laboratory.dto.*;
import com.hospital.laboratory.service.LaboratoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratory")
@CrossOrigin(origins = "http://localhost:3000")
public class LaboratoryController {

    private final LaboratoryService laboratoryService;

    public LaboratoryController(LaboratoryService laboratoryService) {
        this.laboratoryService = laboratoryService;
    }

    @PostMapping("/tests")
    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECHNICIAN')")
    public ResponseEntity<LaboratoryTestResponse> createLaboratoryTest(@Valid @RequestBody LaboratoryTestRequest request) {
        LaboratoryTestResponse response = laboratoryService.createLaboratoryTest(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/tests")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','LAB_TECHNICIAN','NURSE','PATIENT')")
    public ResponseEntity<List<LaboratoryTestResponse>> getActiveTests() {
        List<LaboratoryTestResponse> responses = laboratoryService.getActiveTests();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/reports")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<LaboratoryReportResponse> requestLaboratoryReport(@Valid @RequestBody LaboratoryReportRequest request) {
        LaboratoryReportResponse response = laboratoryService.requestLaboratoryReport(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/reports/pending")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<List<LaboratoryReportResponse>> getPendingReports() {
        List<LaboratoryReportResponse> responses = laboratoryService.getPendingReports();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/reports/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE','LAB_TECHNICIAN')")
    public ResponseEntity<List<LaboratoryReportResponse>> getPatientReports(@PathVariable Long patientId) {
        List<LaboratoryReportResponse> responses = laboratoryService.getPatientReports(patientId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/reports/my")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<List<LaboratoryReportResponse>> getMyReports(@AuthenticationPrincipal UserDetails userDetails) {
        List<LaboratoryReportResponse> responses = laboratoryService.getMyReports(userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/reports/{id}/record")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<LaboratoryReportResponse> recordResult(@PathVariable Long id, @Valid @RequestBody LaboratoryResultRequest request) {
        LaboratoryReportResponse response = laboratoryService.recordResult(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/reports/{id}/status")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<LaboratoryReportResponse> updateStatus(@PathVariable Long id, @RequestParam com.hospital.common.enums.LaboratoryReportStatus status) {
        LaboratoryReportResponse response = laboratoryService.updateStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reports/{id}/upload")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<LaboratoryReportResponse> uploadReport(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "techRemarks", required = false) String techRemarks,
            @RequestParam(value = "resultValue", required = false) String resultValue) {
        LaboratoryReportResponse response = laboratoryService.uploadReport(id, file, techRemarks, resultValue);
        return ResponseEntity.ok(response);
    }
}
