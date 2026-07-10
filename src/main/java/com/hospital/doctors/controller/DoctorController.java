package com.hospital.doctors.controller;

import com.hospital.doctors.entity.Doctor;
import com.hospital.doctors.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    private final DoctorRepository doctorRepository;

    public DoctorController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PATIENT','RECEPTIONIST','NURSE','DOCTOR')")
    public ResponseEntity<List<Map<String, Object>>> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();
        for (Doctor doc : doctors) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.getId());
            map.put("fullName", doc.getUser() != null ? "Dr. " + doc.getUser().getFirstName() + " " + doc.getUser().getLastName() : "Dr. Unknown");
            map.put("specialization", doc.getSpecialization());
            map.put("departmentName", doc.getDepartment() != null ? doc.getDepartment().getName() : "");
            map.put("consultationFee", doc.getConsultationFee());
            response.add(map);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Map<String, Object>> getMyDoctorProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        String username = userDetails.getUsername();
        Doctor doc = doctorRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found for user: " + username));
        Map<String, Object> map = new HashMap<>();
        map.put("id", doc.getId());
        map.put("fullName", doc.getUser() != null ? "Dr. " + doc.getUser().getFirstName() + " " + doc.getUser().getLastName() : "Dr. Unknown");
        map.put("specialization", doc.getSpecialization());
        map.put("experienceYears", doc.getExperienceYears());
        map.put("departmentName", doc.getDepartment() != null ? doc.getDepartment().getName() : "");
        map.put("phone", doc.getPhone());
        map.put("licenseNumber", doc.getLicenseNumber());
        map.put("consultationFee", doc.getConsultationFee());
        return ResponseEntity.ok(map);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<?> updateMyDoctorProfile(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @RequestBody Map<String, Object> updates) {
        try {
            String username = userDetails.getUsername();
            Doctor doc = doctorRepository.findByUserUsername(username)
                    .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
            if (updates.containsKey("specialization") && updates.get("specialization") != null)
                doc.setSpecialization(updates.get("specialization").toString());
            if (updates.containsKey("experienceYears") && updates.get("experienceYears") != null)
                doc.setExperienceYears(Integer.valueOf(updates.get("experienceYears").toString()));
            if (updates.containsKey("phone") && updates.get("phone") != null)
                doc.setPhone(updates.get("phone").toString());
            if (updates.containsKey("consultationFee") && updates.get("consultationFee") != null)
                doc.setConsultationFee(Double.valueOf(updates.get("consultationFee").toString()));
            doctorRepository.save(doc);
            Map<String, Object> map = new HashMap<>();
            map.put("specialization", doc.getSpecialization());
            map.put("experienceYears", doc.getExperienceYears());
            map.put("phone", doc.getPhone());
            map.put("licenseNumber", doc.getLicenseNumber());
            map.put("consultationFee", doc.getConsultationFee());
            map.put("departmentName", doc.getDepartment() != null ? doc.getDepartment().getName() : "");
            return ResponseEntity.ok(map);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
