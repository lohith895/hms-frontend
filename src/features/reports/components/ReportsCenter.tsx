import React, { useState } from 'react';
import { Card, Text, Title, SimpleGrid, Group, Select, Button, Loader, Divider } from '@mantine/core';
import { IconFileSpreadsheet, IconFile, IconFileText, IconDownload, IconChartBar } from '@tabler/icons-react';
import api from '../../../utils/api';
import dayjs from 'dayjs';

interface ReportConfig {
  id: string;
  title: string;
  endpoint: string;
  description: string;
  allowedRoles: string[];
  hasParams: 'date' | 'revenue' | 'none';
}

const reportsList: ReportConfig[] = [
  {
    id: 'appointments',
    title: 'Daily Appointments',
    endpoint: '/v1/reports/appointments',
    description: 'List of all consultations scheduled for a specific date.',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST'],
    hasParams: 'date',
  },
  {
    id: 'revenue',
    title: 'Monthly Revenue',
    endpoint: '/v1/reports/revenue',
    description: 'Financial accounting total billings and collections.',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_FINANCE_MANAGER'],
    hasParams: 'revenue',
  },
  {
    id: 'doctor-perf',
    title: 'Doctor Performance',
    endpoint: '/v1/reports/doctor-performance',
    description: 'Physician metrics, appointment completion counts, and consultation totals.',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT_HEAD'],
    hasParams: 'none',
  },
  {
    id: 'patients',
    title: 'Patient Statistics',
    endpoint: '/v1/reports/patient-stats',
    description: 'General counts, demographic layouts, and registration growth.',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_RECEPTIONIST'],
    hasParams: 'none',
  },
  {
    id: 'labs',
    title: 'Laboratory Reports',
    endpoint: '/v1/reports/lab-reports',
    description: 'Summary of diagnostics tests ordered, completed, and pending.',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_LAB_TECHNICIAN', 'ROLE_DOCTOR'],
    hasParams: 'none',
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy Sales',
    endpoint: '/v1/reports/pharmacy-sales',
    description: 'Sales summaries, revenue compiled from prescription dispense logs.',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_PHARMACIST'],
    hasParams: 'none',
  },
  {
    id: 'inventory',
    title: 'Medicine Inventory',
    endpoint: '/v1/reports/inventory',
    description: 'Stock availability, low-stock items, and expired drug records.',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_INVENTORY_MANAGER'],
    hasParams: 'none',
  },
  {
    id: 'department',
    title: 'Department Performance',
    endpoint: '/v1/reports/department-performance',
    description: 'Activity statistics aggregated per clinical department.',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT_HEAD'],
    hasParams: 'none',
  },
  {
    id: 'bed-occupancy',
    title: 'Bed Occupancy',
    endpoint: '/v1/reports/bed-occupancy',
    description: 'Ward capacities, active patient logs, and ICU availability.',
    allowedRoles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT_HEAD'],
    hasParams: 'none',
  },
  {
    id: 'audit',
    title: 'Audit Logs',
    endpoint: '/v1/reports/audit',
    description: 'Complete security operations ledger, IP logs, and system accesses.',
    allowedRoles: ['ROLE_ADMIN'],
    hasParams: 'none',
  },
];

interface ReportsCenterProps {
  currentUser: any;
}

