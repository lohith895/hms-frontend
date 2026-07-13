import React, { useState, useEffect } from 'react';
import { Button, Table, Tabs, Badge, TextInput, Textarea, Select, Modal, NumberInput, Card, Grid, Text, Title, Group, Divider, Loader, Box, Alert, ScrollArea, ActionIcon } from '@mantine/core';
import { IconPill, IconPlus, IconSearch, IconAlertTriangle, IconCheck, IconUser, IconActivity, IconFileText, IconTrendingUp, IconReceipt2, IconPrinter, IconEdit } from '@tabler/icons-react';
import api from '../../../utils/api';
import { notifications } from '@mantine/notifications';

interface PharmacyPortalProps {
  currentUser: any;
}

const PharmacyPortal: React.FC<PharmacyPortalProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<string>('prescriptions');
  
  // State lists
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [expired, setExpired] = useState<any[]>([]);
  
  // Loaders & Errors
  const [loading, setLoading] = useState(false);
  const [dispenseLoading, setDispenseLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [addDrugOpened, setAddDrugOpened] = useState(false);
  const [addBatchOpened, setAddBatchOpened] = useState(false);
  const [invoiceModalOpened, setInvoiceModalOpened] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);
  
  // Modal forms fields
  // New Drug Form
  const [drugName, setDrugName] = useState('');
  const [drugCode, setDrugCode] = useState('');
  const [drugCategory, setDrugCategory] = useState('');
  const [drugManufacturer, setDrugManufacturer] = useState('');
  const [drugDescription, setDrugDescription] = useState('');
  const [submittingDrug, setSubmittingDrug] = useState(false);
  
  // New Batch Form
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number>(100);
  const [pricePerUnit, setPricePerUnit] = useState<number>(10);
  const [submittingBatch, setSubmittingBatch] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<any | null>(null);

  const isPharmacist = currentUser?.role === 'ROLE_PHARMACIST' || currentUser?.role === 'ROLE_ADMIN';
  const isInventoryManager = currentUser?.role === 'ROLE_INVENTORY_MANAGER' || currentUser?.role === 'ROLE_PHARMACIST' || currentUser?.role === 'ROLE_ADMIN';

  // Load initial data
  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load medicines for dropdowns
      const medRes = await api.get('/pharmacy/medicines');
      setMedicines(medRes.data);
      
      if (isPharmacist) {
        // Load pending prescriptions
        const presRes = await api.get('/prescriptions/pending');
        setPrescriptions(presRes.data);
      }
      
      // Load inventory
      const invRes = await api.get('/pharmacy/inventory');
      setInventory(invRes.data);
      
      // Load alerts
      const lowRes = await api.get('/pharmacy/inventory/low-stock');
      setLowStock(lowRes.data);
      
      const expRes = await api.get('/pharmacy/inventory/expired');
      setExpired(expRes.data);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve pharmacy portal data');
    } finally {
      setLoading(false);
    }
  }, [isPharmacist]);

  useEffect(() => {
    loadData();
    // Default tab settings
    if (!isPharmacist && isInventoryManager) {
      setActiveTab('inventory');
    }
  }, [loadData, isPharmacist, isInventoryManager]);

  // Handle Dispense
  const handleDispense = async (prescriptionId: number) => {
    setDispenseLoading(prescriptionId);
    try {
      await api.post(`/prescriptions/${prescriptionId}/dispense`);
      
      // Fetch the generated invoice
      try {
        const invoiceRes = await api.get(`/pharmacy/invoices/prescription/${prescriptionId}`);
        setGeneratedInvoice(invoiceRes.data);
        setInvoiceModalOpened(true);
      } catch (err) {
        console.error("Failed to fetch generated invoice", err);
      }

      notifications.show({
        title: 'Prescription Dispensed',
        message: 'Medications dispensed successfully and stock decremented.',
        color: 'teal',
        autoClose: 4000,
      });
      loadData();
    } catch (err: any) {
      notifications.show({
        title: 'Dispensing Failed',
        message: err.response?.data?.message || 'Check stock levels and batch expiry.',
        color: 'red',
        autoClose: 5000,
      });
    } finally {
      setDispenseLoading(null);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!generatedInvoice) return;
    setMarkingPaid(true);
    try {
      await api.put(`/pharmacy/invoices/${generatedInvoice.id}/payment?status=PAID`);
      setGeneratedInvoice({ ...generatedInvoice, paymentStatus: 'PAID' });
      notifications.show({ title: 'Payment Recorded', message: 'Invoice marked as PAID', color: 'green' });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: 'Failed to update payment status', color: 'red' });
    } finally {
      setMarkingPaid(false);
    }
  };

  // Handle Create/Update Drug
  const handleAddDrug = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName || !drugCode || !drugCategory || !drugManufacturer) {
      notifications.show({ title: 'Error', message: 'Please fill in all required fields.', color: 'red' });
      return;
    }
    
    setSubmittingDrug(true);
    try {
      const payload = {
        name: drugName,
        code: drugCode,
        category: drugCategory,
        manufacturer: drugManufacturer,
        description: drugDescription,
        active: editingMedicine ? editingMedicine.active : true
      };

      if (editingMedicine) {
        await api.put(`/pharmacy/medicines/${editingMedicine.id}`, payload);
        notifications.show({
          title: 'Drug Updated',
          message: `${drugName} successfully updated.`,
          color: 'teal'
        });
      } else {
        await api.post('/pharmacy/medicines', payload);
        notifications.show({
          title: 'Drug Registered',
          message: `${drugName} successfully registered in system.`,
          color: 'teal'
        });
      }
      
      setDrugName('');
      setDrugCode('');
      setDrugCategory('');
      setDrugManufacturer('');
      setDrugDescription('');
      setEditingMedicine(null);
      setAddDrugOpened(false);
      loadData();
    } catch (err: any) {
      notifications.show({
        title: 'Operation Failed',
        message: err.response?.data?.message || 'Ensure the medicine code is unique.',
        color: 'red'
      });
    } finally {
      setSubmittingDrug(false);
    }
  };

  const handleEditDrugClick = (item: any) => {
    setEditingMedicine({
      id: item.medicineId,
      name: item.medicineName,
      code: item.medicineCode,
      category: item.medicineCategory,
      manufacturer: item.medicineManufacturer || 'GlobalPharma Co.',
      description: item.medicineDescription || '',
      active: true
    });
    setDrugName(item.medicineName);
    setDrugCode(item.medicineCode);
    setDrugCategory(item.medicineCategory);
    setDrugManufacturer(item.medicineManufacturer || 'GlobalPharma Co.');
    setDrugDescription(item.medicineDescription || '');
    setAddDrugOpened(true);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    notifications.show({
      id: 'upload-loading',
      title: 'Uploading Excel',
      message: 'Importing medicines in bulk, please wait...',
      loading: true,
      autoClose: false,
    });

    try {
      await api.post('/pharmacy/medicines/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notifications.update({
        id: 'upload-loading',
        title: 'Success',
        message: 'Medicines imported successfully.',
        color: 'teal',
        loading: false,
        autoClose: 3000,
      });
      loadData();
    } catch (err: any) {
      notifications.update({
        id: 'upload-loading',
        title: 'Upload Failed',
        message: err.response?.data?.message || 'Check the Excel format and content.',
        color: 'red',
        loading: false,
        autoClose: 5000,
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/pharmacy/inventory/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pharmacy_inventory.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      notifications.show({ title: 'Export Complete', message: 'Inventory successfully exported to Excel.', color: 'teal' });
    } catch (err) {
      notifications.show({ title: 'Export Failed', message: 'Failed to export inventory.', color: 'red' });
    }
  };

  // Handle Create Batch
  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicineId || !batchNumber || !expiryDate || !stockQuantity || !pricePerUnit) {
      notifications.show({ title: 'Error', message: 'Please fill in all required fields.', color: 'red' });
      return;
    }
    
    setSubmittingBatch(true);
    try {
      await api.post('/pharmacy/inventory', {
        medicineId: Number(selectedMedicineId),
        batchNumber,
        expiryDate,
        stockQuantity,
        pricePerUnit
      });
      
      notifications.show({
        title: 'Stock Ingested',
        message: `Batch ${batchNumber} successfully recorded into inventory.`,
        color: 'teal'
      });
      
      setSelectedMedicineId(null);
      setBatchNumber('');
      setExpiryDate('');
      setStockQuantity(100);
      setPricePerUnit(10);
      setAddBatchOpened(false);
      loadData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to add batch.';
      const validationErrors = err.response?.data?.validationErrors;
      const details = validationErrors ? ': ' + Object.values(validationErrors).join(', ') : '';
      notifications.show({
        title: 'Failed to Add Batch',
        message: `${errorMsg}${details}`,
        color: 'red'
      });
    } finally {
      setSubmittingBatch(false);
    }
  };

  // Run Manual Alert Scan
  const handleManualScan = async () => {
    try {
      await api.post('/pharmacy/inventory/check-alerts');
      notifications.show({
        title: 'Scan Complete',
        message: 'Stock check executed. Expiry and low-stock warnings updated.',
        color: 'teal'
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: 'Scan Failed',
        message: 'Failed to run manual inventory scan.',
        color: 'red'
      });
    }
  };

  // Filtered Inventory
  const filteredInventory = inventory.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.medicineName.toLowerCase().includes(query) ||
      item.medicineCode.toLowerCase().includes(query) ||
      item.medicineCategory.toLowerCase().includes(query) ||
      item.batchNumber.toLowerCase().includes(query)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Title order={2} style={{ color: '#F0F6FF', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Pharmacy & Inventory Portal
          </Title>
          <Text size="sm" style={{ color: '#8BA3C7', marginTop: '4px' }}>
            Dispense pending prescriptions, track stock quantity, batch expiry alerts, and register new drugs.
          </Text>
        </div>
        
        <Group>
          <Button
            leftSection={<IconActivity size={16} />}
            variant="outline"
            color="cyan"
            radius="md"
            onClick={handleManualScan}
            style={{ height: '42px', fontWeight: 600 }}
          >
            Scan Warnings
          </Button>

          {isInventoryManager && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setAddBatchOpened(true)}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                border: 'none',
                borderRadius: '12px',
                height: '42px',
                fontWeight: 600,
              }}
            >
              Add Stock Batch
            </Button>
          )}

          {isInventoryManager && (
            <Button
              leftSection={<IconPill size={16} />}
              variant="light"
              color="blue"
              onClick={() => {
                setEditingMedicine(null);
                setDrugName('');
                setDrugCode('');
                setDrugCategory('');
                setDrugManufacturer('');
                setDrugDescription('');
                setAddDrugOpened(true);
              }}
              style={{ borderRadius: '12px', height: '42px', fontWeight: 600 }}
            >
              Register Drug
            </Button>
          )}

          {isInventoryManager && (
            <Button
              leftSection={<IconFileText size={16} />}
              variant="outline"
              color="green"
              radius="md"
              component="label"
              style={{ height: '42px', fontWeight: 600 }}
            >
              Import Excel
              <input
                type="file"
                accept=".xlsx"
                hidden
                onChange={handleExcelUpload}
              />
            </Button>
          )}

          {isInventoryManager && (
            <Button
              leftSection={<IconPrinter size={16} />}
              variant="outline"
              color="teal"
              radius="md"
              onClick={handleExportExcel}
              style={{ height: '42px', fontWeight: 600 }}
            >
              Export Excel
            </Button>
          )}
        </Group>
      </div>

      {/* ── Main Layout ── */}
      {error && (
        <Alert title="Error loading data" color="red" radius="md">
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
                  {isPharmacist && (
                    <Tabs.Tab
                      value="prescriptions"
                      leftSection={<IconFileText size={16} />}
                      styles={{ tab: { color: activeTab === 'prescriptions' ? '#22D3EE' : '#8BA3C7', fontWeight: 600 } }}
                    >
                      Prescription Queue ({prescriptions.length})
                    </Tabs.Tab>
                  )}
                  <Tabs.Tab
                    value="inventory"
                    leftSection={<IconPill size={16} />}
                    styles={{ tab: { color: activeTab === 'inventory' ? '#22D3EE' : '#8BA3C7', fontWeight: 600 } }}
                  >
                    Inventory Directory ({inventory.length})
                  </Tabs.Tab>
                </Tabs.List>

                {/* TAB 1: Prescription Queue */}
                {isPharmacist && (
                  <Tabs.Panel value="prescriptions">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {prescriptions.length === 0 ? (
                        <Text size="sm" style={{ color: '#8BA3C7', textAlign: 'center', padding: '60px' }}>
                          No pending prescriptions in the queue.
                        </Text>
                      ) : (
                        prescriptions.map((pres) => {
                          const date = new Date(pres.prescribedDate).toLocaleString();
                          return (
                            <Card
                              key={pres.id}
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
                                    <IconUser size={16} style={{ color: '#22D3EE' }} />
                                    <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>
                                      {pres.patientName}
                                    </Text>
                                    <Badge size="xs" color="gray" variant="outline">Patient ID: {pres.patientId}</Badge>
                                  </Group>
                                  <Text size="xs" style={{ color: '#8BA3C7' }}>
                                    Prescribed on: {date}
                                  </Text>
                                  <Text size="xs" style={{ color: '#60A5FA', fontWeight: 600 }}>
                                    Attending: {pres.doctorName}
                                  </Text>
                                </div>

                                <Button
                                  leftSection={<IconCheck size={16} />}
                                  color="teal"
                                  radius="md"
                                  loading={dispenseLoading === pres.id}
                                  onClick={() => handleDispense(pres.id)}
                                >
                                  Dispense Medication
                                </Button>
                              </div>

                              <Divider color="#1C2B46" my="md" />

                              <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                                Prescribed Items
                              </Text>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {pres.items.map((item: any) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '8px 12px',
                                      backgroundColor: 'rgba(8,13,26,0.4)',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(28,43,70,0.5)',
                                    }}
                                  >
                                    <div>
                                      <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 600 }}>
                                        {item.medicineName} ({item.medicineCode})
                                      </Text>
                                      <Text size="xs" style={{ color: '#8BA3C7' }}>
                                        Dosage: {item.dosage} | Frequency: {item.frequency} | Duration: {item.durationDays} days
                                      </Text>
                                    </div>
                                    <Badge variant="filled" color="blue" size="md">
                                      Qty: {item.quantity}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </Tabs.Panel>
                )}

                {/* TAB 2: Inventory Directory */}
                <Tabs.Panel value="inventory">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    <Alert title="Excel Import Instructions" color="teal" icon={<IconFileText size={16} />} radius="md" variant="light" withCloseButton>
                      <Text size="xs" style={{ lineHeight: 1.6, color: '#8BA3C7' }}>
                        To import medicines in bulk, upload an Excel file (.xlsx) containing the following columns:
                        <br />
                        • <strong>Name</strong> (required) — e.g. Paracetamol 500mg
                        <br />
                        • <strong>Code</strong> (required, unique) — e.g. MED-PAR-500
                        <br />
                        • <strong>Category</strong> (required) — e.g. Analgesics, Antibiotics, Antacids
                        <br />
                        • <strong>Manufacturer</strong> (required) — e.g. Pfizer
                        <br />
                        • <strong>Description</strong> (optional) — e.g. Pain reliever
                        <br />
                        • <strong>Stock Quantity</strong> (optional) — e.g. 100 (creates a stock batch automatically)
                        <br />
                        • <strong>Price Per Unit</strong> (optional) — e.g. 1.50
                      </Text>
                    </Alert>

                    <TextInput
                      placeholder="Search inventory by medicine name, code, category, batch..."
                      leftSection={<IconSearch size={16} style={{ color: '#8BA3C7' }} />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      styles={{
                        input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '42px' }
                      }}
                    />

                    {filteredInventory.length === 0 ? (
                      <Text size="sm" style={{ color: '#8BA3C7', textAlign: 'center', padding: '40px' }}>
                        No inventory batches matched your search.
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
                              <Table.Th>Drug Details</Table.Th>
                              <Table.Th>Category</Table.Th>
                              <Table.Th>Batch No.</Table.Th>
                              <Table.Th>Price per unit</Table.Th>
                              <Table.Th>Quantity</Table.Th>
                              <Table.Th>Expiry Date</Table.Th>
                              <Table.Th>Status</Table.Th>
                            </Table.Tr>
                          </Table.Thead>
                          <Table.Tbody>
                            {filteredInventory.map((item) => {
                              const isExpired = new Date(item.expiryDate) < new Date();
                              const isLowStock = item.stockQuantity < 20;
                              
                              let statusBadge = <Badge color="green">Active</Badge>;
                              if (isExpired) statusBadge = <Badge color="red">Expired</Badge>;
                              else if (isLowStock) statusBadge = <Badge color="yellow">Low Stock</Badge>;

                              return (
                                <Table.Tr key={item.id} style={{ backgroundColor: isExpired ? 'rgba(251,113,133,0.02)' : 'transparent' }}>
                                  <Table.Td>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <div>
                                        <Text size="sm" style={{ fontWeight: 600 }}>{item.medicineName}</Text>
                                        <Text size="xs" style={{ color: '#4D6580' }}>Code: {item.medicineCode}</Text>
                                      </div>
                                      {isInventoryManager && (
                                        <ActionIcon 
                                          variant="subtle" 
                                          color="blue" 
                                          size="sm"
                                          onClick={() => handleEditDrugClick(item)}
                                          title="Edit Medicine Definition"
                                        >
                                          <IconEdit size={14} />
                                        </ActionIcon>
                                      )}
                                    </div>
                                  </Table.Td>
                                  <Table.Td>
                                    <Badge variant="outline" color="cyan" size="xs">{item.medicineCategory}</Badge>
                                  </Table.Td>
                                  <Table.Td style={{ fontFamily: 'monospace' }}>{item.batchNumber}</Table.Td>
                                  <Table.Td>₹{item.pricePerUnit.toFixed(2)}</Table.Td>
                                  <Table.Td style={{ fontWeight: isLowStock ? 700 : 400, color: isLowStock ? '#FBBF24' : 'inherit' }}>
                                    {item.stockQuantity} units
                                  </Table.Td>
                                  <Table.Td style={{ color: isExpired ? '#FB7185' : 'inherit' }}>
                                    {new Date(item.expiryDate).toLocaleDateString()}
                                  </Table.Td>
                                  <Table.Td>{statusBadge}</Table.Td>
                                </Table.Tr>
                              );
                            })}
                          </Table.Tbody>
                        </Table>
                      </div>
                    )}
                  </div>
                </Tabs.Panel>
              </Tabs>
            </Card>
          </Grid.Col>

          {/* Warnings & Alerts column */}
          <Grid.Col span={{ base: 12, lg: 3 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Alert Count Metrics */}
              <Card
                radius="lg"
                p="md"
                style={{
                  background: 'rgba(14,22,40,0.8)',
                  border: '1px solid #1C2B46',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <IconTrendingUp size={18} style={{ color: '#60A5FA' }} />
                  <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>Inventory Warnings</Text>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)', borderRadius: '8px' }}>
                    <Text size="xs" style={{ color: '#FB7185', fontWeight: 600 }}>Expired Batches</Text>
                    <Badge color="red" variant="filled">{expired.length}</Badge>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px' }}>
                    <Text size="xs" style={{ color: '#FBBF24', fontWeight: 600 }}>Low Stock Warnings</Text>
                    <Badge color="yellow" variant="filled">{lowStock.length}</Badge>
                  </div>
                </div>
              </Card>

              {/* Expired alert list */}
              <Card
                radius="lg"
                p="md"
                style={{
                  background: 'rgba(14,22,40,0.8)',
                  border: '1px solid #1C2B46',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#FB7185' }}>
                  <IconAlertTriangle size={18} />
                  <Text size="sm" style={{ fontWeight: 700 }}>Expired Batches</Text>
                </div>

                {expired.length === 0 ? (
                  <Text size="xs" style={{ color: '#4D6580', fontStyle: 'italic' }}>No expired items in stock.</Text>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {expired.map((e) => (
                      <div key={e.id} style={{ borderLeft: '2px solid #FB7185', paddingLeft: '8px' }}>
                        <Text size="xs" style={{ color: '#F0F6FF', fontWeight: 600 }}>{e.medicineName}</Text>
                        <Text size="xs" style={{ color: '#8BA3C7' }}>Batch: {e.batchNumber} | Expiry: {new Date(e.expiryDate).toLocaleDateString()}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Low stock list */}
              <Card
                radius="lg"
                p="md"
                style={{
                  background: 'rgba(14,22,40,0.8)',
                  border: '1px solid #1C2B46',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#FBBF24' }}>
                  <IconAlertTriangle size={18} />
                  <Text size="sm" style={{ fontWeight: 700 }}>Low Stock Alert</Text>
                </div>

                {lowStock.length === 0 ? (
                  <Text size="xs" style={{ color: '#4D6580', fontStyle: 'italic' }}>All stock levels are optimal.</Text>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {lowStock.map((l) => (
                      <div key={l.id} style={{ borderLeft: '2px solid #FBBF24', paddingLeft: '8px' }}>
                        <Text size="xs" style={{ color: '#F0F6FF', fontWeight: 600 }}>{l.medicineName}</Text>
                        <Text size="xs" style={{ color: '#8BA3C7' }}>Remaining: {l.stockQuantity} units (Batch: {l.batchNumber})</Text>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </div>
          </Grid.Col>
        </Grid>
      )}

      {/* ── MODAL 1: Register/Edit Drug ── */}
      <Modal
        opened={addDrugOpened}
        onClose={() => { setAddDrugOpened(false); setEditingMedicine(null); }}
        title={editingMedicine ? "Update Medication Definition" : "Register New Medication definition"}
        radius="lg"
        styles={{
          content: { backgroundColor: '#0E1628', border: '1px solid #1C2B46', color: '#F0F6FF' },
          header: { backgroundColor: '#0E1628', color: '#F0F6FF', borderBottom: '1px solid #1C2B46' },
          title: { fontWeight: 700 }
        }}
      >
        <form onSubmit={handleAddDrug} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
          <TextInput
            label="Medicine Name"
            placeholder="e.g. Amoxicillin Trihydrate"
            required
            value={drugName}
            onChange={(e) => setDrugName(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <TextInput
            label="Medicine Unique Code"
            placeholder="e.g. AMX500"
            required
            value={drugCode}
            onChange={(e) => setDrugCode(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <TextInput
            label="Category / Classification"
            placeholder="e.g. Antibiotic, Analgesic"
            required
            value={drugCategory}
            onChange={(e) => setDrugCategory(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <TextInput
            label="Manufacturer"
            placeholder="e.g. Pfizer, Novartis"
            required
            value={drugManufacturer}
            onChange={(e) => setDrugManufacturer(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <Textarea
            label="Description / Purpose"
            placeholder="Add relevant medical usage descriptors"
            value={drugDescription}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDrugDescription(e.target.value)}
            minRows={2}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <Button
            type="submit"
            loading={submittingDrug}
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              height: '44px',
              fontWeight: 600,
              marginTop: '10px',
              border: 'none',
            }}
          >
            {editingMedicine ? "Update Details" : "Register Drug"}
          </Button>
        </form>
      </Modal>

      {/* ── MODAL 2: Ingest Stock Batch ── */}
      <Modal
        opened={addBatchOpened}
        onClose={() => setAddBatchOpened(false)}
        title="Ingest Stock Batch / replenishment"
        radius="lg"
        styles={{
          content: { backgroundColor: '#0E1628', border: '1px solid #1C2B46', color: '#F0F6FF' },
          header: { backgroundColor: '#0E1628', color: '#F0F6FF', borderBottom: '1px solid #1C2B46' },
          title: { fontWeight: 700 }
        }}
      >
        <form onSubmit={handleAddBatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
          <Select
            label="Select Medicine definition"
            placeholder="Choose medication definition"
            required
            data={medicines.map((m) => ({ value: String(m.id), label: `${m.name} (${m.code})` }))}
            value={selectedMedicineId}
            onChange={setSelectedMedicineId}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 },
              dropdown: { backgroundColor: '#0E1628', borderColor: '#1C2B46' }
            }}
          />

          <TextInput
            label="Batch Number"
            placeholder="e.g. BATCH-2026-X1"
            required
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
              label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ color: '#8BA3C7', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Expiry Date <span style={{ color: '#FB7185' }}>*</span>
            </label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
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

          <Grid gutter="md">
            <Grid.Col span={6}>
              <NumberInput
                label="Ingestion Quantity"
                required
                min={1}
                value={stockQuantity}
                onChange={(val) => setStockQuantity(Number(val))}
                styles={{
                  input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                  label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                }}
              />
            </Grid.Col>
            
            <Grid.Col span={6}>
              <NumberInput
                label="Price Per Unit (₹)"
                required
                min={0.1}
                decimalScale={2}
                value={pricePerUnit}
                onChange={(val) => setPricePerUnit(Number(val))}
                styles={{
                  input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px' },
                  label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }
                }}
              />
            </Grid.Col>
          </Grid>

          <Button
            type="submit"
            loading={submittingBatch}
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              height: '44px',
              fontWeight: 600,
              marginTop: '10px',
              border: 'none',
            }}
          >
            Add to Inventory
          </Button>
        </form>
      </Modal>

      {/* ── MODAL 3: INVOICE / BILL ── */}
      <Modal
        opened={invoiceModalOpened}
        onClose={() => setInvoiceModalOpened(false)}
        title={
          <Group gap="xs">
            <IconReceipt2 size={20} style={{ color: '#F472B6' }} />
            <Text size="md" style={{ fontWeight: 700, color: '#F0F6FF' }}>Pharmacy Medicine Bill</Text>
          </Group>
        }
        size="lg"
        radius="lg"
        styles={{
          content: { backgroundColor: '#0E1628', border: '1px solid #1C2B46', color: '#F0F6FF' },
          header: { backgroundColor: '#0E1628', color: '#F0F6FF', borderBottom: '1px solid #1C2B46' }
        }}
      >
        {generatedInvoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
            <Grid>
              <Grid.Col span={6}>
                <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Invoice Number</Text>
                <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>{generatedInvoice.invoiceNumber}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Patient</Text>
                <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>{generatedInvoice.patientName} (ID: {generatedInvoice.patientId})</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Date</Text>
                <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>{new Date(generatedInvoice.createdAt).toLocaleString()}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Payment Status</Text>
                <Badge color={generatedInvoice.paymentStatus === 'PAID' ? 'green' : 'red'}>
                  {generatedInvoice.paymentStatus}
                </Badge>
              </Grid.Col>
            </Grid>

            <Divider color="#1C2B46" />

            <ScrollArea mah={300}>
              <Table verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: '#8BA3C7' }}>Medicine</Table.Th>
                    <Table.Th style={{ color: '#8BA3C7', textAlign: 'right' }}>Qty</Table.Th>
                    <Table.Th style={{ color: '#8BA3C7', textAlign: 'right' }}>Unit Price</Table.Th>
                    <Table.Th style={{ color: '#8BA3C7', textAlign: 'right' }}>Total</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {generatedInvoice.items.map((item: any) => (
                    <Table.Tr key={item.id}>
                      <Table.Td style={{ color: '#F0F6FF' }}>{item.medicineName}</Table.Td>
                      <Table.Td style={{ color: '#F0F6FF', textAlign: 'right' }}>{item.quantity}</Table.Td>
                      <Table.Td style={{ color: '#F0F6FF', textAlign: 'right' }}>₹{item.unitPrice.toFixed(2)}</Table.Td>
                      <Table.Td style={{ color: '#F0F6FF', textAlign: 'right', fontWeight: 600 }}>₹{item.totalPrice.toFixed(2)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Divider color="#1C2B46" />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                <Text size="sm" style={{ color: '#8BA3C7' }}>Subtotal</Text>
                <Text size="sm" style={{ color: '#F0F6FF' }}>₹{generatedInvoice.subtotal.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                <Text size="sm" style={{ color: '#8BA3C7' }}>GST ({generatedInvoice.gstPercent}%)</Text>
                <Text size="sm" style={{ color: '#F0F6FF' }}>₹{generatedInvoice.gstAmount.toFixed(2)}</Text>
              </div>
              <Divider color="#1C2B46" style={{ width: '200px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                <Text size="md" style={{ color: '#F472B6', fontWeight: 800 }}>Grand Total</Text>
                <Text size="md" style={{ color: '#F472B6', fontWeight: 800 }}>₹{generatedInvoice.grandTotal.toFixed(2)}</Text>
              </div>
            </div>

            <Group justify="space-between" mt="md">
              <Button variant="light" color="gray" leftSection={<IconPrinter size={16} />} onClick={() => window.print()}>
                Print Bill
              </Button>
              
              {generatedInvoice.paymentStatus !== 'PAID' && (
                <Button 
                  color="green" 
                  leftSection={<IconCheck size={16} />} 
                  onClick={handleMarkAsPaid}
                  loading={markingPaid}
                >
                  Mark as Paid
                </Button>
              )}
            </Group>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default PharmacyPortal;
