package com.hospital.appointments.service;

import com.hospital.appointments.dto.AppointmentRequest;
import com.hospital.appointments.dto.AppointmentResponse;

public interface AppointmentService {
    AppointmentResponse createAppointment(AppointmentRequest request);
    java.util.List<AppointmentResponse> getAppointmentsForUser(org.springframework.security.core.userdetails.UserDetails userDetails);
    AppointmentResponse reassignAppointment(Long id, Long newDoctorId, org.springframework.security.core.userdetails.UserDetails userDetails);
    AppointmentResponse updateAppointmentStatus(Long id, com.hospital.common.enums.AppointmentStatus status, org.springframework.security.core.userdetails.UserDetails userDetails);
    AppointmentResponse updatePatientVisitStatus(Long id, com.hospital.common.enums.PatientVisitStatus visitStatus, org.springframework.security.core.userdetails.UserDetails userDetails);
}
