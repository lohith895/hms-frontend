package com.hospital.medicalrecords.service;

import com.hospital.medicalrecords.dto.MedicalRecordRequest;
import com.hospital.medicalrecords.dto.MedicalRecordResponse;

import java.util.List;

public interface MedicalRecordService {
    MedicalRecordResponse createMedicalRecord(MedicalRecordRequest request);
    MedicalRecordResponse createConsultation(com.hospital.medicalrecords.dto.ConsultationRequest request, String doctorUsername);
    List<MedicalRecordResponse> getRecordsForPatient(Long patientId);
    List<MedicalRecordResponse> getMyRecords(String username);
}
