import React, { useState, useEffect } from 'react';
import { Card, Grid, Text, Title, Badge, Group, Button, Modal, TextInput, Select, Table, Box, Loader, Alert, ActionIcon } from '@mantine/core';
import { IconCreditCard, IconReceipt2, IconShieldCheck, IconAlertCircle, IconCheck, IconPrinter } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';

export default function PatientBilling() {
    const { user } = useSelector((state: RootState) => state.auth);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [pharmacyInvoices, setPharmacyInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [invoiceType, setInvoiceType] = useState<'BILLING' | 'PHARMACY'>('BILLING');
    
    // Payment form state
    const [paymentForm, setPaymentForm] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: ''
    });
    const [processingPayment, setProcessingPayment] = useState(false);

    const fetchMyInvoices = async () => {
        try {
            setLoading(true);
            const [billingRes, pharmacyRes] = await Promise.all([
                api.get('/billing/invoices/my').catch(() => ({ data: [] })),
                api.get('/pharmacy/invoices/my').catch(() => ({ data: [] }))
            ]);
            setInvoices(billingRes.data);
            setPharmacyInvoices(pharmacyRes.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch your invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyInvoices();
    }, []);

    const handleOpenPayment = (invoice: any, type: 'BILLING' | 'PHARMACY') => {
        setSelectedInvoice(invoice);
        setInvoiceType(type);
        setPaymentForm({ cardNumber: '', expiry: '', cvv: '', name: '' });
        setPaymentModalOpen(true);
    };

    const handleProcessPayment = async () => {
        if (!selectedInvoice) return;
        setProcessingPayment(true);
        setError(null);
        
        try {
            // Mock transaction delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            if (invoiceType === 'BILLING') {
                await api.post(`/billing/invoices/${selectedInvoice.id}/payments`, {
                    amount: selectedInvoice.netAmount,
                    paymentMethod: 'CARD',
                    transactionId: 'TXN-' + Math.floor(Math.random() * 1000000)
                });
            } else {
                await api.put(`/pharmacy/invoices/${selectedInvoice.id}/payment?status=PAID`);
            }
            
            setPaymentModalOpen(false);
            fetchMyInvoices(); // Refresh to show paid status
        } catch (err: any) {
            setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };

    const totalDueBilling = invoices
        .filter(inv => inv.status === 'UNPAID' || inv.status === 'PARTIALLY_PAID')
        .reduce((sum, inv) => sum + inv.netAmount, 0);

    const totalDuePharmacy = pharmacyInvoices
        .filter(inv => inv.paymentStatus === 'UNPAID' || inv.paymentStatus === 'PARTIALLY_PAID')
        .reduce((sum, inv) => sum + inv.grandTotal, 0);
        
    const totalDue = totalDueBilling + totalDuePharmacy;

    return (
        <Box>
            <Group justify="space-between" mb="xl">
                <Box>
                    <Title order={2} style={{ color: '#F0F6FF', fontWeight: 600 }}>Billing & Payments</Title>
                    <Text size="sm" style={{ color: '#8BA3C7' }}>View your statements and pay your outstanding balances securely.</Text>
                </Box>
                <Button 
                    leftSection={<IconReceipt2 size={16} />} 
                    variant="outline"
                    color="blue"
                    style={{ borderColor: '#1C2B46', color: '#8BA3C7' }}
                >
                    Download Statement
                </Button>
            </Group>

            {error && (
                <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="lg" onClose={() => setError(null)} withCloseButton variant="filled">
                    {error}
                </Alert>
            )}

            <Grid mb="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card p="xl" radius="lg" style={{ backgroundColor: 'rgba(14,22,40,0.75)', border: '1px solid #1C2B46', backdropFilter: 'blur(10px)' }}>
                        <Group justify="space-between">
                            <Box>
                                <Text size="sm" style={{ color: '#8BA3C7', fontWeight: 500, textTransform: 'uppercase' }}>Total Amount Due</Text>
                                <Title order={1} mt="xs" style={{ color: totalDue > 0 ? '#F43F5E' : '#10B981', fontSize: '2.5rem' }}>
                                    ${totalDue.toFixed(2)}
                                </Title>
                            </Box>
                            <IconCreditCard size={48} color={totalDue > 0 ? '#F43F5E' : '#10B981'} stroke={1.5} style={{ opacity: 0.8 }} />
                        </Group>
                    </Card>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Card p="xl" radius="lg" style={{ backgroundColor: 'rgba(14,22,40,0.75)', border: '1px solid #1C2B46', backdropFilter: 'blur(10px)' }}>
                        <Group justify="space-between">
                            <Box>
                                <Text size="sm" style={{ color: '#8BA3C7', fontWeight: 500, textTransform: 'uppercase' }}>Insurance Status</Text>
                                <Title order={2} mt="xs" style={{ color: '#F0F6FF', fontSize: '1.5rem' }}>Active Coverage</Title>
                                <Text size="xs" mt="xs" style={{ color: '#22D3EE' }}>BlueCross BlueShield (Primary)</Text>
                            </Box>
                            <IconShieldCheck size={48} color="#22D3EE" stroke={1.5} style={{ opacity: 0.8 }} />
                        </Group>
                    </Card>
                </Grid.Col>
            </Grid>

            <Title order={3} mb="md" style={{ color: '#F0F6FF', fontWeight: 500 }}>Recent Invoices</Title>
            
            <Card radius="lg" style={{ backgroundColor: 'rgba(14,22,40,0.75)', border: '1px solid #1C2B46' }}>
                {loading ? (
                    <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                        <Loader color="blue" />
                    </Box>
                ) : (
                    <Box style={{ overflowX: 'auto' }}>
                        <Table verticalSpacing="md" style={{ minWidth: 600 }}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Invoice ID</Table.Th>
                                    <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Date</Table.Th>
                                    <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Amount</Table.Th>
                                    <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46' }}>Status</Table.Th>
                                    <Table.Th style={{ color: '#8BA3C7', borderBottom: '1px solid #1C2B46', textAlign: 'right' }}>Action</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                <AnimatePresence>
                                    {invoices.map((invoice, i) => (
                                        <motion.tr 
                                            key={`billing-${invoice.id}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                            style={{ borderBottom: '1px solid #1C2B46' }}
                                        >
                                            <Table.Td style={{ color: '#E2E8F0', fontWeight: 500 }}>INV-{invoice.id}</Table.Td>
                                            <Table.Td style={{ color: '#8BA3C7' }}>{new Date(invoice.createdAt).toLocaleDateString()}</Table.Td>
                                            <Table.Td style={{ color: '#F0F6FF', fontWeight: 600 }}>${invoice.netAmount.toFixed(2)}</Table.Td>
                                            <Table.Td>
                                                <Badge 
                                                    color={invoice.status === 'PAID' ? 'teal' : invoice.status === 'UNPAID' ? 'red' : 'yellow'} 
                                                    variant="light"
                                                >
                                                    {invoice.status}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group justify="flex-end" gap="xs">
                                                    <ActionIcon variant="light" color="gray" onClick={() => window.print()} title="Print Invoice">
                                                        <IconPrinter size={16} />
                                                    </ActionIcon>
                                                    {invoice.status === 'UNPAID' || invoice.status === 'PARTIALLY_PAID' ? (
                                                        <Button size="xs" color="blue" onClick={() => handleOpenPayment(invoice, 'BILLING')}>Pay Now</Button>
                                                    ) : (
                                                        <Button size="xs" variant="light" color="gray" leftSection={<IconCheck size={14} />}>Paid</Button>
                                                    )}
                                                </Group>
                                            </Table.Td>
                                        </motion.tr>
                                    ))}
                                    {pharmacyInvoices.map((invoice, i) => (
                                        <motion.tr 
                                            key={`pharmacy-${invoice.id}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: (invoices.length + i) * 0.05 }}
                                            style={{ borderBottom: '1px solid #1C2B46' }}
                                        >
                                            <Table.Td style={{ color: '#E2E8F0', fontWeight: 500 }}>{invoice.invoiceNumber}</Table.Td>
                                            <Table.Td style={{ color: '#8BA3C7' }}>{new Date(invoice.createdAt).toLocaleDateString()}</Table.Td>
                                            <Table.Td style={{ color: '#F0F6FF', fontWeight: 600 }}>${invoice.grandTotal.toFixed(2)}</Table.Td>
                                            <Table.Td>
                                                <Badge 
                                                    color={invoice.paymentStatus === 'PAID' ? 'teal' : invoice.paymentStatus === 'UNPAID' ? 'red' : 'yellow'} 
                                                    variant="light"
                                                >
                                                    {invoice.paymentStatus}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group justify="flex-end" gap="xs">
                                                    <ActionIcon variant="light" color="gray" onClick={() => window.print()} title="Print Invoice">
                                                        <IconPrinter size={16} />
                                                    </ActionIcon>
                                                    {invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIALLY_PAID' ? (
                                                        <Button size="xs" color="blue" onClick={() => handleOpenPayment(invoice, 'PHARMACY')}>Pay Now</Button>
                                                    ) : (
                                                        <Button size="xs" variant="light" color="gray" leftSection={<IconCheck size={14} />}>Paid</Button>
                                                    )}
                                                </Group>
                                            </Table.Td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {invoices.length === 0 && pharmacyInvoices.length === 0 && (
                                    <Table.Tr>
                                        <Table.Td colSpan={5} style={{ textAlign: 'center', color: '#8BA3C7', padding: '40px 0', borderBottom: 'none' }}>
                                            You have no invoices.
                                        </Table.Td>
                                    </Table.Tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Box>
                )}
            </Card>

            <Modal 
                opened={paymentModalOpen} 
                onClose={() => !processingPayment && setPaymentModalOpen(false)} 
                title={<Text style={{ color: '#F0F6FF', fontWeight: 600, fontSize: '1.2rem' }}>Secure Payment</Text>}
                styles={{
                    content: { backgroundColor: '#0A1121', border: '1px solid #1C2B46' },
                    header: { backgroundColor: '#0A1121', borderBottom: '1px solid #1C2B46' },
                    close: { color: '#8BA3C7', '&:hover': { backgroundColor: 'rgba(28,43,70,0.5)' }, display: processingPayment ? 'none' : 'block' }
                }}
            >
                {selectedInvoice && (
                    <Box>
                        <Group justify="space-between" mb="xl" p="md" style={{ backgroundColor: 'rgba(34,211,238,0.1)', borderRadius: '8px', border: '1px solid rgba(34,211,238,0.3)' }}>
                            <Text style={{ color: '#22D3EE', fontWeight: 500 }}>Payment Amount</Text>
                            <Title order={3} style={{ color: '#22D3EE' }}>${invoiceType === 'BILLING' ? selectedInvoice.netAmount.toFixed(2) : selectedInvoice.grandTotal.toFixed(2)}</Title>
                        </Group>

                        <TextInput
                            label="Name on Card"
                            placeholder="John Doe"
                            value={paymentForm.name}
                            onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                            mb="md"
                            styles={{
                                input: { backgroundColor: 'rgba(14,22,40,0.5)', borderColor: '#1C2B46', color: '#E2E8F0' },
                                label: { color: '#E2E8F0' }
                            }}
                        />
                        <TextInput
                            label="Card Number"
                            placeholder="0000 0000 0000 0000"
                            value={paymentForm.cardNumber}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                            mb="md"
                            leftSection={<IconCreditCard size={16} />}
                            styles={{
                                input: { backgroundColor: 'rgba(14,22,40,0.5)', borderColor: '#1C2B46', color: '#E2E8F0' },
                                label: { color: '#E2E8F0' }
                            }}
                        />
                        <Group grow mb="xl">
                            <TextInput
                                label="Expiry Date"
                                placeholder="MM/YY"
                                value={paymentForm.expiry}
                                onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                                styles={{
                                    input: { backgroundColor: 'rgba(14,22,40,0.5)', borderColor: '#1C2B46', color: '#E2E8F0' },
                                    label: { color: '#E2E8F0' }
                                }}
                            />
                            <TextInput
                                label="CVV"
                                placeholder="123"
                                type="password"
                                value={paymentForm.cvv}
                                onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                                styles={{
                                    input: { backgroundColor: 'rgba(14,22,40,0.5)', borderColor: '#1C2B46', color: '#E2E8F0' },
                                    label: { color: '#E2E8F0' }
                                }}
                            />
                        </Group>

                        <Button 
                            fullWidth 
                            onClick={handleProcessPayment}
                            loading={processingPayment}
                            style={{ backgroundColor: '#22D3EE', color: '#080D1A', fontWeight: 600 }}
                            disabled={!paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvv}
                        >
                            Confirm Payment of ${invoiceType === 'BILLING' ? selectedInvoice.netAmount.toFixed(2) : selectedInvoice.grandTotal.toFixed(2)}
                        </Button>
                    </Box>
                )}
            </Modal>
        </Box>
    );
}
