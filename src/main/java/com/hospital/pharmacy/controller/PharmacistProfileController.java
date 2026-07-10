package com.hospital.pharmacy.controller;

import com.hospital.pharmacy.entity.Pharmacist;
import com.hospital.pharmacy.repository.PharmacistRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pharmacists")
@CrossOrigin(origins = "http://localhost:3000")
public class PharmacistProfileController {

    private final PharmacistRepository pharmacistRepository;

    public PharmacistProfileController(PharmacistRepository pharmacistRepository) {
        this.pharmacistRepository = pharmacistRepository;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PHARMACIST')")
    public ResponseEntity<?> getMyPharmacistProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            Pharmacist ph = pharmacistRepository.findByUserUsername(username)
                    .orElseThrow(() -> new RuntimeException("Pharmacist profile not found"));
            Map<String, Object> map = new HashMap<>();
            map.put("id", ph.getId());
            map.put("licenseNumber", ph.getLicenseNumber());
            map.put("qualification", ph.getQualification());
            map.put("phone", ph.getPhone());
            return ResponseEntity.ok(map);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PHARMACIST')")
    public ResponseEntity<?> updateMyPharmacistProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> updates) {
        try {
            String username = userDetails.getUsername();
            Pharmacist ph = pharmacistRepository.findByUserUsername(username)
                    .orElseThrow(() -> new RuntimeException("Pharmacist profile not found"));
            if (updates.containsKey("phone") && updates.get("phone") != null)
                ph.setPhone(updates.get("phone").toString());
            if (updates.containsKey("qualification") && updates.get("qualification") != null)
                ph.setQualification(updates.get("qualification").toString());
            pharmacistRepository.save(ph);
            Map<String, Object> map = new HashMap<>();
            map.put("licenseNumber", ph.getLicenseNumber());
            map.put("qualification", ph.getQualification());
            map.put("phone", ph.getPhone());
            return ResponseEntity.ok(map);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
