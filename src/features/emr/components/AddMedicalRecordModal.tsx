import React, { useState, useEffect } from 'react';
import { Modal, Button, TextInput, Textarea, Select, Loader, Text, Box, Grid } from '@mantine/core';
import api from '../../../utils/api';
import { IconUser, IconStethoscope, IconCalendar, IconFileText, IconAlertCircle, IconClock } from '@tabler/icons-react';
import WritePrescriptionForm, { PrescriptionItemInput } from '../../prescriptions/components/WritePrescriptionForm';
import OrderLabTestForm, { LabTestOrderInput } from '../../laboratory/components/OrderLabTestForm';

interface AddMedicalRecordModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
  preselectedPatientId?: string;
}

const AddMedicalRecordModal: React.FC<AddMedicalRecordModalProps> = ({
  opened,
  onClose,
  onSuccess,
  currentUser,
  preselectedPatientId,
}) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [vaccinationRecords, setVaccinationRecords] = useState('');
  const [surgicalHistory, setSurgicalHistory] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItemInput[]>([]);
  const [labTests, setLabTests] = useState<LabTestOrderInput[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors/me profile to get doctorId
  useEffect(() => {
    if (opened && currentUser?.role === 'ROLE_DOCTOR') {
      const fetchDoctorProfile = async () => {
        try {
          const res = await api.get('/doctors/me');
          setDoctorId(res.data.id);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch doctor profile');
        }
      };
      fetchDoctorProfile();
    }
  }, [opened, currentUser]);

  // Fetch list of patients
  useEffect(() => {
    if (opened) {
      setError(null);
      setFetchingData(true);
      
      const loadPatients = async () => {
        try {
          const patRes = await api.get('/patients');
          setPatients(patRes.data);
          
          if (preselectedPatientId) {
            setSelectedPatientId(preselectedPatientId);
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch patient list');
        } finally {
          setFetchingData(false);
        }
      };

      loadPatients();
    }
  }, [opened, preselectedPatientId]);

  // Fetch doctor's appointments to link them, filtered for selected patient
  useEffect(() => {
    if (opened && selectedPatientId) {
      const loadAppointments = async () => {
        try {
          const appRes = await api.get('/appointments');
          // Filter appointments for the selected patient and doctor (if match)
          const filtered = appRes.data.filter(
            (app: any) => String(app.patientId) === selectedPatientId
          );
          setAppointments(filtered);
        } catch (err) {
          console.error('Failed to load appointments for dropdown', err);
        }
      };
      loadAppointments();
    } else {
      setAppointments([]);
      setSelectedAppointmentId(null);
    }
  }, [opened, selectedPatientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !doctorId || !diagnosis || !symptoms) {
      setError('Please fill in all required fields (Patient, Symptoms, Diagnosis)');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const recordRes = await api.post('/medical-records', {
        patientId: Number(selectedPatientId),
        doctorId: doctorId,
        appointmentId: selectedAppointmentId ? Number(selectedAppointmentId) : null,
        diagnosis,
        symptoms,
        treatmentPlan,
        allergies,
        medicalHistory,
        notes,
        followUpDate: followUpDate || null,
        chronicConditions: chronicConditions || null,
        vaccinationRecords: vaccinationRecords || null,
        surgicalHistory: surgicalHistory || null,
      });

      if (prescriptionItems.length > 0) {
        await api.post('/prescriptions', {
          patientId: Number(selectedPatientId),
          doctorId: doctorId,
          medicalRecordId: recordRes.data.id,
          items: prescriptionItems.map((item) => ({
            medicineId: item.medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            durationDays: item.durationDays,
            quantity: item.quantity,
          })),
        });
      }

      if (labTests.length > 0) {
        await Promise.all(
          labTests.map((test) =>
            api.post('/laboratory/reports', {
              patientId: Number(selectedPatientId),
              doctorId: doctorId,
              labTestId: test.id,
            })
          )
        );
      }

      onSuccess();
      onClose();
      // Reset form
      if (!preselectedPatientId) {
        setSelectedPatientId(null);
      }
      setSelectedAppointmentId(null);
      setDiagnosis('');
      setSymptoms('');
      setTreatmentPlan('');
      setAllergies('');
      setMedicalHistory('');
      setNotes('');
      setFollowUpDate('');
      setChronicConditions('');
      setVaccinationRecords('');
      setSurgicalHistory('');
      setPrescriptionItems([]);
      setLabTests([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create medical record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Electronic Medical Record (EMR)"
      size="lg"
      radius="lg"
      styles={{
        content: {
          backgroundColor: '#0E1628',
          border: '1px solid #1C2B46',
          color: '#F0F6FF',
        },
        header: {
          backgroundColor: '#0E1628',
          color: '#F0F6FF',
          borderBottom: '1px solid #1C2B46',
        },
        title: {
          fontWeight: 700,
        }
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
        {error && (
          <Text size="sm" style={{ color: '#FB7185', background: 'rgba(251,113,133,0.1)', padding: '10px', borderRadius: '8px' }}>
            {error}
          </Text>
        )}

        {fetchingData ? (
          <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
            <Loader size="md" color="cyan" />
          </Box>
        ) : (
          <>
            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Select Patient"
                  placeholder="Choose a patient"
                  required
                  disabled={!!preselectedPatientId}
                  data={patients.map((p) => ({ value: String(p.id), label: `${p.fullName} (${p.email})` }))}
                  value={selectedPatientId}
                  onChange={setSelectedPatientId}
                  leftSection={<IconUser size={16} />}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                    label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 },
                    dropdown: { backgroundColor: '#0E1628', borderColor: '#1C2B46' },
                  }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                  label="Link to Appointment (Optional)"
                  placeholder={selectedPatientId ? "Choose an appointment" : "Select patient first"}
                  disabled={!selectedPatientId || appointments.length === 0}
                  data={appointments.map((a) => {
                    const date = new Date(a.appointmentDateTime).toLocaleString();
                    return { value: String(a.id), label: `${date} - ${a.reason}` };
                  })}
                  value={selectedAppointmentId}
                  onChange={setSelectedAppointmentId}
                  leftSection={<IconCalendar size={16} />}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                    label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 },
                    dropdown: { backgroundColor: '#0E1628', borderColor: '#1C2B46' },
                  }}
                />
              </Grid.Col>
            </Grid>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Textarea
                  label="Symptoms"
                  placeholder="Describe patient symptoms (e.g. chronic cough, sore throat, fatigue)"
                  required
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  minRows={3}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
                    label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                  }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Diagnosis"
                  placeholder="Clinical diagnosis (e.g. Acute Bronchitis)"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                    label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                  }}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Treatment Plan"
              placeholder="Prescriptions, medications, dosages, follow-up timelines"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              minRows={3}
              leftSection={<IconStethoscope size={16} style={{ color: '#8BA3C7', alignSelf: 'flex-start', marginTop: '10px' }} />}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', paddingLeft: '36px' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
              }}
            />

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Textarea
                  label="Allergies"
                  placeholder="Note allergies during consultation (e.g. Penicillin, Pollen)"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  minRows={2}
                  leftSection={<IconAlertCircle size={16} style={{ color: '#FB7185', alignSelf: 'flex-start', marginTop: '10px' }} />}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', paddingLeft: '36px' },
                    label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                  }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Textarea
                  label="Medical History Notes"
                  placeholder="Relevant conditions, prior surgeries, chronic illnesses"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  minRows={2}
                  leftSection={<IconClock size={16} style={{ color: '#60A5FA', alignSelf: 'flex-start', marginTop: '10px' }} />}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', paddingLeft: '36px' },
                    label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                  }}
                />
              </Grid.Col>
            </Grid>

            <Grid gutter="md">
              <Grid.Col span={{ base: 12, sm: 4 }}>

                <Textarea
                  label="Chronic Conditions"
                  placeholder="E.g., Hypertension, Diabetes"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  minRows={2}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
                    label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                  }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Textarea
                  label="Vaccination Records"
                  placeholder="E.g., COVID-19 Booster, BCG"
                  value={vaccinationRecords}
                  onChange={(e) => setVaccinationRecords(e.target.value)}
                  minRows={2}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
                    label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                  }}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 4 }}>
                <Textarea
                  label="Surgical History"
                  placeholder="E.g., Appendectomy (2018)"
                  value={surgicalHistory}
                  onChange={(e) => setSurgicalHistory(e.target.value)}
                  minRows={2}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
                    label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                  }}
                />
              </Grid.Col>
            </Grid>

            <Textarea
              label="Additional Consult Notes"
              placeholder="Any other internal notes, observations, or lab requests"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              minRows={2}
              leftSection={<IconFileText size={16} style={{ color: '#8BA3C7', alignSelf: 'flex-start', marginTop: '10px' }} />}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', paddingLeft: '36px' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
              }}
            />

            <TextInput
              label="Scheduled Follow-up Date (Optional)"
              placeholder="Select follow-up date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
              }}
              style={{ marginBottom: '16px' }}
            />

            <WritePrescriptionForm
              items={prescriptionItems}
              onChange={setPrescriptionItems}
            />

            <OrderLabTestForm
              selectedTests={labTests}
              onChange={setLabTests}
            />

            <Button
              type="submit"
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                height: '44px',
                radius: 'md',
                fontWeight: 600,
                marginTop: '10px',
                border: 'none',
              }}
            >
              Save Medical Record
            </Button>
          </>
        )}
      </form>
    </Modal>
  );
};

export default AddMedicalRecordModal;
