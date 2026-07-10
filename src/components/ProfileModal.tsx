import React, { useState, useEffect, useCallback } from 'react';
import { Modal, TextInput, Textarea, Button, Text, Badge, Divider, Avatar, Select, NumberInput } from '@mantine/core';
import {
  IconUser, IconMail, IconPhone, IconDroplet, IconStethoscope,
  IconBriefcase, IconCoin, IconIdBadge, IconCertificate,
  IconMapPin, IconCalendar, IconCheck, IconAlertCircle, IconFlask,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateUser } from '../features/authentication/redux/authSlice';
import api from '../utils/api';

interface ProfileModalProps {
  opened: boolean;
  onClose: () => void;
}

const inputStyles = {
  root: { display: 'flex', flexDirection: 'column' as const },
  label: {
    color: '#8BA3C7',
    fontSize: '12px',
    fontWeight: 600 as const,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
  },
  input: {
    backgroundColor: 'rgba(8,13,26,0.7)',
    borderColor: '#1C2B46',
    color: '#F0F6FF',
    borderRadius: '10px',
    height: '44px',
    fontSize: '14px',
  },
};

const selectStyles = {
  input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF', height: '44px', borderRadius: '10px' },
  label: { color: '#8BA3C7', marginBottom: '6px', fontSize: '12px', fontWeight: 600 as const, textTransform: 'uppercase' as const, letterSpacing: '0.05em' },
  dropdown: { backgroundColor: '#0E1628', borderColor: '#1C2B46' },
};

const ROLE_COLORS: Record<string, string> = {
  ROLE_ADMIN: 'yellow',
  ROLE_DOCTOR: 'blue',
  ROLE_NURSE: 'green',
  ROLE_PATIENT: 'cyan',
  ROLE_PHARMACIST: 'grape',
  ROLE_LAB_TECHNICIAN: 'orange',
};

/* ── API path per role ── */
const ROLE_PROFILE_PATH: Record<string, string> = {
  ROLE_PATIENT: '/patients/me',
  ROLE_DOCTOR: '/doctors/me',
  ROLE_NURSE: '/nurses/me',
  ROLE_PHARMACIST: '/pharmacists/me',
  ROLE_LAB_TECHNICIAN: '/lab-technicians/me',
};

