package com.hospital.nurses.repository;

import com.hospital.nurses.entity.Nurse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NurseRepository extends JpaRepository<Nurse, Long> {
    java.util.Optional<Nurse> findByUserUsername(String username);
}

