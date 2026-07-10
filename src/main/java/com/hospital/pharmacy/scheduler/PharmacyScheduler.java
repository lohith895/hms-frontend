package com.hospital.pharmacy.scheduler;

import com.hospital.pharmacy.service.PharmacyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PharmacyScheduler implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(PharmacyScheduler.class);
    private final PharmacyService pharmacyService;

    public PharmacyScheduler(PharmacyService pharmacyService) {
        this.pharmacyService = pharmacyService;
    }

    // Daily at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void scheduleDailyStockCheck() {
        logger.info("Executing daily pharmacy stock and expiry check...");
        try {
            pharmacyService.checkExpiryAndLowStock();
            logger.info("Daily pharmacy check completed successfully.");
        } catch (Exception e) {
            logger.error("Failed to execute pharmacy stock check scheduler", e);
        }
    }

    // Run on startup
    @Override
    public void run(String... args) throws Exception {
        logger.info("Executing startup pharmacy stock and expiry scan...");
        try {
            pharmacyService.checkExpiryAndLowStock();
            logger.info("Startup pharmacy check completed successfully.");
        } catch (Exception e) {
            logger.error("Failed to execute startup pharmacy stock check", e);
        }
    }
}
