import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Fab,
  Badge,
  useTheme,
  alpha,
  Paper,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Approval as ApprovalIcon,
  Analytics as AnalyticsIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Import sub-components
import DoctorList from './DoctorList';
import DoctorForm from './DoctorForm';
import DoctorScheduleManagement from './DoctorScheduleManagement';
import ScheduleApprovalQueue from './ScheduleApprovalQueue';
import DoctorAnalytics from './DoctorAnalytics';
import DoctorAssignments from './DoctorAssignments';

import axios from '../../../utils/axiosConfig';

const EnhancedDoctorManagement = () => {
  const theme = useTheme();
  const { user, token } = useSelector((state) => state.userAuth);
  
  // State management
  const [currentTab, setCurrentTab] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [pendingSchedules, setPendingSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDoctorForm, setOpenDoctorForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeDoctors: 0,
    pendingScheduleRequests: 0,
    averageExperience: 0,
    departmentDistribution: {}
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!user?.hospitalId || !token) return;

    try {
      setLoading(true);
      setError('');

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch doctors and pending schedule requests
      const [doctorsResponse, scheduleRequestsResponse] = await Promise.allSettled([
        axios.get('/api/doctors/hospital', config),
        axios.get('/api/doctors/schedule-requests/pending', config)
      ]);

      // Process doctors data
      if (doctorsResponse.status === 'fulfilled') {
        const doctorsData = doctorsResponse.value.data || [];
        setDoctors(doctorsData);
        
        // Calculate stats
        const totalDoctors = doctorsData.length;
        const activeDoctors = doctorsData.filter(doc => doc.status === 'active').length;
        const avgExperience = doctorsData.reduce((sum, doc) => sum + (doc.experience || 0), 0) / totalDoctors || 0;
        
        // Department distribution
        const deptDist = doctorsData.reduce((acc, doc) => {
          const dept = doc.department || 'General';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});

        setStats(prev => ({
          ...prev,
          totalDoctors,
          activeDoctors,
          averageExperience: Math.round(avgExperience * 10) / 10,
          departmentDistribution: deptDist
        }));
      }

      // Process schedule requests
      if (scheduleRequestsResponse.status === 'fulfilled') {
        const scheduleData = scheduleRequestsResponse.value.data || [];
        setPendingSchedules(scheduleData);
        setStats(prev => ({
          ...prev,
          pendingScheduleRequests: scheduleData.length
        }));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [token, user?.hospitalId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  // Refresh data
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle success/error messages
  const handleSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 5000);
    handleRefresh();
  };

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Tab panels
  const tabPanels = [
    {
      label: "Doctors",
      icon: <PeopleIcon />,
      component: (
        <DoctorList
          doctors={doctors}
          loading={loading}
          onEdit={(doctor) => setOpenDoctorForm(doctor)}
          onRefresh={handleRefresh}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )
    },
    {
      label: "Schedules",
      icon: <ScheduleIcon />,
      component: (
        <DoctorScheduleManagement
          doctors={doctors}
          onRefresh={handleRefresh}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )
    },
    {
      label: "Approvals",
      icon: <ApprovalIcon />,
      badge: stats.pendingScheduleRequests,
      component: (
        <ScheduleApprovalQueue
          pendingSchedules={pendingSchedules}
          onRefresh={handleRefresh}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )
    },
    {
      label: "Analytics",
      icon: <AnalyticsIcon />,
      component: (
        <DoctorAnalytics
          doctors={doctors}
          stats={stats}
        />
      )
    },
    {
      label: "Assignments",
      icon: <AssignmentIcon />,
      component: (
        <DoctorAssignments
          doctors={doctors}
          onRefresh={handleRefresh}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      )
    }
  ];

  if (loading && doctors.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                Doctor Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage doctors, schedules, and assignments for your hospital
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDoctorForm(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}`
                }
              }}
            >
              Add Doctor
            </Button>
          </Box>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                {error}
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                {success}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  borderRadius: 2
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'white'
                      }}
                    >
                      <PeopleIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {stats.totalDoctors}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Doctors
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  borderRadius: 2
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                        color: 'white'
                      }}
                    >
                      <ScheduleIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {stats.activeDoctors}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Doctors
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                  borderRadius: 2
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                        color: 'white'
                      }}
                    >
                      <ApprovalIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {stats.pendingScheduleRequests}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending Approvals
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  borderRadius: 2
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                        color: 'white'
                      }}
                    >
                      <AnalyticsIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold" color="info.main">
                        {stats.averageExperience}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg. Experience (Years)
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={itemVariants}>
          <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[3] }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minHeight: 60
                  }
                }}
              >
                {tabPanels.map((tab, index) => (
                  <Tab
                    key={index}
                    icon={
                      tab.badge ? (
                        <Badge badgeContent={tab.badge} color="error">
                          {tab.icon}
                        </Badge>
                      ) : (
                        tab.icon
                      )
                    }
                    label={tab.label}
                    iconPosition="start"
                    sx={{ gap: 1 }}
                  />
                ))}
              </Tabs>
            </Box>

            <CardContent sx={{ p: 0 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ p: 3 }}>
                    {tabPanels[currentTab].component}
                  </Box>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Floating Add Button for mobile */}
        <Fab
          color="primary"
          aria-label="add doctor"
          onClick={() => setOpenDoctorForm(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' },
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              transform: 'scale(1.1)'
            }
          }}
        >
          <AddIcon />
        </Fab>

        {/* Doctor Form Dialog */}
        <DoctorForm
          open={openDoctorForm}
          onClose={() => setOpenDoctorForm(false)}
          doctor={typeof openDoctorForm === 'object' ? openDoctorForm : null}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </Box>
    </motion.div>
  );
};

export default EnhancedDoctorManagement;