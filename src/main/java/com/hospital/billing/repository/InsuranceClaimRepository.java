package com.hospital.billing.repository;

import com.hospital.billing.entity.InsuranceClaim;
import com.hospital.common.enums.InsuranceClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    List<InsuranceClaim> findByInvoiceId(Long invoiceId);
    List<InsuranceClaim> findByStatus(InsuranceClaimStatus status);
}
