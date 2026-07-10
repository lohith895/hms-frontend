import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { TextInput, PasswordInput, Button, Text, Title } from '@mantine/core';
import {
  IconLock,
  IconMail,
  IconShield,
  IconStethoscope,
  IconHeartHandshake,
  IconFlask,
  IconPill,
  IconUser,
  IconAlertCircle,
  IconArrowRight,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppDispatch, RootState } from '../../../store';
import { login, clearError } from '../redux/authSlice';

type RoleType = 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_NURSE' | 'ROLE_PATIENT' | 'ROLE_PHARMACIST' | 'ROLE_LAB_TECHNICIAN';

interface RoleOption {
  role: RoleType;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  testEmail: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'ROLE_ADMIN',
    label: 'Admin',
    icon: IconShield,
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.1)',
    testEmail: 'admin@hms.com',
  },
  {
    role: 'ROLE_DOCTOR',
    label: 'Doctor',
    icon: IconStethoscope,
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.1)',
    testEmail: 'doctor@hms.com',
  },
  {
    role: 'ROLE_NURSE',
    label: 'Nurse',
    icon: IconHeartHandshake,
    color: '#34D399',
    bg: 'rgba(52,211,153,0.1)',
    testEmail: 'nurse@hms.com',
  },
  {
    role: 'ROLE_PATIENT',
    label: 'Patient',
    icon: IconUser,
    color: '#F472B6',
    bg: 'rgba(244,114,182,0.1)',
    testEmail: 'patient@hms.com',
  },
  {
    role: 'ROLE_PHARMACIST',
    label: 'Pharmacist',
    icon: IconPill,
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.1)',
    testEmail: 'pharmacist@hms.com',
  },
  {
    role: 'ROLE_LAB_TECHNICIAN',
    label: 'Laboratory',
    icon: IconFlask,
    color: '#22D3EE',
    bg: 'rgba(34,211,238,0.1)',
    testEmail: 'lab@hms.com',
  },
];

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

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<RoleType>('ROLE_PATIENT');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { isAuthenticated, isLoading, error, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, selectedRole]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const routes: Record<string, string> = {
      ROLE_ADMIN:          '/admin/dashboard',
      ROLE_DOCTOR:         '/doctor/dashboard',
      ROLE_NURSE:          '/nurse/dashboard',
      ROLE_PATIENT:        '/patient/dashboard',
      ROLE_PHARMACIST:     '/pharmacy/dashboard',
      ROLE_LAB_TECHNICIAN: '/lab/dashboard',
    };
    navigate(routes[user.role] ?? '/dashboard');
  }, [isAuthenticated, user, navigate]);

  const handleRoleSelect = (option: RoleOption) => {
    setSelectedRole(option.role);
    setUsernameOrEmail(option.testEmail);
    setPassword('password123');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ usernameOrEmail, password }));
  };

  const activeOpt = roleOptions.find((o) => o.role === selectedRole)!;

  return (
    <div
      style={{ background: '#080D1A' }}
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans py-10 px-4"
    >
      {/* ── Ambient glow orbs ── */}
      <div
        className="glow-orb-blue"
        style={{ width: '55%', height: '65%', top: '-15%', left: '-10%' }}
      />
      <div
        className="glow-orb-cyan"
        style={{ width: '45%', height: '55%', bottom: '-20%', right: '-8%' }}
      />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-10 items-center z-10">

        {/* ══ Left: Brand panel ══════════════════════════════ */}
        <motion.div
          className="md:col-span-5 flex flex-col justify-center space-y-8"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="HMS Logo" 
              style={{ height: '56px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }}
            />
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <Title
              order={1}
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.4rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(160deg, #F0F6FF 30%, #8BA3C7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Empowering Healthcare, Seamlessly.
            </Title>
            <Text style={{ color: '#4D6580', fontSize: '14px', lineHeight: 1.75 }}>
              HMS connects patients, doctors, nurses, laboratories, and
              pharmacists into a single, unified digital health network.
            </Text>
          </div>

          {/* Feature bullets */}
          <div
            className="space-y-3 border-l-2 pl-5 py-1"
            style={{ borderColor: '#1C2B46' }}
          >
            {[
              { label: 'End-to-End Encrypted', color: '#60A5FA' },
              { label: 'Real-Time Notifications', color: '#34D399' },
              { label: 'Role-Based Access Control', color: '#A78BFA' },
            ].map((f) => (
              <div key={f.label} className="flex items-center space-x-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
                <span style={{ color: '#8BA3C7', fontSize: '13px', fontWeight: 500 }}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══ Right: Login form ══════════════════════════════ */}
        <motion.div
          className="md:col-span-7"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15, ease: 'easeOut' }}
        >
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
            {/* Form header */}
            <div>
              <Title
                order={2}
                style={{
                  color: '#F0F6FF',
                  fontSize: '22px',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                }}
              >
                Sign In to Portal
              </Title>
              <Text style={{ color: '#4D6580', fontSize: '13px', marginTop: 4 }}>
                Select your department and enter credentials
              </Text>
            </div>

            {/* ── Role selector grid ── */}
            <div>
              <p style={{ color: '#8BA3C7', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Access Portal
              </p>
              <div className="grid grid-cols-3 gap-2.5">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedRole === opt.role;
                  return (
                    <motion.button
                      type="button"
                      key={opt.role}
                      id={`role-${opt.role.toLowerCase()}`}
                      onClick={() => handleRoleSelect(opt)}
                      whileHover={{ scale: 1.04, translateY: -2 }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px 8px',
                        borderRadius: '14px',
                        border: `1px solid ${isSelected ? opt.color + '50' : '#1C2B46'}`,
                        background: isSelected ? opt.bg : 'rgba(8,13,26,0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        outline: isSelected ? `2px solid ${opt.color}30` : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: isSelected ? `${opt.color}18` : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: opt.color,
                          marginBottom: 6,
                          transition: 'background 0.2s',
                        }}
                      >
                        <Icon size={18} stroke={1.8} />
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: isSelected ? '#F0F6FF' : '#4D6580',
                          transition: 'color 0.2s',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {opt.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* ── Error banner ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
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
                  <span style={{ color: '#FDA4AF', fontSize: '13px' }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Inputs ── */}
            <div className="space-y-4">
              <TextInput
                id="login-email"
                label="Username or Email"
                placeholder="Enter email or username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.currentTarget.value)}
                required
                leftSection={<IconMail size={16} style={{ color: '#4D6580' }} />}
                styles={inputStyles}
              />
              <PasswordInput
                id="login-password"
                label="Password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                leftSection={<IconLock size={16} style={{ color: '#4D6580' }} />}
                styles={inputStyles}
              />
            </div>

            {/* ── Forgot password ── */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                style={{ fontSize: '12px', color: '#4D6580', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#60A5FA')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4D6580')}
              >
                Forgot password?
              </Link>
            </div>

            {/* ── Submit ── */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                id="login-submit"
                type="submit"
                loading={isLoading}
                fullWidth
                size="md"
                radius="xl"
                onClick={handleSubmit as any}
                rightSection={!isLoading && <IconArrowRight size={16} />}
                style={{
                  height: 48,
                  fontWeight: 600,
                  fontSize: '14px',
                  letterSpacing: '0.01em',
                  background: 'linear-gradient(135deg, #2563EB 0%, #0891B2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(37,99,235,0.35)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
              >
                Access Portal
              </Button>
            </motion.div>

            {/* ── Footer link ── */}
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#4D6580' }}>
              New patient?{' '}
              <Link
                to="/register"
                style={{ color: '#60A5FA', fontWeight: 600, textDecoration: 'none' }}
              >
                Register here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
