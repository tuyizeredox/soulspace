import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Avatar,
  Divider,
  IconButton,
  useTheme,
  alpha,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  People,
  LocalHospital,
  CalendarMonth,
  Medication,
  PersonAdd as PersonAddIcon,
  EventAvailable as EventAvailableIcon,
  Chat as ChatIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import axios from '../../utils/axios';
import StatCard from '../../components/dashboard/StatCard';
import AdvancedAnalytics from '../../components/hospital/AdvancedAnalytics';
import StaffManagement from '../../components/hospital/StaffManagement';
import PatientManagement from '../../components/hospital/PatientManagement';
import { checkAuthStatus } from '../../store/slices/authSlice';
import { getCurrentUser } from '../../store/slices/userAuthSlice';
// Recharts components are used in the imported components

const HospitalAdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);

  // Get user data from all auth systems
  const { user: oldAuthUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: userAuthUser, token: newToken } = useSelector((state) => state.userAuth);
  // Get the latest user data from Redux store for use in callbacks
  const latestUserAuthUser = useSelector((state) => state.userAuth.user);
  const latestOldAuthUser = useSelector((state) => state.auth.user);

  // Use user from any available auth source
  const user = userAuthUser || oldAuthUser;

  // Use token from any available source
  const token = newToken || oldToken || localStorage.getItem('token') || localStorage.getItem('userToken');

  // Check auth status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!user || !token) {
        console.log('No user or token found, checking auth status');
        try {
          // Try both auth systems
          await dispatch(checkAuthStatus()).unwrap();
          await dispatch(getCurrentUser()).unwrap();
        } catch (error) {
          console.error('Auth check failed:', error);
          setError('Authentication failed. Please log in again.');
        }
      }
    };

    checkAuth();
  }, [dispatch, user, token]);

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
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };

  console.log('HospitalAdminDashboard: User data', {
    hospitalId: user?.hospitalId,
    hasToken: !!token
  });

  // Fetch additional data for the dashboard
  const fetchAdditionalData = useCallback(async () => {
    // Get the most up-to-date user data
    const currentUser = latestUserAuthUser || latestOldAuthUser || user;
    if (!currentUser?.hospitalId) return;

    try {
      // Ensure we have the latest token
      const currentToken = newToken ||
                          oldToken ||
                          localStorage.getItem('token') ||
                          localStorage.getItem('userToken');

      if (!currentToken) {
        console.error('No authentication token available for additional data');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${currentToken}` }
      };

      // Set the token in axios defaults as well for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

      // Fetch upcoming appointments
      const appointmentsResponse = await axios.get('/api/appointments/hospital', config);
      if (appointmentsResponse.data) {
        // Sort by date and take the next 5
        const upcoming = appointmentsResponse.data
          .filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
        setUpcomingAppointments(upcoming);
      }

      // Fetch recent patients
      const patientsResponse = await axios.get('/api/patients/hospital', config);
      if (patientsResponse.data) {
        // Sort by creation date and take the most recent 5
        const recent = patientsResponse.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
        setRecentPatients(recent);
      }

      // Create mock doctor performance data (replace with real API when available)
      const mockDoctorPerformance = [
        { name: 'Dr. Smith', patients: 45, satisfaction: 92, department: 'Cardiology' },
        { name: 'Dr. Johnson', patients: 38, satisfaction: 88, department: 'Neurology' },
        { name: 'Dr. Williams', patients: 52, satisfaction: 95, department: 'Orthopedics' },
        { name: 'Dr. Brown', patients: 31, satisfaction: 87, department: 'Pediatrics' },
        { name: 'Dr. Davis', patients: 42, satisfaction: 91, department: 'General Medicine' }
      ];
      setDoctorPerformance(mockDoctorPerformance);

      // Create mock department statistics (replace with real API when available)
      const mockDepartmentStats = [
        { name: 'Cardiology', patients: 120, appointments: 85, satisfaction: 90 },
        { name: 'Neurology', patients: 95, appointments: 72, satisfaction: 88 },
        { name: 'Orthopedics', patients: 110, appointments: 92, satisfaction: 93 },
        { name: 'Pediatrics', patients: 150, appointments: 105, satisfaction: 91 },
        { name: 'General Medicine', patients: 200, appointments: 145, satisfaction: 89 }
      ];
      setDepartmentStats(mockDepartmentStats);

      // Try to fetch real notifications if available, otherwise use mock data
      try {
        const notificationsResponse = await axios.get('/api/notifications', config);
        if (notificationsResponse.data && notificationsResponse.data.length > 0) {
          setNotifications(notificationsResponse.data);
        } else {
          // Fallback to mock notifications
          const mockNotifications = [
            { id: 1, type: 'appointment', message: 'New appointment request from John Doe', time: '10 minutes ago', read: false },
            { id: 2, type: 'message', message: 'Super Admin sent you a message', time: '1 hour ago', read: false },
            { id: 3, type: 'system', message: 'System maintenance scheduled for tonight', time: '3 hours ago', read: true },
            { id: 4, type: 'patient', message: 'Patient Sarah Johnson updated her information', time: '5 hours ago', read: true },
            { id: 5, type: 'doctor', message: 'Dr. Smith requested time off next week', time: '1 day ago', read: true }
          ];
          setNotifications(mockNotifications);
        }
      } catch (notificationError) {
        console.error('Error fetching notifications:', notificationError);
        // Fallback to mock notifications
        const mockNotifications = [
          { id: 1, type: 'appointment', message: 'New appointment request from John Doe', time: '10 minutes ago', read: false },
          { id: 2, type: 'message', message: 'Super Admin sent you a message', time: '1 hour ago', read: false },
          { id: 3, type: 'system', message: 'System maintenance scheduled for tonight', time: '3 hours ago', read: true },
          { id: 4, type: 'patient', message: 'Patient Sarah Johnson updated her information', time: '5 hours ago', read: true },
          { id: 5, type: 'doctor', message: 'Dr. Smith requested time off next week', time: '1 day ago', read: true }
        ];
        setNotifications(mockNotifications);
      }

    } catch (error) {
      console.error('Error fetching additional dashboard data:', error);
      // Don't set error state here to avoid blocking the main dashboard display
    }
  }, [latestUserAuthUser, latestOldAuthUser, user, newToken, oldToken]);

  // We already have the latest user data from Redux store at the top of the component

  // Use useCallback to memoize the function
  const fetchDashboardData = useCallback(async () => {
    // Get the most up-to-date user data
    const currentUser = latestUserAuthUser || latestOldAuthUser || user;

    if (!currentUser || !currentUser.hospitalId) {
      console.error('User or hospitalId is missing');

      // Try to refresh auth state before giving up
      try {
        console.log('Attempting to refresh auth state...');
        await dispatch(checkAuthStatus()).unwrap();
        await dispatch(getCurrentUser()).unwrap();

        // After refreshing auth state, we need to check if we have valid user data
        // We'll rely on the component re-rendering with the new user data from Redux
        setError('Refreshing user data...');
        setLoading(false);
        return;
      } catch (authError) {
        console.error('Failed to refresh auth state:', authError);
        setError('Authentication failed. Please log in again.');
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      console.log('HospitalAdminDashboard: Fetching dashboard data with token:', !!token);

      // Ensure we have the latest token
      const currentToken = newToken ||
                          oldToken ||
                          localStorage.getItem('token') ||
                          localStorage.getItem('userToken');

      if (!currentToken) {
        throw new Error('No authentication token available');
      }

      const config = {
        headers: { Authorization: `Bearer ${currentToken}` }
      };

      // Set the token in axios defaults as well for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

      const response = await axios.get(`/api/hospitals/${currentUser.hospitalId}/stats`, config);
      setStats(response.data);

      // Fetch additional data after the main stats are loaded
      await fetchAdditionalData();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Authentication failed. Please log in again.');
        // Redirect to login after a delay
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError('Error fetching dashboard data: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  }, [latestUserAuthUser, latestOldAuthUser, user, token, newToken, oldToken, dispatch, navigate, fetchAdditionalData]);
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Add fetchDashboardData as dependency


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ mb: { xs: 2, md: 0 } }}>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Welcome, {user?.name || 'Hospital Admin'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your hospital operations, staff, and patients from this dashboard.
                Here's your hospital's overview for today.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/hospital/patients')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Add Patient
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EventAvailableIcon />}
                onClick={() => navigate('/hospital/appointments')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Manage Appointments
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ChatIcon />}
                onClick={() => navigate('/hospital/chat')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Open Chat
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Stats Cards */}
        <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemVariants}>
            <StatCard
              title="Total Patients"
              value={stats.totalPatients || 0}
              icon={<People />}
              color="#1976d2"
              trend="+8% from last month"
              trendUp={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemVariants}>
            <StatCard
              title="Total Doctors"
              value={stats.totalDoctors || 0}
              icon={<LocalHospital />}
              color="#2e7d32"
              trend="+5% from last month"
              trendUp={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemVariants}>
            <StatCard
              title="Pending Appointments"
              value={stats.pendingAppointments || 0}
              icon={<CalendarMonth />}
              color="#ed6c02"
              trend="+12% from last month"
              trendUp={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} component={motion.div} variants={itemVariants}>
            <StatCard
              title="Active Treatments"
              value={stats.activeTreatments || 0}
              icon={<Medication />}
              color="#9c27b0"
              trend="+3% from last month"
              trendUp={true}
            />
          </Grid>
        </Grid>

        {/* Main Dashboard Content */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Advanced Analytics */}
            <AdvancedAnalytics
              departmentStats={departmentStats}
              doctorPerformance={doctorPerformance}
              onViewMore={() => navigate('/hospital/analytics')}
            />

            {/* Staff Management */}
            <StaffManagement
              onViewMore={() => navigate('/hospital/staff')}
            />

            {/* Patient Management */}
            <PatientManagement
              patientData={recentPatients}
              onViewMore={() => navigate('/hospital/patients')}
            />

            {/* Upcoming Appointments */}
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              sx={{ borderRadius: 3, overflow: 'hidden' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Upcoming Appointments
                  </Typography>
                  <Button
                    endIcon={<KeyboardArrowRightIcon />}
                    onClick={() => navigate('/hospital/appointments')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>

                {upcomingAppointments.length > 0 ? (
                  <List sx={{ width: '100%' }}>
                    {upcomingAppointments.map((appointment, index) => (
                      <React.Fragment key={appointment._id || index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                              <CalendarMonth />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={500}>
                                {appointment.patientName || 'Patient Name'}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time || '10:00 AM'}
                                </Typography>
                                {" — "}
                                {appointment.type || 'Regular Checkup'} with {appointment.doctorName || 'Dr. Smith'}
                              </>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={appointment.status || 'Pending'}
                              color={appointment.status === 'confirmed' ? 'success' : 'warning'}
                              size="small"
                              sx={{ borderRadius: 1 }}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < upcomingAppointments.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">No upcoming appointments</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Communication Center */}
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Communication Center
                    </Typography>
                    <Button
                      endIcon={<ChatIcon />}
                      onClick={() => navigate('/hospital/chat')}
                      sx={{ textTransform: 'none' }}
                    >
                      Open Chat
                    </Button>
                  </Box>
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1" paragraph>
                      Connect with Super Admin and other Hospital Admins
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ChatIcon />}
                      onClick={() => navigate('/hospital/chat')}
                      sx={{ borderRadius: 2, textTransform: 'none', mb: 2 }}
                      fullWidth
                    >
                      Start Chatting
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      You have 2 unread messages
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

            {/* Notifications */}
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Notifications
                  </Typography>
                  <IconButton size="small">
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>

                <List sx={{ width: '100%' }}>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id}>
                      <ListItem alignItems="flex-start" sx={{
                        bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 1
                      }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: getNotificationColor(notification.type, theme) }}>
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={notification.message}
                          secondary={notification.time}
                        />
                      </ListItem>
                      {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Recent Patients */}
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              sx={{ borderRadius: 3, overflow: 'hidden' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Patients
                  </Typography>
                  <Button
                    endIcon={<KeyboardArrowRightIcon />}
                    onClick={() => navigate('/hospital/patients')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>

                {recentPatients.length > 0 ? (
                  <List sx={{ width: '100%' }}>
                    {recentPatients.map((patient, index) => (
                      <React.Fragment key={patient._id || index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar>
                              {getInitials(patient.name || 'Unknown Patient')}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={500}>
                                {patient.name || 'Unknown Patient'}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {patient.email || 'No email'}
                                </Typography>
                                {" — "}
                                {patient.phone || 'No phone'}
                              </>
                            }
                          />
                        </ListItem>
                        {index < recentPatients.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">No recent patients</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

// Helper function to get notification icon based on type
const getNotificationIcon = (type) => {
  switch (type) {
    case 'appointment':
      return <CalendarMonth />;
    case 'message':
      return <ChatIcon />;
    case 'system':
      return <NotificationsIcon />;
    case 'patient':
      return <People />;
    case 'doctor':
      return <LocalHospital />;
    default:
      return <NotificationsIcon />;
  }
};

// Helper function to get notification color based on type
const getNotificationColor = (type, theme) => {
  switch (type) {
    case 'appointment':
      return theme.palette.primary.main;
    case 'message':
      return theme.palette.info.main;
    case 'system':
      return theme.palette.warning.main;
    case 'patient':
      return theme.palette.success.main;
    case 'doctor':
      return theme.palette.secondary.main;
    default:
      return theme.palette.primary.main;
  }
};

// Helper function to get initials from name
const getInitials = (name) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export default HospitalAdminDashboard;