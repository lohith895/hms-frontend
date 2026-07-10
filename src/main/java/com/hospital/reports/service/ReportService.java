package com.hospital.reports.service;

public interface ReportService {
    byte[] generateAppointmentsReport(String date, String format) throws Exception;
    byte[] generateRevenueReport(int year, int month, String format) throws Exception;
    byte[] generateDoctorPerformanceReport(String format) throws Exception;
    byte[] generatePatientStatsReport(String format) throws Exception;
    byte[] generateLabReportsReport(String format) throws Exception;
    byte[] generatePharmacySalesReport(String format) throws Exception;
    byte[] generateInventoryReport(String format) throws Exception;
    byte[] generateDepartmentPerformanceReport(String format) throws Exception;
    byte[] generateBedOccupancyReport(String format) throws Exception;
    byte[] generateAuditReport(String format) throws Exception;
}
