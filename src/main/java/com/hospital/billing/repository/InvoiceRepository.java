package com.hospital.billing.repository;

import com.hospital.billing.entity.Invoice;
import com.hospital.common.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT i FROM Invoice i WHERE YEAR(i.createdAt) = :year AND MONTH(i.createdAt) = :month")
    List<Invoice> findByYearAndMonth(@Param("year") int year, @Param("month") int month);

    @Query("SELECT COALESCE(SUM(i.netAmount), 0) FROM Invoice i WHERE YEAR(i.createdAt) = :year AND MONTH(i.createdAt) = :month AND i.status = :status")
    Double sumNetAmountByYearAndMonthAndStatus(@Param("year") int year, @Param("month") int month, @Param("status") InvoiceStatus status);

    List<Invoice> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<Invoice> findByPatientUserUsernameOrderByCreatedAtDesc(String username);
}
