import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TextInput, Button, Paper, Title, Text, Container, Box, Anchor } from '@mantine/core';
import { IconMail, IconArrowLeft } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import api from '../../../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [devResetLink, setDevResetLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setDevResetLink('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.data.message);
      if (res.data.devResetLink) {
        setDevResetLink(res.data.devResetLink);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
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
            Forgot Password?
          </Title>
          <Text c="#8BA3C7" size="sm" style={{ lineHeight: 1.5 }}>
            Enter your email address and we will send you instructions to reset your password.
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
          <form onSubmit={handleSubmit}>
            {error && (
              <Box mb="md" p="sm" style={{ backgroundColor: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.2)', borderRadius: '8px' }}>
                <Text size="sm" c="#FB7185" ta="center">{error}</Text>
              </Box>
            )}

            {success ? (
              <Box mb="md" p="md" style={{ backgroundColor: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px', textAlign: 'center' }}>
                <Text size="sm" c="#34D399" fw={600} mb="sm">{success}</Text>
                
                {devResetLink && (
                  <Box mt="md" p="sm" style={{ backgroundColor: 'rgba(8,13,26,0.6)', borderRadius: '8px' }}>
                    <Text size="xs" c="#8BA3C7" mb="xs">DEVELOPMENT ONLY - SIMULATED EMAIL LINK:</Text>
                    <Anchor href={devResetLink} c="cyan" fw={600} size="sm" style={{ wordBreak: 'break-all' }}>
                      {devResetLink}
                    </Anchor>
                  </Box>
                )}
              </Box>
            ) : (
              <TextInput
                label="Email Address"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                leftSection={<IconMail size={16} />}
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
            )}

            {!success && (
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
                Send Reset Link
              </Button>
            )}
            
            <Box ta="center" mt="xl">
              <Link to="/login" style={{ textDecoration: 'none', color: '#8BA3C7', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
                <IconArrowLeft size={14} /> Back to Login
              </Link>
            </Box>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ForgotPassword;
