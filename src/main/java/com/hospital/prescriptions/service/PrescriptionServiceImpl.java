package com.hospital.prescriptions.service;

import com.hospital.common.enums.PrescriptionStatus;
import com.hospital.common.enums.PharmacyInvoicePaymentStatus;
import com.hospital.doctors.entity.Doctor;
import com.hospital.doctors.repository.DoctorRepository;
import com.hospital.notifications.service.NotificationService;
import com.hospital.patients.entity.Patient;
import com.hospital.patients.repository.PatientRepository;
import com.hospital.pharmacy.entity.Medicine;
import com.hospital.pharmacy.entity.MedicineInventory;
import com.hospital.pharmacy.entity.PharmacyInvoice;
import com.hospital.pharmacy.entity.PharmacyInvoiceItem;
import com.hospital.pharmacy.repository.MedicineInventoryRepository;
import com.hospital.pharmacy.repository.MedicineRepository;
import com.hospital.pharmacy.repository.PharmacyInvoiceRepository;
import com.hospital.pharmacy.repository.PharmacyInvoiceItemRepository;
import com.hospital.prescriptions.dto.PrescriptionItemRequest;
import com.hospital.prescriptions.dto.PrescriptionItemResponse;
import com.hospital.prescriptions.dto.PrescriptionRequest;
import com.hospital.prescriptions.dto.PrescriptionResponse;
import com.hospital.prescriptions.entity.Prescription;
import com.hospital.prescriptions.entity.PrescriptionItem;
import com.hospital.prescriptions.repository.PrescriptionItemRepository;
import com.hospital.prescriptions.repository.PrescriptionRepository;
import com.hospital.appointments.repository.AppointmentRepository;
import com.hospital.users.service.AuditLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicineRepository medicineRepository;
    private final MedicineInventoryRepository medicineInventoryRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final PharmacyInvoiceRepository pharmacyInvoiceRepository;
    private final PharmacyInvoiceItemRepository pharmacyInvoiceItemRepository;
    private final AppointmentRepository appointmentRepository;

    public PrescriptionServiceImpl(PrescriptionRepository prescriptionRepository,
                                   PrescriptionItemRepository prescriptionItemRepository,
                                   MedicineRepository medicineRepository,
                                   MedicineInventoryRepository medicineInventoryRepository,
                                   PatientRepository patientRepository,
                                   DoctorRepository doctorRepository,
                                   NotificationService notificationService,
                                   AuditLogService auditLogService,
                                   PharmacyInvoiceRepository pharmacyInvoiceRepository,
                                   PharmacyInvoiceItemRepository pharmacyInvoiceItemRepository,
                                   AppointmentRepository appointmentRepository) {
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.medicineRepository = medicineRepository;
        this.medicineInventoryRepository = medicineInventoryRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.pharmacyInvoiceRepository = pharmacyInvoiceRepository;
        this.pharmacyInvoiceItemRepository = pharmacyInvoiceItemRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    @Transactional
    public PrescriptionResponse createPrescription(PrescriptionRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + request.getDoctorId()));

        Prescription prescription = new Prescription(
                patient,
                doctor,
                null, // medicalRecord will be set if passed or can remain null for walk-ins
                PrescriptionStatus.PENDING
        );

        Prescription savedPrescription = prescriptionRepository.save(prescription);

        List<PrescriptionItem> items = new ArrayList<>();
        for (PrescriptionItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new RuntimeException("Medicine not found: " + itemReq.getMedicineId()));

            PrescriptionItem item = new PrescriptionItem(
                    savedPrescription,
                    medicine,
                    itemReq.getDosage(),
                    itemReq.getFrequency(),
                    itemReq.getDurationDays(),
                    itemReq.getQuantity()
            );
            items.add(prescriptionItemRepository.save(item));
        }

        // Notify patient that a prescription has been registered
        if (patient.getUser() != null) {
            notificationService.createSystemNotification(
                    patient.getUser().getUsername(),
                    "New Prescription Registered",
                    String.format("Dr. %s has prescribed new medications for you. Please visit the pharmacy to collect them.",
                            doctor.getUser() != null ? doctor.getUser().getLastName() : "attending physician")
            );
        }

        return mapToResponse(savedPrescription, items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPendingPrescriptions() {
        return prescriptionRepository.findByStatusOrderByPrescribedDateDesc(PrescriptionStatus.PENDING).stream()
                .map(p -> {
                    List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(p.getId());
                    return mapToResponse(p, items);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPatientPrescriptions(Long patientId) {
        return prescriptionRepository.findByPatientIdOrderByPrescribedDateDesc(patientId).stream()
                .map(p -> {
                    List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(p.getId());
                    return mapToResponse(p, items);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getMyPrescriptions(String username) {
        Patient patient = patientRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Patient profile not found for user: " + username));
        return prescriptionRepository.findByPatientIdOrderByPrescribedDateDesc(patient.getId()).stream()
                .map(p -> {
                    List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(p.getId());
                    return mapToResponse(p, items);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PrescriptionResponse> getPrescriptionsForDoctor(String doctorUsername) {
        Doctor doc = doctorRepository.findByUserUsername(doctorUsername)
                .orElseThrow(() -> new RuntimeException("Doctor profile not found for user: " + doctorUsername));

        return prescriptionRepository.findByDoctorUserIdOrderByPrescribedDateDesc(doc.getUser().getId()).stream()
                .map(p -> {
                    List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(p.getId());
                    return mapToResponse(p, items);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PrescriptionResponse dispensePrescription(Long prescriptionId) {
        Prescription prescription = prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() -> new RuntimeException("Prescription not found: " + prescriptionId));

        if (prescription.getStatus() != PrescriptionStatus.PENDING) {
            throw new RuntimeException("Prescription is already dispensed or cancelled.");
        }

        List<PrescriptionItem> items = prescriptionItemRepository.findByPrescriptionId(prescriptionId);

        // FEFO (First-Expired, First-Out) Validation
        for (PrescriptionItem item : items) {
            Medicine medicine = item.getMedicine();
            int requiredQty = item.getQuantity();

            // Find all active unexpired batches for this medicine
            List<MedicineInventory> batches = medicineInventoryRepository.findAll().stream()
                    .filter(i -> i.getMedicine().getId().equals(medicine.getId()))
                    .filter(i -> i.getExpiryDate().isAfter(LocalDate.now()))
                    .filter(i -> i.getStockQuantity() > 0)
                    .sorted(Comparator.comparing(x -> x.getExpiryDate())) // Expiring first
                    .collect(Collectors.toList());

            int totalAvailable = batches.stream().mapToInt(x -> x.getStockQuantity()).sum();
            if (totalAvailable < requiredQty) {
                throw new RuntimeException(String.format("Insufficient unexpired stock for medicine '%s'. Required: %d, Available: %d",
                        medicine.getName(), requiredQty, totalAvailable));
            }
        }

        // Deduct stock sequentially
        for (PrescriptionItem item : items) {
            Medicine medicine = item.getMedicine();
            int requiredQty = item.getQuantity();

            List<MedicineInventory> batches = medicineInventoryRepository.findAll().stream()
                    .filter(i -> i.getMedicine().getId().equals(medicine.getId()))
                    .filter(i -> i.getExpiryDate().isAfter(LocalDate.now()))
                    .filter(i -> i.getStockQuantity() > 0)
                    .sorted(Comparator.comparing(x -> x.getExpiryDate()))
                    .collect(Collectors.toList());

            int remainingToDeduct = requiredQty;
            for (MedicineInventory batch : batches) {
                int batchQty = batch.getStockQuantity();
                if (batchQty >= remainingToDeduct) {
                    batch.setStockQuantity(batchQty - remainingToDeduct);
                    medicineInventoryRepository.save(batch);
                    break;
                } else {
                    remainingToDeduct -= batchQty;
                    batch.setStockQuantity(0);
                    medicineInventoryRepository.save(batch);
                }
            }
        }

        prescription.setStatus(PrescriptionStatus.DISPENSED);
        Prescription saved = prescriptionRepository.save(prescription);

        if (saved.getMedicalRecord() != null && saved.getMedicalRecord().getAppointment() != null) {
            com.hospital.appointments.entity.Appointment app = saved.getMedicalRecord().getAppointment();
            app.setVisitStatus(com.hospital.common.enums.PatientVisitStatus.CLOSED);
            appointmentRepository.save(app);
        }

        // === Generate Pharmacy Invoice ===
        PharmacyInvoice invoice = new PharmacyInvoice();
        String invoiceNum = "PH-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + "-" + prescriptionId;
        invoice.setInvoiceNumber(invoiceNum);
        invoice.setPrescription(saved);
        invoice.setPatient(prescription.getPatient());

        double subtotal = 0.0;
        PharmacyInvoice savedInvoice = pharmacyInvoiceRepository.save(invoice);

        for (PrescriptionItem item : items) {
            // Look up the unit price from the first available inventory batch
            Double unitPrice = medicineInventoryRepository.findAll().stream()
                    .filter(inv -> inv.getMedicine().getId().equals(item.getMedicine().getId()))
                    .filter(inv -> inv.getPricePerUnit() != null)
                    .map(inv -> inv.getPricePerUnit())
                    .findFirst()
                    .orElse(0.0);

            double lineTotal = unitPrice * item.getQuantity();
            subtotal += lineTotal;

            PharmacyInvoiceItem invoiceItem = new PharmacyInvoiceItem(
                    savedInvoice,
                    item.getMedicine().getName(),
                    item.getMedicine().getCode(),
                    item.getQuantity(),
                    unitPrice,
                    lineTotal
            );
            pharmacyInvoiceItemRepository.save(invoiceItem);
        }

        double discountPercent = 0.0;
        double discountAmount = subtotal * (discountPercent / 100.0);
        double afterDiscount = subtotal - discountAmount;
        double gstPercent = 18.0;
        double gstAmount = afterDiscount * (gstPercent / 100.0);
        double grandTotal = afterDiscount + gstAmount;

        savedInvoice.setSubtotal(Math.round(subtotal * 100.0) / 100.0);
        savedInvoice.setDiscountPercent(discountPercent);
        savedInvoice.setDiscountAmount(Math.round(discountAmount * 100.0) / 100.0);
        savedInvoice.setGstPercent(gstPercent);
        savedInvoice.setGstAmount(Math.round(gstAmount * 100.0) / 100.0);
        savedInvoice.setGrandTotal(Math.round(grandTotal * 100.0) / 100.0);
        savedInvoice.setPaymentStatus(PharmacyInvoicePaymentStatus.UNPAID);
        pharmacyInvoiceRepository.save(savedInvoice);

        // Audit Logging
        String patientName = prescription.getPatient().getUser() != null ?
                prescription.getPatient().getUser().getFirstName() + " " + prescription.getPatient().getUser().getLastName() : "Unknown";
        auditLogService.log(
                "SYSTEM",
                "MEDICINE_DISPENSE",
                String.format("Dispensed prescription ID: %d for patient: %s", prescription.getId(), patientName),
                "0.0.0.0"
        );

        // Notify patient that their prescription has been successfully dispensed
        if (prescription.getPatient().getUser() != null) {
            notificationService.createSystemNotification(
                    prescription.getPatient().getUser().getUsername(),
                    "Prescription Dispensed",
                    "Your prescription has been dispensed by the pharmacist. Take as directed by your physician."
            );
        }

        return mapToResponse(saved, items);
    }

    private PrescriptionResponse mapToResponse(Prescription p, List<PrescriptionItem> items) {
        String patientName = p.getPatient().getUser() != null ?
                p.getPatient().getUser().getFirstName() + " " + p.getPatient().getUser().getLastName() : "Unknown";
        String doctorName = p.getDoctor().getUser() != null ?
                "Dr. " + p.getDoctor().getUser().getFirstName() + " " + p.getDoctor().getUser().getLastName() : "Dr. Unknown";

        List<PrescriptionItemResponse> itemResponses = items.stream()
                .map(i -> new PrescriptionItemResponse(
                        i.getId(),
                        i.getMedicine().getId(),
                        i.getMedicine().getName(),
                        i.getMedicine().getCode(),
                        i.getDosage(),
                        i.getFrequency(),
                        i.getDurationDays(),
                        i.getQuantity()
                ))
                .collect(Collectors.toList());

        return new PrescriptionResponse(
                p.getId(),
                p.getPatient().getId(),
                patientName,
                p.getDoctor().getId(),
                doctorName,
                p.getMedicalRecord() != null ? p.getMedicalRecord().getId() : null,
                p.getPrescribedDate(),
                p.getStatus(),
                itemResponses
        );
    }
}
