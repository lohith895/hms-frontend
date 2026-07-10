package com.hospital.pharmacy.repository;

import com.hospital.pharmacy.entity.MedicineInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineInventoryRepository extends JpaRepository<MedicineInventory, Long> {

    @Query("SELECT m FROM MedicineInventory m WHERE m.expiryDate < :date")
    List<MedicineInventory> findExpiredBefore(LocalDate date);

    @Query("SELECT m FROM MedicineInventory m WHERE m.stockQuantity < :threshold")
    List<MedicineInventory> findLowStock(int threshold);
}
