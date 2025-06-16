import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  useTheme,
  alpha,
  Tabs,
  Tab,
} from '@mui/material';
import {
  People as PeopleIcon,
  LocalHospital as DoctorIcon,
  Event as AppointmentIcon,
  Assignment as StaffIcon,
} from '@mui/icons-material';

// Import the management components
import { 
  PatientManagement, 
  DoctorManagement, 
  AppointmentManagement 
} from './modern';

const HospitalAdminDashboard = () => {
  const theme = useTheme();
  const { user } = useSelector((state) => state.userAuth);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    { label: 'Patients', icon: <PeopleIcon />, component: <PatientManagement /> },
    { label: 'Doctors', icon: <DoctorIcon />, component: <DoctorManagement /> },
    { label: 'Appointments', icon: <AppointmentIcon />, component: <AppointmentManagement /> },
    { label: 'Staff', icon: <StaffIcon />, component: <div>Staff Management - Coming Soon</div> },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary.main" gutterBottom>
          Hospital Administration Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, {user?.name}. Manage your hospital operations from here.
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                },
              }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {tabs[activeTab]?.component}
      </Box>
    </Container>
  );
};

export default HospitalAdminDashboard;