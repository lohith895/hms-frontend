package com.hospital.prescriptions.service;

import com.hospital.prescriptions.dto.PrescriptionRequest;
import com.hospital.prescriptions.dto.PrescriptionResponse;

import java.util.List;

public interface PrescriptionService {
    PrescriptionResponse createPrescription(PrescriptionRequest request);
    List<PrescriptionResponse> getPendingPrescriptions();
    List<PrescriptionResponse> getPatientPrescriptions(Long patientId);
    List<PrescriptionResponse> getPrescriptionsForDoctor(String doctorUsername);
    List<PrescriptionResponse> getMyPrescriptions(String username);
    PrescriptionResponse dispensePrescription(Long prescriptionId);
}
