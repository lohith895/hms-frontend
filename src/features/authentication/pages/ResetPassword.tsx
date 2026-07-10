import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TextInput, Button, Paper, Title, Text, Container, Box } from '@mantine/core';
import { IconLock, IconArrowLeft, IconCheck } from '@tabler/icons-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={420} my={80}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box ta="center" mb={30}>
          <Title
            style={{
              color: '#F0F6FF',
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '10px'
            }}
          >
            Create New Password
          </Title>
          <Text c="#8BA3C7" size="sm" style={{ lineHeight: 1.5 }}>
            Please enter your new password below. Ensure it is at least 6 characters long.
          </Text>
        </Box>

        <Paper
          withBorder
          shadow="md"
          p={30}
          mt={30}
          radius="lg"
          style={{
            backgroundColor: 'rgba(14,22,40,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #1C2B46',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {success ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center', padding: '20px 0' }}
            >
              <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(52,211,153,0.1)', color: '#34D399', marginBottom: '20px' }}>
                <IconCheck size={32} />
              </div>
              <Title order={3} c="#F0F6FF" mb="sm">Password Reset Successful</Title>
              <Text c="#8BA3C7" size="sm" mb="xl">
                Your password has been successfully updated. You will be redirected to the login page momentarily.
              </Text>
              <Button
                fullWidth
                variant="light"
                color="cyan"
                onClick={() => navigate('/login')}
              >
                Go to Login Now
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <Box mb="md" p="sm" style={{ backgroundColor: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: '8px' }}>
                  <Text size="sm" c="#FB7185" ta="center">{error}</Text>
                </Box>
              )}

              <TextInput
                label="New Password"
                placeholder="Enter new password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                leftSection={<IconLock size={16} />}
                mb="md"
                styles={{
                  input: {
                    backgroundColor: 'rgba(8,13,26,0.6)',
                    borderColor: '#1C2B46',
                    color: '#F0F6FF',
                    height: '46px',
                    '&:focus': { borderColor: '#3B82F6' }
                  },
                  label: {
                    color: '#8BA3C7',
                    marginBottom: '8px',
                    fontSize: '13px',
                    fontWeight: 600
                  }
                }}
              />
              
              <TextInput
                label="Confirm New Password"
                placeholder="Confirm your new password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                leftSection={<IconLock size={16} />}
                mb="xl"
                styles={{
                  input: {
                    backgroundColor: 'rgba(8,13,26,0.6)',
                    borderColor: '#1C2B46',
                    color: '#F0F6FF',
                    height: '46px',
                    '&:focus': { borderColor: '#3B82F6' }
                  },
                  label: {
                    color: '#8BA3C7',
                    marginBottom: '8px',
                    fontSize: '13px',
                    fontWeight: 600
                  }
                }}
              />

              <Button
                fullWidth
                mt="xl"
                size="md"
                type="submit"
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)',
                  border: 'none',
                  height: '46px',
                  fontWeight: 600,
                  transition: 'transform 0.2s',
                }}
              >
                Reset Password
              </Button>
              
              <Box ta="center" mt="xl">
                <Link to="/login" style={{ textDecoration: 'none', color: '#8BA3C7', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                  <IconArrowLeft size={14} /> Back to Login
                </Link>
              </Box>
            </form>
          )}
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ResetPassword;
