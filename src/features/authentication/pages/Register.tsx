import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Text, Title, SimpleGrid, Select, NumberInput, SegmentedControl } from '@mantine/core';
import {
  IconLock,
  IconMail,
  IconUser,
  IconAlertCircle,
  IconArrowLeft,
  IconCircleCheck,
  IconArrowRight,
  IconStethoscope,
  IconPhone,
  IconCoin,
  IconBriefcase,
  IconDroplet,
  IconIdBadge,
  IconAddressBook,
  IconCertificate,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../utils/api';

/* ── Shared input styles ─────────────────────────────── */
const inputStyles = {
  root: { display: 'flex', flexDirection: 'column' as const },
  label: {
    color: '#8BA3C7',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    marginBottom: '7px',
  },
  input: {
    backgroundColor: 'rgba(8,13,26,0.7)',
    borderColor: '#1C2B46',
    color: '#F0F6FF',
    borderRadius: '12px',
    height: '46px',
    fontSize: '14px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  innerInput: { color: '#F0F6FF', height: '44px' },
};

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const location = useLocation();
  const defaultRole = location.state?.defaultRole || '';
  const [role, setRole] = useState(defaultRole);
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [consultationFee, setConsultationFee] = useState<number | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [bloodGroup, setBloodGroup] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [shift, setShift] = useState<string | null>(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [qualification, setQualification] = useState('');
  const [certification, setCertification] = useState('');

  const [departments, setDepartments] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [customSpec, setCustomSpec] = useState('');

  React.useEffect(() => {
    api.get('/departments/public').then((res) => {
      setDepartments(res.data);
    }).catch(console.error);

    api.get('/specializations/public').then((res) => {
      setSpecializations(res.data);
    }).catch(console.error);
  }, []);

  const filteredSpecs = React.useMemo(() => {
    if (!departmentId) return specializations;
    return specializations.filter(s => s.department && String(s.department.id) === departmentId);
  }, [specializations, departmentId]);

  const specData = React.useMemo(() => {
    const list = filteredSpecs.map(s => ({ value: s.name, label: s.name }));
    const uniqueList: any[] = [];
    const seen = new Set();
    list.forEach(item => {
      if (!seen.has(item.value)) {
        seen.add(item.value);
        uniqueList.push(item);
      }
    });
    uniqueList.push({ value: 'CUSTOM_SPECIALIZATION', label: 'Add custom specialization...' });
    return uniqueList;
  }, [filteredSpecs]);

  const handleSpecChange = (val: string | null) => {
    setSelectedSpec(val);
    if (val !== 'CUSTOM_SPECIALIZATION') {
      setSpecialization(val || '');
    } else {
      setSpecialization(customSpec);
    }
  };

  const handleCustomSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setCustomSpec(val);
    setSpecialization(val);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        username,
        email,
        password,
        firstName,
        lastName,
        role,
      };

      if (role === 'ROLE_DOCTOR') {
        payload.specialization = specialization;
        payload.departmentId = departmentId ? Number(departmentId) : null;
        payload.experienceYears = experienceYears === '' ? null : experienceYears;
        payload.consultationFee = consultationFee === '' ? null : consultationFee;
        payload.phone = phone;
      } else if (role === 'ROLE_PATIENT') {
        payload.dateOfBirth = dateOfBirth || null;
        payload.gender = gender;
        payload.bloodGroup = bloodGroup;
        payload.address = address;
        payload.emergencyContact = emergencyContact;
      } else if (role === 'ROLE_NURSE') {
        payload.departmentId = departmentId ? Number(departmentId) : null;
        payload.shift = shift;
        payload.phone = phone;
      } else if (role === 'ROLE_PHARMACIST') {
        payload.licenseNumber = licenseNumber;
        payload.qualification = qualification;
        payload.phone = phone;
      } else if (role === 'ROLE_LAB_TECHNICIAN') {
        payload.specialization = specialization;
        payload.certification = certification;
        payload.phone = phone;
      } else if (role === 'ROLE_ADMIN') {
        payload.phone = phone;
      }

      await api.post('/auth/register', payload);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      if (err.response?.data?.validationErrors) {
        const errorsMap = err.response.data.validationErrors;
        const msg = Object.entries(errorsMap)
          .map(([field, errorMsg]) => `${errorMsg}`)
          .join('\n');
        setError(msg);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{ background: '#080D1A' }}
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans py-10 px-4"
    >
      {/* ── Ambient glow orbs ── */}
      <div
        className="glow-orb-emerald"
        style={{ width: '50%', height: '60%', top: '-15%', right: '-8%' }}
      />
      <div
        className="glow-orb-blue"
        style={{ width: '40%', height: '50%', bottom: '-20%', left: '-8%' }}
      />

      <motion.div
        className="w-full max-w-2xl z-10"
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        {/* ── Card ── */}
        <div
          className="rounded-3xl p-8 space-y-6"
          style={{
            background: 'rgba(14,22,40,0.80)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid #1C2B46',
            boxShadow: '0 8px 48px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {/* ── Header ── */}
          <div className="flex flex-col items-center space-y-3">
            {/* Back link */}
            <Link
              to="/login"
              className="self-start flex items-center space-x-1.5 transition-colors"
              style={{ color: '#4D6580', fontSize: '13px', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#60A5FA')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#4D6580')}
            >
              <IconArrowLeft size={14} />
              <span>Back to Sign In</span>
            </Link>

            {/* Logo */}
            <img
              src="/logo.png"
              alt="HMS Logo"
              style={{ height: '56px', width: 'auto', objectFit: 'contain', borderRadius: '8px', marginTop: '8px' }}
            />

            <div className="text-center">
              <Title
                order={2}
                style={{
                  color: '#F0F6FF',
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                {!role ? 'Register Here' :
                 role === 'ROLE_DOCTOR' ? 'Doctor Registration' : 
                 role === 'ROLE_NURSE' ? 'Nurse Registration' : 
                 role === 'ROLE_PHARMACIST' ? 'Pharmacist Registration' :
                 role === 'ROLE_LAB_TECHNICIAN' ? 'Lab Technician Registration' :
                 role === 'ROLE_ADMIN' ? 'Admin Registration' :
                 'Patient Portal Registration'}
              </Title>
              <Text style={{ color: '#4D6580', fontSize: '13px', marginTop: 4 }}>
                Create your account to schedule consultations and access records.
              </Text>
            </div>
          </div>

          {/* ── Success banner ── */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                <IconCircleCheck size={18} style={{ color: '#34D399', flexShrink: 0 }} />
                <span style={{ color: '#6EE7B7', fontSize: '13px', fontWeight: 500 }}>
                  Registration successful! Redirecting you to the portal…
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Error banner ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(244,63,94,0.08)',
                  border: '1px solid rgba(244,63,94,0.2)',
                }}
              >
                <IconAlertCircle size={15} style={{ color: '#FB7185', flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: '#FDA4AF', fontSize: '13px', whiteSpace: 'pre-wrap' }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div style={{ marginBottom: '20px' }}>
              <Select
                label="Account Type"
                placeholder="Select your role"
                value={role}
                onChange={(val) => setRole(val || 'ROLE_PATIENT')}
                data={[
                  { label: 'Patient', value: 'ROLE_PATIENT' },
                  { label: 'Doctor', value: 'ROLE_DOCTOR' },
                  { label: 'Nurse', value: 'ROLE_NURSE' },
                  { label: 'Pharmacist', value: 'ROLE_PHARMACIST' },
                  { label: 'Lab Technician', value: 'ROLE_LAB_TECHNICIAN' },
                  { label: 'Administrator', value: 'ROLE_ADMIN' },
                ]}
                styles={{
                  input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF', height: '46px' },
                  label: { color: '#8BA3C7', marginBottom: '7px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }
                }}
              />
            </div>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                id="reg-firstname"
                label="First Name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.currentTarget.value)}
                required
                leftSection={<IconUser size={16} style={{ color: '#4D6580' }} />}
                styles={inputStyles}
              />
              <TextInput
                id="reg-lastname"
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.currentTarget.value)}
                required
                leftSection={<IconUser size={16} style={{ color: '#4D6580' }} />}
                styles={inputStyles}
              />
            </SimpleGrid>

            <TextInput
              id="reg-username"
              label="Username"
              placeholder="johndoe123"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
              leftSection={<IconUser size={16} style={{ color: '#4D6580' }} />}
              styles={inputStyles}
            />

            <TextInput
              id="reg-email"
              label="Email Address"
              placeholder="johndoe@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
              leftSection={<IconMail size={16} style={{ color: '#4D6580' }} />}
              styles={inputStyles}
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <PasswordInput
                id="reg-password"
                label="Password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                leftSection={<IconLock size={16} style={{ color: '#4D6580' }} />}
                styles={inputStyles}
              />
              <PasswordInput
                id="reg-confirm-password"
                label="Confirm Password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                required
                leftSection={<IconLock size={16} style={{ color: '#4D6580' }} />}
                styles={inputStyles}
              />
            </SimpleGrid>

            {role === 'ROLE_DOCTOR' && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Select
                    label="Department"
                    placeholder="Select Department"
                    value={departmentId}
                    onChange={(val) => {
                      setDepartmentId(val);
                      setSelectedSpec(null);
                      setSpecialization('');
                    }}
                    data={departments.map(d => ({ value: String(d.id), label: d.name }))}
                    styles={{
                      input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF', height: '46px' },
                      label: { color: '#8BA3C7', marginBottom: '7px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }
                    }}
                  />
                  <Select
                    label="Specialization"
                    placeholder="Select Specialization"
                    value={selectedSpec}
                    onChange={handleSpecChange}
                    data={specData}
                    required
                    leftSection={<IconStethoscope size={16} style={{ color: '#4D6580' }} />}
                    styles={{
                      input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF', height: '46px' },
                      label: { color: '#8BA3C7', marginBottom: '7px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }
                    }}
                  />
                </SimpleGrid>

                {selectedSpec === 'CUSTOM_SPECIALIZATION' && (
                  <TextInput
                    label="Custom Specialization"
                    placeholder="Type your custom specialization"
                    value={customSpec}
                    onChange={handleCustomSpecChange}
                    required
                    leftSection={<IconStethoscope size={16} style={{ color: '#4D6580' }} />}
                    styles={inputStyles}
                  />
                )}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                  <NumberInput
                    label="Experience (Yrs)"
                    placeholder="e.g. 10"
                    value={experienceYears}
                    onChange={(val) => setExperienceYears(val === '' ? '' : Number(val))}
                    leftSection={<IconBriefcase size={16} style={{ color: '#4D6580' }} />}
                    styles={inputStyles}
                  />
                  <NumberInput
                    label="Consultation Fee"
                    placeholder="e.g. 150"
                    value={consultationFee}
                    onChange={(val) => setConsultationFee(val === '' ? '' : Number(val))}
                    leftSection={<IconCoin size={16} style={{ color: '#4D6580' }} />}
                    styles={inputStyles}
                  />
                  <TextInput
                    label="Phone Number"
                    placeholder="123-456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.currentTarget.value)}
                    leftSection={<IconPhone size={16} style={{ color: '#4D6580' }} />}
                    styles={inputStyles}
                  />
                </SimpleGrid>
              </>
            )}

            {role === 'ROLE_PATIENT' && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    label="Date of Birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.currentTarget.value)}
                    styles={inputStyles}
                  />
                  <Select
                    label="Gender"
                    placeholder="Select Gender"
                    value={gender}
                    onChange={setGender}
                    data={['Male', 'Female', 'Other']}
                    styles={{
                      input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF', height: '46px' },
                      label: { color: '#8BA3C7', marginBottom: '7px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }
                    }}
                  />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <Select
                    label="Blood Group"
                    placeholder="e.g. O+"
                    value={bloodGroup}
                    onChange={setBloodGroup}
                    data={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
                    leftSection={<IconDroplet size={16} style={{ color: '#4D6580' }} />}
                    styles={{
                      input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF', height: '46px' },
                      label: { color: '#8BA3C7', marginBottom: '7px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }
                    }}
                  />
                  <TextInput
                    label="Emergency Contact"
                    placeholder="123-456-7890"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.currentTarget.value)}
                    leftSection={<IconPhone size={16} style={{ color: '#4D6580' }} />}
                    styles={inputStyles}
                  />
                </SimpleGrid>
                <TextInput
                  label="Address"
                  placeholder="Full Address"
                  value={address}
                  onChange={(e) => setAddress(e.currentTarget.value)}
                  styles={inputStyles}
                />
              </>
            )}

            {role === 'ROLE_NURSE' && (
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <Select
                  label="Department"
                  placeholder="Select Department"
                  value={departmentId}
                  onChange={setDepartmentId}
                  data={departments.map(d => ({ value: String(d.id), label: d.name }))}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF', height: '46px' },
                    label: { color: '#8BA3C7', marginBottom: '7px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }
                  }}
                />
                <Select
                  label="Shift"
                  placeholder="Select Shift"
                  value={shift}
                  onChange={setShift}
                  data={['Morning', 'Evening', 'Night']}
                  styles={{
                    input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF', height: '46px' },
                    label: { color: '#8BA3C7', marginBottom: '7px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }
                  }}
                />
                <TextInput
                  label="Phone Number"
                  placeholder="123-456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.currentTarget.value)}
                  leftSection={<IconPhone size={16} style={{ color: '#4D6580' }} />}
                  styles={inputStyles}
                />
              </SimpleGrid>
            )}

            {role === 'ROLE_PHARMACIST' && (
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <TextInput
                  label="License Number"
                  placeholder="PHARM-XXXX"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.currentTarget.value)}
                  leftSection={<IconIdBadge size={16} style={{ color: '#4D6580' }} />}
                  styles={inputStyles}
                />
                <TextInput
                  label="Qualification"
                  placeholder="e.g. B.Pharm"
                  value={qualification}
                  onChange={(e) => setQualification(e.currentTarget.value)}
                  leftSection={<IconCertificate size={16} style={{ color: '#4D6580' }} />}
                  styles={inputStyles}
                />
                <TextInput
                  label="Phone Number"
                  placeholder="123-456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.currentTarget.value)}
                  leftSection={<IconPhone size={16} style={{ color: '#4D6580' }} />}
                  styles={inputStyles}
                />
              </SimpleGrid>
            )}

            {role === 'ROLE_LAB_TECHNICIAN' && (
              <>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                  <Select
                    label="Specialization"
                    placeholder="Select Specialization"
                    value={selectedSpec}
                    onChange={handleSpecChange}
                    data={specData}
                    leftSection={<IconStethoscope size={16} style={{ color: '#4D6580' }} />}
                    styles={{
                      input: { backgroundColor: 'rgba(8,13,26,0.7)', borderColor: '#1C2B46', color: '#F0F6FF', height: '46px' },
                      label: { color: '#8BA3C7', marginBottom: '7px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }
                    }}
                  />
                  <TextInput
                    label="Certification"
                    placeholder="e.g. ASCP"
                    value={certification}
                    onChange={(e) => setCertification(e.currentTarget.value)}
                    leftSection={<IconCertificate size={16} style={{ color: '#4D6580' }} />}
                    styles={inputStyles}
                  />
                  <TextInput
                    label="Phone Number"
                    placeholder="123-456-7890"
                    value={phone}
                    onChange={(e) => setPhone(e.currentTarget.value)}
                    leftSection={<IconPhone size={16} style={{ color: '#4D6580' }} />}
                    styles={inputStyles}
                  />
                </SimpleGrid>

                {selectedSpec === 'CUSTOM_SPECIALIZATION' && (
                  <TextInput
                    label="Custom Specialization"
                    placeholder="Type your custom specialization"
                    value={customSpec}
                    onChange={handleCustomSpecChange}
                    required
                    leftSection={<IconStethoscope size={16} style={{ color: '#4D6580' }} />}
                    styles={inputStyles}
                  />
                )}
              </>
            )}

            {role === 'ROLE_ADMIN' && (
              <TextInput
                label="Phone Number"
                placeholder="123-456-7890"
                value={phone}
                onChange={(e) => setPhone(e.currentTarget.value)}
                leftSection={<IconPhone size={16} style={{ color: '#4D6580' }} />}
                styles={inputStyles}
              />
            )}

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-1">
              <Button
                id="reg-submit"
                type="submit"
                loading={isLoading}
                fullWidth
                size="md"
                radius="xl"
                rightSection={!isLoading && <IconArrowRight size={16} />}
                style={{
                  height: 48,
                  fontWeight: 600,
                  fontSize: '14px',
                  letterSpacing: '0.01em',
                  background: 'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(5,150,105,0.30)',
                }}
              >
                Create Account
              </Button>
            </motion.div>

            <p style={{ textAlign: 'center', fontSize: '13px', color: '#4D6580' }}>
              Already registered?{' '}
              <Link
                to="/login"
                style={{ color: '#60A5FA', fontWeight: 600, textDecoration: 'none' }}
              >
                Sign In Here
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
