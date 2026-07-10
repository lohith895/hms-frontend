package com.hospital.medicalrecords.service;

import com.hospital.medicalrecords.entity.MedicalRecord;
import com.hospital.medicalrecords.repository.MedicalRecordRepository;
import com.hospital.notifications.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class FollowUpScheduler {

    private final MedicalRecordRepository medicalRecordRepository;
    private final NotificationService notificationService;

    public FollowUpScheduler(MedicalRecordRepository medicalRecordRepository,
                             NotificationService notificationService) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.notificationService = notificationService;
    }

    // Run every day at 8:00 AM to notify patients of follow-ups scheduled for tomorrow
    @Scheduled(cron = "0 0 8 * * ?")
    public void sendFollowUpReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<MedicalRecord> records = medicalRecordRepository.findByFollowUpDate(tomorrow);

        for (MedicalRecord record : records) {
            if (record.getPatient() != null && record.getPatient().getUser() != null) {
                String username = record.getPatient().getUser().getUsername();
                String doctorName = record.getDoctor().getUser() != null ?
                        "Dr. " + record.getDoctor().getUser().getFirstName() + " " + record.getDoctor().getUser().getLastName() : "attending physician";

                notificationService.createSystemNotification(
                        username,
                        "Follow-up Consultation Reminder",
                        "You have a scheduled follow-up consultation with " + doctorName + " tomorrow. Please contact the clinic if you need to reschedule."
                );
            }
        }
    }
}
