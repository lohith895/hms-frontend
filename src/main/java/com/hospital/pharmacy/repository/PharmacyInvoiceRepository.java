package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.entity.PharmacyInvoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PharmacyInvoiceRepository extends JpaRepository<PharmacyInvoice, Long> {
    Optional<PharmacyInvoice> findByPrescriptionId(Long prescriptionId);
    List<PharmacyInvoice> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<PharmacyInvoice> findByPatientUserUsernameOrderByCreatedAtDesc(String username);
    List<PharmacyInvoice> findAllByOrderByCreatedAtDesc();

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(i.grandTotal), 0) FROM PharmacyInvoice i WHERE YEAR(i.createdAt) = :year AND MONTH(i.createdAt) = :month AND i.paymentStatus = 'PAID'")
    Double sumPaidByYearAndMonth(@org.springframework.data.repository.query.Param("year") int year, @org.springframework.data.repository.query.Param("month") int month);

    long countByPaymentStatus(com.hospital.common.enums.PharmacyInvoicePaymentStatus status);
}
