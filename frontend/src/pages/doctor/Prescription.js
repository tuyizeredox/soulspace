import React from 'react';
import { Box } from '@mui/material';
import PrescriptionDashboard from '../../components/doctor/prescriptions';

const Prescription = () => {
  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }}>
      <PrescriptionDashboard />
    </Box>
  );
};

export default Prescription;
