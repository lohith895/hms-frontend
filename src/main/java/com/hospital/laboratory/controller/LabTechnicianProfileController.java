package com.hospital.laboratory.controller;

import com.hospital.laboratory.entity.LabTechnician;
import com.hospital.laboratory.repository.LabTechnicianRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/lab-technicians")
@CrossOrigin(origins = "http://localhost:3000")
public class LabTechnicianProfileController {

    private final LabTechnicianRepository labTechnicianRepository;

    public LabTechnicianProfileController(LabTechnicianRepository labTechnicianRepository) {
        this.labTechnicianRepository = labTechnicianRepository;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<?> getMyLabTechProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            LabTechnician lab = labTechnicianRepository.findByUserUsername(username)
                    .orElseThrow(() -> new RuntimeException("Lab technician profile not found"));
            Map<String, Object> map = new HashMap<>();
            map.put("id", lab.getId());
            map.put("specialization", lab.getSpecialization());
            map.put("certification", lab.getCertification());
            map.put("phone", lab.getPhone());
            return ResponseEntity.ok(map);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<?> updateMyLabTechProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> updates) {
        try {
            String username = userDetails.getUsername();
            LabTechnician lab = labTechnicianRepository.findByUserUsername(username)
                    .orElseThrow(() -> new RuntimeException("Lab technician profile not found"));
            if (updates.containsKey("specialization") && updates.get("specialization") != null)
                lab.setSpecialization(updates.get("specialization").toString());
            if (updates.containsKey("certification") && updates.get("certification") != null)
                lab.setCertification(updates.get("certification").toString());
            if (updates.containsKey("phone") && updates.get("phone") != null)
                lab.setPhone(updates.get("phone").toString());
            labTechnicianRepository.save(lab);
            Map<String, Object> map = new HashMap<>();
            map.put("specialization", lab.getSpecialization());
            map.put("certification", lab.getCertification());
            map.put("phone", lab.getPhone());
            return ResponseEntity.ok(map);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
