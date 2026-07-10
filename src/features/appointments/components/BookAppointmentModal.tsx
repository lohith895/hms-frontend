import React, { useState, useEffect } from 'react';
import { Modal, Button, TextInput, Textarea, Select, Loader, Text, Box } from '@mantine/core';
import api from '../../../utils/api';
import { IconCalendar, IconUser, IconStethoscope } from '@tabler/icons-react';

interface BookAppointmentModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
}

const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  opened,
  onClose,
  onSuccess,
  currentUser,
}) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPatient = currentUser?.role === 'ROLE_PATIENT';

  useEffect(() => {
    if (opened) {
      setError(null);
      setFetchingData(true);
      
      const loadData = async () => {
        try {
          const docRes = await api.get('/doctors');
          setDoctors(docRes.data);

          if (isPatient) {
            const meRes = await api.get('/patients/me');
            setSelectedPatientId(String(meRes.data.id));
          } else {
            const patRes = await api.get('/patients');
            setPatients(patRes.data);
          }
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch doctor/patient details');
        } finally {
          setFetchingData(false);
        }
      };

      loadData();
    }
  }, [opened, isPatient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedPatientId || !appointmentDateTime || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.post('/appointments', {
        patientId: Number(selectedPatientId),
        doctorId: Number(selectedDoctorId),
        appointmentDateTime: appointmentDateTime,
        reason,
        notes,
      });
      onSuccess();
      onClose();
      setSelectedDoctorId(null);
      if (!isPatient) setSelectedPatientId(null);
      setAppointmentDateTime('');
      setReason('');
      setNotes('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Book a Medical Consultation"
      size="md"
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
            <Loader size="md" color="blue" />
          </Box>
        ) : (
          <>
            {!isPatient && (
              <Select
                label="Select Patient"
                placeholder="Choose a patient"
                required
                data={patients.map((p) => ({ value: String(p.id), label: `${p.fullName} (${p.email})` }))}
                value={selectedPatientId}
                onChange={setSelectedPatientId}
                leftSection={<IconUser size={16} />}
                styles={{
                  input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                  label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                }}
              />
            )}

            <Select
              label="Select Medical Doctor"
              placeholder="Choose a doctor"
              required
              data={doctors.map((d) => ({ value: String(d.id), label: `${d.fullName} — ${d.specialization} (${d.departmentName})` }))}
              value={selectedDoctorId}
              onChange={setSelectedDoctorId}
              leftSection={<IconStethoscope size={16} />}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ color: '#8BA3C7', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Appointment Date & Time <span style={{ color: '#FB7185' }}>*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={appointmentDateTime}
                onChange={(e) => setAppointmentDateTime(e.target.value)}
                style={{
                  backgroundColor: 'rgba(8,13,26,0.6)',
                  border: '1px solid #1C2B46',
                  color: '#F0F6FF',
                  borderRadius: '12px',
                  height: '44px',
                  padding: '0 12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
            </div>

            <TextInput
              label="Reason for Visit"
              placeholder="e.g. Annual physical exam"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
              }}
            />

            <Textarea
              label="Additional Notes (Optional)"
              placeholder="Provide any relevant medical symptoms"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              minRows={3}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
              }}
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
              Confirm Appointment
            </Button>
          </>
        )}
      </form>
    </Modal>
  );
};

export default BookAppointmentModal;
