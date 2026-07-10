package com.hospital.prescriptions.repository;

import com.hospital.prescriptions.entity.Prescription;
import com.hospital.common.enums.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByStatusOrderByPrescribedDateDesc(PrescriptionStatus status);
    List<Prescription> findByPatientIdOrderByPrescribedDateDesc(Long patientId);
    List<Prescription> findByDoctorUserIdOrderByPrescribedDateDesc(Long doctorUserId);
    long countByStatus(PrescriptionStatus status);
}