const ReportsCenter: React.FC<ReportsCenterProps> = ({ currentUser }) => {
  const [selectedFormat, setSelectedFormat] = useState<Record<string, string>>({});
  const [dateParams, setDateParams] = useState<Record<string, string>>({});
  const [yearParams, setYearParams] = useState<Record<string, string>>({});
  const [monthParams, setMonthParams] = useState<Record<string, string>>({});
  const [loadingReport, setLoadingReport] = useState<Record<string, boolean>>({});

  const handleDownload = async (report: ReportConfig) => {
    const format = selectedFormat[report.id] || 'pdf';
    setLoadingReport(prev => ({ ...prev, [report.id]: true }));

    let params: Record<string, any> = {};
    if (report.hasParams === 'date') {
      params.date = dateParams[report.id] || dayjs().format('YYYY-MM-DD');
    } else if (report.hasParams === 'revenue') {
      params.year = Number(yearParams[report.id] || dayjs().format('YYYY'));
      params.month = Number(monthParams[report.id] || dayjs().format('MM'));
    }

    try {
      const res = await api.get(report.endpoint, {
        params: { ...params, format },
        responseType: 'blob',
      });

      let ext = '.pdf';
      if (format === 'excel') ext = '.xlsx';
      if (format === 'csv') ext = '.csv';

      const fileName = `${report.id}_report_${dayjs().format('YYYYMMDD')}${ext}`;
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate report. Make sure you have authorized access privileges.');
    } finally {
      setLoadingReport(prev => ({ ...prev, [report.id]: false }));
    }
  };

  const authorizedReports = reportsList.filter(rep => {
    return rep.allowedRoles.includes(currentUser?.role || '');
  });

  const getFormatIcon = (format: string) => {
    if (format === 'excel') return <IconFileSpreadsheet size={16} />;
    if (format === 'csv') return <IconFileText size={16} />;
    return <IconFile size={16} />;
  };

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
      <Group mb="lg">
        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(34,211,238,0.1)', color: '#22D3EE', display: 'flex', alignItems: 'center' }}>
          <IconChartBar size={24} />
        </div>
        <div>
          <Title order={3} style={{ color: '#F0F6FF', fontSize: '18px', fontWeight: 700 }}>Reports & Hospital Ledger</Title>
          <Text size="xs" style={{ color: '#8BA3C7' }}>Compile clinical, operational, financial metrics and download analytical logs.</Text>
        </div>
      </Group>

      <Divider color="#1C2B46" mb="lg" />

      {authorizedReports.length === 0 ? (
        <Text style={{ color: '#8BA3C7', textAlign: 'center', padding: '40px 0' }}>
          You do not have administrative privileges to access hospital reporting ledgers.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          {authorizedReports.map((report) => {
            const format = selectedFormat[report.id] || 'pdf';
            const isLoading = loadingReport[report.id] || false;

            return (
              <Card
                key={report.id}
                radius="md"
                p="md"
                style={{
                  backgroundColor: 'rgba(8,13,26,0.6)',
                  border: '1px solid #1C2B46',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <Text style={{ fontWeight: 700, color: '#F0F6FF', fontSize: '15px' }}>{report.title}</Text>
                  <Text size="xs" style={{ color: '#8BA3C7', marginTop: 4, lineHeight: 1.4 }}>{report.description}</Text>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {report.hasParams === 'date' && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ color: '#8BA3C7', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>Date</label>
                      <input
                        type="date"
                        value={dateParams[report.id] || dayjs().format('YYYY-MM-DD')}
                        onChange={(e) => setDateParams(prev => ({ ...prev, [report.id]: e.target.value }))}
                        style={{
                          backgroundColor: 'rgba(8,13,26,0.9)',
                          border: '1px solid #1C2B46',
                          color: '#F0F6FF',
                          borderRadius: '8px',
                          height: '36px',
                          padding: '0 10px',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  )}

                  {report.hasParams === 'revenue' && (
                    <Group grow>
                      <div>
                        <label style={{ color: '#8BA3C7', fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Year</label>
                        <Select
                          data={['2025', '2026', '2027']}
                          value={yearParams[report.id] || dayjs().format('YYYY')}
                          onChange={(val) => setYearParams(prev => ({ ...prev, [report.id]: val || '2026' }))}
                          size="xs"
                          styles={{ input: { backgroundColor: 'rgba(8,13,26,0.9)', borderColor: '#1C2B46', color: '#F0F6FF' } }}
                        />
                      </div>
                      <div>
                        <label style={{ color: '#8BA3C7', fontSize: '11px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Month</label>
                        <Select
                          data={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: dayjs().month(i).format('MMMM') }))}
                          value={monthParams[report.id] || String(dayjs().month() + 1)}
                          onChange={(val) => setMonthParams(prev => ({ ...prev, [report.id]: val || '1' }))}
                          size="xs"
                          styles={{ input: { backgroundColor: 'rgba(8,13,26,0.9)', borderColor: '#1C2B46', color: '#F0F6FF' } }}
                        />
                      </div>
                    </Group>
                  )}

                  <Group mt="xs" justify="space-between">
                    <Select
                      data={[
                        { value: 'pdf', label: 'PDF Document' },
                        { value: 'excel', label: 'Excel Spreadsheet' },
                        { value: 'csv', label: 'CSV Text' }
                      ]}
                      value={format}
                      onChange={(val) => setSelectedFormat(prev => ({ ...prev, [report.id]: val || 'pdf' }))}
                      size="xs"
                      leftSection={getFormatIcon(format)}
                      styles={{
                        input: {
                          backgroundColor: 'rgba(8,13,26,0.9)',
                          borderColor: '#1C2B46',
                          color: '#F0F6FF',
                          width: '160px',
                        }
                      }}
                    />

                    <Button
                      size="xs"
                      onClick={() => handleDownload(report)}
                      loading={isLoading}
                      leftSection={<IconDownload size={14} />}
                      style={{
                        background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                      }}
                    >
                      Export
                    </Button>
                  </Group>
                </div>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Card>
  );
};

export default ReportsCenter;
