import React, { useState, useEffect } from 'react';
import { Card, Grid, Text, Title, Badge, Group, TextInput, SegmentedControl, Box, Table, ActionIcon, Button, Modal, NumberInput, Select, Loader, Alert } from '@mantine/core';
import { IconSearch, IconReceipt2, IconCash, IconShieldCheck, IconCheck, IconX, IconPlus, IconAlertCircle } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';


export default function FinanceManagerPortal() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [search, setSearch] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pharmacyInvoices, setPharmacyInvoices] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);
  
  // Modals
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [newInvoice, setNewInvoice] = useState({ patientId: '', totalAmount: 0, taxAmount: 0, dueDate: '' });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const [invRes, pharmRes] = await Promise.all([
          api.get('/billing/invoices').catch(() => ({ data: [] })),
          api.get('/pharmacy/invoices').catch(() => ({ data: [] }))
      ]);
      setInvoices(invRes.data);
      setPharmacyInvoices(pharmRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
      try {
          const res = await api.get('/users/patients'); // Assuming this endpoint exists or similar
          setPatients(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPatients();
  }, []);

  const handleCreateInvoice = async () => {
      try {
          await api.post('/billing/invoices', newInvoice);
          setInvoiceModalOpen(false);
          fetchInvoices();
      } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to create invoice');
      }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'teal';
      case 'PARTIAL':
      case 'PARTIALLY_PAID': return 'yellow';
      case 'UNPAID': return 'red';
      default: return 'gray';
    }
  };

  const handleMarkAsPaid = async (invoice: any) => {
      setMarkingPaid(invoice.id);
      try {
          if (invoice.type === 'BILLING') {
              await api.post(`/billing/invoices/${invoice.id}/payments`, {
                  amount: invoice.netAmount,
                  paymentMethod: 'CASH',
                  transactionId: 'CASH-' + Math.floor(Math.random() * 1000000)
              });
          } else {
              await api.put(`/pharmacy/invoices/${invoice.id}/payment?status=PAID`);
          }
          fetchInvoices();
      } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to mark as paid');
      } finally {
          setMarkingPaid(null);
      }
  };

  const allInvoices = [
      ...invoices.map(i => ({ ...i, type: 'BILLING', displayId: `INV-${i.id}`, amount: i.netAmount, currentStatus: i.status })),
      ...pharmacyInvoices.map(p => ({ ...p, type: 'PHARMACY', displayId: p.invoiceNumber, amount: p.grandTotal, currentStatus: p.paymentStatus, dueDate: p.createdAt }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredInvoices = allInvoices.filter(inv => 
      inv.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.displayId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = allInvoices
      .filter(i => i.currentStatus !== 'PAID')
      .reduce((sum, i) => sum + i.amount, 0);
      
  const paymentsToday = allInvoices
      .filter(i => i.currentStatus === 'PAID')
      .reduce((sum, i) => sum + i.amount, 0); // Simplified for demo

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Box>
          <Title order={2} style={{ color: '#F0F6FF', fontWeight: 600 }}>Finance Hub</Title>
          <Text size="sm" style={{ color: '#8BA3C7' }}>Manage patient billing, payments, and insurance claims</Text>
        </Box>
        <Group>
          <TextInput
            placeholder="Search by ID or Patient Name..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            styles={{
              input: {
                backgroundColor: 'rgba(14,22,40,0.5)',
                borderColor: '#1C2B46',
                color: '#E2E8F0',
                width: 300,
                '&:focus': { borderColor: '#3B82F6' }
              }
            }}
          />
          <Button 
            leftSection={<IconPlus size={16} />} 
            onClick={() => setInvoiceModalOpen(true)}
            style={{ backgroundColor: '#22D3EE', color: '#080D1A', fontWeight: 600 }}
          >
            New Invoice
          </Button>
        </Group>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="lg" onClose={() => setError(null)} withCloseButton variant="filled">
            {error}
        </Alert>
      )}

      <Grid mb="xl">
        {[
          { label: 'Total Outstanding', value: `$${totalOutstanding.toFixed(2)}`, icon: IconReceipt2, color: '#F43F5E' },
          { label: 'Payments Recorded', value: `$${paymentsToday.toFixed(2)}`, icon: IconCash, color: '#10B981' },
          { label: 'Pending Claims', value: '12', icon: IconShieldCheck, color: '#F59E0B' }
        ].map((stat, idx) => (
          <Grid.Col span={{ base: 12, sm: 4 }} key={idx}>
            <Card
              p="xl"
              radius="lg"
              style={{
                backgroundColor: 'rgba(14,22,40,0.75)',
                border: '1px solid #1C2B46',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: `radial-gradient(circle, ${stat.color}22 0%, transparent 70%)`,
                  transform: 'translate(30%, -30%)'
                }}
              />
              <Group justify="space-between" align="flex-start">
                <Box>
                  <Text size="sm" style={{ color: '#8BA3C7', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</Text>
                  <Title order={2} mt="xs" style={{ color: '#F0F6FF', fontSize: '2rem' }}>{stat.value}</Title>
                </Box>
                <stat.icon size={32} color={stat.color} stroke={1.5} style={{ opacity: 0.8 }} />
              </Group>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      <Card
          radius="lg"
          style={{
            backgroundColor: 'rgba(14,22,40,0.75)',
            border: '1px solid #1C2B46',
            backdropFilter: 'blur(10px)',
            minHeight: '400px'
          }}
      >
        <SegmentedControl
            value={activeTab}
            onChange={setActiveTab}
            data={[
                { label: 'All Invoices', value: 'invoices' },
                { label: 'Insurance Claims', value: 'claims' }
            ]}
            mb="xl"
            styles={{
                root: { backgroundColor: 'rgba(8,13,26,0.5)', border: '1px solid #1C2B46' },
                indicator: { backgroundColor: '#1C2B46' },
                label: { color: '#8BA3C7', '&[data-active]': { color: '#F0F6FF' } }
            }}
        />

        {loading ? (
            <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <Loader color="blue" />
            </Box>
        ) : (
            <Box style={{ overflowX: 'auto' }}>
                <Table verticalSpacing="md" style={{ minWidth: 800 }}>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Invoice ID</Table.Th>
                            <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Type</Table.Th>
                            <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Patient</Table.Th>
                            <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Date</Table.Th>
                            <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Due Date</Table.Th>
                            <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Net Amount</Table.Th>
                            <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Status</Table.Th>
                            <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46', textAlign: 'right' }}>Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        <AnimatePresence>
                            {filteredInvoices.map((invoice, i) => (
                                <motion.tr 
                                    key={`${invoice.type}-${invoice.id}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    style={{ borderBottom: '1px solid #1C2B46' }}
                                >
                                    <Table.Td style={{ color: '#E2E8F0', fontWeight: 500 }}>{invoice.displayId}</Table.Td>
                                    <Table.Td>
                                        <Badge color={invoice.type === 'BILLING' ? 'blue' : 'grape'} variant="outline">
                                            {invoice.type === 'BILLING' ? 'CONSULT' : 'PHARMACY'}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td style={{ color: '#E2E8F0' }}>{invoice.patientName}</Table.Td>
                                    <Table.Td style={{ color: '#8BA3C7' }}>{new Date(invoice.createdAt).toLocaleDateString()}</Table.Td>
                                    <Table.Td style={{ color: invoice.currentStatus === 'UNPAID' && new Date(invoice.dueDate) < new Date() ? '#F43F5E' : '#8BA3C7' }}>
                                        {new Date(invoice.dueDate).toLocaleDateString()}
                                    </Table.Td>
                                    <Table.Td style={{ color: '#F0F6FF', fontWeight: 600 }}>${invoice.amount.toFixed(2)}</Table.Td>
                                    <Table.Td>
                                        <Badge color={getStatusColor(invoice.currentStatus)} variant="light">
                                            {invoice.currentStatus}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: 'right' }}>
                                        {invoice.currentStatus !== 'PAID' && (
                                            <Button 
                                                variant="light" 
                                                color="teal" 
                                                size="xs" 
                                                onClick={() => handleMarkAsPaid(invoice)}
                                                loading={markingPaid === invoice.id}
                                            >
                                                Mark Paid
                                            </Button>
                                        )}
                                    </Table.Td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                        {filteredInvoices.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={7} style={{ textAlign: 'center', color: '#8BA3C7', padding: '40px 0', borderBottom: 'none' }}>
                                    No invoices found matching your criteria.
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Box>
        )}
      </Card>

      <Modal 
          opened={invoiceModalOpen} 
          onClose={() => setInvoiceModalOpen(false)} 
          title={<Text style={{ color: '#F0F6FF', fontWeight: 600, fontSize: '1.2rem' }}>Create New Invoice</Text>}
          styles={{
            content: { backgroundColor: '#0A1121', border: '1px solid #1C2B46' },
            header: { backgroundColor: '#0A1121', borderBottom: '1px solid #1C2B46' },
            close: { color: '#8BA3C7', '&:hover': { backgroundColor: 'rgba(28,43,70,0.5)' } }
          }}
      >
        <Select
            label="Patient"
            placeholder="Select patient"
            data={patients.map(p => ({ value: p.id.toString(), label: p.fullName || p.user.username }))}
            value={newInvoice.patientId}
            onChange={(val) => setNewInvoice({ ...newInvoice, patientId: val || '' })}
            mb="md"
            styles={{
                input: { backgroundColor: 'rgba(14,22,40,0.5)', borderColor: '#1C2B46', color: '#E2E8F0' },
                label: { color: '#E2E8F0' }
            }}
        />
        <NumberInput
            label="Total Amount ($)"
            placeholder="0.00"
            value={newInvoice.totalAmount}
            onChange={(val) => setNewInvoice({ ...newInvoice, totalAmount: typeof val === 'number' ? val : 0 })}
            mb="md"
            styles={{
                input: { backgroundColor: 'rgba(14,22,40,0.5)', borderColor: '#1C2B46', color: '#E2E8F0' },
                label: { color: '#E2E8F0' }
            }}
        />
        <TextInput
            label="Due Date"
            type="date"
            value={newInvoice.dueDate}
            onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
            mb="xl"
            styles={{
                input: { backgroundColor: 'rgba(14,22,40,0.5)', borderColor: '#1C2B46', color: '#E2E8F0' },
                label: { color: '#E2E8F0' }
            }}
        />
        <Button 
            fullWidth 
            onClick={handleCreateInvoice}
            style={{ backgroundColor: '#22D3EE', color: '#080D1A', fontWeight: 600 }}
            disabled={!newInvoice.patientId || !newInvoice.totalAmount || !newInvoice.dueDate}
        >
            Generate Invoice
        </Button>
      </Modal>

    </Box>
  );
}
