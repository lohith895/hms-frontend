import React, { useState, useEffect } from 'react';
import { Select, Button, Table, Text, Box, Group, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash, IconFlask } from '@tabler/icons-react';
import api from '../../../utils/api';

export interface LabTestOrderInput {
  id: number;
  testName: string;
  testCode: string;
  cost: number;
  referenceRange: string;
}

interface OrderLabTestFormProps {
  selectedTests: LabTestOrderInput[];
  onChange: (tests: LabTestOrderInput[]) => void;
}

const OrderLabTestForm: React.FC<OrderLabTestFormProps> = ({ selectedTests, onChange }) => {
  const [testsCatalog, setTestsCatalog] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/laboratory/tests')
      .then((res) => {
        // Load active diagnostic profiles
        setTestsCatalog(res.data.filter((t: any) => t.active));
      })
      .catch((err) => {
        console.error('Failed to load lab tests for order form', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddTest = () => {
    if (!selectedTestId) return;

    // Check if test is already added
    if (selectedTests.some((t) => String(t.id) === selectedTestId)) {
      setSelectedTestId(null);
      return;
    }

    const test = testsCatalog.find((t) => String(t.id) === selectedTestId);
    if (!test) return;

    const newItem: LabTestOrderInput = {
      id: test.id,
      testName: test.testName,
      testCode: test.testCode,
      cost: test.cost,
      referenceRange: test.referenceRange
    };

    onChange([...selectedTests, newItem]);
    setSelectedTestId(null);
  };

  const handleRemoveTest = (id: number) => {
    const updated = selectedTests.filter((t) => t.id !== id);
    onChange(updated);
  };

  return (
    <Box style={{ border: '1px solid #1C2B46', borderRadius: '12px', padding: '16px', backgroundColor: 'rgba(8,13,26,0.3)' }}>
      <Group gap="xs" mb="sm">
        <IconFlask size={18} style={{ color: '#22D3EE' }} />
        <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>
          Order Laboratory Diagnostics (Optional)
        </Text>
      </Group>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
        <Select
          label="Select Diagnostics"
          placeholder={loading ? "Loading diagnostics..." : "Choose lab test"}
          disabled={loading}
          data={testsCatalog.map((t) => ({ value: String(t.id), label: `${t.testName} (${t.testCode}) - ₹${t.cost.toFixed(2)}` }))}
          value={selectedTestId}
          onChange={setSelectedTestId}
          style={{ flex: 1, minWidth: '220px' }}
          styles={{
            input: { backgroundColor: 'rgba(8,13,26,0.6)', borderColor: '#1C2B46', color: '#F0F6FF' },
            label: { color: '#8BA3C7', marginBottom: '4px', fontSize: '11px', fontWeight: 600 },
            dropdown: { backgroundColor: '#0E1628', borderColor: '#1C2B46' }
          }}
        />
        <Button
          leftSection={<IconPlus size={14} />}
          size="sm"
          variant="light"
          color="cyan"
          onClick={handleAddTest}
          disabled={!selectedTestId}
          style={{ height: '36px' }}
        >
          Add Lab Order
        </Button>
      </div>

      {selectedTests.length > 0 && (
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
                <Table.Th>Test Code</Table.Th>
                <Table.Th>Test Name</Table.Th>
                <Table.Th>Ref Range</Table.Th>
                <Table.Th>Cost</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {selectedTests.map((test) => (
                <Table.Tr key={test.id}>
                  <Table.Td style={{ fontWeight: 600, fontFamily: 'monospace' }}>{test.testCode}</Table.Td>
                  <Table.Td style={{ fontWeight: 600 }}>{test.testName}</Table.Td>
                  <Table.Td style={{ color: '#34D399' }}>{test.referenceRange}</Table.Td>
                  <Table.Td>₹{test.cost.toFixed(2)}</Table.Td>
                  <Table.Td>
                    <ActionIcon color="red" size="sm" variant="subtle" onClick={() => handleRemoveTest(test.id)}>
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

export default OrderLabTestForm;
