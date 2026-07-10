package com.hospital.billing.repository;

import com.hospital.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByInvoiceId(Long invoiceId);

    @Query("SELECT p FROM Payment p WHERE YEAR(p.paymentDate) = :year AND MONTH(p.paymentDate) = :month")
    List<Payment> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
}
