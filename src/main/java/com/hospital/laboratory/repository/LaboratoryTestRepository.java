package com.hospital.laboratory.repository;

import com.hospital.laboratory.entity.LaboratoryTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LaboratoryTestRepository extends JpaRepository<LaboratoryTest, Long> {
    List<LaboratoryTest> findByIsActive(boolean isActive);
    Optional<LaboratoryTest> findByTestCode(String testCode);
    boolean existsByTestCode(String testCode);
}
