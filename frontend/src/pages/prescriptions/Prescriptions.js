import React from 'react';
import { Box } from '@mui/material';
import Layout from '../../components/layout/Layout';
import PrescriptionDashboard from '../../components/doctor/prescriptions';

const Prescriptions = () => {
  return (
    <Layout>
      <Box sx={{ height: '100vh', overflow: 'hidden' }}>
        <PrescriptionDashboard />
      </Box>
    </Layout>
  );
};

export default Prescriptions;
