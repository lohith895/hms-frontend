package com.hospital.laboratory.repository;

import com.hospital.laboratory.entity.LabTechnician;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LabTechnicianRepository extends JpaRepository<LabTechnician, Long> {
    java.util.Optional<LabTechnician> findByUserUsername(String username);
}

