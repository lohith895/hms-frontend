package com.hospital.medicalrecords.repository;

import com.hospital.medicalrecords.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatientIdOrderByRecordDateDesc(Long patientId);
    List<MedicalRecord> findByPatientUserUsernameOrderByRecordDateDesc(String username);
    List<MedicalRecord> findByDoctorUserIdOrderByRecordDateDesc(Long userId);
    List<MedicalRecord> findByFollowUpDate(java.time.LocalDate followUpDate);
}
