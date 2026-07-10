package com.hospital.notifications.service;

import com.hospital.appointments.dto.AppointmentEvent;

public interface NotificationService {
    void sendAppointmentNotification(AppointmentEvent event);
    void createSystemNotification(String username, String title, String message);
}
