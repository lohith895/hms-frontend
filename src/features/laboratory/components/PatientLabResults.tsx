import React, { useState, useEffect } from 'react';
import { Card, Grid, Text, Title, Badge, Group, TextInput, SegmentedControl, Loader, Box, Divider, Alert, Button } from '@mantine/core';
import { IconFlask, IconSearch, IconCalendar, IconUser, IconAlertCircle, IconCheck, IconClock, IconFileText, IconActivity } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';

interface PatientLabResultsProps {
  currentUser: any;
  patientId?: string | number | null;
}

const PatientLabResults: React.FC<PatientLabResultsProps> = ({ currentUser, patientId }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const isPatient = currentUser?.role === 'ROLE_PATIENT';
  const targetPatientId = patientId || (isPatient ? 'my' : null);

  const loadReports = React.useCallback(async () => {
    if (!targetPatientId) {
      setReports([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let url = '';
      if (targetPatientId === 'my') {
        url = '/laboratory/reports/my';
      } else {
        url = `/laboratory/reports/patient/${targetPatientId}`;
      }
      
      const res = await api.get(url);
      setReports(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve laboratory reports.');
    } finally {
      setLoading(false);
    }
  }, [targetPatientId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      report.labTestName.toLowerCase().includes(query) ||
      report.labTestCode.toLowerCase().includes(query) ||
      (report.doctorName && report.doctorName.toLowerCase().includes(query));
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && report.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── Filters & Search ── */}
      <Card
        radius="lg"
        p="md"
        style={{
          background: 'rgba(14,22,40,0.7)',
          border: '1px solid #1C2B46',
        }}
      >
        <Grid align="center" gutter="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Search reports by test name, code, doctor..."
              leftSection={<IconSearch size={16} style={{ color: '#8BA3C7' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '42px' }
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Group justify="flex-end">
              <SegmentedControl
                value={statusFilter}
                onChange={setStatusFilter}
                data={[
                  { label: 'All Reports', value: 'all' },
                  { label: 'Completed', value: 'completed' },
                  { label: 'Processing', value: 'processing' },
                  { label: 'Sample Collected', value: 'sample_collected' },
                  { label: 'Pending', value: 'pending' },
                ]}
                styles={{
                  root: { backgroundColor: 'rgba(8,13,26,0.6)', border: '1px solid #1C2B46' },
                  control: { border: 'none' },
                  label: { color: '#8BA3C7', fontWeight: 600 },
                  indicator: { backgroundColor: '#1C2B46' },
                }}
              />
            </Group>
          </Grid.Col>
        </Grid>
      </Card>

      {/* ── Load States / Reports ── */}
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" radius="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Loader size="lg" color="cyan" />
        </Box>
      ) : (
        <>
          {filteredReports.length === 0 ? (
            <Card
              radius="lg"
              p="xl"
              style={{
                background: 'rgba(14,22,40,0.5)',
                border: '1px solid #1C2B46',
                textAlign: 'center',
                padding: '60px 20px',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'rgba(34,211,238,0.06)',
                  color: '#22D3EE',
                  marginBottom: '16px',
                }}
              >
                <IconFlask size={28} />
              </div>
              <Title order={3} style={{ color: '#F0F6FF', fontSize: '18px', fontWeight: 600 }}>
                No Laboratory Reports Found
              </Title>
              <Text size="sm" style={{ color: '#8BA3C7', maxWidth: '400px', margin: '8px auto 0 auto', lineHeight: 1.5 }}>
                {searchQuery || statusFilter !== 'all' 
                  ? 'No results match your active filters. Try refining your search query.' 
                  : 'There are currently no laboratory diagnostic reports logged under this record.'}
              </Text>
            </Card>
          ) : (
            <Grid gutter="md">
              <AnimatePresence>
                {filteredReports.map((report, index) => {
                  const isCompleted = report.status === 'COMPLETED';
                  const isProcessing = report.status === 'PROCESSING';
                  const isCollected = report.status === 'SAMPLE_COLLECTED';
                  const date = new Date(report.testDate).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  });

                  return (
                    <Grid.Col span={{ base: 12, md: 6 }} key={report.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card
                          radius="lg"
                          p="lg"
                          style={{
                            background: 'rgba(14,22,40,0.75)',
                            border: '1px solid #1C2B46',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '220px'
                          }}
                        >
                          <div>
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                              <Group gap="xs">
                                <IconFlask size={18} style={{ color: '#22D3EE' }} />
                                <div>
                                  <Text size="md" style={{ color: '#F0F6FF', fontWeight: 700, lineHeight: 1.2 }}>
                                    {report.labTestName}
                                  </Text>
                                  <Text size="xs" style={{ color: '#8BA3C7', fontFamily: 'monospace', marginTop: '2px' }}>
                                    Code: {report.labTestCode}
                                  </Text>
                                </div>
                              </Group>
                              
                              <Badge 
                                variant="light" 
                                color={isCompleted ? 'green' : (isProcessing || isCollected) ? 'blue' : 'yellow'}
                                leftSection={isCompleted ? <IconCheck size={12} /> : (isProcessing || isCollected) ? <IconActivity size={12} /> : <IconClock size={12} />}
                                styles={{ root: { padding: '4px 10px', height: '24px' } }}
                              >
                                {report.status.replace('_', ' ')}
                              </Badge>
                            </div>

                            <Divider color="#1C2B46" my="xs" />

                            {/* Details Grid */}
                            <Grid gutter="xs">
                              <Grid.Col span={6}>
                                <Group gap="xs" wrap="nowrap">
                                  <IconCalendar size={14} style={{ color: '#8BA3C7', flexShrink: 0 }} />
                                  <div>
                                    <Text size="xs" style={{ color: '#8BA3C7' }}>Test Date</Text>
                                    <Text size="xs" style={{ color: '#F0F6FF', fontWeight: 600 }}>{date}</Text>
                                  </div>
                                </Group>
                              </Grid.Col>
                              
                              <Grid.Col span={6}>
                                <Group gap="xs" wrap="nowrap">
                                  <IconUser size={14} style={{ color: '#8BA3C7', flexShrink: 0 }} />
                                  <div>
                                    <Text size="xs" style={{ color: '#8BA3C7' }}>Prescribed By</Text>
                                    <Text size="xs" style={{ color: '#3B82F6', fontWeight: 600 }}>{report.doctorName}</Text>
                                  </div>
                                </Group>
                              </Grid.Col>
                            </Grid>

                            {/* Results & Normals Section */}
                            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(8,13,26,0.4)', border: '1px solid #1C2B46' }}>
                              {isCompleted ? (
                                <Grid align="center">
                                  <Grid.Col span={6}>
                                    <Text size="xs" style={{ color: '#8BA3C7' }}>Observed Result</Text>
                                    <Text size="md" style={{ color: '#22D3EE', fontWeight: 800, marginTop: '2px' }}>
                                      {report.resultValue}
                                    </Text>
                                  </Grid.Col>
                                  <Grid.Col span={6}>
                                    <Text size="xs" style={{ color: '#8BA3C7' }}>Reference Range</Text>
                                    <Text size="xs" style={{ color: '#34D399', fontWeight: 700, marginTop: '4px' }}>
                                      {report.referenceRange}
                                    </Text>
                                  </Grid.Col>
                                </Grid>
                              ) : (
                                <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IconClock size={16} style={{ color: '#F59E0B' }} />
                                  <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 500 }}>
                                    Awaiting diagnostic evaluation. Reference range is <span style={{ color: '#34D399', fontWeight: 700 }}>{report.referenceRange}</span>.
                                  </Text>
                                </Box>
                              )}
                              
                              {report.doctorRemarks && (
                                <div style={{ marginTop: '12px', borderLeft: '3px solid #FBBF24', paddingLeft: '10px' }}>
                                  <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Doctor's Note:</Text>
                                  <Text size="xs" style={{ color: '#F0F6FF', fontStyle: 'italic', marginTop: '2px', lineHeight: 1.3 }}>
                                    {report.doctorRemarks}
                                  </Text>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            {/* Technician comments */}
                            {isCompleted && report.techRemarks && (
                              <div style={{ marginTop: '12px', borderLeft: '3px solid #06B6D4', paddingLeft: '10px' }}>
                                <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Technician Note:</Text>
                                <Text size="xs" style={{ color: '#F0F6FF', fontStyle: 'italic', marginTop: '2px', lineHeight: 1.3 }}>
                                  {report.techRemarks}
                                </Text>
                              </div>
                            )}

                            {isCompleted && report.reportFileUrl && (
                              <Button
                                mt="md"
                                fullWidth
                                variant="light"
                                color="cyan"
                                leftSection={<IconFileText size={16} />}
                                component="a"
                                href={report.reportFileUrl}
                                target="_blank"
                              >
                                View Official Report
                              </Button>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    </Grid.Col>
                  );
                })}
              </AnimatePresence>
            </Grid>
          )}
        </>
      )}

    </div>
  );
};

export default PatientLabResults;
