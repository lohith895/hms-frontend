package com.hospital.laboratory.service;

import com.hospital.laboratory.dto.*;

import java.util.List;

public interface LaboratoryService {
    LaboratoryTestResponse createLaboratoryTest(LaboratoryTestRequest request);
    List<LaboratoryTestResponse> getActiveTests();
    List<LaboratoryTestResponse> getAllTests();
    
    LaboratoryReportResponse requestLaboratoryReport(LaboratoryReportRequest request);
    LaboratoryReportResponse updateStatus(Long id, com.hospital.common.enums.LaboratoryReportStatus status);
    LaboratoryReportResponse uploadReport(Long reportId, org.springframework.web.multipart.MultipartFile file, String techRemarks, String resultValue);
    List<LaboratoryReportResponse> getPendingReports();
    List<LaboratoryReportResponse> getPatientReports(Long patientId);
    List<LaboratoryReportResponse> getMyReports(String username);
    
    LaboratoryReportResponse recordResult(Long reportId, LaboratoryResultRequest request);
}
