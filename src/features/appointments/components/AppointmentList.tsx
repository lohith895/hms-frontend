import React, { useState, useEffect } from 'react';
import { Table, Badge, TextInput, Button, Loader, Text, Box, Card, Group } from '@mantine/core';
import { IconSearch, IconCalendarPlus, IconAlertCircle, IconCalendar } from '@tabler/icons-react';
import api from '../../../utils/api';
import BookAppointmentModal from './BookAppointmentModal';
import ReassignAppointmentModal from './ReassignAppointmentModal';
import ConsultationForm from './ConsultationForm';
import dayjs from 'dayjs';

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentDateTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  visitStatus?: 'WAITING' | 'UNDER_CONSULTATION' | 'PHARMACY_PROCESSING' | 'CLOSED';
  reason: string;
  notes: string;
}

interface AppointmentListProps {
  currentUser: any;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ currentUser }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [reassignModalOpened, setReassignModalOpened] = useState(false);
  const [selectedAppointmentToReassign, setSelectedAppointmentToReassign] = useState<any>(null);
  const [consultationModalOpened, setConsultationModalOpened] = useState(false);
  const [selectedAppointmentForConsult, setSelectedAppointmentForConsult] = useState<any>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.put(`/appointments/${id}/status?status=${status}`);
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleVisitStatusUpdate = async (id: number, visitStatus: string) => {
    try {
      await api.put(`/appointments/${id}/visit-status?visitStatus=${visitStatus}`);
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update visit status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'COMPLETED': return 'green';
      case 'CANCELLED': return 'red';
      default: return 'gray';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING': return 'yellow';
      case 'UNDER_CONSULTATION': return 'orange';
      case 'PHARMACY_PROCESSING': return 'violet';
      case 'CLOSED': return 'teal';
      default: return 'gray';
    }
  };

  const filteredAppointments = appointments.filter(app => {
    const searchLower = search.toLowerCase();
    return (
      app.doctorName.toLowerCase().includes(searchLower) ||
      app.patientName.toLowerCase().includes(searchLower) ||
      app.reason.toLowerCase().includes(searchLower)
    );
  });

  const canBook = currentUser?.role === 'ROLE_PATIENT' || currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_RECEPTIONIST';

  return (
    <Card
      radius="lg"
      p="xl"
      style={{
        backgroundColor: 'rgba(14,22,40,0.7)',
        border: '1px solid #1C2B46',
        boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
      }}
    >
      <Group justify="space-between" mb="lg">
        <div>
          <Text size="lg" style={{ fontWeight: 700, color: '#F0F6FF' }}>Consultation Schedule</Text>
          <Text size="xs" style={{ color: '#8BA3C7' }}>View and manage clinical appointments</Text>
        </div>
        
        {canBook && (
          <Button
            leftSection={<IconCalendarPlus size={16} />}
            onClick={() => setModalOpened(true)}
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 600,
            }}
          >
            Schedule Consultation
          </Button>
        )}
      </Group>

      <TextInput
        placeholder="Filter by physician, patient or reason..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb="lg"
        styles={{
          input: {
            backgroundColor: 'rgba(8,13,26,0.6)',
            borderColor: '#1C2B46',
            color: '#F0F6FF',
            borderRadius: '10px',
          }
        }}
      />

      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Loader size="md" color="blue" />
        </Box>
      ) : error ? (
        <Box style={{ textAlign: 'center', padding: '40px 0' }}>
          <IconAlertCircle size={40} style={{ color: '#FB7185', marginBottom: '10px' }} />
          <Text size="sm" style={{ color: '#FB7185' }}>{error}</Text>
        </Box>
      ) : filteredAppointments.length === 0 ? (
        <Box style={{ textAlign: 'center', padding: '60px 0' }}>
          <IconCalendar size={40} style={{ color: '#4D6580', marginBottom: '10px' }} />
          <Text size="sm" style={{ color: '#8BA3C7' }}>No consultations found</Text>
        </Box>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <Table verticalSpacing="sm" style={{ color: '#F0F6FF', minWidth: '600px' }}>
            <Table.Thead style={{ borderBottom: '2px solid #1C2B46' }}>
              <Table.Tr>
                <Table.Th style={{ color: '#8BA3C7', fontSize: '12px', fontWeight: 600 }}>Date & Time</Table.Th>
                <Table.Th style={{ color: '#8BA3C7', fontSize: '12px', fontWeight: 600 }}>Patient Name</Table.Th>
                <Table.Th style={{ color: '#8BA3C7', fontSize: '12px', fontWeight: 600 }}>Consulting Physician</Table.Th>
                <Table.Th style={{ color: '#8BA3C7', fontSize: '12px', fontWeight: 600 }}>Status</Table.Th>
                <Table.Th style={{ color: '#8BA3C7', fontSize: '12px', fontWeight: 600 }}>Visit State</Table.Th>
                <Table.Th style={{ color: '#8BA3C7', fontSize: '12px', fontWeight: 600 }}>Reason</Table.Th>
                <Table.Th style={{ color: '#8BA3C7', fontSize: '12px', fontWeight: 600 }}>Notes</Table.Th>
                {currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_RECEPTIONIST' || currentUser?.role === 'ROLE_NURSE' || currentUser?.role === 'ROLE_DOCTOR' ? (
                  <Table.Th style={{ color: '#8BA3C7', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>Actions</Table.Th>
                ) : null}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAppointments.map((app) => (
                <Table.Tr key={app.id} style={{ borderBottom: '1px solid #1C2B46' }}>
                  <Table.Td style={{ fontWeight: 500 }}>
                    {dayjs(app.appointmentDateTime).format('MMM DD, YYYY — hh:mm A')}
                  </Table.Td>
                  <Table.Td>{app.patientName}</Table.Td>
                  <Table.Td>{app.doctorName}</Table.Td>
                  <Table.Td>
                    <Badge color={getStatusColor(app.status)} variant="light" size="sm" radius="sm">
                      {app.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {app.visitStatus ? (
                      <Badge color={getVisitStatusColor(app.visitStatus)} variant="light" size="sm" radius="sm">
                        {app.visitStatus.replace('_', ' ')}
                      </Badge>
                    ) : (
                      <Text size="xs" style={{ color: '#4D6580' }}>Not Checked In</Text>
                    )}
                  </Table.Td>
                  <Table.Td>{app.reason}</Table.Td>
                  <Table.Td style={{ color: '#8BA3C7', fontSize: '13px' }}>
                    {app.notes || '—'}
                  </Table.Td>
                  {currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_RECEPTIONIST' || currentUser?.role === 'ROLE_NURSE' || currentUser?.role === 'ROLE_DOCTOR' ? (
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Group gap="xs" justify="flex-end">
                        {(currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_RECEPTIONIST') && (
                          <Button
                            variant="light"
                            size="xs"
                            color="cyan"
                            onClick={() => {
                              setSelectedAppointmentToReassign(app);
                              setReassignModalOpened(true);
                            }}
                          >
                            Reassign
                          </Button>
                        )}
                        {app.status === 'SCHEDULED' && (!app.visitStatus || app.visitStatus === 'WAITING') && (currentUser?.role === 'ROLE_ADMIN' || currentUser?.role === 'ROLE_RECEPTIONIST' || currentUser?.role === 'ROLE_NURSE') && (
                          <Button
                            variant="light"
                            size="xs"
                            color="yellow"
                            onClick={() => handleVisitStatusUpdate(app.id, app.visitStatus === 'WAITING' ? 'UNDER_CONSULTATION' : 'WAITING')}
                          >
                            {app.visitStatus === 'WAITING' ? 'Call Patient' : 'Check In'}
                          </Button>
                        )}
                        {app.status === 'SCHEDULED' && (
                          <Button
                            variant="light"
                            size="xs"
                            color="red"
                            onClick={() => handleStatusUpdate(app.id, 'CANCELLED')}
                          >
                            Cancel
                          </Button>
                        )}
                        {app.status === 'SCHEDULED' && currentUser?.role === 'ROLE_DOCTOR' && (
                          <Button
                            variant="filled"
                            size="xs"
                            color="blue"
                            onClick={() => {
                              setSelectedAppointmentForConsult(app);
                              setConsultationModalOpened(true);
                            }}
                          >
                            Start Consultation
                          </Button>
                        )}
                        {app.status === 'SCHEDULED' && currentUser?.role === 'ROLE_ADMIN' && (
                          <Button
                            variant="light"
                            size="xs"
                            color="green"
                            onClick={() => handleStatusUpdate(app.id, 'COMPLETED')}
                          >
                            Mark Done
                          </Button>
                        )}
                      </Group>
                    </Table.Td>
                  ) : null}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}
      {canBook && (
        <BookAppointmentModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          onSuccess={() => fetchAppointments()}
          currentUser={currentUser}
        />
      )}
      
      {selectedAppointmentToReassign && (
        <ReassignAppointmentModal
          opened={reassignModalOpened}
          onClose={() => setReassignModalOpened(false)}
          onSuccess={() => fetchAppointments()}
          appointmentId={selectedAppointmentToReassign.id}
          currentDoctorId={selectedAppointmentToReassign.doctorId}
        />
      )}
      
      {selectedAppointmentForConsult && (
        <ConsultationForm
          opened={consultationModalOpened}
          onClose={() => setConsultationModalOpened(false)}
          appointment={selectedAppointmentForConsult}
          onSuccess={() => fetchAppointments()}
        />
      )}
    </Card>
  );
};

export default AppointmentList;
