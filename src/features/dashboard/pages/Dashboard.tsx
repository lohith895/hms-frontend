import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Text, Title, Badge, RingProgress, Popover, Indicator, ActionIcon, ScrollArea, Divider, Card, Loader, Box } from '@mantine/core';
import {
  IconLogout,
  IconUser,
  IconShield,
  IconStethoscope,
  IconHeartHandshake,
  IconFlask,
  IconPill,
  IconCalendar,
  IconFileText,
  IconActivity,
  IconTrendingUp,
  IconChevronRight,
  IconBell,
  IconReceipt2,
  IconDownload,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { AppDispatch, RootState } from '../../../store';
import { logout } from '../../authentication/redux/authSlice';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { notifications as mantineNotifications } from '@mantine/notifications';
import api from '../../../utils/api';
import AppointmentList from '../../appointments/components/AppointmentList';
import ReportsCenter from '../../reports/components/ReportsCenter';
import EMRHistory from '../../emr/components/EMRHistory';
import PharmacyPortal from '../../pharmacy/components/PharmacyPortal';
import LabTechnicianPortal from '../../laboratory/components/LabTechnicianPortal';
import PatientLabResults from '../../laboratory/components/PatientLabResults';
import FinanceManagerPortal from '../../billing/components/FinanceManagerPortal';
import PatientBilling from '../../billing/components/PatientBilling';
import AiAssistantWidget from '../../../components/AiAssistantWidget';
import ProfileModal from '../../../components/ProfileModal';

/* ── Animation variants ──────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 24 },
  },
};

/* ── Role config map ─────────────────────────────────── */
type RoleConfig = {
  title: string;
  icon: React.ComponentType<any>;
  accentColor: string;
  accentBg: string;
  accentGlow: string;
  headerGradient: string;
  badgeColor: string;
  description: string;
  stats: { label: string; value: string; desc: string; trend?: string }[];
  ringColor: string;
};

const getRoleConfig = (role: string): RoleConfig => {
  const map: Record<string, RoleConfig> = {
    ROLE_ADMIN: {
      title: 'System Administrator Control Center',
      icon: IconShield,
      accentColor: '#FBBF24',
      accentBg: 'rgba(251,191,36,0.08)',
      accentGlow: 'rgba(251,191,36,0.15)',
      headerGradient: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)',
      badgeColor: 'yellow',
      description: 'Manage users, assign roles, monitor audit logs, and oversee hospital operations.',
      stats: [
        { label: 'Total Doctors', value: '42', desc: 'Active consulting staff', trend: '+3 this month' },
        { label: 'Total Patients', value: '1,840', desc: 'Registered patients', trend: '+128 this month' },
        { label: 'System Uptime', value: '99.98%', desc: 'All services online', trend: 'Optimal' },
      ],
      ringColor: '#FBBF24',
    },
    ROLE_DOCTOR: {
      title: 'Physician Clinical Portal',
      icon: IconStethoscope,
      accentColor: '#60A5FA',
      accentBg: 'rgba(96,165,250,0.08)',
      accentGlow: 'rgba(96,165,250,0.15)',
      headerGradient: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
      badgeColor: 'blue',
      description: 'Review clinical histories, create EMR entries, prescribe medicines, and manage consultations.',
      stats: [
        { label: "Today's Appointments", value: '12', desc: '5 completed, 7 remaining', trend: 'On schedule' },
        { label: 'Pending EMRs', value: '3', desc: 'Requires clinical sign-off', trend: 'Action needed' },
        { label: 'Avg Consult Time', value: '18 min', desc: 'Optimal patient care', trend: '-2min vs last week' },
      ],
      ringColor: '#60A5FA',
    },
    ROLE_NURSE: {
      title: 'Nursing Care Operations Hub',
      icon: IconHeartHandshake,
      accentColor: '#34D399',
      accentBg: 'rgba(52,211,153,0.08)',
      accentGlow: 'rgba(52,211,153,0.15)',
      headerGradient: 'linear-gradient(135deg, #065F46 0%, #059669 100%)',
      badgeColor: 'green',
      description: 'Track vitals, manage ward assignments, administer medications, and assist clinical staff.',
      stats: [
        { label: 'Active Ward Patients', value: '28', desc: 'High attention: 4', trend: 'Stable' },
        { label: 'Task Completion', value: '9 / 15', desc: 'Hourly rounds checklist', trend: '60% done' },
        { label: 'Shift Handover', value: 'Ready', desc: 'Next shift: 19:00', trend: 'On time' },
      ],
      ringColor: '#34D399',
    },
    ROLE_PATIENT: {
      title: 'Personal Health Portal',
      icon: IconUser,
      accentColor: '#F472B6',
      accentBg: 'rgba(244,114,182,0.08)',
      accentGlow: 'rgba(244,114,182,0.15)',
      headerGradient: 'linear-gradient(135deg, #9D174D 0%, #DB2777 100%)',
      badgeColor: 'pink',
      description: 'View health records, browse prescriptions, check lab reports, and manage appointments.',
      stats: [
        { label: 'Upcoming Consults', value: '1', desc: 'Dr. Sarah Connor (Tomorrow, 10:00)', trend: 'Confirmed' },
        { label: 'Active Prescriptions', value: '2', desc: 'Lisinopril, Metformin', trend: 'Refill due in 5 days' },
        { label: 'Latest Lab Result', value: 'Normal', desc: 'CBC Panel (June 24)', trend: 'All clear' },
      ],
      ringColor: '#F472B6',
    },
    ROLE_PHARMACIST: {
      title: 'Pharmacy Inventory & Dispensing Hub',
      icon: IconPill,
      accentColor: '#A78BFA',
      accentBg: 'rgba(167,139,250,0.08)',
      accentGlow: 'rgba(167,139,250,0.15)',
      headerGradient: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)',
      badgeColor: 'violet',
      description: 'Dispense prescriptions, track drug stocks, monitor expiry dates, and manage suppliers.',
      stats: [
        { label: 'Pending Dispenses', value: '8', desc: 'Express queues: 3', trend: 'Urgent' },
        { label: 'Low Stock Alerts', value: '4 items', desc: 'Requires replenishment', trend: 'Action needed' },
        { label: 'Inventory Value', value: '$45.2K', desc: 'Secure drugs audited', trend: '+$1.2K this week' },
      ],
      ringColor: '#A78BFA',
    },
    ROLE_LAB_TECHNICIAN: {
      title: 'Diagnostic Laboratory Management',
      icon: IconFlask,
      accentColor: '#22D3EE',
      accentBg: 'rgba(34,211,238,0.08)',
      accentGlow: 'rgba(34,211,238,0.15)',
      headerGradient: 'linear-gradient(135deg, #164E63 0%, #0891B2 100%)',
      badgeColor: 'cyan',
      description: 'Review lab requests, record results, print reports, and calibrate diagnostic equipment.',
      stats: [
        { label: 'Pending Specimens', value: '14', desc: 'Urgent STAT: 2', trend: 'High priority' },
        { label: 'Completed Tests', value: '38', desc: 'Linked to EMR automatically', trend: '+6 today' },
        { label: 'Accuracy Rate', value: '99.9%', desc: 'Internal control verified', trend: 'Excellent' },
      ],
      ringColor: '#22D3EE',
    },
  };

  return (
    map[role] ?? {
      title: 'General Health Services Dashboard',
      icon: IconActivity,
      accentColor: '#60A5FA',
      accentBg: 'rgba(96,165,250,0.08)',
      accentGlow: 'rgba(96,165,250,0.15)',
      headerGradient: 'linear-gradient(135deg, #1D4ED8 0%, #0891B2 100%)',
      badgeColor: 'blue',
      description: 'General system operations dashboard.',
      stats: [{ label: 'Status', value: 'Online', desc: 'System operational' }],
      ringColor: '#60A5FA',
    }
  );
};

