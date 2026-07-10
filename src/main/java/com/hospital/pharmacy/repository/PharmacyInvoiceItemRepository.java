package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.entity.PharmacyInvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PharmacyInvoiceItemRepository extends JpaRepository<PharmacyInvoiceItem, Long> {
    List<PharmacyInvoiceItem> findByPharmacyInvoiceId(Long invoiceId);
}
