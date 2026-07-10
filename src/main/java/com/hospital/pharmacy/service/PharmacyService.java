package com.hospital.pharmacy.service;

import com.hospital.pharmacy.dto.MedicineInventoryRequest;
import com.hospital.pharmacy.dto.MedicineInventoryResponse;
import com.hospital.pharmacy.dto.MedicineRequest;
import com.hospital.pharmacy.dto.MedicineResponse;
import com.hospital.pharmacy.dto.PharmacyInvoiceResponse;
import com.hospital.common.enums.PharmacyInvoicePaymentStatus;

import java.util.List;

public interface PharmacyService {
    MedicineResponse createMedicine(MedicineRequest request);
    List<MedicineResponse> getAllMedicines();
    MedicineInventoryResponse addInventory(MedicineInventoryRequest request);
    List<MedicineInventoryResponse> getFullInventory();
    List<MedicineInventoryResponse> getLowStockItems();
    List<MedicineInventoryResponse> getExpiredItems();
    void checkExpiryAndLowStock();
    
    PharmacyInvoiceResponse getInvoiceByPrescription(Long prescriptionId);
    List<PharmacyInvoiceResponse> getPatientInvoices(Long patientId);
    List<PharmacyInvoiceResponse> getMyInvoices(String username);
    List<PharmacyInvoiceResponse> getAllInvoices();
    PharmacyInvoiceResponse updatePaymentStatus(Long invoiceId, PharmacyInvoicePaymentStatus status);
}
