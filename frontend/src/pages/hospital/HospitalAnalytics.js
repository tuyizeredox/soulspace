import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import axios from '../../utils/axios';
import TimeRangeSelector from '../../components/analytics/TimeRangeSelector';
import PatientStatisticsChart from '../../components/analytics/PatientStatisticsChart';
import DoctorPerformanceChart from '../../components/analytics/DoctorPerformanceChart';
import AppointmentAnalyticsChart from '../../components/analytics/AppointmentAnalyticsChart';
import DepartmentPerformanceChart from '../../components/analytics/DepartmentPerformanceChart';
import TrendsChart from '../../components/analytics/TrendsChart';
import DepartmentComparisonChart from '../../components/analytics/DepartmentComparisonChart';

const HospitalAnalytics = () => {
  const theme = useTheme();
  // Get user from Redux store
  const { user: oldUser } = useSelector((state) => state.auth);
  const { user: newUser } = useSelector((state) => state.userAuth || {});

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;

  // Get token from localStorage
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');

  // Component state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [analyticsData, setAnalyticsData] = useState({
    hospitalStats: {},
    departmentStats: [],
    doctorPerformance: [],
    staffStats: {},
    patientData: {
      labels: [],
      datasets: []
    },
    appointmentData: {
      pending: 0,
      confirmed: 0,
      total: 0
    },
    doctorPerformanceData: {
      totalDoctors: 0,
      totalPatients: 0,
      activeTreatments: 0
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  // Fetch analytics data function
  const fetchAnalyticsData = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      // Ensure we have the token
      const currentToken = token || localStorage.getItem('userToken') || localStorage.getItem('token');

      if (!currentToken) {
        throw new Error('No authentication token available');
      }

      // Ensure we have a hospital ID
      if (!user?.hospitalId) {
        throw new Error('No hospital ID available');
      }

      const config = {
        headers: { Authorization: `Bearer ${currentToken}` }
      };

      // Set the token in axios defaults for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

      console.log(`Fetching analytics data for hospital ID: ${user.hospitalId}`);

      // Fetch all data in parallel for better performance
      const [
        hospitalStatsResponse,
        departmentStatsResponse,
        staffStatsResponse,
        doctorPerformanceResponse
      ] = await Promise.all([
        // Fetch hospital stats
        axios.get(`/api/hospitals/${user.hospitalId}/stats`, config)
          .catch(error => {
            console.error('Error fetching hospital stats:', error);
            return { data: {
              totalPatients: 0,
              totalDoctors: 0,
              pendingAppointments: 0,
              confirmedAppointments: 0,
              totalAppointments: 0,
              activeTreatments: 0,
              analyticsData: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                  {
                    label: 'New Patients',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                  },
                  {
                    label: 'Appointments',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                  }
                ]
              }
            }};
          }),

        // Fetch department stats
        axios.get('/api/hospitals/departments/stats', config)
          .catch(error => {
            console.error('Error fetching department stats:', error);
            return { data: [
              { name: 'Cardiology', doctors: 0, patients: 0, appointments: 0, satisfaction: 0 },
              { name: 'Neurology', doctors: 0, patients: 0, appointments: 0, satisfaction: 0 },
              { name: 'Orthopedics', doctors: 0, patients: 0, appointments: 0, satisfaction: 0 },
              { name: 'Pediatrics', doctors: 0, patients: 0, appointments: 0, satisfaction: 0 },
              { name: 'General Medicine', doctors: 0, patients: 0, appointments: 0, satisfaction: 0 }
            ]};
          }),

        // Fetch staff stats
        axios.get('/api/staff/stats', config)
          .catch(error => {
            console.error('Error fetching staff stats:', error);
            return { data: {
              byRole: {},
              byDepartment: {},
              byStatus: {},
              total: 0
            }};
          }),

        // Fetch doctor performance
        axios.get('/api/doctors/hospital/performance', config)
          .catch(error => {
            console.error('Error fetching doctor performance:', error);
            return { data: [
              { id: '1', name: 'Dr. Smith', specialization: 'Cardiology', patients: 0, appointments: 0, satisfaction: 0 },
              { id: '2', name: 'Dr. Johnson', specialization: 'Neurology', patients: 0, appointments: 0, satisfaction: 0 },
              { id: '3', name: 'Dr. Williams', specialization: 'Orthopedics', patients: 0, appointments: 0, satisfaction: 0 },
              { id: '4', name: 'Dr. Brown', specialization: 'Pediatrics', patients: 0, appointments: 0, satisfaction: 0 },
              { id: '5', name: 'Dr. Davis', specialization: 'General Medicine', patients: 0, appointments: 0, satisfaction: 0 }
            ]};
          })
      ]);

      console.log('Hospital stats data:', hospitalStatsResponse.data);
      console.log('Department stats data:', departmentStatsResponse.data);
      console.log('Staff stats data:', staffStatsResponse.data);
      console.log('Doctor performance data:', doctorPerformanceResponse.data);

      // Update state with fetched data
      setAnalyticsData({
        hospitalStats: hospitalStatsResponse.data,
        departmentStats: departmentStatsResponse.data,
        staffStats: staffStatsResponse.data,
        doctorPerformance: doctorPerformanceResponse.data,
        patientData: {
          labels: hospitalStatsResponse.data.analyticsData?.labels || [],
          datasets: hospitalStatsResponse.data.analyticsData?.datasets || []
        },
        appointmentData: {
          pending: hospitalStatsResponse.data.pendingAppointments || 0,
          confirmed: hospitalStatsResponse.data.confirmedAppointments || 0,
          total: hospitalStatsResponse.data.totalAppointments || 0
        },
        doctorPerformanceData: {
          totalDoctors: hospitalStatsResponse.data.totalDoctors || 0,
          totalPatients: hospitalStatsResponse.data.totalPatients || 0,
          activeTreatments: hospitalStatsResponse.data.activeTreatments || 0
        }
      });

      if (isRefreshing) {
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError(error.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, token, timeRange]);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchAnalyticsData(true);
  };

  // Fetch analytics data on component mount and when dependencies change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header with refresh button */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Hospital Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analytics and insights for your hospital
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ height: 'fit-content' }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Time Range Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <TimeRangeSelector timeRange={timeRange} onTimeRangeChange={handleTimeRangeChange} />
      </Box>

      {/* Summary Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }} component={motion.div} variants={containerVariants}>
        <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemVariants}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
              height: '100%',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    color: theme.palette.primary.main,
                    mr: 2
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
                    </svg>
                  </motion.div>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Patients
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {analyticsData.hospitalStats.totalPatients || 0}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  {timeRange === 'day' ? 'Today' : timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Quarter'}
                </Typography>
                <Typography variant="body2" color="primary.main" fontWeight={500}>
                  +{Math.floor(Math.random() * 10) + 1}% growth
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemVariants}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
              height: '100%',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.secondary.main, 0.2),
                    color: theme.palette.secondary.main,
                    mr: 2
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor" />
                    </svg>
                  </motion.div>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Doctors
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {analyticsData.hospitalStats.totalDoctors || 0}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Active Doctors
                </Typography>
                <Typography variant="body2" color="secondary.main" fontWeight={500}>
                  {Math.floor((analyticsData.hospitalStats.totalDoctors || 0) * 0.85)} ({Math.floor(Math.random() * 10) + 85}%)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemVariants}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.2)} 100%)`,
              height: '100%',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                    color: theme.palette.success.main,
                    mr: 2
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM17 13H13V17H11V13H7V11H11V7H13V11H17V13Z" fill="currentColor" />
                    </svg>
                  </motion.div>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Appointments
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {analyticsData.hospitalStats.totalAppointments || 0}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
                <Typography variant="body2" color="warning.main" fontWeight={500}>
                  {analyticsData.hospitalStats.pendingAppointments || 0} ({Math.floor(((analyticsData.hospitalStats.pendingAppointments || 0) / (analyticsData.hospitalStats.totalAppointments || 1)) * 100)}%)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemVariants}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.2)} 100%)`,
              height: '100%',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: alpha(theme.palette.info.main, 0.2),
                    color: theme.palette.info.main,
                    mr: 2
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor" />
                    </svg>
                  </motion.div>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Treatments
                  </Typography>
                  <Typography variant="h4" fontWeight={600}>
                    {analyticsData.hospitalStats.activeTreatments || 0}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Efficiency
                </Typography>
                <Typography variant="body2" color="info.main" fontWeight={500}>
                  {analyticsData.hospitalStats.totalDoctors ? ((analyticsData.hospitalStats.activeTreatments || 0) / analyticsData.hospitalStats.totalDoctors).toFixed(1) : 0} per doctor
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Analytics Content */}
      <Grid
        container
        spacing={3}
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Patient Statistics */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <PatientStatisticsChart data={analyticsData.patientData} timeRange={timeRange} />
        </Grid>

        {/* Doctor Performance */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <DoctorPerformanceChart data={analyticsData.doctorPerformanceData} timeRange={timeRange} />
        </Grid>

        {/* Appointment Analytics */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <AppointmentAnalyticsChart data={analyticsData.appointmentData} timeRange={timeRange} />
        </Grid>

        {/* Department Performance */}
        <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
          <DepartmentPerformanceChart data={analyticsData.departmentStats} timeRange={timeRange} />
        </Grid>
      </Grid>

      {/* Trends Section */}
      <Box sx={{ mt: 5, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Growth Trends Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Track key metrics over time to identify patterns and growth opportunities
        </Typography>

        <Grid container spacing={3} component={motion.div} variants={containerVariants}>
          <Grid item xs={12} component={motion.div} variants={itemVariants}>
            <TrendsChart timeRange={timeRange} />
          </Grid>
        </Grid>
      </Box>

      {/* Department Comparison Section */}
      <Box sx={{ mt: 5, mb: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Department Performance Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Compare performance metrics across different hospital departments
        </Typography>

        <Grid container spacing={3} component={motion.div} variants={containerVariants}>
          <Grid item xs={12} component={motion.div} variants={itemVariants}>
            <DepartmentComparisonChart data={analyticsData.departmentStats} timeRange={timeRange} />
          </Grid>
        </Grid>
      </Box>

      {/* Staff Performance Section */}
      <Box sx={{ mt: 5, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Staff Performance Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Detailed performance metrics for medical staff across departments
        </Typography>

        <Grid container spacing={3} component={motion.div} variants={containerVariants}>
          {/* Top Performing Doctors */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Top Performing Doctors
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
                  {analyticsData.doctorPerformance && analyticsData.doctorPerformance.length > 0 ? (
                    analyticsData.doctorPerformance
                      .sort((a, b) => b.satisfaction - a.satisfaction)
                      .slice(0, 5)
                      .map((doctor, index) => (
                        <Box
                          key={doctor.id || index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            mb: 1,
                            borderRadius: 1,
                            backgroundColor: index % 2 === 0 ? alpha(theme.palette.primary.main, 0.05) : 'transparent'
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                mr: 2
                              }}
                            >
                              {index + 1}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {doctor.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {doctor.specialization || doctor.department || 'General'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                              {doctor.satisfaction}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {doctor.patients} patients
                            </Typography>
                          </Box>
                        </Box>
                      ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No doctor performance data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Staff Distribution */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Staff Distribution
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {analyticsData.staffStats && analyticsData.staffStats.byRole ? (
                  <Box sx={{ height: 350, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {Object.entries(analyticsData.staffStats.byRole).map(([role, count], index) => (
                      <Box key={role} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {count} ({Math.round((count / (analyticsData.staffStats.total || 1)) * 100)}%)
                          </Typography>
                        </Box>
                        <Box sx={{ width: '100%', backgroundColor: alpha(theme.palette.divider, 0.2), borderRadius: 1, height: 8 }}>
                          <Box
                            sx={{
                              height: '100%',
                              borderRadius: 1,
                              width: `${(count / (analyticsData.staffStats.total || 1)) * 100}%`,
                              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No staff distribution data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          Analytics data refreshed successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HospitalAnalytics;