/* ── Component ───────────────────────────────────────── */
const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'reports' | 'emr' | 'pharmacy' | 'laboratory' | 'billing'>('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [myPrescriptions, setMyPrescriptions] = useState<any[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/dashboard/metrics');
      setDashboardStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/dashboard/analytics');
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard analytics', err);
    }
  };

  const fetchMyPrescriptions = async () => {
    setLoadingPrescriptions(true);
    try {
      const res = await api.get('/prescriptions/my');
      setMyPrescriptions(res.data);
    } catch (err) {
      console.error('Failed to load prescriptions', err);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleMarkNotificationsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.post('/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications read', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'dashboard') {
      fetchMetrics();
      if (user.role === 'ROLE_ADMIN') {
        fetchAnalytics();
      }
      if (user.role === 'ROLE_PATIENT') {
        fetchMyPrescriptions();
      }
    }
  }, [activeTab, user]);

  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    const socket = new SockJS('http://localhost:8080/ws-hms');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      client.subscribe('/user/queue/notifications', (message) => {
        if (message.body) {
          const newNotification = JSON.parse(message.body);
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          mantineNotifications.show({
            title: newNotification.title,
            message: newNotification.message,
            color: 'teal',
            autoClose: 5000,
          });
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!user) return null;

  const cfg = getRoleConfig(user.role);
  if (dashboardStats && dashboardStats.length > 0) {
    cfg.stats = dashboardStats;
  }
  const RoleIcon = cfg.icon;

  const modules = [
    { label: 'Electronic Records', icon: IconFileText, desc: 'Central patient files', status: 'Online' },
    { label: 'Appointments', icon: IconCalendar, desc: 'Consultation calendar', status: 'Online' },
    { label: 'Laboratory Diagnostics', icon: IconFlask, desc: 'Diagnostics queue & results', status: 'Online' },
    { label: 'Pharmacy Dispensary', icon: IconPill, desc: 'Prescription queue', status: 'Online' },
    { label: 'Billing & Payments', icon: IconReceipt2, desc: 'Invoices & claims', status: 'Online' },
  ];

  return (
    <motion.div
      style={{ background: '#080D1A', minHeight: '100vh', color: '#F0F6FF' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
    >

      {/* ══ Topbar ══════════════════════════════════════════ */}
      <header
        style={{
          background: 'rgba(14,22,40,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid #1C2B46',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          className="max-w-7xl mx-auto px-6 py-3.5 flex justify-between items-center"
        >
          {/* Brand */}
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="HMS Logo"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* User info + navigation + logout */}
          <div className="flex items-center space-x-4">
            {/* Header Navigation Links */}
            <div className="flex space-x-1.5 mr-2">
              <Button
                variant={activeTab === 'dashboard' ? 'light' : 'subtle'}
                size="xs"
                radius="md"
                onClick={() => setActiveTab('dashboard')}
                style={{ color: activeTab === 'dashboard' ? '#22D3EE' : '#8BA3C7' }}
              >
                Dashboard
              </Button>
              <Button
                variant={activeTab === 'appointments' ? 'light' : 'subtle'}
                size="xs"
                radius="md"
                onClick={() => setActiveTab('appointments')}
                style={{ color: activeTab === 'appointments' ? '#22D3EE' : '#8BA3C7' }}
              >
                Appointments
              </Button>
              {['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_PATIENT'].includes(user.role) && (
                <Button
                  variant={activeTab === 'emr' ? 'light' : 'subtle'}
                  size="xs"
                  radius="md"
                  onClick={() => setActiveTab('emr')}
                  style={{ color: activeTab === 'emr' ? '#22D3EE' : '#8BA3C7' }}
                >
                  Medical Records
                </Button>
              )}
              {['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_INVENTORY_MANAGER'].includes(user.role) && (
                <Button
                  variant={activeTab === 'pharmacy' ? 'light' : 'subtle'}
                  size="xs"
                  radius="md"
                  onClick={() => setActiveTab('pharmacy')}
                  style={{ color: activeTab === 'pharmacy' ? '#22D3EE' : '#8BA3C7' }}
                >
                  Pharmacy Dispensary
                </Button>
              )}
              {['ROLE_ADMIN', 'ROLE_LAB_TECHNICIAN', 'ROLE_PATIENT'].includes(user.role) && (
                <Button
                  variant={activeTab === 'laboratory' ? 'light' : 'subtle'}
                  size="xs"
                  radius="md"
                  onClick={() => setActiveTab('laboratory')}
                  style={{ color: activeTab === 'laboratory' ? '#22D3EE' : '#8BA3C7' }}
                >
                  Laboratory
                </Button>
              )}
              {['ROLE_ADMIN', 'ROLE_FINANCE_MANAGER', 'ROLE_PATIENT'].includes(user.role) && (
                <Button
                  variant={activeTab === 'billing' ? 'light' : 'subtle'}
                  size="xs"
                  radius="md"
                  onClick={() => setActiveTab('billing')}
                  style={{ color: activeTab === 'billing' ? '#22D3EE' : '#8BA3C7' }}
                >
                  Billing & Payments
                </Button>
              )}
              {['ROLE_ADMIN', 'ROLE_DEPARTMENT_HEAD', 'ROLE_LAB_TECHNICIAN', 'ROLE_PHARMACIST', 'ROLE_FINANCE_MANAGER', 'ROLE_INVENTORY_MANAGER'].includes(user.role) && (
                <Button
                  variant={activeTab === 'reports' ? 'light' : 'subtle'}
                  size="xs"
                  radius="md"
                  onClick={() => setActiveTab('reports')}
                  style={{ color: activeTab === 'reports' ? '#22D3EE' : '#8BA3C7' }}
                >
                  Reports
                </Button>
              )}
            </div>

            {/* Notification Bell */}
            <Popover width={320} position="bottom-end" withArrow shadow="md">
              <Popover.Target>
                <Indicator label={unreadCount} size={16} color="red" offset={3} disabled={unreadCount === 0}>
                  <ActionIcon
                    variant="subtle"
                    radius="md"
                    size="lg"
                    style={{ color: '#8BA3C7', border: '1px solid #1C2B46', backgroundColor: 'rgba(8,13,26,0.3)' }}
                    onClick={handleMarkNotificationsRead}
                  >
                    <IconBell size={18} />
                  </ActionIcon>
                </Indicator>
              </Popover.Target>
              <Popover.Dropdown style={{ backgroundColor: '#0E1628', borderColor: '#1C2B46', padding: '12px' }}>
                <Text size="sm" style={{ fontWeight: 700, color: '#F0F6FF', marginBottom: '8px' }}>System Alerts</Text>
                <Divider color="#1C2B46" mb="sm" />
                <ScrollArea.Autosize mah={250} type="hover">
                  {notifications.length === 0 ? (
                    <Text size="xs" style={{ color: '#8BA3C7', textAlign: 'center', padding: '20px' }}>
                      No new alerts
                    </Text>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {notifications.map((n: any) => (
                        <div
                          key={n.id}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            backgroundColor: n.read ? 'transparent' : 'rgba(34,211,238,0.06)',
                            borderLeft: n.read ? 'none' : '3px solid #06B6D4',
                          }}
                        >
                          <Text size="xs" style={{ fontWeight: 600, color: '#F0F6FF' }}>{n.title}</Text>
                          <Text size="xs" style={{ color: '#8BA3C7', marginTop: '2px', lineHeight: 1.3 }}>{n.message}</Text>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea.Autosize>
              </Popover.Dropdown>
            </Popover>

            <div
              className="hidden md:flex flex-col items-end cursor-pointer select-none"
              onClick={() => setProfileOpen(true)}
              title="Click to edit profile"
              style={{
                padding: '6px 10px',
                borderRadius: '10px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F6FF' }}>
                {user.firstName} {user.lastName}
              </span>
              <Badge
                size="xs"
                color={cfg.badgeColor}
                variant="light"
                radius="sm"
                style={{ marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}
              >
                {user.role.replace('ROLE_', '').replace(/_/g, ' ')}
              </Badge>
            </div>
            <Button
              variant="subtle"
              size="xs"
              radius="md"
              leftSection={<IconLogout size={14} />}
              onClick={handleLogout}
              style={{
                color: '#4D6580',
                border: '1px solid #1C2B46',
                background: 'transparent',
                fontWeight: 600,
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* ══ Main ════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {activeTab === 'appointments' && (
          <AppointmentList currentUser={user} />
        )}

        {activeTab === 'emr' && (
          <EMRHistory currentUser={user} />
        )}

        {activeTab === 'pharmacy' && (
          <PharmacyPortal currentUser={user} />
        )}

        {activeTab === 'laboratory' && (
          ['ROLE_ADMIN', 'ROLE_LAB_TECHNICIAN'].includes(user.role) ? (
            <LabTechnicianPortal currentUser={user} />
          ) : (
            <PatientLabResults currentUser={user} />
          )
        )}

        {activeTab === 'billing' && (
          ['ROLE_ADMIN', 'ROLE_FINANCE_MANAGER'].includes(user.role) ? (
            <FinanceManagerPortal />
          ) : (
            <PatientBilling />
          )
        )}

        {activeTab === 'reports' && (
          <ReportsCenter currentUser={user} />
        )}

        {activeTab === 'dashboard' && (
          <>
            {/* ── Welcome card ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="rounded-3xl p-8 relative overflow-hidden"
                style={{
                  background: 'rgba(14,22,40,0.75)',
                  border: '1px solid #1C2B46',
                  boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
                }}
              >
                {/* Glow blob */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    width: 350,
                    height: 350,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${cfg.accentGlow} 0%, transparent 70%)`,
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                  }}
                />

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center space-x-3">
                      {/* Role icon badge */}
                      <div
                        className="p-2.5 rounded-xl"
                        style={{ background: cfg.accentBg, color: cfg.accentColor }}
                      >
                        <RoleIcon size={22} stroke={1.8} />
                      </div>
                      <Title
                        order={2}
                        style={{ color: '#F0F6FF', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }}
                      >
                        {cfg.title}
                      </Title>
                    </div>

                    <Text style={{ color: '#8BA3C7', fontSize: '14px', lineHeight: 1.7 }}>
                      Welcome back,{' '}
                      <strong style={{ color: '#F0F6FF' }}>{user.firstName}</strong>.{' '}
                      {cfg.description}
                    </Text>

                    {/* Quick date/time indicator */}
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: '#10B981' }}
                      />
                      <span style={{ color: '#4D6580', fontSize: '12px', fontWeight: 600 }}>
                        Live — All systems operational
                      </span>
                    </div>
                  </div>

                  {/* Shift ring */}
                  <div className="flex-shrink-0 hidden lg:block">
                    <div
                      className="p-5 rounded-2xl flex items-center space-x-4"
                      style={{ background: 'rgba(8,13,26,0.6)', border: '1px solid #1C2B46' }}
                    >
                      <RingProgress
                        size={80}
                        roundCaps
                        thickness={6}
                        sections={[{ value: 75, color: cfg.ringColor }]}
                        label={
                          <Text size="xs" ta="center" style={{ fontWeight: 700, color: cfg.accentColor }}>
                            75%
                          </Text>
                        }
                      />
                      <div>
                        <Text size="xs" style={{ color: '#4D6580', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Shift Progress
                        </Text>
                        <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 600 }}>
                          6 hrs elapsed
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Key Metrics ── */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <IconTrendingUp size={16} style={{ color: '#4D6580' }} />
                <Title order={3} style={{ color: '#F0F6FF', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                  Key Operational Metrics
                </Title>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {cfg.stats.map((stat, i) => (
                  <motion.div key={i} variants={itemVariants}>
                    <div
                      className="stat-card p-6 rounded-2xl h-full"
                      style={{
                        background: 'rgba(14,22,40,0.7)',
                        border: '1px solid #1C2B46',
                      }}
                    >
                      <Text
                        size="xs"
                        style={{
                          color: '#4D6580',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          marginBottom: 8,
                        }}
                      >
                        {stat.label}
                      </Text>
                      <div
                        style={{
                          fontSize: '2rem',
                          fontWeight: 800,
                          color: cfg.accentColor,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.1,
                          marginBottom: 6,
                        }}
                      >
                        {stat.value}
                      </div>
                      <Text size="xs" style={{ color: '#8BA3C7', marginBottom: 6 }}>
                        {stat.desc}
                      </Text>
                      {stat.trend && (
                        <div
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full"
                          style={{
                            background: `${cfg.accentColor}12`,
                            border: `1px solid ${cfg.accentColor}25`,
                          }}
                        >
                          <span style={{ fontSize: '11px', fontWeight: 600, color: cfg.accentColor }}>
                            {stat.trend}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ── Admin Analytics Charts ── */}
            {user.role === 'ROLE_ADMIN' && analyticsData && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <IconTrendingUp size={16} style={{ color: '#FBBF24' }} />
                  <Title order={3} style={{ color: '#F0F6FF', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                    Hospital Analytics Insights
                  </Title>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Chart 1: Today's Appointment Trend */}
                  <Card radius="lg" p="lg" style={{ background: 'rgba(14,22,40,0.7)', border: '1px solid #1C2B46' }}>
                    <Text size="sm" style={{ color: '#8BA3C7', fontWeight: 700, marginBottom: '16px' }}>Today's Appointment Load</Text>
                    <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '20px' }}>
                      {(() => {
                        const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
                        const hourlyMap: Record<number, number> = {};
                        (analyticsData.todayHourlyAppointments || []).forEach((item: any) => {
                          hourlyMap[item.hour] = item.count;
                        });
                        const maxCount = Math.max(...hours.map(h => hourlyMap[h] || 0), 1);
                        
                        return hours.map((hour) => {
                          const count = hourlyMap[hour] || 0;
                          const heightPct = (count / maxCount) * 100;
                          return (
                            <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                                <div 
                                  style={{ 
                                    width: '100%', 
                                    height: `${Math.max(heightPct, 6)}%`, 
                                    background: count > 0 ? 'linear-gradient(to top, #3B82F6, #06B6D4)' : 'rgba(28,43,70,0.3)',
                                    borderRadius: '4px 4px 0 0',
                                    transition: 'height 0.3s ease',
                                    boxShadow: count > 0 ? '0 0 10px rgba(6,182,212,0.3)' : 'none'
                                  }} 
                                  title={`${count} appointments at ${hour}:00`}
                                />
                              </div>
                              <Text style={{ color: '#4D6580', marginTop: '6px', fontSize: '9px', fontWeight: 600 }}>{hour}</Text>
                              <Text style={{ color: count > 0 ? '#22D3EE' : '#4D6580', fontSize: '10px', fontWeight: 700 }}>{count}</Text>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </Card>

                  {/* Chart 2: Monthly Revenue Streams */}
                  <Card radius="lg" p="lg" style={{ background: 'rgba(14,22,40,0.7)', border: '1px solid #1C2B46' }}>
                    <Text size="sm" style={{ color: '#8BA3C7', fontWeight: 700, marginBottom: '16px' }}>Monthly Revenue Streams</Text>
                    {(() => {
                      const billing = analyticsData.monthlyRevenue?.billingRevenue || 0;
                      const pharmacy = analyticsData.monthlyRevenue?.pharmacySales || 0;
                      const total = billing + pharmacy || 1;
                      const billingPct = (billing / total) * 100;
                      const pharmacyPct = (pharmacy / total) * 100;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '180px', justifyContent: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Consultation Billing ({billingPct.toFixed(0)}%)</Text>
                              <Text size="xs" style={{ color: '#F0F6FF', fontWeight: 700 }}>₹{billing.toLocaleString()}</Text>
                            </div>
                            <div style={{ height: '10px', backgroundColor: 'rgba(28,43,70,0.4)', borderRadius: '5px', overflow: 'hidden' }}>
                              <div style={{ width: `${billingPct}%`, height: '100%', background: 'linear-gradient(to right, #3B82F6, #60A5FA)', borderRadius: '5px' }} />
                            </div>
                          </div>

                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Pharmacy Sales ({pharmacyPct.toFixed(0)}%)</Text>
                              <Text size="xs" style={{ color: '#F0F6FF', fontWeight: 700 }}>₹{pharmacy.toLocaleString()}</Text>
                            </div>
                            <div style={{ height: '10px', backgroundColor: 'rgba(28,43,70,0.4)', borderRadius: '5px', overflow: 'hidden' }}>
                              <div style={{ width: `${pharmacyPct}%`, height: '100%', background: 'linear-gradient(to right, #10B981, #34D399)', borderRadius: '5px' }} />
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid #1C2B46', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <Text size="xs" style={{ color: '#8BA3C7', fontWeight: 600 }}>Total Revenue</Text>
                            <Text size="sm" style={{ color: '#22D3EE', fontWeight: 800 }}>₹{Math.round(total).toLocaleString()}</Text>
                          </div>
                        </div>
                      );
                    })()}
                  </Card>

                  {/* Chart 3: Top Doctors by Patient Load */}
                  <Card radius="lg" p="lg" style={{ background: 'rgba(14,22,40,0.7)', border: '1px solid #1C2B46' }}>
                    <Text size="sm" style={{ color: '#8BA3C7', fontWeight: 700, marginBottom: '16px' }}>Top Doctors (Last 30 Days)</Text>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '180px', overflowY: 'auto' }}>
                      {analyticsData.topDoctors && analyticsData.topDoctors.length > 0 ? (
                        analyticsData.topDoctors.map((doc: any, idx: number) => {
                          const maxCount = analyticsData.topDoctors[0].appointmentCount || 1;
                          const pct = (doc.appointmentCount / maxCount) * 100;
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text size="xs" style={{ color: '#F0F6FF', fontWeight: 600 }}>{doc.doctorName}</Text>
                                <Text size="xs" style={{ color: '#22D3EE', fontWeight: 700 }}>{doc.appointmentCount} appts</Text>
                              </div>
                              <div style={{ height: '6px', backgroundColor: 'rgba(28,43,70,0.4)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(to right, #A78BFA, #C084FC)', borderRadius: '3px' }} />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <Text size="xs" style={{ color: '#4D6580', textAlign: 'center', marginTop: '40px' }}>No appointment data available</Text>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ── Patient Current Prescriptions ── */}
            {user.role === 'ROLE_PATIENT' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <IconPill size={16} style={{ color: '#F472B6' }} />
                  <Title order={3} style={{ color: '#F0F6FF', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                    My Current Prescriptions
                  </Title>
                </div>

                {loadingPrescriptions ? (
                  <Box style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                    <Loader size="sm" color="pink" />
                  </Box>
                ) : myPrescriptions.length === 0 ? (
                  <Card radius="lg" p="lg" style={{ background: 'rgba(14,22,40,0.5)', border: '1px solid #1C2B46', textAlign: 'center' }}>
                    <Text size="sm" style={{ color: '#8BA3C7' }}>No prescriptions found in your record.</Text>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myPrescriptions.map((rx: any) => (
                      <Card key={rx.id} radius="lg" p="lg" style={{ background: 'rgba(14,22,40,0.7)', border: '1px solid #1C2B46' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                          <div>
                            <Text size="sm" style={{ color: '#F0F6FF', fontWeight: 700 }}>{rx.doctorName || 'Attending Doctor'}</Text>
                            <Text size="xs" style={{ color: '#8BA3C7', marginTop: '2px' }}>
                              Prescribed on: {rx.prescribedDate ? new Date(rx.prescribedDate).toLocaleDateString() : 'Unknown'}
                            </Text>
                          </div>
                          <Badge color={rx.status === 'DISPENSED' ? 'teal' : 'pink'}>{rx.status}</Badge>
                        </div>
                        <Divider color="#1C2B46" my="sm" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                          {(rx.items || []).map((item: any) => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text size="xs" style={{ color: '#F0F6FF' }}>• {item.medicineName}</Text>
                              <Text size="xs" style={{ color: '#8BA3C7' }}>{item.dosage} | {item.frequency} | {item.durationDays} days</Text>
                            </div>
                          ))}
                        </div>
                        <Button
                          variant="light"
                          color="pink"
                          size="xs"
                          fullWidth
                          leftSection={<IconDownload size={14} />}
                          onClick={async () => {
                            try {
                              const res = await api.get(`/prescriptions/${rx.id}/pdf`, { responseType: 'blob' });
                              const blob = new Blob([res.data], { type: 'application/pdf' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `prescription-RX-${rx.id}.pdf`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              window.URL.revokeObjectURL(url);
                            } catch (err) {
                              console.error("Failed to download prescription PDF", err);
                            }
                          }}
                        >
                          Download Digital Prescription PDF
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── HMS Modules ── */}
            <div className="space-y-4 pb-8">
              <Title order={3} style={{ color: '#F0F6FF', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Integrated HMS Modules
              </Title>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {modules.map((mod, index) => {
                  const Icon = mod.icon;
                  const isOnline = mod.status === 'Online';
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.03, translateY: -3 }}
                      whileTap={{ scale: 0.98 }}
                      className="module-card cursor-pointer"
                      onClick={() => {
                        if (mod.label === 'Appointments') {
                          setActiveTab('appointments');
                        } else if (mod.label === 'Electronic Records' && ['ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_PATIENT'].includes(user.role)) {
                          setActiveTab('emr');
                        } else if (mod.label === 'Pharmacy Dispensary' && ['ROLE_ADMIN', 'ROLE_PHARMACIST', 'ROLE_INVENTORY_MANAGER'].includes(user.role)) {
                          setActiveTab('pharmacy');
                        } else if (mod.label === 'Laboratory Diagnostics' && ['ROLE_ADMIN', 'ROLE_LAB_TECHNICIAN', 'ROLE_PATIENT'].includes(user.role)) {
                          setActiveTab('laboratory');
                        } else if (mod.label === 'Billing & Payments' && ['ROLE_ADMIN', 'ROLE_FINANCE_MANAGER', 'ROLE_PATIENT'].includes(user.role)) {
                          setActiveTab('billing');
                        }
                      }}
                    >
                      <div
                        className="p-5 rounded-2xl h-36 flex flex-col justify-between"
                        style={{
                          background: 'rgba(8,13,26,0.7)',
                          border: '1px solid #1C2B46',
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className="p-2 rounded-xl"
                            style={{
                              background: isOnline ? 'rgba(34,211,238,0.1)' : 'rgba(28,43,70,0.6)',
                              color: isOnline ? '#22D3EE' : '#4D6580',
                            }}
                          >
                            <Icon size={18} stroke={1.8} />
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <div
                              className={isOnline ? 'w-1.5 h-1.5 rounded-full' : 'w-1.5 h-1.5 rounded-full'}
                              style={{
                                backgroundColor: isOnline ? '#10B981' : '#4D6580',
                                boxShadow: isOnline ? '0 0 6px rgba(16,185,129,0.6)' : 'none',
                              }}
                            />
                            <span style={{ fontSize: '10px', fontWeight: 600, color: isOnline ? '#34D399' : '#4D6580', letterSpacing: '0.04em' }}>
                              {mod.status}
                            </span>
                          </div>
                        </div>

                        <div>
                          <Text
                            size="sm"
                            style={{ color: '#C8D9F5', fontWeight: 600, marginBottom: 3 }}
                          >
                            {mod.label}
                          </Text>
                          <div className="flex items-center justify-between">
                            <Text size="xs" style={{ color: '#4D6580' }}>
                              {mod.desc}
                            </Text>
                            <IconChevronRight size={14} style={{ color: '#4D6580' }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </>
        )}
      </main>
      <AiAssistantWidget />
      <ProfileModal opened={profileOpen} onClose={() => setProfileOpen(false)} />
    </motion.div>
  );
};

export default Dashboard;
