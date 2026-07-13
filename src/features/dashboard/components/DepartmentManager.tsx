import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  TextInput,
  Textarea,
  Select,
  Modal,
  Group,
  ActionIcon,
  Text,
  Tabs,
  Badge,
  Loader,
  Card,
  Alert,
} from '@mantine/core';
import {
  IconTrash,
  IconEdit,
  IconPlus,
  IconSettings,
  IconBuildingCommunity,
  IconStethoscope,
  IconFileText,
  IconPrinter,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import api from '../../../utils/api';

interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
}

interface Specialization {
  id: number;
  name: string;
  description: string;
  department: Department | null;
}

export const DepartmentManager: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingSpecs, setLoadingSpecs] = useState(false);

  // Department Modal State
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Specialization Modal State
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [specName, setSpecName] = useState('');
  const [specDesc, setSpecDesc] = useState('');
  const [specDeptId, setSpecDeptId] = useState<string | null>(null);

  // Fetch Departments
  const fetchDepartments = async () => {
    setLoadingDepts(true);
    try {
      const res = await api.get('/departments/public');
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments', err);
      notifications.show({
        title: 'Error',
        message: 'Could not retrieve departments list.',
        color: 'red',
      });
    } finally {
      setLoadingDepts(false);
    }
  };

  // Fetch Specializations
  const fetchSpecializations = async () => {
    setLoadingSpecs(true);
    try {
      const res = await api.get('/specializations/public');
      setSpecializations(res.data);
    } catch (err) {
      console.error('Failed to load specializations', err);
      notifications.show({
        title: 'Error',
        message: 'Could not retrieve specializations list.',
        color: 'red',
      });
    } finally {
      setLoadingSpecs(false);
    }
  };

  // Excel Import/Export Handlers
  const handleExcelExportDept = async () => {
    try {
      const response = await api.get('/departments/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'departments.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      notifications.show({ title: 'Export Complete', message: 'Departments successfully exported to Excel.', color: 'teal' });
    } catch (err) {
      notifications.show({ title: 'Export Failed', message: 'Failed to export departments.', color: 'red' });
    }
  };

  const handleExcelImportDept = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    notifications.show({
      id: 'dept-import-loading',
      title: 'Importing Departments',
      message: 'Processing Excel file, please wait...',
      loading: true,
      autoClose: false,
    });

    try {
      await api.post('/departments/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notifications.update({
        id: 'dept-import-loading',
        title: 'Success',
        message: 'Departments imported successfully.',
        color: 'teal',
        loading: false,
        autoClose: 3000,
      });
      fetchDepartments();
    } catch (err: any) {
      notifications.update({
        id: 'dept-import-loading',
        title: 'Import Failed',
        message: err.response?.data?.message || 'Failed to import departments.',
        color: 'red',
        loading: false,
        autoClose: 5000,
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleExcelExportSpec = async () => {
    try {
      const response = await api.get('/specializations/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'specializations.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      notifications.show({ title: 'Export Complete', message: 'Specializations successfully exported to Excel.', color: 'teal' });
    } catch (err) {
      notifications.show({ title: 'Export Failed', message: 'Failed to export specializations.', color: 'red' });
    }
  };

  const handleExcelImportSpec = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    notifications.show({
      id: 'spec-import-loading',
      title: 'Importing Specializations',
      message: 'Processing Excel file, please wait...',
      loading: true,
      autoClose: false,
    });

    try {
      await api.post('/specializations/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notifications.update({
        id: 'spec-import-loading',
        title: 'Success',
        message: 'Specializations imported successfully.',
        color: 'teal',
        loading: false,
        autoClose: 3000,
      });
      fetchSpecializations();
    } catch (err: any) {
      notifications.update({
        id: 'spec-import-loading',
        title: 'Import Failed',
        message: err.response?.data?.message || 'Failed to import specializations.',
        color: 'red',
        loading: false,
        autoClose: 5000,
      });
    } finally {
      e.target.value = '';
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchSpecializations();
  }, []);

  // Handle Department Submit (Create/Update)
  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) {
      notifications.show({ title: 'Validation Error', message: 'Name and Code are required', color: 'yellow' });
      return;
    }

    try {
      const payload = { name: deptName, code: deptCode, description: deptDesc };
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, payload);
        notifications.show({ title: 'Success', message: 'Department updated successfully', color: 'teal' });
      } else {
        await api.post('/departments', payload);
        notifications.show({ title: 'Success', message: 'Department created successfully', color: 'teal' });
      }
      setDeptModalOpen(false);
      setEditingDept(null);
      resetDeptForm();
      fetchDepartments();
    } catch (err: any) {
      console.error(err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Operation failed.',
        color: 'red',
      });
    }
  };

  // Handle Specialization Submit
  const handleSpecSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName) {
      notifications.show({ title: 'Validation Error', message: 'Specialization name is required', color: 'yellow' });
      return;
    }

    try {
      const payload = {
        name: specName,
        description: specDesc,
        departmentId: specDeptId ? Number(specDeptId) : null,
      };
      await api.post('/specializations', payload);
      notifications.show({ title: 'Success', message: 'Specialization created successfully', color: 'teal' });
      setSpecModalOpen(false);
      resetSpecForm();
      fetchSpecializations();
    } catch (err: any) {
      console.error(err);
      notifications.show({
        title: 'Error',
        message: err.response?.data?.message || 'Operation failed.',
        color: 'red',
      });
    }
  };

  // Handle Delete Department
  const handleDeleteDept = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this department? All associated specializations will be affected.')) return;
    try {
      await api.delete(`/departments/${id}`);
      notifications.show({ title: 'Success', message: 'Department deleted successfully', color: 'teal' });
      fetchDepartments();
      fetchSpecializations();
    } catch (err) {
      console.error(err);
      notifications.show({ title: 'Error', message: 'Failed to delete department', color: 'red' });
    }
  };

  // Handle Delete Specialization
  const handleDeleteSpec = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this specialization?')) return;
    try {
      await api.delete(`/specializations/${id}`);
      notifications.show({ title: 'Success', message: 'Specialization deleted successfully', color: 'teal' });
      fetchSpecializations();
    } catch (err) {
      console.error(err);
      notifications.show({ title: 'Error', message: 'Failed to delete specialization', color: 'red' });
    }
  };

  const openEditDeptModal = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptDesc(dept.description);
    setDeptModalOpen(true);
  };

  const resetDeptForm = () => {
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
  };

  const resetSpecForm = () => {
    setSpecName('');
    setSpecDesc('');
    setSpecDeptId(null);
  };

  return (
    <Card
      radius="2xl"
      p="xl"
      style={{
        background: 'rgba(14,22,40,0.8)',
        border: '1px solid #1C2B46',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <Group justify="space-between" mb="xl">
        <div>
          <Text style={{ fontSize: '20px', fontWeight: 700, color: '#F0F6FF' }}>
            Hospital Setup & Operations
          </Text>
          <Text size="xs" style={{ color: '#8BA3C7', marginTop: '2px' }}>
            Configure and manage medical departments and doctor specialties.
          </Text>
        </div>
      </Group>

      <Tabs defaultValue="departments" variant="outline" styles={{
        tab: {
          color: '#8BA3C7',
          borderColor: '#1C2B46',
          '&[data-active]': {
            color: '#22D3EE',
            borderColor: '#22D3EE',
            backgroundColor: 'rgba(34,211,238,0.05)',
          },
        },
        panel: {
          paddingTop: '20px',
        }
      }}>
        <Tabs.List style={{ borderColor: '#1C2B46' }}>
          <Tabs.Tab value="departments" leftSection={<IconBuildingCommunity size={16} />}>
            Departments ({departments.length})
          </Tabs.Tab>
          <Tabs.Tab value="specializations" leftSection={<IconStethoscope size={16} />}>
            Specializations ({specializations.length})
          </Tabs.Tab>
        </Tabs.List>

        {/* Departments Panel */}
        <Tabs.Panel value="departments">
          <Group justify="flex-end" mb="md">
            <Button
              size="xs"
              radius="md"
              variant="outline"
              color="green"
              leftSection={<IconFileText size={14} />}
              component="label"
            >
              Import Excel
              <input type="file" accept=".xlsx" hidden onChange={handleExcelImportDept} />
            </Button>
            <Button
              size="xs"
              radius="md"
              variant="outline"
              color="teal"
              leftSection={<IconPrinter size={14} />}
              onClick={handleExcelExportDept}
            >
              Export Excel
            </Button>
            <Button
              size="xs"
              radius="md"
              leftSection={<IconPlus size={14} />}
              onClick={() => {
                setEditingDept(null);
                resetDeptForm();
                setDeptModalOpen(true);
              }}
              style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', border: 'none' }}
            >
              Add Department
            </Button>
          </Group>

          <Alert title="Excel Import Instructions" color="blue" icon={<IconBuildingCommunity size={16} />} radius="md" mb="md" variant="light" withCloseButton>
            <Text size="xs" style={{ lineHeight: 1.5, color: '#8BA3C7' }}>
              To import departments in bulk, upload an Excel file (.xlsx) containing the following columns:
              <br />
              • <strong>Name</strong> (required) — e.g. Cardiology
              <br />
              • <strong>Code</strong> (required, unique) — e.g. CARDIOLOGY
              <br />
              • <strong>Description</strong> (optional) — e.g. Heart diagnostics
            </Text>
          </Alert>

          {loadingDepts ? (
            <Group justify="center" p="xl"><Loader color="blue" /></Group>
          ) : (
            <Table variant="vertical" style={{ color: '#F0F6FF' }} verticalSpacing="sm" highlightOnHover>
              <Table.Thead style={{ borderBottom: '1px solid #1C2B46' }}>
                <Table.Tr>
                  <Table.Th style={{ color: '#8BA3C7' }}>Code</Table.Th>
                  <Table.Th style={{ color: '#8BA3C7' }}>Name</Table.Th>
                  <Table.Th style={{ color: '#8BA3C7' }}>Description</Table.Th>
                  <Table.Th style={{ color: '#8BA3C7', textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {departments.map((dept) => (
                  <Table.Tr key={dept.id} style={{ borderBottom: '1px solid rgba(28,43,70,0.5)' }}>
                    <Table.Td>
                      <Badge color="blue" variant="light">{dept.code}</Badge>
                    </Table.Td>
                    <Table.Td style={{ fontWeight: 600 }}>{dept.name}</Table.Td>
                    <Table.Td style={{ color: '#8BA3C7', fontSize: '13px' }}>{dept.description || 'N/A'}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => openEditDeptModal(dept)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteDept(dept.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {departments.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={4} style={{ textAlign: 'center', color: '#8BA3C7', padding: '30px' }}>
                      No departments configured. Click 'Add Department' to create one.
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>

        {/* Specializations Panel */}
        <Tabs.Panel value="specializations">
          <Group justify="flex-end" mb="md">
            <Button
              size="xs"
              radius="md"
              variant="outline"
              color="green"
              leftSection={<IconFileText size={14} />}
              component="label"
            >
              Import Excel
              <input type="file" accept=".xlsx" hidden onChange={handleExcelImportSpec} />
            </Button>
            <Button
              size="xs"
              radius="md"
              variant="outline"
              color="teal"
              leftSection={<IconPrinter size={14} />}
              onClick={handleExcelExportSpec}
            >
              Export Excel
            </Button>
            <Button
              size="xs"
              radius="md"
              leftSection={<IconPlus size={14} />}
              onClick={() => {
                resetSpecForm();
                setSpecModalOpen(true);
              }}
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none' }}
            >
              Add Specialization
            </Button>
          </Group>

          <Alert title="Excel Import Instructions" color="teal" icon={<IconStethoscope size={16} />} radius="md" mb="md" variant="light" withCloseButton>
            <Text size="xs" style={{ lineHeight: 1.5, color: '#8BA3C7' }}>
              To import specializations in bulk, upload an Excel file (.xlsx) containing the following columns:
              <br />
              • <strong>Name</strong> (required) — e.g. Interventional Cardiology
              <br />
              • <strong>Department Code</strong> (required) — e.g. CARDIOLOGY (must match an existing department code)
              <br />
              • <strong>Description</strong> (optional) — e.g. Specialty in heart catheter treatments
            </Text>
          </Alert>

          {loadingSpecs ? (
            <Group justify="center" p="xl"><Loader color="teal" /></Group>
          ) : (
            <Table variant="vertical" style={{ color: '#F0F6FF' }} verticalSpacing="sm" highlightOnHover>
              <Table.Thead style={{ borderBottom: '1px solid #1C2B46' }}>
                <Table.Tr>
                  <Table.Th style={{ color: '#8BA3C7' }}>Specialization</Table.Th>
                  <Table.Th style={{ color: '#8BA3C7' }}>Associated Department</Table.Th>
                  <Table.Th style={{ color: '#8BA3C7' }}>Description</Table.Th>
                  <Table.Th style={{ color: '#8BA3C7', textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {specializations.map((spec) => (
                  <Table.Tr key={spec.id} style={{ borderBottom: '1px solid rgba(28,43,70,0.5)' }}>
                    <Table.Td style={{ fontWeight: 600 }}>{spec.name}</Table.Td>
                    <Table.Td>
                      {spec.department ? (
                        <Badge color="violet" variant="light">{spec.department.name}</Badge>
                      ) : (
                        <Text size="xs" style={{ color: '#4D6580' }}>Global / None</Text>
                      )}
                    </Table.Td>
                    <Table.Td style={{ color: '#8BA3C7', fontSize: '13px' }}>{spec.description || 'N/A'}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDeleteSpec(spec.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {specializations.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={4} style={{ textAlign: 'center', color: '#8BA3C7', padding: '30px' }}>
                      No specializations listed. Click 'Add Specialization' to create one.
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Department Modal */}
      <Modal
        opened={deptModalOpen}
        onClose={() => setDeptModalOpen(false)}
        title={editingDept ? 'Update Department' : 'Create New Department'}
        centered
        radius="lg"
        styles={{
          content: { backgroundColor: '#0E1628', border: '1px solid #1C2B46', color: '#F0F6FF' },
          header: { backgroundColor: '#0E1628', color: '#F0F6FF' }
        }}
      >
        <form onSubmit={handleDeptSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <TextInput
            label="Department Name"
            placeholder="e.g. Cardiology"
            value={deptName}
            onChange={(e) => setDeptName(e.currentTarget.value)}
            required
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7' }
            }}
          />
          <TextInput
            label="Department Code"
            placeholder="e.g. CARDIOLOGY"
            value={deptCode}
            onChange={(e) => setDeptCode(e.currentTarget.value.toUpperCase())}
            required
            disabled={!!editingDept}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7' }
            }}
          />
          <Textarea
            label="Description"
            placeholder="Detailed description of the department's role..."
            value={deptDesc}
            onChange={(e) => setDeptDesc(e.currentTarget.value)}
            minRows={3}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7' }
            }}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setDeptModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)', border: 'none' }}>
              {editingDept ? 'Update' : 'Create'}
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Specialization Modal */}
      <Modal
        opened={specModalOpen}
        onClose={() => setSpecModalOpen(false)}
        title="Create New Specialization"
        centered
        radius="lg"
        styles={{
          content: { backgroundColor: '#0E1628', border: '1px solid #1C2B46', color: '#F0F6FF' },
          header: { backgroundColor: '#0E1628', color: '#F0F6FF' }
        }}
      >
        <form onSubmit={handleSpecSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <TextInput
            label="Specialization Name"
            placeholder="e.g. Pediatric Cardiology"
            value={specName}
            onChange={(e) => setSpecName(e.currentTarget.value)}
            required
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7' }
            }}
          />
          <Select
            label="Associated Department"
            placeholder="Select Department (optional)"
            value={specDeptId}
            onChange={setSpecDeptId}
            data={departments.map(d => ({ value: String(d.id), label: d.name }))}
            clearable
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7' }
            }}
          />
          <Textarea
            label="Description"
            placeholder="Describe the medical specialty..."
            value={specDesc}
            onChange={(e) => setSpecDesc(e.currentTarget.value)}
            minRows={3}
            styles={{
              input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF' },
              label: { color: '#8BA3C7' }
            }}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setSpecModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none' }}>
              Create
            </Button>
          </Group>
        </form>
      </Modal>
    </Card>
  );
};
