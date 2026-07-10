package com.hospital.laboratory.repository;

import com.hospital.laboratory.entity.LaboratoryReport;
import com.hospital.common.enums.LaboratoryReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaboratoryReportRepository extends JpaRepository<LaboratoryReport, Long> {

    List<LaboratoryReport> findByStatus(LaboratoryReportStatus status);

    @Query("SELECT r FROM LaboratoryReport r WHERE YEAR(r.testDate) = :year AND MONTH(r.testDate) = :month")
    List<LaboratoryReport> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    List<LaboratoryReport> findByPatientIdOrderByTestDateDesc(Long patientId);
    List<LaboratoryReport> findByPatientUserUsernameOrderByTestDateDesc(String username);
    List<LaboratoryReport> findByDoctorUserIdOrderByTestDateDesc(Long doctorUserId);
    List<LaboratoryReport> findByStatusOrderByTestDateDesc(LaboratoryReportStatus status);
}
