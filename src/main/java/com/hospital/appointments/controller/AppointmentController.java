package com.hospital.appointments.controller;

import com.hospital.appointments.dto.AppointmentRequest;
import com.hospital.appointments.dto.AppointmentResponse;
import com.hospital.appointments.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('appointment:write')")
    public ResponseEntity<AppointmentResponse> createAppointment(@Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.createAppointment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PATIENT','RECEPTIONIST','NURSE')")
    public ResponseEntity<java.util.List<AppointmentResponse>> getAppointments(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        java.util.List<AppointmentResponse> responses = appointmentService.getAppointmentsForUser(userDetails);
        return ResponseEntity.ok(responses);
    }
    
    @PutMapping("/{id}/reassign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AppointmentResponse> reassignAppointment(
            @PathVariable Long id,
            @RequestParam Long newDoctorId,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        AppointmentResponse response = appointmentService.reassignAppointment(id, newDoctorId, userDetails);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam com.hospital.common.enums.AppointmentStatus status,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        AppointmentResponse response = appointmentService.updateAppointmentStatus(id, status, userDetails);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/visit-status")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','NURSE')")
    public ResponseEntity<AppointmentResponse> updateVisitStatus(
            @PathVariable Long id,
            @RequestParam com.hospital.common.enums.PatientVisitStatus visitStatus,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        AppointmentResponse response = appointmentService.updatePatientVisitStatus(id, visitStatus, userDetails);
        return ResponseEntity.ok(response);
    }
}
