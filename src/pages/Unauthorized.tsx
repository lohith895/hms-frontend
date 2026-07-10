import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Title, Text, Button } from '@mantine/core';
import { motion } from 'framer-motion';
import { IconAlertCircle } from '@tabler/icons-react';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-rose-500/10 blur-[120px] pointer-events-none"></div>

      <motion.div
        className="max-w-md w-full z-10"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        <Card 
          shadow="xl" 
          padding="xl" 
          radius="2xl" 
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-slate-950/50 text-center flex flex-col items-center p-8"
        >
          <div className="p-3.5 rounded-full bg-rose-500/10 text-rose-500 mb-4 animate-pulse">
            <IconAlertCircle size={40} />
          </div>
          
          <Title order={2} className="text-white text-xl font-bold tracking-tight mb-2">
            Access Denied
          </Title>
          
          <Text size="sm" className="text-slate-400 mb-6 leading-relaxed">
            You do not have administrative clearance or matching roles to view this hospital department portal.
          </Text>

          <Button
            component={Link}
            to="/dashboard"
            fullWidth
            size="md"
            radius="xl"
            className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 border-0"
          >
            Return to Dashboard
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
