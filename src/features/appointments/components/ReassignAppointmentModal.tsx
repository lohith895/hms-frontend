import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, Loader, Text, Box } from '@mantine/core';
import api from '../../../utils/api';
import { IconStethoscope } from '@tabler/icons-react';

interface ReassignAppointmentModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  appointmentId: number;
  currentDoctorId: number;
}

const ReassignAppointmentModal: React.FC<ReassignAppointmentModalProps> = ({
  opened,
  onClose,
  onSuccess,
  appointmentId,
  currentDoctorId,
}) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(String(currentDoctorId));
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setError(null);
      setFetchingData(true);
      
      const loadData = async () => {
        try {
          const docRes = await api.get('/doctors');
          setDoctors(docRes.data);
          setSelectedDoctorId(String(currentDoctorId));
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to fetch doctors');
        } finally {
          setFetchingData(false);
        }
      };

      loadData();
    }
  }, [opened, currentDoctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError('Please select a new doctor');
      return;
    }
    
    if (String(currentDoctorId) === selectedDoctorId) {
      setError('Please select a DIFFERENT doctor to reassign to');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.put(`/appointments/${appointmentId}/reassign?newDoctorId=${selectedDoctorId}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reassign appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Reassign Appointment"
      size="sm"
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
          <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
            <Loader size="sm" color="blue" />
          </Box>
        ) : (
          <>
            <Select
              label="Select New Consulting Doctor"
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
              Confirm Reassignment
            </Button>
          </>
        )}
      </form>
    </Modal>
  );
};

export default ReassignAppointmentModal;
