package com.hospital.reports.controller;

import com.hospital.reports.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports & Analytics", description = "Export hospital reports in PDF, Excel, or CSV format")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // ──────────────────────────────────────────────────────
    // 1. DAILY APPOINTMENTS
    // ──────────────────────────────────────────────────────
    @GetMapping("/appointments")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    @Operation(summary = "Export daily appointments report", description = "Download appointments (optionally filtered by date) in PDF, Excel, or CSV")
    public ResponseEntity<byte[]> appointmentsReport(
            @RequestParam(required = false) String date,
            @RequestParam(defaultValue = "pdf") @Parameter(description = "pdf | excel | csv") String format) {
        try {
            byte[] data = reportService.generateAppointmentsReport(date, format);
            return buildResponse(data, "appointments_report", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    // 2. MONTHLY REVENUE
    // ──────────────────────────────────────────────────────
    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ADMIN','FINANCE_MANAGER')")
    @Operation(summary = "Export monthly revenue report")
    public ResponseEntity<byte[]> revenueReport(
            @RequestParam(defaultValue = "0") int year,
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            int y = year == 0 ? LocalDate.now().getYear() : year;
            int m = month == 0 ? LocalDate.now().getMonthValue() : month;
            byte[] data = reportService.generateRevenueReport(y, m, format);
            return buildResponse(data, "revenue_report", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    // 3. DOCTOR PERFORMANCE
    // ──────────────────────────────────────────────────────
    @GetMapping("/doctor-performance")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_HEAD')")
    @Operation(summary = "Export doctor performance report")
    public ResponseEntity<byte[]> doctorPerformanceReport(
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] data = reportService.generateDoctorPerformanceReport(format);
            return buildResponse(data, "doctor_performance_report", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    // 4. PATIENT STATISTICS
    // ──────────────────────────────────────────────────────
    @GetMapping("/patient-stats")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR','RECEPTIONIST')")
    @Operation(summary = "Export patient statistics report")
    public ResponseEntity<byte[]> patientStatsReport(
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] data = reportService.generatePatientStatsReport(format);
            return buildResponse(data, "patient_stats_report", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    // 5. LABORATORY REPORTS
    // ──────────────────────────────────────────────────────
    @GetMapping("/lab-reports")
    @PreAuthorize("hasAnyRole('ADMIN','LAB_TECHNICIAN','DOCTOR')")
    @Operation(summary = "Export laboratory reports summary")
    public ResponseEntity<byte[]> labReportsReport(
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] data = reportService.generateLabReportsReport(format);
            return buildResponse(data, "lab_reports", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    // 6. PHARMACY SALES
    // ──────────────────────────────────────────────────────
    @GetMapping("/pharmacy-sales")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    @Operation(summary = "Export pharmacy sales report")
    public ResponseEntity<byte[]> pharmacySalesReport(
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] data = reportService.generatePharmacySalesReport(format);
            return buildResponse(data, "pharmacy_sales_report", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    // 7. MEDICINE INVENTORY
    // ──────────────────────────────────────────────────────
    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','INVENTORY_MANAGER')")
    @Operation(summary = "Export medicine inventory report")
    public ResponseEntity<byte[]> inventoryReport(
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] data = reportService.generateInventoryReport(format);
            return buildResponse(data, "inventory_report", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    // 8. DEPARTMENT PERFORMANCE
    // ──────────────────────────────────────────────────────
    @GetMapping("/department-performance")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_HEAD')")
    @Operation(summary = "Export department performance report")
    public ResponseEntity<byte[]> departmentPerformanceReport(
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] data = reportService.generateDepartmentPerformanceReport(format);
            return buildResponse(data, "department_performance_report", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    // 9. BED OCCUPANCY
    // ──────────────────────────────────────────────────────
    @GetMapping("/bed-occupancy")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_HEAD')")
    @Operation(summary = "Export bed occupancy report")
    public ResponseEntity<byte[]> bedOccupancyReport(
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] data = reportService.generateBedOccupancyReport(format);
            return buildResponse(data, "bed_occupancy_report", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    // 10. AUDIT REPORT
    // ──────────────────────────────────────────────────────
    @GetMapping("/audit")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export system audit log report")
    public ResponseEntity<byte[]> auditReport(
            @RequestParam(defaultValue = "pdf") String format) {
        try {
            byte[] data = reportService.generateAuditReport(format);
            return buildResponse(data, "audit_report", format);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ──────────────────────────────────────────────────────
    //  HELPER — builds the correct Content-Type & Content-Disposition
    // ──────────────────────────────────────────────────────
    private ResponseEntity<byte[]> buildResponse(byte[] data, String baseName, String format) {
        HttpHeaders headers = new HttpHeaders();
        String fileName;
        MediaType mediaType;

        switch (format.toLowerCase()) {
            case "excel" -> {
                fileName = baseName + ".xlsx";
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }
            case "csv" -> {
                fileName = baseName + ".csv";
                mediaType = MediaType.parseMediaType("text/csv; charset=UTF-8");
            }
            default -> {
                fileName = baseName + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
            }
        }

        headers.setContentType(mediaType);
        headers.setContentDispositionFormData("attachment", fileName);
        headers.setContentLength(data.length);
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
