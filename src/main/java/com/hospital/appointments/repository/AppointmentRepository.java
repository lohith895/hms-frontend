package com.hospital.appointments.repository;

import com.hospital.appointments.entity.Appointment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByDoctorUserId(Long userId);
    List<Appointment> findByPatientUserId(Long userId);
    
    long countByDoctorUserIdAndAppointmentDateTimeBetween(Long doctorId, LocalDateTime start, LocalDateTime end);
    long countByDoctorUserIdAndStatus(Long doctorId, com.hospital.common.enums.AppointmentStatus status);
    long countByPatientUserIdAndStatus(Long patientId, com.hospital.common.enums.AppointmentStatus status);
    long countByAppointmentDateTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Appointment> findByAppointmentDateTimeBetweenOrderByAppointmentDateTimeAsc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE DATE(a.appointmentDateTime) = CURRENT_DATE")
    long countTodaysAppointments();

    @Query(
        "SELECT HOUR(a.appointmentDateTime) as hr, COUNT(a) as cnt " +
        "FROM Appointment a WHERE DATE(a.appointmentDateTime) = CURRENT_DATE " +
        "GROUP BY HOUR(a.appointmentDateTime) ORDER BY HOUR(a.appointmentDateTime)"
    )
    List<Object[]> countTodayAppointmentsByHour();

    @Query(
        "SELECT d.user.firstName, d.user.lastName, COUNT(a) as cnt " +
        "FROM Appointment a JOIN a.doctor d " +
        "WHERE a.appointmentDateTime >= :since " +
        "GROUP BY d.id, d.user.firstName, d.user.lastName ORDER BY COUNT(a) DESC"
    )
    List<Object[]> findTopDoctorsByAppointmentCount(
        @Param("since") LocalDateTime since,
        Pageable pageable
    );
}
