package com.hospital.pharmacy.service;

import com.hospital.pharmacy.entity.Medicine;
import com.hospital.pharmacy.entity.MedicineInventory;
import com.hospital.pharmacy.repository.MedicineInventoryRepository;
import com.hospital.notifications.service.NotificationService;
import com.hospital.users.entity.User;
import com.hospital.users.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryAlertScheduler {

    private final MedicineInventoryRepository inventoryRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public InventoryAlertScheduler(MedicineInventoryRepository inventoryRepository,
                                   NotificationService notificationService,
                                   UserRepository userRepository) {
        this.inventoryRepository = inventoryRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // Run daily at 9:00 AM to check for low stock medicines
    @Scheduled(cron = "0 0 9 * * ?")
    public void checkLowStockAndSendAlerts() {
        List<MedicineInventory> inventory = inventoryRepository.findAll();

        // Group active inventory batches by medicine
        Map<Medicine, List<MedicineInventory>> grouped = inventory.stream()
                .filter(inv -> inv.getExpiryDate().isAfter(LocalDate.now()))
                .filter(inv -> inv.getMedicine() != null)
                .collect(Collectors.groupingBy(inv -> inv.getMedicine()));

        List<User> alertRecipients = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ROLE_PHARMACIST") || u.getRole().name().equals("ROLE_ADMIN"))
                .collect(Collectors.toList());

        for (Map.Entry<Medicine, List<MedicineInventory>> entry : grouped.entrySet()) {
            Medicine med = entry.getKey();
            List<MedicineInventory> batches = entry.getValue();

            int totalStock = batches.stream().mapToInt(inv -> inv.getStockQuantity()).sum();
            int minThreshold = batches.stream()
                    .map(inv -> inv.getReorderThreshold())
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(50); // Default threshold is 50

            if (totalStock < minThreshold) {
                // Get supplier details from the latest batch
                MedicineInventory latestBatch = batches.stream()
                        .max(Comparator.comparing(inv -> inv.getId()))
                        .orElse(null);

                String supplierInfo = "Unknown Supplier";
                if (latestBatch != null && latestBatch.getSupplierName() != null && !latestBatch.getSupplierName().trim().isEmpty()) {
                    supplierInfo = latestBatch.getSupplierName();
                    if (latestBatch.getSupplierContact() != null && !latestBatch.getSupplierContact().trim().isEmpty()) {
                        supplierInfo += " (" + latestBatch.getSupplierContact() + ")";
                    }
                }

                String message = String.format("Low Stock Alert: %s (Code: %s) is running low. Total Stock: %d (Threshold: %d). Preferred Supplier: %s.",
                        med.getName(), med.getCode(), totalStock, minThreshold, supplierInfo);

                for (User u : alertRecipients) {
                    notificationService.createSystemNotification(
                            u.getUsername(),
                            "Low Stock Alert: " + med.getName(),
                            message
                    );
                }
            }
        }
    }
}
