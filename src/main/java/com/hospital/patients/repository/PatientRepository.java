package com.hospital.patients.repository;

import com.hospital.patients.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    java.util.Optional<Patient> findByUserUsername(String username);
}
