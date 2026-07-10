package com.hospital.appointments.service;

import com.hospital.appointments.dto.AppointmentEvent;
import com.hospital.appointments.dto.AppointmentRequest;
import com.hospital.appointments.dto.AppointmentResponse;
import com.hospital.appointments.entity.Appointment;
import com.hospital.appointments.producer.AppointmentEventProducer;
import com.hospital.appointments.repository.AppointmentRepository;
import com.hospital.common.enums.AppointmentStatus;
import com.hospital.doctors.entity.Doctor;
import com.hospital.doctors.repository.DoctorRepository;
import com.hospital.patients.entity.Patient;
import com.hospital.patients.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentEventProducer appointmentEventProducer;
    private final com.hospital.users.repository.UserRepository userRepository;
    private final com.hospital.notifications.service.NotificationService notificationService;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  PatientRepository patientRepository,
                                  DoctorRepository doctorRepository,
                                  AppointmentEventProducer appointmentEventProducer,
                                  com.hospital.users.repository.UserRepository userRepository,
                                  com.hospital.notifications.service.NotificationService notificationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentEventProducer = appointmentEventProducer;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + request.getDoctorId()));

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDateTime(request.getAppointmentDateTime());
        appointment.setStatus(AppointmentStatus.SCHEDULED);
        appointment.setVisitStatus(com.hospital.common.enums.PatientVisitStatus.WAITING);
        appointment.setReason(request.getReason());
        appointment.setNotes(request.getNotes());

        Appointment savedAppointment = appointmentRepository.save(appointment);

        String patientFullName = patient.getUser().getFirstName() + " " + patient.getUser().getLastName();
        String doctorFullName = "Dr. " + doctor.getUser().getFirstName() + " " + doctor.getUser().getLastName();

        AppointmentEvent event = new AppointmentEvent(
                savedAppointment.getId(),
                patient.getId(),
                patientFullName,
                patient.getUser().getEmail(),
                patient.getEmergencyContact(),
                doctor.getId(),
                doctorFullName,
                doctor.getUser().getEmail(),
                savedAppointment.getAppointmentDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                savedAppointment.getReason(),
                savedAppointment.getStatus().name()
        );

        appointmentEventProducer.sendAppointmentCreatedEvent(event);

        return new AppointmentResponse(
                savedAppointment.getId(),
                patient.getId(),
                patientFullName,
                doctor.getId(),
                doctorFullName,
                savedAppointment.getAppointmentDateTime(),
                savedAppointment.getStatus(),
                savedAppointment.getVisitStatus(),
                savedAppointment.getReason(),
                savedAppointment.getNotes()
        );
    }

    @Override
    @Transactional
    public java.util.List<AppointmentResponse> getAppointmentsForUser(org.springframework.security.core.userdetails.UserDetails userDetails) {
        String username = userDetails.getUsername();
        com.hospital.users.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        java.util.List<Appointment> appointments;
        String roleName = user.getRole().name();

        if (roleName.equals("ROLE_ADMIN") || roleName.equals("ROLE_RECEPTIONIST") || roleName.equals("ROLE_NURSE")) {
            appointments = appointmentRepository.findAll();
        } else if (roleName.equals("ROLE_DOCTOR")) {
            appointments = appointmentRepository.findByDoctorUserId(user.getId());
        } else if (roleName.equals("ROLE_PATIENT")) {
            appointments = appointmentRepository.findByPatientUserId(user.getId());
        } else {
            appointments = new java.util.ArrayList<>();
        }

        java.util.List<AppointmentResponse> responses = new java.util.ArrayList<>();
        for (Appointment app : appointments) {
            String pName = app.getPatient().getUser() != null ? app.getPatient().getUser().getFirstName() + " " + app.getPatient().getUser().getLastName() : "Unknown";
            String dName = app.getDoctor().getUser() != null ? "Dr. " + app.getDoctor().getUser().getFirstName() + " " + app.getDoctor().getUser().getLastName() : "Dr. Unknown";
            responses.add(new AppointmentResponse(
                    app.getId(),
                    app.getPatient().getId(),
                    pName,
                    app.getDoctor().getId(),
                    dName,
                    app.getAppointmentDateTime(),
                    app.getStatus(),
                    app.getVisitStatus(),
                    app.getReason(),
                    app.getNotes()
            ));
        }
        return responses;
    }

    @Override
    @Transactional
    public AppointmentResponse reassignAppointment(Long id, Long newDoctorId, org.springframework.security.core.userdetails.UserDetails userDetails) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
                
        Doctor newDoctor = doctorRepository.findById(newDoctorId)
                .orElseThrow(() -> new RuntimeException("New doctor not found"));
                
        appointment.setDoctor(newDoctor);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        String pName = appointment.getPatient().getUser().getFirstName() + " " + appointment.getPatient().getUser().getLastName();
        String dName = "Dr. " + newDoctor.getUser().getFirstName() + " " + newDoctor.getUser().getLastName();
        
        // Notify patient
        notificationService.createSystemNotification(
            appointment.getPatient().getUser().getUsername(),
            "Appointment Reassigned",
            "Your appointment on " + appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) + " has been reassigned to " + dName
        );
        
        // Notify new doctor
        notificationService.createSystemNotification(
            newDoctor.getUser().getUsername(),
            "New Appointment Assigned",
            "You have been assigned a new appointment with " + pName + " on " + appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"))
        );
        
        return new AppointmentResponse(
                savedAppointment.getId(),
                appointment.getPatient().getId(),
                pName,
                newDoctor.getId(),
                dName,
                savedAppointment.getAppointmentDateTime(),
                savedAppointment.getStatus(),
                savedAppointment.getVisitStatus(),
                savedAppointment.getReason(),
                savedAppointment.getNotes()
        );
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointmentStatus(Long id, AppointmentStatus status, org.springframework.security.core.userdetails.UserDetails userDetails) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
                
        if (status == AppointmentStatus.COMPLETED) {
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                throw new IllegalStateException("Only administrators have the authority to finalize and close appointments.");
            }
            appointment.setVisitStatus(com.hospital.common.enums.PatientVisitStatus.CLOSED);
        }
                 
        appointment.setStatus(status);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        String pName = appointment.getPatient().getUser().getFirstName() + " " + appointment.getPatient().getUser().getLastName();
        String dName = "Dr. " + appointment.getDoctor().getUser().getFirstName() + " " + appointment.getDoctor().getUser().getLastName();
        
        // Notify patient if approved/scheduled
        if (status == AppointmentStatus.SCHEDULED) {
            notificationService.createSystemNotification(
                appointment.getPatient().getUser().getUsername(),
                "Appointment Approved",
                "Your appointment with " + dName + " on " + appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) + " has been confirmed."
            );
        } else if (status == AppointmentStatus.CANCELLED) {
            notificationService.createSystemNotification(
                appointment.getPatient().getUser().getUsername(),
                "Appointment Cancelled",
                "Your appointment with " + dName + " on " + appointment.getAppointmentDateTime().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm")) + " has been cancelled."
            );
        }
        
        return new AppointmentResponse(
                savedAppointment.getId(),
                appointment.getPatient().getId(),
                pName,
                appointment.getDoctor().getId(),
                dName,
                savedAppointment.getAppointmentDateTime(),
                savedAppointment.getStatus(),
                savedAppointment.getVisitStatus(),
                savedAppointment.getReason(),
                savedAppointment.getNotes()
        );
    }

    @Override
    @Transactional
    public AppointmentResponse updatePatientVisitStatus(Long id, com.hospital.common.enums.PatientVisitStatus visitStatus, org.springframework.security.core.userdetails.UserDetails userDetails) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
                
        appointment.setVisitStatus(visitStatus);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        String pName = appointment.getPatient().getUser().getFirstName() + " " + appointment.getPatient().getUser().getLastName();
        String dName = "Dr. " + appointment.getDoctor().getUser().getFirstName() + " " + appointment.getDoctor().getUser().getLastName();
        
        return new AppointmentResponse(
                savedAppointment.getId(),
                appointment.getPatient().getId(),
                pName,
                appointment.getDoctor().getId(),
                dName,
                savedAppointment.getAppointmentDateTime(),
                savedAppointment.getStatus(),
                savedAppointment.getVisitStatus(),
                savedAppointment.getReason(),
                savedAppointment.getNotes()
        );
    }
}
