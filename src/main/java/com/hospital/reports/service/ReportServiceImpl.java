// Force IDE re-indexing of report service implementation package
package com.hospital.reports.service;

import com.hospital.appointments.entity.Appointment;
import com.hospital.appointments.repository.AppointmentRepository;
import com.hospital.billing.entity.Invoice;
import com.hospital.billing.entity.Payment;
import com.hospital.billing.repository.InvoiceRepository;
import com.hospital.billing.repository.PaymentRepository;
import com.hospital.common.enums.AppointmentStatus;
import com.hospital.common.enums.InvoiceStatus;
import com.hospital.common.enums.LaboratoryReportStatus;
import com.hospital.departments.entity.Department;
import com.hospital.departments.repository.DepartmentRepository;
import com.hospital.doctors.entity.Doctor;
import com.hospital.doctors.repository.DoctorRepository;
import com.hospital.laboratory.entity.LaboratoryReport;
import com.hospital.laboratory.repository.LaboratoryReportRepository;
import com.hospital.patients.repository.PatientRepository;
import com.hospital.pharmacy.entity.MedicineInventory;
import com.hospital.pharmacy.repository.MedicineInventoryRepository;
import com.hospital.reports.util.ReportExporterUtil;
import com.hospital.users.entity.AuditLog;
import com.hospital.users.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final LaboratoryReportRepository labReportRepository;
    private final MedicineInventoryRepository inventoryRepository;
    private final DepartmentRepository departmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final ReportExporterUtil exporterUtil;

    public ReportServiceImpl(AppointmentRepository appointmentRepository,
                             PatientRepository patientRepository,
                             DoctorRepository doctorRepository,
                             InvoiceRepository invoiceRepository,
                             PaymentRepository paymentRepository,
                             LaboratoryReportRepository labReportRepository,
                             MedicineInventoryRepository inventoryRepository,
                             DepartmentRepository departmentRepository,
                             AuditLogRepository auditLogRepository,
                             ReportExporterUtil exporterUtil) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.labReportRepository = labReportRepository;
        this.inventoryRepository = inventoryRepository;
        this.departmentRepository = departmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.exporterUtil = exporterUtil;
    }

    // ──────────────────────────────────────────────────────
    // 1. DAILY APPOINTMENTS
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generateAppointmentsReport(String date, String format) throws Exception {
        List<Appointment> appointments = appointmentRepository.findAll();

        if (date != null && !date.isBlank()) {
            LocalDate filterDate = LocalDate.parse(date, DateTimeFormatter.ISO_LOCAL_DATE);
            appointments = appointments.stream()
                    .filter(a -> a.getAppointmentDateTime().toLocalDate().equals(filterDate))
                    .collect(Collectors.toList());
        }

        String[] headers = {"ID", "Patient", "Doctor", "Department", "DateTime", "Status", "Reason"};
        List<String[]> rows = appointments.stream().map(a -> new String[]{
                String.valueOf(a.getId()),
                a.getPatient().getUser().getFirstName() + " " + a.getPatient().getUser().getLastName(),
                "Dr. " + a.getDoctor().getUser().getFirstName() + " " + a.getDoctor().getUser().getLastName(),
                a.getDoctor().getDepartment().getName(),
                a.getAppointmentDateTime().toString(),
                a.getStatus().name(),
                a.getReason()
        }).collect(Collectors.toList());

        return export("Daily Appointments Report — " + (date != null ? date : "All"), headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // 2. MONTHLY REVENUE
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generateRevenueReport(int year, int month, String format) throws Exception {
        List<Invoice> invoices = invoiceRepository.findByYearAndMonth(year, month);
        List<Payment> payments = paymentRepository.findByYearAndMonth(year, month);

        double totalBilled = invoices.stream().mapToDouble(i -> i.getTotalAmount()).sum();
        double totalCollected = invoices.stream()
                .filter(i -> i.getStatus() == InvoiceStatus.PAID)
                .mapToDouble(i -> i.getNetAmount()).sum();
        double pending = invoices.stream()
                .filter(i -> i.getStatus() != InvoiceStatus.PAID)
                .mapToDouble(i -> i.getNetAmount()).sum();

        String[] headers = {"Metric", "Amount (₹)"};
        List<String[]> rows = Arrays.asList(
                new String[]{"Total Invoices Raised", String.valueOf(invoices.size())},
                new String[]{"Total Billed Amount", String.format("%.2f", totalBilled)},
                new String[]{"Total Collected (Paid)", String.format("%.2f", totalCollected)},
                new String[]{"Pending Amount", String.format("%.2f", pending)},
                new String[]{"Total Transactions", String.valueOf(payments.size())}
        );

        return export("Monthly Revenue Report — " + year + "/" + String.format("%02d", month), headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // 3. DOCTOR PERFORMANCE
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generateDoctorPerformanceReport(String format) throws Exception {
        List<Doctor> doctors = doctorRepository.findAll();
        List<Appointment> allAppointments = appointmentRepository.findAll();

        String[] headers = {"Doctor Name", "Specialization", "Department", "Total Appointments", "Completed", "Cancelled", "Experience (yrs)"};
        List<String[]> rows = doctors.stream().map(d -> {
            List<Appointment> docAppts = allAppointments.stream()
                    .filter(a -> a.getDoctor().getId().equals(d.getId()))
                    .collect(Collectors.toList());
            long completed = docAppts.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
            long cancelled = docAppts.stream().filter(a -> a.getStatus() == AppointmentStatus.CANCELLED).count();
            return new String[]{
                    "Dr. " + d.getUser().getFirstName() + " " + d.getUser().getLastName(),
                    d.getSpecialization(),
                    d.getDepartment().getName(),
                    String.valueOf(docAppts.size()),
                    String.valueOf(completed),
                    String.valueOf(cancelled),
                    String.valueOf(d.getExperienceYears())
            };
        }).collect(Collectors.toList());

        return export("Doctor Performance Report", headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // 4. PATIENT STATISTICS
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generatePatientStatsReport(String format) throws Exception {
        long totalPatients = patientRepository.count();
        List<Appointment> appointments = appointmentRepository.findAll();
        long totalAppts = appointments.size();
        long completedAppts = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
        long scheduledAppts = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.SCHEDULED).count();

        String[] headers = {"Metric", "Value"};
        List<String[]> rows = Arrays.asList(
                new String[]{"Total Registered Patients", String.valueOf(totalPatients)},
                new String[]{"Total Appointments", String.valueOf(totalAppts)},
                new String[]{"Completed Appointments", String.valueOf(completedAppts)},
                new String[]{"Scheduled (Upcoming) Appointments", String.valueOf(scheduledAppts)},
                new String[]{"Average Appointments per Patient", totalPatients > 0
                        ? String.format("%.2f", (double) totalAppts / totalPatients) : "N/A"}
        );

        return export("Patient Statistics Report", headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // 5. LABORATORY REPORTS
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generateLabReportsReport(String format) throws Exception {
        List<LaboratoryReport> reports = labReportRepository.findAll();
        long pending = reports.stream().filter(r -> r.getStatus() == LaboratoryReportStatus.PENDING).count();
        long completed = reports.stream().filter(r -> r.getStatus() == LaboratoryReportStatus.COMPLETED).count();

        String[] headers = {"ID", "Patient", "Doctor", "Test", "Test Date", "Status", "Result"};
        List<String[]> rows = reports.stream().map(r -> new String[]{
                String.valueOf(r.getId()),
                r.getPatient().getUser().getFirstName() + " " + r.getPatient().getUser().getLastName(),
                "Dr. " + r.getDoctor().getUser().getFirstName() + " " + r.getDoctor().getUser().getLastName(),
                r.getLabTest().getTestName(),
                r.getTestDate() != null ? r.getTestDate().toString() : "N/A",
                r.getStatus().name(),
                r.getResultValue() != null ? r.getResultValue() : "Pending"
        }).collect(Collectors.toList());

        return export("Laboratory Reports — Total: " + reports.size() + " | Pending: " + pending + " | Completed: " + completed,
                headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // 6. PHARMACY SALES
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generatePharmacySalesReport(String format) throws Exception {
        List<MedicineInventory> inventory = inventoryRepository.findAll();
        double totalSalesValue = inventory.stream()
                .mapToDouble(i -> i.getPricePerUnit() * i.getStockQuantity())
                .sum();

        String[] headers = {"Medicine", "Manufacturer", "Batch", "Stock Qty", "Unit Price (₹)", "Total Value (₹)", "Expiry"};
        List<String[]> rows = inventory.stream().map(i -> new String[]{
                i.getMedicine().getName(),
                i.getMedicine().getManufacturer(),
                i.getBatchNumber(),
                String.valueOf(i.getStockQuantity()),
                String.format("%.2f", i.getPricePerUnit()),
                String.format("%.2f", i.getPricePerUnit() * i.getStockQuantity()),
                i.getExpiryDate().toString()
        }).collect(Collectors.toList());

        rows.add(new String[]{"", "", "", "TOTAL VALUE:", "", String.format("%.2f", totalSalesValue), ""});
        return export("Pharmacy Sales Report", headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // 7. MEDICINE INVENTORY
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generateInventoryReport(String format) throws Exception {
        List<MedicineInventory> inventory = inventoryRepository.findAll();
        List<MedicineInventory> lowStock = inventoryRepository.findLowStock(20);
        List<MedicineInventory> expired = inventoryRepository.findExpiredBefore(LocalDate.now());

        String[] headers = {"Medicine Code", "Medicine Name", "Batch No.", "Stock Qty", "Unit Price (₹)", "Expiry Date", "Status"};
        List<String[]> rows = inventory.stream().map(i -> {
            String status = i.getExpiryDate().isBefore(LocalDate.now()) ? "EXPIRED"
                    : i.getStockQuantity() < 20 ? "LOW STOCK" : "OK";
            return new String[]{
                    i.getMedicine().getCode(),
                    i.getMedicine().getName(),
                    i.getBatchNumber(),
                    String.valueOf(i.getStockQuantity()),
                    String.format("%.2f", i.getPricePerUnit()),
                    i.getExpiryDate().toString(),
                    status
            };
        }).collect(Collectors.toList());

        return export("Medicine Inventory Report | Low Stock: " + lowStock.size() + " | Expired: " + expired.size(),
                headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // 8. DEPARTMENT PERFORMANCE
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generateDepartmentPerformanceReport(String format) throws Exception {
        List<Department> departments = departmentRepository.findAll();
        List<Doctor> doctors = doctorRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();

        String[] headers = {"Department", "Code", "No. of Doctors", "Total Appointments", "Completed", "Completion Rate %"};
        List<String[]> rows = departments.stream().map(dept -> {
            long deptDoctors = doctors.stream()
                    .filter(d -> d.getDepartment().getId().equals(dept.getId()))
                    .count();
            List<Appointment> deptAppts = appointments.stream()
                    .filter(a -> a.getDoctor().getDepartment().getId().equals(dept.getId()))
                    .collect(Collectors.toList());
            long completed = deptAppts.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
            double rate = deptAppts.isEmpty() ? 0 : (double) completed / deptAppts.size() * 100;
            return new String[]{
                    dept.getName(),
                    dept.getCode(),
                    String.valueOf(deptDoctors),
                    String.valueOf(deptAppts.size()),
                    String.valueOf(completed),
                    String.format("%.1f%%", rate)
            };
        }).collect(Collectors.toList());

        return export("Department Performance Report", headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // 9. BED OCCUPANCY (Simulated — no Bed entity yet)
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generateBedOccupancyReport(String format) throws Exception {
        String[] headers = {"Ward / Unit", "Total Beds", "Occupied", "Available", "Occupancy Rate %"};
        List<String[]> rows = Arrays.asList(
                new String[]{"General Ward", "50", "38", "12", "76.0%"},
                new String[]{"ICU", "20", "15", "5", "75.0%"},
                new String[]{"Emergency Room", "15", "10", "5", "66.7%"},
                new String[]{"Maternity Ward", "25", "18", "7", "72.0%"},
                new String[]{"Pediatric Ward", "20", "12", "8", "60.0%"},
                new String[]{"Cardiac Unit", "10", "8", "2", "80.0%"}
        );
        return export("Bed Occupancy Report (Simulated)", headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // 10. AUDIT REPORT
    // ──────────────────────────────────────────────────────
    @Override
    public byte[] generateAuditReport(String format) throws Exception {
        List<AuditLog> logs = auditLogRepository.findAll();

        String[] headers = {"ID", "Username", "Action", "Details", "IP Address", "Timestamp"};
        List<String[]> rows = logs.stream().map(log -> new String[]{
                String.valueOf(log.getId()),
                log.getUsername(),
                log.getAction(),
                log.getDetails() != null ? log.getDetails() : "",
                log.getIpAddress() != null ? log.getIpAddress() : "",
                log.getTimestamp() != null ? log.getTimestamp().toString() : ""
        }).collect(Collectors.toList());

        return export("System Audit Log Report", headers, rows, format);
    }

    // ──────────────────────────────────────────────────────
    // INTERNAL DISPATCH
    // ──────────────────────────────────────────────────────
    private byte[] export(String title, String[] headers, List<String[]> rows, String format) throws Exception {
        return switch (format.toLowerCase()) {
            case "excel" -> exporterUtil.exportToExcel(title, headers, rows);
            case "csv"   -> exporterUtil.exportToCsv(headers, rows);
            default      -> exporterUtil.exportToPdf(title, headers, rows);
        };
    }
}
