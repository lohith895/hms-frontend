package com.hospital.appointments.producer;

import com.hospital.appointments.dto.AppointmentEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.hospital.notifications.service.NotificationService;
import org.springframework.stereotype.Component;

@Component
public class AppointmentEventProducer {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentEventProducer.class);
    private final NotificationService notificationService;

    public AppointmentEventProducer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void sendAppointmentCreatedEvent(AppointmentEvent event) {
        logger.info("Directly delegating appointment created event to NotificationService. Appointment ID: {}", event.getAppointmentId());
        try {
            notificationService.sendAppointmentNotification(event);
        } catch (Exception ex) {
            logger.error("Failed to process appointment event", ex);
        }
    }
}
