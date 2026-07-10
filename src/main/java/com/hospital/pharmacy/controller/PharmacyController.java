package com.hospital.pharmacy.controller;

import com.hospital.pharmacy.dto.MedicineInventoryRequest;
import com.hospital.pharmacy.dto.MedicineInventoryResponse;
import com.hospital.pharmacy.dto.MedicineRequest;
import com.hospital.pharmacy.dto.MedicineResponse;
import com.hospital.pharmacy.dto.PharmacyInvoiceResponse;
import com.hospital.common.enums.PharmacyInvoicePaymentStatus;
import com.hospital.pharmacy.service.PharmacyService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pharmacy")
@CrossOrigin(origins = "http://localhost:3000")
public class PharmacyController {

    private final PharmacyService pharmacyService;

    public PharmacyController(PharmacyService pharmacyService) {
        this.pharmacyService = pharmacyService;
    }

    @PostMapping("/medicines")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','INVENTORY_MANAGER')")
    public ResponseEntity<MedicineResponse> createMedicine(@Valid @RequestBody MedicineRequest request) {
        MedicineResponse response = pharmacyService.createMedicine(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/medicines")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','PHARMACIST','INVENTORY_MANAGER','NURSE')")
    public ResponseEntity<List<MedicineResponse>> getAllMedicines() {
        List<MedicineResponse> responses = pharmacyService.getAllMedicines();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/inventory")
    @PreAuthorize("hasAnyRole('PHARMACIST','INVENTORY_MANAGER')")
    public ResponseEntity<MedicineInventoryResponse> addInventory(@Valid @RequestBody MedicineInventoryRequest request) {
        MedicineInventoryResponse response = pharmacyService.addInventory(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('PHARMACIST','INVENTORY_MANAGER')")
    public ResponseEntity<List<MedicineInventoryResponse>> getFullInventory() {
        List<MedicineInventoryResponse> responses = pharmacyService.getFullInventory();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/inventory/low-stock")
    @PreAuthorize("hasAnyRole('PHARMACIST','INVENTORY_MANAGER')")
    public ResponseEntity<List<MedicineInventoryResponse>> getLowStockItems() {
        List<MedicineInventoryResponse> responses = pharmacyService.getLowStockItems();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/inventory/expired")
    @PreAuthorize("hasAnyRole('PHARMACIST','INVENTORY_MANAGER')")
    public ResponseEntity<List<MedicineInventoryResponse>> getExpiredItems() {
        List<MedicineInventoryResponse> responses = pharmacyService.getExpiredItems();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/inventory/check-alerts")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<String> manuallyCheckAlerts() {
        pharmacyService.checkExpiryAndLowStock();
        return ResponseEntity.ok("Pharmacy stock scan executed successfully.");
    }

    @GetMapping("/invoices/prescription/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','PATIENT')")
    public ResponseEntity<PharmacyInvoiceResponse> getInvoiceByPrescription(@PathVariable Long id) {
        PharmacyInvoiceResponse response = pharmacyService.getInvoiceByPrescription(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/invoices/patient/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','PATIENT')")
    public ResponseEntity<List<PharmacyInvoiceResponse>> getPatientInvoices(@PathVariable Long id) {
        List<PharmacyInvoiceResponse> responses = pharmacyService.getPatientInvoices(id);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/invoices/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PharmacyInvoiceResponse>> getMyInvoices() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        List<PharmacyInvoiceResponse> responses = pharmacyService.getMyInvoices(username);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','FINANCE_MANAGER')")
    public ResponseEntity<List<PharmacyInvoiceResponse>> getAllInvoices() {
        List<PharmacyInvoiceResponse> responses = pharmacyService.getAllInvoices();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/invoices/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','FINANCE_MANAGER')")
    public ResponseEntity<PharmacyInvoiceResponse> updatePaymentStatus(
            @PathVariable Long id, 
            @RequestParam String status) {
        PharmacyInvoicePaymentStatus paymentStatus = PharmacyInvoicePaymentStatus.valueOf(status.toUpperCase());
        PharmacyInvoiceResponse response = pharmacyService.updatePaymentStatus(id, paymentStatus);
        return ResponseEntity.ok(response);
    }
}
