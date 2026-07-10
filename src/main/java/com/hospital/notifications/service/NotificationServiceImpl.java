package com.hospital.notifications.service;

import com.hospital.appointments.dto.AppointmentEvent;
import com.hospital.notifications.entity.Notification;
import com.hospital.notifications.repository.NotificationRepository;
import com.hospital.patients.entity.Patient;
import com.hospital.patients.repository.PatientRepository;
import com.hospital.users.entity.User;
import com.hospital.users.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final PatientRepository patientRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   PatientRepository patientRepository,
                                   SimpMessagingTemplate messagingTemplate,
                                   UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.patientRepository = patientRepository;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void sendAppointmentNotification(AppointmentEvent event) {
        logger.info("Starting multi-channel notification dispatches for appointment ID: {}", event.getAppointmentId());

        // 1. In-App Notification (Database Log)
        Patient patient = patientRepository.findById(event.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + event.getPatientId()));
        User user = patient.getUser();

        String notificationMessage = String.format("Dear %s, your appointment with %s on %s has been scheduled. Reason: %s",
                event.getPatientName(), event.getDoctorName(), event.getAppointmentDateTime(), event.getReason());

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle("Appointment Scheduled");
        notification.setMessage(notificationMessage);
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        logger.info("[IN-APP NOTIFICATION] Saved to database for user: {}", user.getUsername());

        // 2. Real-time WebSocket Push
        try {
            messagingTemplate.convertAndSendToUser(
                    user.getUsername(),
                    "/queue/notifications",
                    savedNotification
            );
            logger.info("[WEBSOCKET PUSH] Real-time alert dispatched to user: {}", user.getUsername());
        } catch (Exception wsEx) {
            logger.error("Failed to dispatch real-time WebSocket push alert", wsEx);
        }

        // 3. Mock Email Dispatch
        logger.info("[EMAIL DELIVERY] Successfully dispatched email to: {} | Subject: Appointment Scheduled | Content: {}",
                event.getPatientEmail(), notificationMessage);

        // 4. Mock SMS Dispatch
        logger.info("[SMS DELIVERY] Successfully dispatched SMS text message to: {} | Content: {}",
                event.getPatientPhone(), notificationMessage);

        // 5. Mock Push Notification Dispatch
        logger.info("[PUSH DELIVERY] Successfully dispatched mobile push notification alert to user: {}",
                user.getUsername());
    }

    @Override
    @Transactional
    public void createSystemNotification(String username, String title, String message) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            logger.warn("Skipping system notification for non-existent username: {}", username);
            return;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);
        logger.info("[SYSTEM NOTIFICATION] Created and saved to database for user: {}", username);

        try {
            messagingTemplate.convertAndSendToUser(
                    username,
                    "/queue/notifications",
                    saved
            );
            logger.info("[SYSTEM NOTIFICATION WEBSOCKET] Dispatched real-time alert to user: {}", username);
        } catch (Exception wsEx) {
            logger.error("Failed to send WebSocket alert for system notification", wsEx);
        }
    }
}
