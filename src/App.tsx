import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, MantineProvider } from '@mantine/core';
import Login from './features/authentication/pages/Login';
import Register from './features/authentication/pages/Register';
import ForgotPassword from './features/authentication/pages/ForgotPassword';
import ResetPassword from './features/authentication/pages/ResetPassword';
import Dashboard from './features/dashboard/pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './features/authentication/components/ProtectedRoute';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { Notifications } from '@mantine/notifications';

const theme = createTheme({
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  colors: {
    // Sapphire Blue — primary brand color
    primary: [
      '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD',
      '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8',
      '#1E40AF', '#1E3A8A', '#172554'
    ],
    // Cyan — accent / online states
    accent: [
      '#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9',
      '#22D3EE', '#06B6D4', '#0891B2', '#0E7490',
      '#155E75', '#164E63', '#083344'
    ],
    // Emerald — success / health
    success: [
      '#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7',
      '#34D399', '#10B981', '#059669', '#047857',
      '#065F46', '#064E3B', '#022C22'
    ],
    // Navy — surface / neutral
    navy: [
      '#F0F6FF', '#C8D9F5', '#8BA3C7', '#5A7FA8',
      '#2D5A8A', '#1C3F63', '#142D47', '#0E1F32',
      '#0A1525', '#080D1A', '#040810'
    ],
  },
  primaryColor: 'primary',
  defaultRadius: 'md',
  other: {
    // Expose tokens for inline use
    bgBase:      '#080D1A',
    bgSurface:   '#0E1628',
    bgElevated:  '#131E35',
    bgBorder:    '#1C2B46',
    textPrimary: '#F0F6FF',
    textMuted:   '#8BA3C7',
  },
});

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Role-Specific Portal Route Aliases */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['ROLE_DOCTOR']} />}>
              <Route path="/doctor/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['ROLE_NURSE']} />}>
              <Route path="/nurse/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['ROLE_PATIENT']} />}>
              <Route path="/patient/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['ROLE_PHARMACIST']} />}>
              <Route path="/pharmacy/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={['ROLE_LAB_TECHNICIAN']} />}>
              <Route path="/lab/dashboard" element={<Dashboard />} />
            </Route>
          </Route>

          {/* Catch-all Redirects */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
}

export default App;
