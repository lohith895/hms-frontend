import React, { useState, useEffect } from 'react';
import { Button, Select, Title, Text, Card, Grid, Loader, Box, Badge, Divider, Group, ActionIcon } from '@mantine/core';
import {
  IconFileText, IconAlertCircle, IconClock, IconPlus, IconActivity, IconUser, IconHeart,
  IconStethoscope, IconFlask, IconPill, IconReceipt2, IconDownload
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';
import AddMedicalRecordModal from './AddMedicalRecordModal';

interface EMRHistoryProps {
  currentUser: any;
}

export type TimelineEventType = 'CONSULTATION' | 'LAB_TEST' | 'PRESCRIPTION' | 'CONSULT_BILL' | 'PHARMACY_BILL';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: Date;
  data: any;
}

const EMRHistory: React.FC<EMRHistoryProps> = ({ currentUser }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [fetchingPatients, setFetchingPatients] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClinician = ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE'].includes(currentUser?.role);
  const isDoctor = currentUser?.role === 'ROLE_DOCTOR';
  const isPatient = currentUser?.role === 'ROLE_PATIENT';

  // Load patients if clinician
  useEffect(() => {
    if (isClinician) {
      setFetchingPatients(true);
      api.get('/patients') // Fetch patients list from correct endpoint
        .then((res) => {
          setPatients(res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch patients list', err);
        })
        .finally(() => {
          setFetchingPatients(false);
        });
    }
  }, [isClinician]);

  // Load unified records
  const loadRecords = React.useCallback(async (patientId?: string) => {
    setLoading(true);
    setError(null);
    try {
      let emr: any[] = [];
      let labs: any[] = [];
      let rx: any[] = [];
      let consultBills: any[] = [];
      let pharmBills: any[] = [];

      if (isPatient) {
        const [emrRes, labsRes, rxRes, cbRes, pbRes] = await Promise.all([
          api.get('/medical-records/my').catch(() => ({ data: [] })),
          api.get('/laboratory/reports/my').catch(() => ({ data: [] })),
          api.get('/prescriptions/my').catch(() => ({ data: [] })),
          api.get('/billing/invoices/my').catch(() => ({ data: [] })),
          api.get('/pharmacy/invoices/my').catch(() => ({ data: [] }))
        ]);
        emr = emrRes.data; labs = labsRes.data; rx = rxRes.data; consultBills = cbRes.data; pharmBills = pbRes.data;
      } else if (patientId) {
        const [emrRes, labsRes, rxRes, cbRes, pbRes] = await Promise.all([
          api.get(`/medical-records/patient/${patientId}`).catch(() => ({ data: [] })),
          api.get(`/laboratory/reports/patient/${patientId}`).catch(() => ({ data: [] })),
          api.get(`/prescriptions/patient/${patientId}`).catch(() => ({ data: [] })),
          api.get(`/billing/invoices/patient/${patientId}`).catch(() => ({ data: [] })),
          api.get(`/pharmacy/invoices/patient/${patientId}`).catch(() => ({ data: [] }))
        ]);
        emr = emrRes.data; labs = labsRes.data; rx = rxRes.data; consultBills = cbRes.data; pharmBills = pbRes.data;
      } else {
        setTimelineEvents([]);
        return;
      }

      const events: TimelineEvent[] = [
        ...emr.map((item: any) => ({ id: `emr-${item.id}`, type: 'CONSULTATION' as TimelineEventType, date: new Date(item.recordDate || item.createdAt), data: item })),
        ...labs.map((item: any) => ({ id: `lab-${item.id}`, type: 'LAB_TEST' as TimelineEventType, date: new Date(item.createdAt || item.requestedAt), data: item })),
        ...rx.map((item: any) => ({ id: `rx-${item.id}`, type: 'PRESCRIPTION' as TimelineEventType, date: new Date(item.createdAt), data: item })),
        ...consultBills.map((item: any) => ({ id: `cb-${item.id}`, type: 'CONSULT_BILL' as TimelineEventType, date: new Date(item.createdAt), data: item })),
        ...pharmBills.map((item: any) => ({ id: `pb-${item.id}`, type: 'PHARMACY_BILL' as TimelineEventType, date: new Date(item.createdAt), data: item })),
      ];

      events.sort((a, b) => b.date.getTime() - a.date.getTime());
      setTimelineEvents(events);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve EMR timeline');
    } finally {
      setLoading(false);
    }
  }, [isPatient]);

  // Initial load for patient
  useEffect(() => {
    if (isPatient) {
      loadRecords();
    }
  }, [isPatient, loadRecords]);

  // Load records when patient selection changes
  useEffect(() => {
    if (isClinician && selectedPatientId) {
      const patient = patients.find((p) => String(p.id) === selectedPatientId);
      setSelectedPatientName(patient ? (patient.fullName || patient.user?.username) : 'Selected Patient');
      loadRecords(selectedPatientId);
    } else if (isClinician) {
      setTimelineEvents([]);
      setSelectedPatientName('');
    }
  }, [selectedPatientId, patients, isClinician, loadRecords]);

  // Extract cumulative alerts
  const getCumulativeAlerts = () => {
    if (timelineEvents.length === 0) return { allergies: 'None reported', history: 'None reported', chronic: 'None reported', vaccinations: 'None reported', surgery: 'None reported' };
    let cumulativeAllergies = '';
    let cumulativeHistory = '';
    let cumulativeChronic = '';
    let cumulativeVaccinations = '';
    let cumulativeSurgery = '';

    const consults = timelineEvents.filter(e => e.type === 'CONSULTATION');
    for (const event of consults) {
      const record = event.data;
      if (record.allergies && record.allergies.trim() && !cumulativeAllergies) {
        cumulativeAllergies = record.allergies;
      }
      if (record.medicalHistory && record.medicalHistory.trim() && !cumulativeHistory) {
        cumulativeHistory = record.medicalHistory;
      }
      if (record.chronicConditions && record.chronicConditions.trim() && !cumulativeChronic) {
        cumulativeChronic = record.chronicConditions;
      }
      if (record.vaccinationRecords && record.vaccinationRecords.trim() && !cumulativeVaccinations) {
        cumulativeVaccinations = record.vaccinationRecords;
      }
      if (record.surgicalHistory && record.surgicalHistory.trim() && !cumulativeSurgery) {
        cumulativeSurgery = record.surgicalHistory;
      }
    }

    return {
      allergies: cumulativeAllergies || 'None reported',
      history: cumulativeHistory || 'None reported',
      chronic: cumulativeChronic || 'None reported',
      vaccinations: cumulativeVaccinations || 'None reported',
      surgery: cumulativeSurgery || 'None reported',
    };
  };

  const { allergies, history, chronic, vaccinations, surgery } = getCumulativeAlerts();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── EMR Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title order={2} style={{ color: '#F0F6FF', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Final Patient Record Timeline
          </Title>
          <Text size="sm" style={{ color: '#8BA3C7', marginTop: '4px' }}>
            {isPatient 
              ? 'Your comprehensive clinical consult log, medical history, and timeline.' 
              : 'Access complete medical timeline including consultations, labs, and bills.'}
          </Text>
        </div>
        
        {isDoctor && selectedPatientId && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpened(true)}
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              border: 'none',
              borderRadius: '12px',
              height: '42px',
              fontWeight: 600,
            }}
          >
            Log Consultation
          </Button>
        )}
      </div>

      {/* ── Patient Selector (Clinician only) ── */}
      {isClinician && (
        <Card radius="lg" p="md" style={{ background: 'rgba(14,22,40,0.7)', border: '1px solid #1C2B46' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
            <Select
              label="Select Patient to View Chart"
              placeholder={fetchingPatients ? "Loading patients..." : "Choose a patient"}
              data={patients.map((p) => ({ value: String(p.id), label: `${p.fullName || p.user?.username} (ID: ${p.id})` }))}
              value={selectedPatientId}
              onChange={setSelectedPatientId}
              disabled={fetchingPatients}
              leftSection={<IconUser size={16} />}
              style={{ flex: 1, minWidth: '260px' }}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 },
                dropdown: { backgroundColor: '#0E1628', borderColor: '#1C2B46' },
              }}
            />
            {selectedPatientId && (
              <Button variant="subtle" onClick={() => setSelectedPatientId(null)} style={{ color: '#FB7185', height: '44px' }}>
                Clear Selection
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* ── Main Content Layout ── */}
      {error && (
        <Text size="sm" style={{ color: '#FB7185', background: 'rgba(251,113,133,0.1)', padding: '12px', borderRadius: '12px' }}>{error}</Text>
      )}

      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
          <Loader size="xl" color="cyan" />
        </Box>
      ) : (
        <>
          {isClinician && !selectedPatientId ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(96,165,250,0.06)', color: '#60A5FA', marginBottom: '16px' }}>
                <IconFileText size={32} />
              </div>
              <Title order={3} style={{ color: '#F0F6FF', fontSize: '18px', fontWeight: 600 }}>No Patient Selected</Title>
              <Text size="sm" style={{ color: '#8BA3C7', maxWidth: '400px', margin: '8px auto 0 auto', lineHeight: 1.5 }}>
                Please select a patient from the dropdown above to retrieve their complete medical timeline.
              </Text>
            </motion.div>
          ) : (
            <Grid gutter="xl">
              {/* EMR Timeline Left Column (8-col) */}
              <Grid.Col span={{ base: 12, md: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconActivity size={18} style={{ color: '#22D3EE' }} />
                    <Title order={3} style={{ color: '#F0F6FF', fontSize: '16px', fontWeight: 700 }}>
                      Complete Medical Timeline
                    </Title>
                    <Badge variant="light" color="cyan" radius="sm">
                      {timelineEvents.length} {timelineEvents.length === 1 ? 'Event' : 'Events'}
                    </Badge>
                  </div>

                  {timelineEvents.length === 0 ? (
                    <Card radius="lg" p="xl" style={{ background: 'rgba(14,22,40,0.5)', border: '1px solid #1C2B46', textAlign: 'center', padding: '48px' }}>
                      <Text size="sm" style={{ color: '#8BA3C7' }}>No medical events recorded for this patient.</Text>
                    </Card>
                  ) : (
                    <div style={{ position: 'relative', paddingLeft: '28px', borderLeft: '2px solid #1C2B46', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      <AnimatePresence>
                        {timelineEvents.map((event, index) => {
                          const recordDate = event.date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
                          
                          let icon, color, title, content;

                          if (event.type === 'CONSULTATION') {
                              icon = <IconStethoscope size={14} color="#34D399" />;
                              color = '#34D399';
                              title = 'Medical Consultation';
                              content = (
                                   <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                       <Text size="sm" style={{ color: '#F0F6FF' }}><b>Diagnosis:</b> {event.data.diagnosis}</Text>
                                       {event.data.treatmentPlan && <Text size="sm" style={{ color: '#34D399' }}><b>Treatment Plan:</b> {event.data.treatmentPlan}</Text>}
                                       {event.data.chronicConditions && <Text size="xs" style={{ color: '#FB7185' }}><b>Chronic Conditions:</b> {event.data.chronicConditions}</Text>}
                                       {event.data.vaccinationRecords && <Text size="xs" style={{ color: '#60A5FA' }}><b>Vaccinations:</b> {event.data.vaccinationRecords}</Text>}
                                       {event.data.surgicalHistory && <Text size="xs" style={{ color: '#A78BFA' }}><b>Surgical History:</b> {event.data.surgicalHistory}</Text>}
                                       {event.data.followUpDate && (
                                           <Text size="xs" style={{ color: '#FBBF24', fontWeight: 600 }}>
                                               <b>Scheduled Follow-up:</b> {new Date(event.data.followUpDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                           </Text>
                                       )}
                                       {event.data.notes && <Text size="xs" style={{ color: '#8BA3C7', fontStyle: 'italic' }}>Notes: {event.data.notes}</Text>}
                                   </div>
                              );
                          } else if (event.type === 'LAB_TEST') {
                              icon = <IconFlask size={14} color="#A78BFA" />;
                              color = '#A78BFA';
                              title = 'Laboratory Report';
                              content = (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <Text size="sm" style={{ color: '#F0F6FF' }}><b>Test:</b> {event.data.testName}</Text>
                                      <Group justify="space-between">
                                        <Badge color={event.data.status === 'COMPLETED' ? 'teal' : 'yellow'}>{event.data.status}</Badge>
                                        {event.data.fileUrl && (
                                            <Button variant="light" color="violet" size="xs" leftSection={<IconDownload size={12} />} onClick={() => window.open(`http://localhost:8080/uploads/${event.data.fileUrl}`, '_blank')}>Download Report</Button>
                                        )}
                                      </Group>
                                  </div>
                              );
                          } else if (event.type === 'PRESCRIPTION') {
                              icon = <IconPill size={14} color="#60A5FA" />;
                              color = '#60A5FA';
                              title = 'Prescription';
                              content = (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <Text size="sm" style={{ color: '#F0F6FF' }}><b>Medicines:</b> {event.data.items?.map((i: any) => i.medicineName).join(', ')}</Text>
                                      <Group justify="space-between" align="center">
                                          <Badge color={event.data.status === 'DISPENSED' ? 'teal' : 'blue'}>{event.data.status}</Badge>
                                          <Button
                                              variant="light"
                                              color="blue"
                                              size="xs"
                                              leftSection={<IconDownload size={12} />}
                                              onClick={async () => {
                                                  try {
                                                      const res = await api.get(`/prescriptions/${event.data.id}/pdf`, { responseType: 'blob' });
                                                      const blob = new Blob([res.data], { type: 'application/pdf' });
                                                      const url = window.URL.createObjectURL(blob);
                                                      const a = document.createElement('a');
                                                      a.href = url;
                                                      a.download = `prescription-RX-${event.data.id}.pdf`;
                                                      document.body.appendChild(a);
                                                      a.click();
                                                      document.body.removeChild(a);
                                                      window.URL.revokeObjectURL(url);
                                                  } catch (err) {
                                                      console.error("Failed to download prescription PDF", err);
                                                  }
                                              }}
                                          >
                                              Download PDF
                                          </Button>
                                      </Group>
                                  </div>
                              );
                          } else {
                              icon = <IconReceipt2 size={14} color="#F472B6" />;
                              color = '#F472B6';
                              title = event.type === 'CONSULT_BILL' ? 'Consultation Bill' : 'Pharmacy Bill';
                              const amount = event.type === 'CONSULT_BILL' ? event.data.netAmount : event.data.grandTotal;
                              const status = event.type === 'CONSULT_BILL' ? event.data.status : event.data.paymentStatus;
                              content = (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <Text size="sm" style={{ color: '#F0F6FF' }}><b>Amount:</b> ${amount.toFixed(2)}</Text>
                                      <Badge color={status === 'PAID' ? 'teal' : 'red'}>{status}</Badge>
                                  </div>
                              );
                          }

                          return (
                            <motion.div key={event.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: index * 0.05 }} style={{ position: 'relative' }}>
                              <div style={{ position: 'absolute', left: '-39px', top: '12px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#080D1A', border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 8px ${color}80` }}></div>
                              
                              <Card radius="lg" p="lg" style={{ background: 'rgba(14,22,40,0.75)', border: `1px solid ${color}40` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                  <Group gap="xs">
                                      {icon}
                                      <Text size="xs" style={{ color: color, fontWeight: 700, textTransform: 'uppercase' }}>{title}</Text>
                                  </Group>
                                  <Text size="xs" style={{ color: '#8BA3C7' }}>{recordDate}</Text>
                                </div>
                                <Divider color="#1C2B46" my="sm" />
                                {content}
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </Grid.Col>

              {/* Patient Profile & Alerts Right Column (4-col) */}
              <Grid.Col span={{ base: 12, md: 4 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '90px' }}>
                  <Card radius="lg" p="lg" style={{ background: 'rgba(14,22,40,0.8)', border: '1px solid #1C2B46', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <IconHeart size={20} style={{ color: '#FB7185' }} />
                      <Title order={3} style={{ color: '#F0F6FF', fontSize: '15px', fontWeight: 700 }}>Active Clinical Profile</Title>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div>
                        <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Patient Name</Text>
                        <Text size="md" style={{ color: '#F0F6FF', fontWeight: 700, marginTop: '2px' }}>
                          {isPatient ? `${currentUser?.firstName} ${currentUser?.lastName}` : selectedPatientName}
                        </Text>
                      </div>

                      <Divider color="#1C2B46" />

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FB7185', marginBottom: '4px' }}>
                          <IconAlertCircle size={15} />
                          <Text size="xs" style={{ fontWeight: 700 }}>Cumulative Allergies</Text>
                        </div>
                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: allergies !== 'None reported' ? 'rgba(251,113,133,0.06)' : 'rgba(8,13,26,0.3)', border: allergies !== 'None reported' ? '1px solid rgba(251,113,133,0.15)' : '1px solid #1C2B46' }}>
                          <Text size="sm" style={{ color: allergies !== 'None reported' ? '#FB7185' : '#8BA3C7', fontWeight: allergies !== 'None reported' ? 600 : 400 }}>{allergies}</Text>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60A5FA', marginBottom: '4px' }}>
                          <IconClock size={15} />
                          <Text size="xs" style={{ fontWeight: 700 }}>Recorded Medical History</Text>
                        </div>
                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: history !== 'None reported' ? 'rgba(96,165,250,0.06)' : 'rgba(8,13,26,0.3)', border: history !== 'None reported' ? '1px solid rgba(96,165,250,0.15)' : '1px solid #1C2B46' }}>
                          <Text size="sm" style={{ color: history !== 'None reported' ? '#93C5FD' : '#8BA3C7', lineHeight: 1.4 }}>{history}</Text>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FB7185', marginBottom: '4px' }}>
                          <IconAlertCircle size={15} />
                          <Text size="xs" style={{ fontWeight: 700 }}>Chronic Conditions</Text>
                        </div>
                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: chronic !== 'None reported' ? 'rgba(251,113,133,0.06)' : 'rgba(8,13,26,0.3)', border: chronic !== 'None reported' ? '1px solid rgba(251,113,133,0.15)' : '1px solid #1C2B46' }}>
                          <Text size="sm" style={{ color: chronic !== 'None reported' ? '#FB7185' : '#8BA3C7', lineHeight: 1.4 }}>{chronic}</Text>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60A5FA', marginBottom: '4px' }}>
                          <IconStethoscope size={15} />
                          <Text size="xs" style={{ fontWeight: 700 }}>Vaccination Records</Text>
                        </div>
                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: vaccinations !== 'None reported' ? 'rgba(96,165,250,0.06)' : 'rgba(8,13,26,0.3)', border: vaccinations !== 'None reported' ? '1px solid rgba(96,165,250,0.15)' : '1px solid #1C2B46' }}>
                          <Text size="sm" style={{ color: vaccinations !== 'None reported' ? '#93C5FD' : '#8BA3C7', lineHeight: 1.4 }}>{vaccinations}</Text>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A78BFA', marginBottom: '4px' }}>
                          <IconClock size={15} />
                          <Text size="xs" style={{ fontWeight: 700 }}>Surgical History</Text>
                        </div>
                        <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: surgery !== 'None reported' ? 'rgba(167,139,250,0.06)' : 'rgba(8,13,26,0.3)', border: surgery !== 'None reported' ? '1px solid rgba(167,139,250,0.15)' : '1px solid #1C2B46' }}>
                          <Text size="sm" style={{ color: surgery !== 'None reported' ? '#C084FC' : '#8BA3C7', lineHeight: 1.4 }}>{surgery}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </Grid.Col>
            </Grid>
          )}
        </>
      )}

      {/* ── Add Record Modal ── */}
      {isDoctor && selectedPatientId && (
        <AddMedicalRecordModal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          onSuccess={() => { loadRecords(selectedPatientId); }}
          currentUser={currentUser}
          preselectedPatientId={selectedPatientId}
        />
      )}
    </div>
  );
};

export default EMRHistory;
