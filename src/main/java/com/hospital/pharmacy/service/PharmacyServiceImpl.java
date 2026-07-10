package com.hospital.pharmacy.service;

import com.hospital.notifications.service.NotificationService;
import com.hospital.pharmacy.dto.MedicineInventoryRequest;
import com.hospital.pharmacy.dto.MedicineInventoryResponse;
import com.hospital.pharmacy.dto.MedicineRequest;
import com.hospital.pharmacy.dto.MedicineResponse;
import com.hospital.pharmacy.dto.PharmacyInvoiceResponse;
import com.hospital.pharmacy.dto.PharmacyInvoiceItemResponse;
import com.hospital.common.enums.PharmacyInvoicePaymentStatus;
import com.hospital.pharmacy.entity.Medicine;
import com.hospital.pharmacy.entity.MedicineInventory;
import com.hospital.pharmacy.entity.PharmacyInvoice;
import com.hospital.pharmacy.entity.PharmacyInvoiceItem;
import com.hospital.pharmacy.repository.MedicineInventoryRepository;
import com.hospital.pharmacy.repository.MedicineRepository;
import com.hospital.pharmacy.repository.PharmacyInvoiceRepository;
import com.hospital.pharmacy.repository.PharmacyInvoiceItemRepository;
import com.hospital.patients.entity.Patient;
import com.hospital.patients.repository.PatientRepository;
import com.hospital.users.entity.User;
import com.hospital.users.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PharmacyServiceImpl implements PharmacyService {

    private final MedicineRepository medicineRepository;
    private final MedicineInventoryRepository medicineInventoryRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final PharmacyInvoiceRepository pharmacyInvoiceRepository;
    private final PharmacyInvoiceItemRepository pharmacyInvoiceItemRepository;
    private final PatientRepository patientRepository;

    public PharmacyServiceImpl(MedicineRepository medicineRepository,
                               MedicineInventoryRepository medicineInventoryRepository,
                               NotificationService notificationService,
                               UserRepository userRepository,
                               PharmacyInvoiceRepository pharmacyInvoiceRepository,
                               PharmacyInvoiceItemRepository pharmacyInvoiceItemRepository,
                               PatientRepository patientRepository) {
        this.medicineRepository = medicineRepository;
        this.medicineInventoryRepository = medicineInventoryRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.pharmacyInvoiceRepository = pharmacyInvoiceRepository;
        this.pharmacyInvoiceItemRepository = pharmacyInvoiceItemRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        if (medicineRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Medicine code already exists: " + request.getCode());
        }

        Medicine medicine = new Medicine(
                request.getName(),
                request.getCode(),
                request.getCategory(),
                request.getManufacturer(),
                request.getDescription(),
                request.isActive()
        );

        Medicine saved = medicineRepository.save(medicine);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineResponse> getAllMedicines() {
        return medicineRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicineInventoryResponse addInventory(MedicineInventoryRequest request) {
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new RuntimeException("Medicine not found: " + request.getMedicineId()));

        MedicineInventory inventory = new MedicineInventory(
                medicine,
                request.getBatchNumber(),
                request.getExpiryDate(),
                request.getStockQuantity(),
                request.getPricePerUnit()
        );

        MedicineInventory saved = medicineInventoryRepository.save(inventory);
        
        // Instant check if newly added batch creates alerts
        if (saved.getStockQuantity() < 20) {
            triggerAlertToStaff("Low Stock Warning", String.format("New batch %s of medicine '%s' is registered with low stock: %d units", 
                    saved.getBatchNumber(), saved.getMedicine().getName(), saved.getStockQuantity()));
        }
        if (saved.getExpiryDate().isBefore(LocalDate.now())) {
            triggerAlertToStaff("Expired Batch Added", String.format("Batch %s of medicine '%s' is expired (Expiry date: %s)", 
                    saved.getBatchNumber(), saved.getMedicine().getName(), saved.getExpiryDate()));
        }

        return mapToInventoryResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineInventoryResponse> getFullInventory() {
        return medicineInventoryRepository.findAll().stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineInventoryResponse> getLowStockItems() {
        return medicineInventoryRepository.findLowStock(20).stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicineInventoryResponse> getExpiredItems() {
        return medicineInventoryRepository.findExpiredBefore(LocalDate.now()).stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void checkExpiryAndLowStock() {
        LocalDate today = LocalDate.now();
        List<MedicineInventory> expired = medicineInventoryRepository.findExpiredBefore(today);
        List<MedicineInventory> lowStock = medicineInventoryRepository.findLowStock(20);

        for (MedicineInventory i : expired) {
            String title = "Stock Expiry Warning";
            String message = String.format("Batch %s of drug '%s' expired on %s! Remove from inventory immediately.",
                    i.getBatchNumber(), i.getMedicine().getName(), i.getExpiryDate());
            triggerAlertToStaff(title, message);
        }

        for (MedicineInventory i : lowStock) {
            String title = "Low Stock Alert";
            String message = String.format("Drug '%s' (Batch: %s) stock level is critical. Remaining: %d units.",
                    i.getMedicine().getName(), i.getBatchNumber(), i.getStockQuantity());
            triggerAlertToStaff(title, message);
        }
    }

    private void triggerAlertToStaff(String title, String message) {
        List<User> staff = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ROLE_PHARMACIST") || u.getRole().name().equals("ROLE_INVENTORY_MANAGER") || u.getRole().name().equals("ROLE_ADMIN"))
                .collect(Collectors.toList());

        for (User u : staff) {
            notificationService.createSystemNotification(u.getUsername(), title, message);
        }
    }

    private MedicineResponse mapToResponse(Medicine m) {
        return new MedicineResponse(
                m.getId(),
                m.getName(),
                m.getCode(),
                m.getCategory(),
                m.getManufacturer(),
                m.getDescription(),
                m.isActive()
        );
    }

    private MedicineInventoryResponse mapToInventoryResponse(MedicineInventory i) {
        return new MedicineInventoryResponse(
                i.getId(),
                i.getMedicine().getId(),
                i.getMedicine().getName(),
                i.getMedicine().getCode(),
                i.getMedicine().getCategory(),
                i.getBatchNumber(),
                i.getExpiryDate(),
                i.getStockQuantity(),
                i.getPricePerUnit()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PharmacyInvoiceResponse getInvoiceByPrescription(Long prescriptionId) {
        PharmacyInvoice invoice = pharmacyInvoiceRepository.findByPrescriptionId(prescriptionId)
                .orElseThrow(() -> new RuntimeException("No invoice found for prescription: " + prescriptionId));
        return mapToInvoiceResponse(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyInvoiceResponse> getPatientInvoices(Long patientId) {
        return pharmacyInvoiceRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(this::mapToInvoiceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyInvoiceResponse> getMyInvoices(String username) {
        Patient patient = patientRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Patient profile not found for user: " + username));
        return pharmacyInvoiceRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId()).stream()
                .map(this::mapToInvoiceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PharmacyInvoiceResponse> getAllInvoices() {
        return pharmacyInvoiceRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToInvoiceResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PharmacyInvoiceResponse updatePaymentStatus(Long invoiceId, PharmacyInvoicePaymentStatus status) {
        PharmacyInvoice invoice = pharmacyInvoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));
        invoice.setPaymentStatus(status);
        PharmacyInvoice saved = pharmacyInvoiceRepository.save(invoice);

        if (status == PharmacyInvoicePaymentStatus.PAID && invoice.getPatient().getUser() != null) {
            notificationService.createSystemNotification(
                    invoice.getPatient().getUser().getUsername(),
                    "Pharmacy Payment Confirmed",
                    String.format("Your pharmacy invoice %s (₹%.2f) has been marked as paid.", invoice.getInvoiceNumber(), invoice.getGrandTotal())
            );
        }

        return mapToInvoiceResponse(saved);
    }

    private PharmacyInvoiceResponse mapToInvoiceResponse(PharmacyInvoice inv) {
        PharmacyInvoiceResponse res = new PharmacyInvoiceResponse();
        res.setId(inv.getId());
        res.setInvoiceNumber(inv.getInvoiceNumber());
        res.setPrescriptionId(inv.getPrescription().getId());
        res.setPatientId(inv.getPatient().getId());
        String patientName = inv.getPatient().getUser() != null ?
                inv.getPatient().getUser().getFirstName() + " " + inv.getPatient().getUser().getLastName() : "Unknown";
        res.setPatientName(patientName);
        res.setSubtotal(inv.getSubtotal());
        res.setDiscountPercent(inv.getDiscountPercent());
        res.setDiscountAmount(inv.getDiscountAmount());
        res.setGstPercent(inv.getGstPercent());
        res.setGstAmount(inv.getGstAmount());
        res.setGrandTotal(inv.getGrandTotal());
        res.setPaymentStatus(inv.getPaymentStatus());
        res.setCreatedAt(inv.getCreatedAt());

        List<PharmacyInvoiceItem> items = pharmacyInvoiceItemRepository.findByPharmacyInvoiceId(inv.getId());
        res.setItems(items.stream().map(item -> new PharmacyInvoiceItemResponse(
                item.getId(),
                item.getMedicineName(),
                item.getMedicineCode(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getTotalPrice()
        )).collect(Collectors.toList()));

        return res;
    }
}
