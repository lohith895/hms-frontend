import React, { useState, useEffect } from 'react';
import { Button, Table, Tabs, Badge, TextInput, Select, Modal, NumberInput, Card, Grid, Text, Title, Group, Divider, Loader, Box, Alert, Textarea, FileInput } from '@mantine/core';
import { IconFlask, IconPlus, IconSearch, IconAlertTriangle, IconCalendar, IconCheck, IconUser, IconActivity, IconStethoscope, IconFileText, IconTrendingUp, IconAlertCircle } from '@tabler/icons-react';
import api from '../../../utils/api';
import { notifications } from '@mantine/notifications';

interface LabTechnicianPortalProps {
  currentUser: any;
}

const LabTechnicianPortal: React.FC<LabTechnicianPortalProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<string>('requests');
  
  // State lists
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [addTestOpened, setAddTestOpened] = useState(false);
  const [recordResultOpened, setRecordResultOpened] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  // Form states
  // Add Diagnostic Profile Form
  const [testName, setTestName] = useState('');
  const [testCode, setTestCode] = useState('');
  const [referenceRange, setReferenceRange] = useState('');
  const [cost, setCost] = useState<number>(100);

  // Record Result Form
  const [resultValue, setResultValue] = useState('');
  const [comments, setComments] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);

  // Load initial data
  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pendingRes = await api.get('/laboratory/reports/pending');
      setPendingReports(pendingRes.data);

      const catalogRes = await api.get('/laboratory/tests');
      setCatalog(catalogRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve laboratory portal data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Add Diagnostic profile
  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || !testCode || !referenceRange || !cost) {
      notifications.show({ title: 'Error', message: 'Please fill in all required fields.', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/laboratory/tests', {
        testName,
        testCode,
        referenceRange,
        cost,
        active: true
      });

      notifications.show({
        title: 'Diagnostic Test Added',
        message: `${testName} successfully registered in test catalog.`,
        color: 'teal'
      });

      setTestName('');
      setTestCode('');
      setReferenceRange('');
      setCost(100);
      setAddTestOpened(false);
      loadData();
    } catch (err: any) {
      notifications.show({
        title: 'Registration Failed',
        message: err.response?.data?.message || 'Failed to add laboratory test.',
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Record Result
  const handleRecordResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !resultValue) {
      notifications.show({ title: 'Error', message: 'Result value is required.', color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('resultValue', resultValue);
      formData.append('techRemarks', comments);
      if (reportFile) {
        formData.append('file', reportFile);
      }

      await api.post(`/laboratory/reports/${selectedReport.id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      notifications.show({
        title: 'Diagnostic Complete',
        message: 'Laboratory results recorded successfully.',
        color: 'teal'
      });

      setSelectedReport(null);
      setResultValue('');
      setComments('');
      setRecordResultOpened(false);
      loadData();
    } catch (err: any) {
      notifications.show({
        title: 'Recording Failed',
        message: err.response?.data?.message || 'Failed to record diagnostic result.',
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (reportId: number, status: string) => {
    try {
      await api.put(`/laboratory/reports/${reportId}/status?status=${status}`);
      notifications.show({ title: 'Status Updated', message: `Report status updated to ${status.replace('_', ' ')}`, color: 'blue' });
      loadData();
    } catch (err: any) {
      notifications.show({ title: 'Error', message: 'Failed to update status', color: 'red' });
    }
  };

  // Filtered Catalog
  const filteredCatalog = catalog.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.testName.toLowerCase().includes(query) ||
      item.testCode.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title order={2} style={{ color: '#F0F6FF', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Diagnostic Laboratory Management
          </Title>
          <Text size="sm" style={{ color: '#8BA3C7', marginTop: '4px' }}>
            Record patient lab results, manage available clinical tests, and process active test requests.
          </Text>
        </div>
        
        <Group>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setAddTestOpened(true)}
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              border: 'none',
              borderRadius: '12px',
              height: '42px',
              fontWeight: 600,
            }}
          >
            Add Diagnostic Profile
          </Button>
        </Group>
      </div>

      {/* ── Dashboard Layout ── */}
      {error && (
        <Alert title="Load Error" color="red" radius="md">
          {error}
        </Alert>
      )}

      {loading ? (
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
          <Loader size="xl" color="cyan" />
        </Box>
      ) : (
        <Grid gutter="xl">
          {/* Main workspace */}
          <Grid.Col span={{ base: 12, lg: 9 }}>
            <Card
              radius="lg"
              p="lg"
              style={{
                background: 'rgba(14,22,40,0.75)',
                border: '1px solid #1C2B46',
                minHeight: '400px',
              }}
            >
              <Tabs value={activeTab} onChange={(val) => val && setActiveTab(val)}>
                <Tabs.List style={{ borderColor: '#1C2B46', marginBottom: '20px' }}>
                  <Tabs.Tab
                    value="requests"
                    leftSection={<IconFileText size={16} />}
                    styles={{ tab: { color: activeTab === 'requests' ? '#22D3EE' : '#8BA3C7', fontWeight: 600 } }}
                  >
                    Pending Requests ({pendingReports.length})
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="catalog"
                    leftSection={<IconFlask size={16} />}
                    styles={{ tab: { color: activeTab === 'catalog' ? '#22D3EE' : '#8BA3C7', fontWeight: 600 } }}
                  >
                    Test Catalog ({catalog.length})
                  </Tabs.Tab>
                </Tabs.List>

                {/* TAB 1: Pending Queue */}
                <Tabs.Panel value="requests">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {pendingReports.length === 0 ? (
                      <Text size="sm" style={{ color: '#8BA3C7', textAlign: 'center', padding: '60px' }}>
                        No pending laboratory tests in queue.
                      </Text>
                    ) : (
                      pendingReports.map((report) => {
                        const date = new Date(report.testDate).toLocaleString();
                        return (
                          <Card
                            key={report.id}
                            radius="md"
                            p="md"
                            style={{
                              background: 'rgba(8,13,26,0.6)',
                              border: '1px solid #1C2B46',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <Group gap="xs">
                                  <IconFlask size={16} style={{ color: '#22D3EE' }} />
                                  <Text size="md" style={{ color: '#F0F6FF', fontWeight: 700 }}>
                                    {report.labTestName} ({report.labTestCode})
                                  </Text>
                                </Group>
                                <Text size="xs" style={{ color: '#8BA3C7' }}>
                                  Ordered: {date}
                                </Text>
                                <Text size="xs" style={{ color: '#F472B6', fontWeight: 600 }}>
                                  Patient: {report.patientName} (ID: {report.patientId})
                                </Text>
                                <Text size="xs" style={{ color: '#60A5FA' }}>
                                  Ordered by: {report.doctorName}
                                </Text>
                                <Text size="xs" style={{ color: '#34D399', fontWeight: 600 }}>
                                  Expected Range: {report.referenceRange}
                                </Text>
                                {report.doctorRemarks && (
                                  <Box mt="xs" p="xs" style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '4px' }}>
                                    <Text size="xs" style={{ color: '#FBBF24', fontWeight: 600 }}>Doctor Remarks:</Text>
                                    <Text size="xs" style={{ color: '#F0F6FF' }}>{report.doctorRemarks}</Text>
                                  </Box>
                                )}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Select
                                  size="xs"
                                  placeholder="Update Status"
                                  data={[
                                    { value: 'PENDING', label: 'Pending' },
                                    { value: 'SAMPLE_COLLECTED', label: 'Sample Collected' },
                                    { value: 'PROCESSING', label: 'Processing' }
                                  ]}
                                  value={report.status}
                                  onChange={(val) => val && handleUpdateStatus(report.id, val)}
                                  styles={{
                                    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' }
                                  }}
                                />
                                <Button
                                  size="sm"
                                  leftSection={<IconCheck size={14} />}
                                  color="teal"
                                  radius="md"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setRecordResultOpened(true);
                                  }}
                                >
                                  Record Result
                                </Button>
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </Tabs.Panel>

                {/* TAB 2: Catalog Directory */}
                <Tabs.Panel value="catalog">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <TextInput
                      placeholder="Search catalog by test name, code..."
                      leftSection={<IconSearch size={16} style={{ color: '#8BA3C7' }} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      styles={{
                        input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '42px' }
                      }}
                    />

                    {filteredCatalog.length === 0 ? (
                      <Text size="sm" style={{ color: '#8BA3C7', textAlign: 'center', padding: '40px' }}>
                        No diagnostic tests registered in catalog.
                      </Text>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <Table
                          verticalSpacing="sm"
                          horizontalSpacing="md"
                          styles={{
                            table: { color: '#F0F6FF' },
                            th: { color: '#8BA3C7', borderBottom: '1px solid #1C2B46', fontWeight: 700, fontSize: '12px' },
                            td: { borderBottom: '1px solid #1C2B46', fontSize: '13px' }
                          }}
                        >
                          <Table.Thead>
                            <Table.Tr>
                              <Table.Th>Test Code</Table.Th>
                              <Table.Th>Diagnostic Name</Table.Th>
                              <Table.Th>Reference Range</Table.Th>
                              <Table.Th>Patient Cost</Table.Th>
                              <Table.Th>Status</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {filteredCatalog.map((item) => (
                              <Table.Tr key={item.id}>
                                <Table.Td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{item.testCode}</Table.Td>
                                <Table.Td style={{ fontWeight: 600 }}>{item.testName}</Table.Td>
                                <Table.Td style={{ color: '#34D399', fontWeight: 500 }}>{item.referenceRange}</Table.Td>
                                <Table.Td>₹{item.cost.toFixed(2)}</Table.Td>
                                <Table.Td>
                                  <Badge color={item.active ? 'green' : 'gray'}>
                                    {item.active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </Table.Td>
                              </Table.Tr>
                            ))}
                          </Table.Tbody>
                        </Table>
                      </div>
                    )}
                  </div>
                </Tabs.Panel>
              </Tabs>
            </Card>
          </Grid.Col>

          {/* Quick Info card */}
          <Grid.Col span={{ base: 12, lg: 3 }}>
            <Card
              radius="lg"
              p="md"
              style={{
                background: 'rgba(14,22,40,0.8)',
                border: '1px solid #1C2B46',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <IconActivity size={18} style={{ color: '#60A5FA' }} />
                <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>Diagnostics Overview</Text>
              </div>
              <Text size="xs" style={{ color: '#8BA3C7', lineHeight: 1.5 }}>
                Ensure lab test result inputs exactly match clinical measurements. WebSocket alert triggers automatically notify patients immediately upon saving results.
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      )}

      {/* ── MODAL 1: Add Test Profile ── */}
      <Modal
        opened={addTestOpened}
        onClose={() => setAddTestOpened(false)}
        title="Add Diagnostic Lab Profile"
        radius="lg"
        styles={{
          content: { backgroundColor: '#0E1628', border: '1px solid #1C2B46', color: '#F0F6FF' },
          header: { backgroundColor: '#0E1628', color: '#F0F6FF', borderBottom: '1px solid #1C2B46' },
          title: { fontWeight: 700 }
        }}
      >
        <form onSubmit={handleAddTest} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
          <TextInput
            label="Diagnostic Name"
            placeholder="e.g. Complete Blood Count (CBC)"
            required
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <TextInput
            label="Unique Test Code"
            placeholder="e.g. CBC-101"
            required
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <TextInput
            label="Reference Range / Expected Normals"
            placeholder="e.g. 12.0 - 16.0 g/dL, < 100 mg/dL"
            required
            value={referenceRange}
            onChange={(e) => setReferenceRange(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <NumberInput
            label="Patient Test Cost (₹)"
            required
            min={0}
            value={cost}
            onChange={(val) => setCost(Number(val))}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <Button
            type="submit"
            loading={submitting}
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              height: '44px',
              fontWeight: 600,
              marginTop: '10px',
              border: 'none',
            }}
          >
            Register Test Profile
          </Button>
        </form>
      </Modal>

      {/* ── MODAL 2: Record Result ── */}
      <Modal
        opened={recordResultOpened}
        onClose={() => {
          setSelectedReport(null);
          setRecordResultOpened(false);
        }}
        title="Record Clinical Laboratory Results"
        radius="lg"
        styles={{
          content: { backgroundColor: '#0E1628', border: '1px solid #1C2B46', color: '#F0F6FF' },
          header: { backgroundColor: '#0E1628', color: '#F0F6FF', borderBottom: '1px solid #1C2B46' },
          title: { fontWeight: 700 }
        }}
      >
        {selectedReport && (
          <form onSubmit={handleRecordResult} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
            <Box style={{ backgroundColor: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.1)', padding: '12px', borderRadius: '8px' }}>
              <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Test Ordered</Text>
              <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>{selectedReport.labTestName}</Text>
              
              <Divider color="#1C2B46" my="xs" />
              
              <Group gap="xs">
                <IconAlertCircle size={14} style={{ color: '#34D399' }} />
                <Text size="xs" style={{ color: '#34D399', fontWeight: 700 }}>
                  Clinical Reference Range: {selectedReport.referenceRange}
                </Text>
              </Group>
            </Box>

            <TextInput
              label="Observed Result Value"
              placeholder="e.g. 14.2 g/dL, 112 mg/dL"
              required
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value)}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
              }}
            />

            <FileInput
              label="Upload PDF/Image Report (Optional)"
              placeholder="Select file"
              accept="image/png,image/jpeg,application/pdf"
              value={reportFile}
              onChange={setReportFile}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
              }}
            />

            <Textarea
              label="Technician Observations / Comments"
              placeholder="Provide comments on abnormal levels, calibrator readings..."
              value={comments}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComments(e.target.value)}
              minRows={3}
              styles={{
                input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
                label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
              }}
            />

            <Button
              type="submit"
              loading={submitting}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                height: '44px',
                fontWeight: 600,
                marginTop: '10px',
                border: 'none',
              }}
            >
              Confirm & Complete Test
            </Button>
          </form>
        )}
      </Modal>

    </div>
  );
};

export default LabTechnicianPortal;
