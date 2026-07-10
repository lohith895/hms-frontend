package com.hospital.pharmacy.service;

import com.hospital.pharmacy.entity.Medicine;
import com.hospital.pharmacy.entity.MedicineInventory;
import com.hospital.pharmacy.repository.MedicineInventoryRepository;
import com.hospital.pharmacy.repository.MedicineRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class PharmacyDataInitializer implements CommandLineRunner {

    private final MedicineRepository medicineRepository;
    private final MedicineInventoryRepository medicineInventoryRepository;

    public PharmacyDataInitializer(MedicineRepository medicineRepository,
                                   MedicineInventoryRepository medicineInventoryRepository) {
        this.medicineRepository = medicineRepository;
        this.medicineInventoryRepository = medicineInventoryRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Medicines if none exist
        if (medicineRepository.count() == 0) {
            Medicine paracetamol = new Medicine(
                    "Paracetamol 500mg",
                    "MED-PAR-500",
                    "Analgesics",
                    "GlobalPharma Co.",
                    "Common pain reliever and fever reducer.",
                    true
            );

            Medicine amoxicillin = new Medicine(
                    "Amoxicillin 250mg",
                    "MED-AMX-250",
                    "Antibiotics",
                    "BioLabs Ltd.",
                    "Penicillin-type antibiotic used to treat bacterial infections.",
                    true
            );

            Medicine ibuprofen = new Medicine(
                    "Ibuprofen 400mg",
                    "MED-IBU-400",
                    "NSAID",
                    "MediHealth Group",
                    "Nonsteroidal anti-inflammatory drug for pain relief.",
                    true
            );

            Medicine atorvastatin = new Medicine(
                    "Atorvastatin 10mg",
                    "MED-ATO-10",
                    "Statins",
                    "Pfizer",
                    "Cholesterol-lowering medication.",
                    true
            );

            List<Medicine> savedMedicines = medicineRepository.saveAll(Arrays.asList(paracetamol, amoxicillin, ibuprofen, atorvastatin));

            // Seed Inventory Batches if none exist
            if (medicineInventoryRepository.count() == 0) {
                // Paracetamol (High Stock)
                MedicineInventory paraBatch1 = new MedicineInventory(
                        savedMedicines.get(0),
                        "B-PAR-001",
                        LocalDate.now().plusYears(2),
                        80,
                        1.50,
                        "Express Med Supplies",
                        "+1-800-555-0120",
                        30
                );
                MedicineInventory paraBatch2 = new MedicineInventory(
                        savedMedicines.get(0),
                        "B-PAR-002",
                        LocalDate.now().plusYears(3),
                        60,
                        1.55,
                        "Express Med Supplies",
                        "+1-800-555-0120",
                        30
                );

                // Amoxicillin (Low Stock - triggers alert)
                MedicineInventory amxBatch = new MedicineInventory(
                        savedMedicines.get(1),
                        "B-AMX-101",
                        LocalDate.now().plusYears(1),
                        15,
                        3.20,
                        "Astra Distribution",
                        "+1-800-555-0988",
                        50 // threshold is 50, current stock is 15 -> triggers alert
                );

                // Ibuprofen (Medium Stock)
                MedicineInventory ibuBatch = new MedicineInventory(
                        savedMedicines.get(2),
                        "B-IBU-201",
                        LocalDate.now().plusYears(2),
                        45,
                        2.10,
                        "MediLine Logistics",
                        "+1-800-555-0761",
                        40
                );

                // Atorvastatin (Low Stock - triggers alert)
                MedicineInventory atoBatch = new MedicineInventory(
                        savedMedicines.get(3),
                        "B-ATO-501",
                        LocalDate.now().plusYears(2),
                        8,
                        4.50,
                        "Pfizer Wholesale",
                        "+1-800-555-1234",
                        20 // threshold is 20, current stock is 8 -> triggers alert
                );

                medicineInventoryRepository.saveAll(Arrays.asList(paraBatch1, paraBatch2, amxBatch, ibuBatch, atoBatch));
            }
        }
    }
}
