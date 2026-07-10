package com.hospital.patients.controller;

import com.hospital.patients.entity.Patient;
import com.hospital.patients.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:3000")
public class PatientController {

    private final PatientRepository patientRepository;

    public PatientController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST','NURSE')")
    public ResponseEntity<List<Map<String, Object>>> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();
        for (Patient p : patients) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", p.getId());
            map.put("fullName", p.getUser() != null ? p.getUser().getFirstName() + " " + p.getUser().getLastName() : "Unknown");
            map.put("email", p.getUser() != null ? p.getUser().getEmail() : "");
            map.put("gender", p.getGender());
            map.put("emergencyContact", p.getEmergencyContact());
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Map<String, Object>> getMyPatientProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String username = userDetails.getUsername();
        Patient p = patientRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Patient profile not found for user: " + username));
        Map<String, Object> map = new HashMap<>();
        map.put("id", p.getId());
        map.put("fullName", p.getUser() != null ? p.getUser().getFirstName() + " " + p.getUser().getLastName() : "Unknown");
        map.put("email", p.getUser() != null ? p.getUser().getEmail() : "");
        map.put("dateOfBirth", p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : null);
        map.put("gender", p.getGender());
        map.put("bloodGroup", p.getBloodGroup());
        map.put("address", p.getAddress());
        map.put("insuranceNumber", p.getInsuranceNumber());
        map.put("emergencyContact", p.getEmergencyContact());
        return ResponseEntity.ok(map);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> updateMyPatientProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @RequestBody Map<String, Object> updates) {
        try {
            String username = userDetails.getUsername();
            Patient p = patientRepository.findByUserUsername(username)
                    .orElseThrow(() -> new RuntimeException("Patient profile not found"));
            if (updates.containsKey("dateOfBirth") && updates.get("dateOfBirth") != null && !updates.get("dateOfBirth").toString().isBlank())
                p.setDateOfBirth(java.time.LocalDate.parse(updates.get("dateOfBirth").toString()));
            if (updates.containsKey("gender") && updates.get("gender") != null)
                p.setGender(updates.get("gender").toString());
            if (updates.containsKey("bloodGroup") && updates.get("bloodGroup") != null)
                p.setBloodGroup(updates.get("bloodGroup").toString());
            if (updates.containsKey("address") && updates.get("address") != null)
                p.setAddress(updates.get("address").toString());
            if (updates.containsKey("emergencyContact") && updates.get("emergencyContact") != null)
                p.setEmergencyContact(updates.get("emergencyContact").toString());
            if (updates.containsKey("insuranceNumber") && updates.get("insuranceNumber") != null)
                p.setInsuranceNumber(updates.get("insuranceNumber").toString());
            patientRepository.save(p);
            Map<String, Object> map = new HashMap<>();
            map.put("dateOfBirth", p.getDateOfBirth() != null ? p.getDateOfBirth().toString() : null);
            map.put("gender", p.getGender());
            map.put("bloodGroup", p.getBloodGroup());
            map.put("address", p.getAddress());
            map.put("emergencyContact", p.getEmergencyContact());
            map.put("insuranceNumber", p.getInsuranceNumber());
            return ResponseEntity.ok(map);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
