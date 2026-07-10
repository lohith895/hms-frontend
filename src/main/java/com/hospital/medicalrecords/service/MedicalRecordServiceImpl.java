package com.hospital.medicalrecords.service;

import com.hospital.appointments.entity.Appointment;
import com.hospital.appointments.repository.AppointmentRepository;
import com.hospital.doctors.entity.Doctor;
import com.hospital.doctors.repository.DoctorRepository;
import com.hospital.medicalrecords.dto.MedicalRecordRequest;
import com.hospital.medicalrecords.dto.MedicalRecordResponse;
import com.hospital.medicalrecords.entity.MedicalRecord;
import com.hospital.medicalrecords.repository.MedicalRecordRepository;
import com.hospital.patients.entity.Patient;
import com.hospital.patients.repository.PatientRepository;
import com.hospital.users.entity.User;
import com.hospital.users.repository.UserRepository;
import com.hospital.medicalrecords.dto.ConsultationRequest;
import com.hospital.medicalrecords.dto.PrescriptionItemRequest;
import com.hospital.prescriptions.entity.Prescription;
import com.hospital.prescriptions.entity.PrescriptionItem;
import com.hospital.prescriptions.repository.PrescriptionRepository;
import com.hospital.prescriptions.repository.PrescriptionItemRepository;
import com.hospital.pharmacy.entity.Medicine;
import com.hospital.pharmacy.repository.MedicineRepository;
import com.hospital.laboratory.entity.LaboratoryReport;
import com.hospital.laboratory.entity.LaboratoryTest;
import com.hospital.laboratory.repository.LaboratoryReportRepository;
import com.hospital.laboratory.repository.LaboratoryTestRepository;
import com.hospital.medicalrecords.dto.LabTestOrderRequest;
import com.hospital.notifications.service.NotificationService;
import com.hospital.common.enums.PrescriptionStatus;
import com.hospital.common.enums.LaboratoryReportStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicineRepository medicineRepository;
    private final LaboratoryTestRepository labTestRepository;
    private final LaboratoryReportRepository labReportRepository;
    private final NotificationService notificationService;

    public MedicalRecordServiceImpl(MedicalRecordRepository medicalRecordRepository,
                                    PatientRepository patientRepository,
                                    DoctorRepository doctorRepository,
                                    AppointmentRepository appointmentRepository,
                                    UserRepository userRepository,
                                    PrescriptionRepository prescriptionRepository,
                                    PrescriptionItemRepository prescriptionItemRepository,
                                    MedicineRepository medicineRepository,
                                    LaboratoryTestRepository labTestRepository,
                                    LaboratoryReportRepository labReportRepository,
                                    NotificationService notificationService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.medicineRepository = medicineRepository;
        this.labTestRepository = labTestRepository;
        this.labReportRepository = labReportRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + request.getDoctorId()));

        Appointment appointment = null;
        if (request.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(request.getAppointmentId())
                    .orElse(null);
        }

        if (appointment != null && appointment.getStatus() == com.hospital.common.enums.AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("This appointment has already been finalized and closed by the administrator. No further modifications are allowed.");
        }

        MedicalRecord record = new MedicalRecord(
                patient,
                doctor,
                appointment,
                request.getDiagnosis(),
                request.getSymptoms(),
                request.getTreatmentPlan(),
                request.getAllergies(),
                request.getMedicalHistory(),
                request.getNotes(),
                request.getFollowUpDate(),
                request.getChronicConditions(),
                request.getVaccinationRecords(),
                request.getSurgicalHistory()
        );

        if (appointment != null) {
            appointment.setVisitStatus(com.hospital.common.enums.PatientVisitStatus.UNDER_CONSULTATION);
            appointmentRepository.save(appointment);
        }

        MedicalRecord saved = medicalRecordRepository.save(record);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public MedicalRecordResponse createConsultation(ConsultationRequest request, String doctorUsername) {
        Doctor doctor = doctorRepository.findByUserUsername(doctorUsername)
                .orElseThrow(() -> new RuntimeException("Doctor not found for username: " + doctorUsername));
                
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found: " + request.getPatientId()));
                
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + request.getAppointmentId()));
                
        if (appointment != null && appointment.getStatus() == com.hospital.common.enums.AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("This appointment has already been finalized and closed by the administrator. No further modifications are allowed.");
        }

        // 1. Create Medical Record
        MedicalRecord record = new MedicalRecord(
                patient, doctor, appointment,
                request.getDiagnosis(), request.getSymptoms(),
                request.getTreatmentPlan(), request.getAllergies(),
                request.getMedicalHistory(), request.getNotes(),
                request.getFollowUpDate(),
                request.getChronicConditions(),
                request.getVaccinationRecords(),
                request.getSurgicalHistory()
        );
        MedicalRecord savedRecord = medicalRecordRepository.save(record);
        
        // 2. Update visit status but leave appointment status as SCHEDULED (Only Admin can close it)
        if (appointment != null) {
            appointment.setVisitStatus(com.hospital.common.enums.PatientVisitStatus.CLOSED);
            appointmentRepository.save(appointment);
        }
        
        // 3. Create Prescriptions if any
        if (request.getMedicines() != null && !request.getMedicines().isEmpty()) {
            Prescription prescription = new Prescription(patient, doctor, savedRecord, PrescriptionStatus.PENDING);
            Prescription savedPrescription = prescriptionRepository.save(prescription);
            
            for (PrescriptionItemRequest itemReq : request.getMedicines()) {
                Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                        .orElseThrow(() -> new RuntimeException("Medicine not found: " + itemReq.getMedicineId()));
                PrescriptionItem item = new PrescriptionItem(
                        savedPrescription, medicine, itemReq.getDosage(), 
                        itemReq.getFrequency(), itemReq.getDurationDays(), itemReq.getQuantity()
                );
                prescriptionItemRepository.save(item);
            }
            
            // Update visit status to PHARMACY_PROCESSING
            if (appointment != null) {
                appointment.setVisitStatus(com.hospital.common.enums.PatientVisitStatus.PHARMACY_PROCESSING);
                appointmentRepository.save(appointment);
            }

            // Notify patient about new prescription
            if (patient.getUser() != null) {
                notificationService.createSystemNotification(
                    patient.getUser().getUsername(),
                    "New Prescription Available",
                    "Your doctor has prescribed new medicines. Please visit the Pharmacy department for dispensing."
                );
            }
            
            // Notify pharmacy staff
            triggerPharmacyNotification("New Prescription Ready",
                String.format("A new prescription with %d item(s) is ready for patient %s. Please review and dispense.",
                    request.getMedicines().size(),
                    patient.getUser() != null ? patient.getUser().getFirstName() + " " + patient.getUser().getLastName() : "Unknown"));
        }
        
        // 4. Create Lab Reports if any
        if (request.getLabTests() != null && !request.getLabTests().isEmpty()) {
            for (LabTestOrderRequest orderReq : request.getLabTests()) {
                LaboratoryTest labTest = labTestRepository.findById(orderReq.getTestId())
                        .orElseThrow(() -> new RuntimeException("Lab test not found: " + orderReq.getTestId()));
                LaboratoryReport report = new LaboratoryReport(
                        patient, doctor, labTest, null, null, LaboratoryReportStatus.PENDING, orderReq.getRemarks()
                );
                labReportRepository.save(report);
            }
            
            // Send patient notification
            if (patient.getUser() != null) {
                notificationService.createSystemNotification(
                    patient.getUser().getUsername(),
                    "Laboratory Tests Ordered",
                    "Your doctor has prescribed new laboratory tests. Please visit the laboratory department."
                );
            }
        }
        
        return mapToResponse(savedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getRecordsForPatient(Long patientId) {
        List<MedicalRecord> list = medicalRecordRepository.findByPatientIdOrderByRecordDateDesc(patientId);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalRecordResponse> getMyRecords(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        List<MedicalRecord> list;
        if (user.getRole().name().equals("ROLE_DOCTOR")) {
            list = medicalRecordRepository.findByDoctorUserIdOrderByRecordDateDesc(user.getId());
        } else if (user.getRole().name().equals("ROLE_PATIENT")) {
            list = medicalRecordRepository.findByPatientUserUsernameOrderByRecordDateDesc(username);
        } else {
            list = new ArrayList<>();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private void triggerPharmacyNotification(String title, String message) {
        List<User> pharmacists = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ROLE_PHARMACIST") || u.getRole().name().equals("ROLE_ADMIN"))
                .collect(Collectors.toList());

        for (User u : pharmacists) {
            notificationService.createSystemNotification(u.getUsername(), title, message);
        }
    }

    private MedicalRecordResponse mapToResponse(MedicalRecord record) {
        String patientName = record.getPatient().getUser() != null ?
                record.getPatient().getUser().getFirstName() + " " + record.getPatient().getUser().getLastName() : "Unknown";
        String doctorName = record.getDoctor().getUser() != null ?
                "Dr. " + record.getDoctor().getUser().getFirstName() + " " + record.getDoctor().getUser().getLastName() : "Dr. Unknown";

        return new MedicalRecordResponse(
                record.getId(),
                record.getPatient().getId(),
                patientName,
                record.getDoctor().getId(),
                doctorName,
                record.getAppointment() != null ? record.getAppointment().getId() : null,
                record.getDiagnosis(),
                record.getSymptoms(),
                record.getTreatmentPlan(),
                record.getAllergies(),
                record.getMedicalHistory(),
                record.getNotes(),
                record.getFollowUpDate(),
                record.getChronicConditions(),
                record.getVaccinationRecords(),
                record.getSurgicalHistory(),
                record.getRecordDate()
        );
    }
}
