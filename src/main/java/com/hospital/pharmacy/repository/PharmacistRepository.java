package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.entity.Pharmacist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PharmacistRepository extends JpaRepository<Pharmacist, Long> {
    java.util.Optional<Pharmacist> findByUserUsername(String username);
}

