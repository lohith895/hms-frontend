package com.hospital.dashboard.service;

import com.hospital.appointments.repository.AppointmentRepository;
import com.hospital.billing.repository.InvoiceRepository;
import com.hospital.common.enums.AppointmentStatus;
import com.hospital.common.enums.InvoiceStatus;
import com.hospital.common.enums.PharmacyInvoicePaymentStatus;
import com.hospital.common.enums.PrescriptionStatus;
import com.hospital.doctors.repository.DoctorRepository;
import com.hospital.patients.repository.PatientRepository;
import com.hospital.pharmacy.repository.PharmacyInvoiceRepository;
import com.hospital.prescriptions.repository.PrescriptionRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final InvoiceRepository invoiceRepository;
    private final PharmacyInvoiceRepository pharmacyInvoiceRepository;
    private final PrescriptionRepository prescriptionRepository;

    public DashboardService(AppointmentRepository appointmentRepository,
                            DoctorRepository doctorRepository,
                            PatientRepository patientRepository,
                            InvoiceRepository invoiceRepository,
                            PharmacyInvoiceRepository pharmacyInvoiceRepository,
                            PrescriptionRepository prescriptionRepository) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.invoiceRepository = invoiceRepository;
        this.pharmacyInvoiceRepository = pharmacyInvoiceRepository;
        this.prescriptionRepository = prescriptionRepository;
    }

    public List<Map<String, Object>> getMetricsForRole(String roleName, Long userId) {
        List<Map<String, Object>> stats = new ArrayList<>();

        if (roleName.equals("ROLE_ADMIN")) {
            long todayCount = appointmentRepository.countTodaysAppointments();
            long totalDoctors = doctorRepository.count();

            int year = LocalDate.now().getYear();
            int month = LocalDate.now().getMonthValue();
            Double consultRevenue = invoiceRepository.sumNetAmountByYearAndMonthAndStatus(year, month, InvoiceStatus.PAID);
            Double pharmacySales = pharmacyInvoiceRepository.sumPaidByYearAndMonth(year, month);
            double totalRevenue = (consultRevenue != null ? consultRevenue : 0.0) + (pharmacySales != null ? pharmacySales : 0.0);

            long pendingRx = prescriptionRepository.countByStatus(PrescriptionStatus.PENDING);

            stats.add(createStat("Today's Patients", String.valueOf(todayCount), "Appointments scheduled today", null));
            stats.add(createStat("Total Doctors", String.valueOf(totalDoctors), "Active consulting staff", null));
            stats.add(createStat("Monthly Revenue", String.format("₹%.0f", totalRevenue), "Billing + Pharmacy (current month)", null));
            stats.add(createStat("Pending Dispenses", String.valueOf(pendingRx), "Prescriptions awaiting pharmacy", pendingRx > 0 ? "Action needed" : "All clear"));
        }
        else if (roleName.equals("ROLE_DOCTOR")) {
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            LocalDateTime endOfDay = LocalDate.now().atTime(23, 59, 59);

            long todaysAppointments = appointmentRepository.countByDoctorUserIdAndAppointmentDateTimeBetween(userId, startOfDay, endOfDay);
            long pendingEMRs = appointmentRepository.countByDoctorUserIdAndStatus(userId, AppointmentStatus.SCHEDULED);

            stats.add(createStat("Today's Appointments", String.valueOf(todaysAppointments), "Scheduled for today", "On schedule"));
            stats.add(createStat("Pending Actions", String.valueOf(pendingEMRs), "Requires clinical sign-off", "Action needed"));
            stats.add(createStat("Avg Consult Time", "18 min", "Optimal patient care", "-2min vs last week"));
        }
        else if (roleName.equals("ROLE_NURSE")) {
            stats.add(createStat("Active Ward Patients", "28", "High attention: 4", "Stable"));
            stats.add(createStat("Task Completion", "9 / 15", "Hourly rounds checklist", "60% done"));
            stats.add(createStat("Shift Handover", "Ready", "Next shift: 19:00", "On time"));
        }
        else if (roleName.equals("ROLE_PATIENT")) {
            long upcomingConsults = appointmentRepository.countByPatientUserIdAndStatus(userId, AppointmentStatus.SCHEDULED);
            long activePrescriptions = prescriptionRepository.countByStatus(PrescriptionStatus.PENDING);

            stats.add(createStat("Upcoming Consults", String.valueOf(upcomingConsults), "Scheduled appointments", "Confirmed"));
            stats.add(createStat("Active Prescriptions", String.valueOf(activePrescriptions > 0 ? activePrescriptions : 0), "Awaiting pickup", null));
            stats.add(createStat("Latest Lab Result", "None", "No recent tests", null));
        }
        else if (roleName.equals("ROLE_PHARMACIST")) {
            long pendingRx = prescriptionRepository.countByStatus(PrescriptionStatus.PENDING);
            long unpaidInvoices = pharmacyInvoiceRepository.countByPaymentStatus(PharmacyInvoicePaymentStatus.UNPAID);

            int year = LocalDate.now().getYear();
            int month = LocalDate.now().getMonthValue();
            Double pharmacySales = pharmacyInvoiceRepository.sumPaidByYearAndMonth(year, month);

            stats.add(createStat("Pending Dispenses", String.valueOf(pendingRx), "Prescriptions to fill", pendingRx > 0 ? "Urgent" : "All clear"));
            stats.add(createStat("Unpaid Invoices", String.valueOf(unpaidInvoices), "Pharmacy bills outstanding", unpaidInvoices > 0 ? "Action needed" : "All clear"));
            stats.add(createStat("Monthly Sales", String.format("₹%.0f", pharmacySales != null ? pharmacySales : 0.0), "Pharmacy revenue this month", null));
        }
        else if (roleName.equals("ROLE_LAB_TECHNICIAN")) {
            stats.add(createStat("Pending Specimens", "14", "Urgent STAT: 2", "High priority"));
            stats.add(createStat("Completed Tests", "38", "Linked to EMR automatically", "+6 today"));
            stats.add(createStat("Accuracy Rate", "99.9%", "Internal control verified", "Excellent"));
        }
        else {
            stats.add(createStat("Status", "Online", "System operational", null));
        }

        return stats;
    }

    /**
     * Returns aggregated analytics data for the Admin dashboard charts.
     */
    public Map<String, Object> getAdminAnalytics() {
        Map<String, Object> result = new LinkedHashMap<>();

        // 1. Today's hourly appointment distribution
        List<Object[]> hourlyRaw = appointmentRepository.countTodayAppointmentsByHour();
        List<Map<String, Object>> hourlyData = new ArrayList<>();
        for (Object[] row : hourlyRaw) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("hour", row[0]);
            point.put("count", row[1]);
            hourlyData.add(point);
        }
        result.put("todayHourlyAppointments", hourlyData);

        // 2. Monthly revenue breakdown
        int year = LocalDate.now().getYear();
        int month = LocalDate.now().getMonthValue();
        Double consultRevenue = invoiceRepository.sumNetAmountByYearAndMonthAndStatus(year, month, InvoiceStatus.PAID);
        Double pharmacySales = pharmacyInvoiceRepository.sumPaidByYearAndMonth(year, month);
        Map<String, Object> revenue = new LinkedHashMap<>();
        revenue.put("billingRevenue", consultRevenue != null ? Math.round(consultRevenue * 100.0) / 100.0 : 0.0);
        revenue.put("pharmacySales", pharmacySales != null ? Math.round(pharmacySales * 100.0) / 100.0 : 0.0);
        result.put("monthlyRevenue", revenue);

        // 3. Top 5 doctors by appointment count (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Object[]> topDoctorsRaw = appointmentRepository.findTopDoctorsByAppointmentCount(thirtyDaysAgo, PageRequest.of(0, 5));
        List<Map<String, Object>> topDoctors = new ArrayList<>();
        for (Object[] row : topDoctorsRaw) {
            Map<String, Object> doc = new LinkedHashMap<>();
            doc.put("doctorName", "Dr. " + row[0] + " " + row[1]);
            doc.put("appointmentCount", row[2]);
            topDoctors.add(doc);
        }
        result.put("topDoctors", topDoctors);

        // 4. Total patients registered
        result.put("totalPatients", patientRepository.count());
        result.put("totalDoctors", doctorRepository.count());

        return result;
    }

    private Map<String, Object> createStat(String label, String value, String desc, String trend) {
        Map<String, Object> map = new HashMap<>();
        map.put("label", label);
        map.put("value", value);
        map.put("desc", desc);
        if (trend != null) {
            map.put("trend", trend);
        }
        return map;
    }
}