const ProfileModal: React.FC<ProfileModalProps> = ({ opened, onClose }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  /* ── Base user fields ── */
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  /* ── Role-specific fields ── */
  const [roleData, setRoleData] = useState<Record<string, any>>({});
  const [loadingRole, setLoadingRole] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Setters for role fields ── */
  const set = (key: string, val: any) => setRoleData(prev => ({ ...prev, [key]: val }));

  const fetchRoleProfile = useCallback(async () => {
    if (!user) return;
    const path = ROLE_PROFILE_PATH[user.role];
    if (!path) return;
    setLoadingRole(true);
    try {
      const res = await api.get(path);
      setRoleData(res.data);
    } catch {
      // silently ignore if no profile found
    } finally {
      setLoadingRole(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && opened) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setSuccess(false);
      setError(null);
      fetchRoleProfile();
    }
  }, [user, opened, fetchRoleProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      /* 1. Update base user profile */
      const baseRes = await api.put('/auth/profile', { firstName, lastName, email });
      dispatch(updateUser({
        firstName: baseRes.data.firstName,
        lastName: baseRes.data.lastName,
        email: baseRes.data.email,
      }));

      /* 2. Update role-specific profile */
      const path = user ? ROLE_PROFILE_PATH[user.role] : null;
      if (path) {
        await api.put(path, roleData);
      }

      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
  const roleLabel = user.role.replace('ROLE_', '').replace(/_/g, ' ');
  const badgeColor = ROLE_COLORS[user.role] ?? 'gray';

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text style={{ color: '#F0F6FF', fontWeight: 700, fontSize: '16px' }}>My Profile</Text>}
      size="md"
      centered
      styles={{
        content: {
          background: 'rgba(14,22,40,0.97)',
          backdropFilter: 'blur(24px)',
          border: '1px solid #1C2B46',
          borderRadius: '20px',
          maxHeight: '90vh',
          overflowY: 'auto',
        },
        header: {
          backgroundColor: 'transparent',
          borderBottom: '1px solid #1C2B46',
          paddingBottom: '12px',
        },
        overlay: {
          backdropFilter: 'blur(6px)',
          backgroundColor: 'rgba(0,0,0,0.55)',
        },
        close: { color: '#4D6580' },
      }}
    >
      <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Avatar + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar
            size={64}
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
              fontSize: '20px',
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>
          <div>
            <Text style={{ color: '#F0F6FF', fontWeight: 700, fontSize: '18px', lineHeight: 1.2 }}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={{ color: '#4D6580', fontSize: '13px', marginBottom: '6px' }}>
              @{user.username}
            </Text>
            <Badge color={badgeColor} variant="light" size="sm" radius="sm"
              style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {roleLabel}
            </Badge>
          </div>
        </div>

        <Divider color="#1C2B46" label={<Text size="xs" style={{ color: '#4D6580' }}>Account Details</Text>} labelPosition="center" />

        {/* Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
              <IconAlertCircle size={15} style={{ color: '#FB7185', flexShrink: 0 }} />
              <Text style={{ color: '#FDA4AF', fontSize: '13px' }}>{error}</Text>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <IconCheck size={15} style={{ color: '#34D399', flexShrink: 0 }} />
              <Text style={{ color: '#6EE7B7', fontSize: '13px' }}>Profile updated successfully!</Text>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* ── Common fields ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <TextInput label="First Name" value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)} required
              leftSection={<IconUser size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
            <TextInput label="Last Name" value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)} required
              leftSection={<IconUser size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
          </div>

          <TextInput label="Email Address" type="email" value={email}
            onChange={(e) => setEmail(e.currentTarget.value)} required
            leftSection={<IconMail size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />

          {/* Username (readonly) */}
          <TextInput label="Username" value={user.username} disabled
            description="Username cannot be changed"
            styles={{
              root: inputStyles.root,
              label: inputStyles.label,
              input: { ...inputStyles.input, color: '#4D6580', opacity: 0.6 },
              description: { color: '#2D3F57', fontSize: '11px', marginTop: '4px' },
            }} />

          {/* ── Role-specific fields ── */}
          {!loadingRole && (
            <>
              {/* PATIENT */}
              {user.role === 'ROLE_PATIENT' && (
                <>
                  <Divider color="#1C2B46" label={<Text size="xs" style={{ color: '#4D6580' }}>Patient Details</Text>} labelPosition="center" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <TextInput label="Date of Birth" type="date" value={roleData.dateOfBirth ?? ''}
                      onChange={(e) => set('dateOfBirth', e.currentTarget.value)}
                      leftSection={<IconCalendar size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                    <Select label="Gender" placeholder="Select" value={roleData.gender ?? null}
                      onChange={(v) => set('gender', v)} data={['Male', 'Female', 'Other']} styles={selectStyles} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Select label="Blood Group" placeholder="e.g. O+" value={roleData.bloodGroup ?? null}
                      onChange={(v) => set('bloodGroup', v)}
                      data={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                      leftSection={<IconDroplet size={15} style={{ color: '#4D6580' }} />} styles={selectStyles} />
                    <TextInput label="Emergency Contact" value={roleData.emergencyContact ?? ''}
                      onChange={(e) => set('emergencyContact', e.currentTarget.value)}
                      leftSection={<IconPhone size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                  </div>
                  <TextInput label="Address" value={roleData.address ?? ''}
                    onChange={(e) => set('address', e.currentTarget.value)}
                    leftSection={<IconMapPin size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                  <TextInput label="Insurance Number (Optional)" value={roleData.insuranceNumber ?? ''}
                    onChange={(e) => set('insuranceNumber', e.currentTarget.value)}
                    leftSection={<IconIdBadge size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                </>
              )}

              {/* DOCTOR */}
              {user.role === 'ROLE_DOCTOR' && (
                <>
                  <Divider color="#1C2B46" label={<Text size="xs" style={{ color: '#4D6580' }}>Doctor Details</Text>} labelPosition="center" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <TextInput label="Specialization" value={roleData.specialization ?? ''}
                      onChange={(e) => set('specialization', e.currentTarget.value)}
                      leftSection={<IconStethoscope size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                    <TextInput label="Department" value={roleData.departmentName ?? ''} disabled
                      styles={{ ...inputStyles, input: { ...inputStyles.input, color: '#4D6580', opacity: 0.6 } }}
                      description="Assigned by admin" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <NumberInput label="Experience (Yrs)" value={roleData.experienceYears ?? ''}
                      onChange={(v) => set('experienceYears', v)}
                      leftSection={<IconBriefcase size={15} style={{ color: '#4D6580' }} />}
                      styles={{ ...inputStyles, input: { ...inputStyles.input, paddingLeft: '36px' } }} />
                    <NumberInput label="Consult Fee (₹)" value={roleData.consultationFee ?? ''}
                      onChange={(v) => set('consultationFee', v)}
                      leftSection={<IconCoin size={15} style={{ color: '#4D6580' }} />}
                      styles={{ ...inputStyles, input: { ...inputStyles.input, paddingLeft: '36px' } }} />
                    <TextInput label="Phone" value={roleData.phone ?? ''}
                      onChange={(e) => set('phone', e.currentTarget.value)}
                      leftSection={<IconPhone size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                  </div>
                  <TextInput label="License Number" value={roleData.licenseNumber ?? ''} disabled
                    leftSection={<IconIdBadge size={15} style={{ color: '#2D3F57' }} />}
                    styles={{ ...inputStyles, input: { ...inputStyles.input, color: '#4D6580', opacity: 0.6 } }}
                    description="Assigned at registration" />
                </>
              )}

              {/* NURSE */}
              {user.role === 'ROLE_NURSE' && (
                <>
                  <Divider color="#1C2B46" label={<Text size="xs" style={{ color: '#4D6580' }}>Nurse Details</Text>} labelPosition="center" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <TextInput label="Department" value={roleData.departmentName ?? ''} disabled
                      styles={{ ...inputStyles, input: { ...inputStyles.input, color: '#4D6580', opacity: 0.6 } }} />
                    <Select label="Shift" value={roleData.shift ?? null} onChange={(v) => set('shift', v)}
                      data={['Morning', 'Evening', 'Night']} styles={selectStyles} />
                    <TextInput label="Phone" value={roleData.phone ?? ''}
                      onChange={(e) => set('phone', e.currentTarget.value)}
                      leftSection={<IconPhone size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                  </div>
                </>
              )}

              {/* PHARMACIST */}
              {user.role === 'ROLE_PHARMACIST' && (
                <>
                  <Divider color="#1C2B46" label={<Text size="xs" style={{ color: '#4D6580' }}>Pharmacist Details</Text>} labelPosition="center" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <TextInput label="License Number" value={roleData.licenseNumber ?? ''} disabled
                      leftSection={<IconIdBadge size={15} style={{ color: '#2D3F57' }} />}
                      styles={{ ...inputStyles, input: { ...inputStyles.input, color: '#4D6580', opacity: 0.6 } }}
                      description="Assigned at registration" />
                    <TextInput label="Qualification" value={roleData.qualification ?? ''}
                      onChange={(e) => set('qualification', e.currentTarget.value)}
                      leftSection={<IconCertificate size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                  </div>
                  <TextInput label="Phone" value={roleData.phone ?? ''}
                    onChange={(e) => set('phone', e.currentTarget.value)}
                    leftSection={<IconPhone size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                </>
              )}

              {/* LAB TECHNICIAN */}
              {user.role === 'ROLE_LAB_TECHNICIAN' && (
                <>
                  <Divider color="#1C2B46" label={<Text size="xs" style={{ color: '#4D6580' }}>Lab Technician Details</Text>} labelPosition="center" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <TextInput label="Specialization" value={roleData.specialization ?? ''}
                      onChange={(e) => set('specialization', e.currentTarget.value)}
                      leftSection={<IconFlask size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                    <TextInput label="Certification" value={roleData.certification ?? ''}
                      onChange={(e) => set('certification', e.currentTarget.value)}
                      leftSection={<IconCertificate size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                  </div>
                  <TextInput label="Phone" value={roleData.phone ?? ''}
                    onChange={(e) => set('phone', e.currentTarget.value)}
                    leftSection={<IconPhone size={15} style={{ color: '#4D6580' }} />} styles={inputStyles} />
                </>
              )}

              {/* ADMIN — phone only from user entity */}
              {user.role === 'ROLE_ADMIN' && (
                <>
                  <Divider color="#1C2B46" label={<Text size="xs" style={{ color: '#4D6580' }}>Admin Details</Text>} labelPosition="center" />
                  <Text size="xs" style={{ color: '#4D6580', textAlign: 'center' }}>
                    Update your name and email above.
                  </Text>
                </>
              )}
            </>
          )}

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} style={{ paddingTop: '4px' }}>
            <Button type="submit" loading={loading} fullWidth size="md" radius="xl"
              style={{
                height: '44px', fontWeight: 600, fontSize: '14px',
                background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                border: 'none', boxShadow: '0 4px 18px rgba(59,130,246,0.30)',
              }}>
              Save Changes
            </Button>
          </motion.div>
        </form>
      </div>
    </Modal>
  );
};

export default ProfileModal;
