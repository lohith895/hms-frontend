import React, { useState, useEffect } from 'react';
import { Modal, Button, TextInput, Textarea, Select, MultiSelect, NumberInput, Group, Box, Title, Text, ActionIcon, ScrollArea, Divider } from '@mantine/core';
import { IconCheck, IconTrash, IconStethoscope, IconPill, IconFlask } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../../utils/api';

interface Medicine {
  id: number;
  name: string;
  manufacturer: string;
}

interface LabTest {
  id: number;
  testName: string;
  category: string;
}

interface PrescriptionItemRequest {
  medicineId: number | null;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
}

interface LabTestOrderRequest {
  testId: number | null;
  remarks: string;
}

interface ConsultationFormProps {
  opened: boolean;
  onClose: () => void;
  appointment: any;
  onSuccess: () => void;
}

const ConsultationForm: React.FC<ConsultationFormProps> = ({ opened, onClose, appointment, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [savingTests, setSavingTests] = useState(false);
  const [savingMedicines, setSavingMedicines] = useState(false);
  
  // Data for dropdowns
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  
  // Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [notes, setNotes] = useState('');
  const [allergies, setAllergies] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  
  const [prescriptions, setPrescriptions] = useState<PrescriptionItemRequest[]>([]);
  const [labTestOrders, setLabTestOrders] = useState<LabTestOrderRequest[]>([]);

  useEffect(() => {
    if (opened) {
      fetchData();
      // Pre-fill some fields if possible
      setSymptoms(appointment?.reason || '');
      // Reset form
      setDiagnosis('');
      setTreatmentPlan('');
      setNotes('');
      setAllergies('');
      setMedicalHistory('');
      setPrescriptions([]);
      setLabTestOrders([]);
    }
  }, [opened, appointment]);

  const fetchData = async () => {
    try {
      const [medRes, labRes] = await Promise.all([
        api.get('/pharmacy/medicines'),
        api.get('/laboratory/tests')
      ]);
      setMedicines(medRes.data);
      setLabTests(labRes.data);
    } catch (err) {
      console.error('Failed to load form data', err);
    }
  };

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicineId: null, dosage: '', frequency: '', durationDays: 1, quantity: 1 }]);
  };

  const removePrescriptionRow = (index: number) => {
    const newP = [...prescriptions];
    newP.splice(index, 1);
    setPrescriptions(newP);
  };

  const updatePrescriptionRow = (index: number, field: keyof PrescriptionItemRequest, value: any) => {
    const newP = [...prescriptions];
    newP[index] = { ...newP[index], [field]: value };
    setPrescriptions(newP);
  };

  const addLabTestRow = () => {
    setLabTestOrders([...labTestOrders, { testId: null, remarks: '' }]);
  };

  const removeLabTestRow = (index: number) => {
    const newL = [...labTestOrders];
    newL.splice(index, 1);
    setLabTestOrders(newL);
  };

  const updateLabTestRow = (index: number, field: keyof LabTestOrderRequest, value: any) => {
    const newL = [...labTestOrders];
    newL[index] = { ...newL[index], [field]: value };
    setLabTestOrders(newL);
  };

  const handleSaveTests = async () => {
    if (labTestOrders.length === 0) {
      notifications.show({ title: 'Error', message: 'No laboratory tests to save', color: 'red' });
      return;
    }

    const invalidLabTest = labTestOrders.find(l => !l.testId);
    if (invalidLabTest) {
      notifications.show({ title: 'Error', message: 'Please select a lab test for all ordered tests', color: 'red' });
      return;
    }

    setSavingTests(true);
    try {
      await api.post(`/medical-records/appointments/${appointment.id}/lab-tests`, labTestOrders);
      notifications.show({ title: 'Success', message: 'Laboratory tests successfully ordered & dispatched!', color: 'teal' });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to save tests', color: 'red' });
    } finally {
      setSavingTests(false);
    }
  };

  const handleSaveMedicines = async () => {
    if (prescriptions.length === 0) {
      notifications.show({ title: 'Error', message: 'No prescribed medicines to save', color: 'red' });
      return;
    }

    const invalidPrescription = prescriptions.find(p => !p.medicineId || !p.dosage || !p.frequency || p.durationDays < 1 || p.quantity < 1);
    if (invalidPrescription) {
      notifications.show({ title: 'Error', message: 'Please fill all fields correctly for prescribed medicines', color: 'red' });
      return;
    }

    setSavingMedicines(true);
    try {
      await api.post(`/medical-records/appointments/${appointment.id}/prescriptions`, prescriptions);
      notifications.show({ title: 'Success', message: 'Prescription successfully saved & dispatched to Pharmacy!', color: 'teal' });
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to save prescription', color: 'red' });
    } finally {
      setSavingMedicines(false);
    }
  };

  const handleSubmit = async () => {
    if (!diagnosis || !symptoms) {
      notifications.show({ title: 'Error', message: 'Diagnosis and Symptoms are required fields', color: 'red' });
      return;
    }

    // Validate prescriptions
    const invalidPrescription = prescriptions.find(p => !p.medicineId || !p.dosage || !p.frequency || p.durationDays < 1 || p.quantity < 1);
    if (invalidPrescription) {
      notifications.show({ title: 'Error', message: 'Please fill all fields correctly for prescribed medicines', color: 'red' });
      return;
    }

    const invalidLabTest = labTestOrders.find(l => !l.testId);
    if (invalidLabTest) {
      notifications.show({ title: 'Error', message: 'Please select a lab test for all ordered tests', color: 'red' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        diagnosis,
        symptoms,
        treatmentPlan,
        notes,
        allergies,
        medicalHistory,
        medicines: prescriptions,
        labTests: labTestOrders
      };

      await api.post('/medical-records/consultation', payload);
      notifications.show({ title: 'Success', message: 'Consultation completed successfully! EMR updated and orders dispatched.', color: 'teal' });
      onSuccess();
      onClose();
    } catch (err: any) {
      notifications.show({ title: 'Error', message: err.response?.data?.message || 'Failed to submit consultation', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
    label: { color: '#8BA3C7', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconStethoscope size={24} color="#60A5FA" />
          <Title order={3} c="#F0F6FF">Patient Consultation</Title>
        </Group>
      }
      size="100%"
      styles={{
        header: { backgroundColor: '#0B1120', borderBottom: '1px solid #1C2B46' },
        content: { backgroundColor: '#0B1120', border: '1px solid #1C2B46' },
        title: { color: '#F0F6FF', fontWeight: 600 },
        close: { color: '#8BA3C7', '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }
      }}
    >
      <ScrollArea h="calc(100vh - 140px)" offsetScrollbars>
        <Box p="md" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Patient Info Banner */}
          <Box mb="xl" p="md" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '12px' }}>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="#8BA3C7">Patient Name</Text>
                <Text size="lg" fw={600} c="#F0F6FF">{appointment?.patientName}</Text>
              </div>
              <div>
                <Text size="sm" c="#8BA3C7">Appointment Type</Text>
                <Text size="md" fw={500} c="#F0F6FF">{appointment?.appointmentType}</Text>
              </div>
              <div>
                <Text size="sm" c="#8BA3C7">Date</Text>
                <Text size="md" fw={500} c="#F0F6FF">{new Date(appointment?.appointmentDateTime).toLocaleString()}</Text>
              </div>
            </Group>
          </Box>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Clinical Notes */}
            <div className="space-y-4">
              <Title order={4} c="#60A5FA" mb="md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconStethoscope size={20} /> Clinical Notes
              </Title>
              
              <Textarea
                label="Symptoms (Reported)"
                placeholder="E.g., Fever, cough, fatigue"
                required
                minRows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.currentTarget.value)}
                styles={inputStyles}
              />
              
              <Textarea
                label="Diagnosis"
                placeholder="Primary diagnosis"
                required
                minRows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.currentTarget.value)}
                styles={inputStyles}
              />

              <Textarea
                label="Treatment Plan"
                placeholder="Recommended treatment and lifestyle changes"
                minRows={3}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.currentTarget.value)}
                styles={inputStyles}
              />

              <div className="grid grid-cols-2 gap-4">
                <Textarea
                  label="Allergies"
                  placeholder="Any known allergies"
                  minRows={2}
                  value={allergies}
                  onChange={(e) => setAllergies(e.currentTarget.value)}
                  styles={inputStyles}
                />
                <Textarea
                  label="Medical History"
                  placeholder="Relevant past history"
                  minRows={2}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.currentTarget.value)}
                  styles={inputStyles}
                />
              </div>

              <Textarea
                label="Internal Doctor Notes"
                placeholder="Private notes, observations"
                minRows={2}
                value={notes}
                onChange={(e) => setNotes(e.currentTarget.value)}
                styles={inputStyles}
              />
            </div>

            {/* Right Column: Orders & Prescriptions */}
            <div className="space-y-6">
              
              {/* Lab Orders */}
              <Box p="md" style={{ backgroundColor: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: '12px' }}>
                <Group justify="space-between" mb="md">
                  <Title order={4} c="#22D3EE" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconFlask size={20} /> Laboratory Orders
                  </Title>
                  <Button size="xs" variant="light" color="cyan" onClick={addLabTestRow}>
                    + Add Test
                  </Button>
                </Group>
                
                {labTestOrders.length === 0 ? (
                  <Text size="sm" c="#4D6580" fs="italic" ta="center" py="md">No lab tests ordered yet.</Text>
                ) : (
                  <div className="space-y-4">
                    {labTestOrders.map((l, index) => (
                      <Box key={index} p="sm" style={{ backgroundColor: 'rgba(8,13,26,0.5)', border: '1px solid #1C2B46', borderRadius: '8px' }}>
                        <Group align="flex-end" mb="sm">
                          <Select
                            label="Laboratory Test"
                            placeholder="Select test"
                            data={labTests.map(lt => ({ value: lt.id.toString(), label: `${lt.testName} (${lt.category})` }))}
                            value={l.testId?.toString() || null}
                            onChange={(val) => updateLabTestRow(index, 'testId', val ? parseInt(val) : null)}
                            searchable
                            required
                            style={{ flex: 1 }}
                            styles={inputStyles}
                          />
                          <ActionIcon color="red" variant="subtle" onClick={() => removeLabTestRow(index)} size="lg" mb={4}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                        <TextInput
                          label="Special Instructions / Remarks"
                          placeholder="e.g., Fasting required"
                          value={l.remarks}
                          onChange={(e) => updateLabTestRow(index, 'remarks', e.currentTarget.value)}
                          styles={inputStyles}
                        />
                      </Box>
                    ))}
                    <Group justify="flex-end" mt="md">
                      <Button
                        size="xs"
                        variant="filled"
                        color="cyan"
                        loading={savingTests}
                        onClick={handleSaveTests}
                        style={{
                          background: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                          border: 'none'
                        }}
                      >
                        Save Tests
                      </Button>
                    </Group>
                  </div>
                )}
              </Box>

              {/* Prescriptions */}
              <Box p="md" style={{ backgroundColor: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px' }}>
                <Group justify="space-between" mb="md">
                  <Title order={4} c="#A78BFA" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IconPill size={20} /> E-Prescriptions
                  </Title>
                  <Button size="xs" variant="light" color="violet" onClick={addPrescriptionRow}>
                    + Add Medicine
                  </Button>
                </Group>
                
                {prescriptions.length === 0 ? (
                  <Text size="sm" c="#4D6580" fs="italic" ta="center" py="md">No medicines prescribed yet.</Text>
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((p, index) => (
                      <Box key={index} p="sm" style={{ backgroundColor: 'rgba(8,13,26,0.5)', border: '1px solid #1C2B46', borderRadius: '8px' }}>
                        <Group align="flex-end" mb="sm">
                          <Select
                            label="Medicine"
                            placeholder="Select medicine"
                            data={medicines.map(m => ({ value: m.id.toString(), label: `${m.name} (${m.manufacturer})` }))}
                            value={p.medicineId?.toString() || null}
                            onChange={(val) => updatePrescriptionRow(index, 'medicineId', val ? parseInt(val) : null)}
                            searchable
                            required
                            style={{ flex: 1 }}
                            styles={inputStyles}
                          />
                          <ActionIcon color="red" variant="subtle" onClick={() => removePrescriptionRow(index)} size="lg" mb={4}>
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                        <Group grow>
                          <TextInput
                            label="Dosage"
                            placeholder="e.g., 500mg"
                            required
                            value={p.dosage}
                            onChange={(e) => updatePrescriptionRow(index, 'dosage', e.currentTarget.value)}
                            styles={inputStyles}
                          />
                          <TextInput
                            label="Frequency"
                            placeholder="e.g., 1x/day"
                            required
                            value={p.frequency}
                            onChange={(e) => updatePrescriptionRow(index, 'frequency', e.currentTarget.value)}
                            styles={inputStyles}
                          />
                          <NumberInput
                            label="Days"
                            required
                            min={1}
                            value={p.durationDays}
                            onChange={(val) => updatePrescriptionRow(index, 'durationDays', val)}
                            styles={inputStyles}
                          />
                          <NumberInput
                            label="Quantity"
                            required
                            min={1}
                            value={p.quantity}
                            onChange={(val) => updatePrescriptionRow(index, 'quantity', val)}
                            styles={inputStyles}
                          />
                        </Group>
                      </Box>
                    ))}
                    <Group justify="flex-end" mt="md">
                      <Button
                        size="xs"
                        variant="filled"
                        color="violet"
                        loading={savingMedicines}
                        onClick={handleSaveMedicines}
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                          border: 'none'
                        }}
                      >
                        Save Medicine
                      </Button>
                    </Group>
                  </div>
                )}
              </Box>

            </div>
          </div>

          <Divider my="xl" color="#1C2B46" />
          
          <Group justify="flex-end">
            <Button variant="subtle" color="gray" onClick={onClose}>Cancel</Button>
            <Button 
              leftSection={<IconCheck size={16} />}
              onClick={handleSubmit}
              loading={loading}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                border: 'none'
              }}
            >
              Sign & Complete Consultation
            </Button>
          </Group>
          
        </Box>
      </ScrollArea>
    </Modal>
  );
};

export default ConsultationForm;
