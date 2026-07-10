package com.hospital.doctors.repository;

import com.hospital.doctors.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    java.util.Optional<Doctor> findByUserUsername(String username);
}
