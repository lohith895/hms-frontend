import React, { useState, useEffect } from 'react';
import { Select, TextInput, NumberInput, Button, Table, Text, Box, Grid, Group, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash, IconPill } from '@tabler/icons-react';
import api from '../../../utils/api';

export interface PrescriptionItemInput {
  medicineId: number;
  medicineName: string;
  medicineCode: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
}

interface WritePrescriptionFormProps {
  items: PrescriptionItemInput[];
  onChange: (items: PrescriptionItemInput[]) => void;
}

const WritePrescriptionForm: React.FC<WritePrescriptionFormProps> = ({ items, onChange }) => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [selectedMedId, setSelectedMedId] = useState<string | null>(null);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [quantity, setQuantity] = useState<number>(7);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/pharmacy/medicines')
      .then((res) => {
        // Only load active medicines
        setMedicines(res.data.filter((m: any) => m.active));
      })
      .catch((err) => {
        console.error('Failed to load medicines for prescription writer', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddItem = () => {
    if (!selectedMedId || !dosage || !frequency || !durationDays || !quantity) {
      return;
    }

    const selectedMed = medicines.find((m) => String(m.id) === selectedMedId);
    if (!selectedMed) return;

    const newItem: PrescriptionItemInput = {
      medicineId: Number(selectedMedId),
      medicineName: selectedMed.name,
      medicineCode: selectedMed.code,
      dosage,
      frequency,
      durationDays,
      quantity,
    };

    const updated = [...items, newItem];
    onChange(updated);

    // Reset inputs
    setSelectedMedId(null);
    setDosage('');
    setFrequency('');
    setDurationDays(7);
    setQuantity(7);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Box style={{ border: '1px solid #1C2B46', borderRadius: '12px', padding: '16px', backgroundColor: 'rgba(8,13,26,0.3)' }}>
      <Group gap="xs" mb="sm">
        <IconPill size={18} style={{ color: '#22D3EE' }} />
        <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>
          Compose Prescription (Optional)
        </Text>
      </Group>

      {/* Input row */}
      <Grid gutter="xs" align="flex-end">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Select
            label="Select Medicine"
            placeholder={loading ? "Loading medicines..." : "Choose drug"}
            disabled={loading}
            data={medicines.map((m) => ({ value: String(m.id), label: `${m.name} (${m.code})` }))}
            value={selectedMedId}
            onChange={setSelectedMedId}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7', marginBottom: '4px', fontSize: '11px', fontWeight: 600 },
              dropdown: { backgroundColor: '#0E1628', borderColor: '#1C2B46' }
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 3 }}>
          <TextInput
            label="Dosage"
            placeholder="e.g. 1 tab, 5ml"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 3 }}>
          <TextInput
            label="Frequency"
            placeholder="e.g. twice daily"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 1 }}>
          <NumberInput
            label="Days"
            min={1}
            value={durationDays}
            onChange={(val) => setDurationDays(Number(val))}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }
            }}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 6, sm: 1 }}>
          <NumberInput
            label="Qty"
            min={1}
            value={quantity}
            onChange={(val) => setQuantity(Number(val))}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }
            }}
          />
        </Grid.Col>
      </Grid>

      <Button
        leftSection={<IconPlus size={14} />}
        size="xs"
        variant="light"
        color="cyan"
        onClick={handleAddItem}
        disabled={!selectedMedId || !dosage || !frequency}
        style={{ marginTop: '12px' }}
      >
        Add to Prescription
      </Button>

      {/* Added items list */}
      {items.length > 0 && (
        <Box mt="md" style={{ overflowX: 'auto' }}>
          <Table
            verticalSpacing="xs"
            horizontalSpacing="xs"
            styles={{
              table: { color: '#F0F6FF' },
              th: { color: '#8BA3C7', borderBottom: '1px solid #1C2B46', fontSize: '11px', fontWeight: 700 },
              td: { borderBottom: '1px solid #1C2B46', fontSize: '12px' }
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Medication</Table.Th>
                <Table.Th>Dosage</Table.Th>
                <Table.Th>Frequency</Table.Th>
                <Table.Th>Days</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td style={{ fontWeight: 600 }}>{item.medicineName} ({item.medicineCode})</Table.Td>
                  <Table.Td>{item.dosage}</Table.Td>
                  <Table.Td>{item.frequency}</Table.Td>
                  <Table.Td>{item.durationDays}</Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                  <Table.Td>
                    <ActionIcon color="red" size="sm" variant="subtle" onClick={() => handleRemoveItem(idx)}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default WritePrescriptionForm;
