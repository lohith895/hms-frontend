package com.hospital.nurses.controller;

import com.hospital.nurses.entity.Nurse;
import com.hospital.nurses.repository.NurseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/nurses")
@CrossOrigin(origins = "http://localhost:3000")
public class NurseController {

    private final NurseRepository nurseRepository;

    public NurseController(NurseRepository nurseRepository) {
        this.nurseRepository = nurseRepository;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<?> getMyNurseProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails.getUsername();
            Nurse nurse = nurseRepository.findByUserUsername(username)
                    .orElseThrow(() -> new RuntimeException("Nurse profile not found"));
            Map<String, Object> map = new HashMap<>();
            map.put("id", nurse.getId());
            map.put("phone", nurse.getPhone());
            map.put("shift", nurse.getShift());
            map.put("departmentName", nurse.getDepartment() != null ? nurse.getDepartment().getName() : "");
            return ResponseEntity.ok(map);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('NURSE')")
    public ResponseEntity<?> updateMyNurseProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> updates) {
        try {
            String username = userDetails.getUsername();
            Nurse nurse = nurseRepository.findByUserUsername(username)
                    .orElseThrow(() -> new RuntimeException("Nurse profile not found"));
            if (updates.containsKey("phone") && updates.get("phone") != null)
                nurse.setPhone(updates.get("phone").toString());
            if (updates.containsKey("shift") && updates.get("shift") != null)
                nurse.setShift(updates.get("shift").toString());
            nurseRepository.save(nurse);
            Map<String, Object> map = new HashMap<>();
            map.put("phone", nurse.getPhone());
            map.put("shift", nurse.getShift());
            map.put("departmentName", nurse.getDepartment() != null ? nurse.getDepartment().getName() : "");
            return ResponseEntity.ok(map);
        } catch (Exception ex) {
            Map<String, String> err = new HashMap<>();
            err.put("message", ex.getMessage());
            return ResponseEntity.badRequest().body(err);
        }
    }
}
