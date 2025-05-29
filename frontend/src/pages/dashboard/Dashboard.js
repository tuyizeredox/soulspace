import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
  Divider,
  IconButton,
  Button,
  useTheme,
  alpha,
  CircularProgress,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  CalendarMonth,
  People,
  LocalHospital,
  TrendingUp,
  MoreVert,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  PersonAdd,
  MedicalServices,
  MonitorHeart,
  Medication,
  SmartToy,
  FitnessCenter,
  Restaurant,
  Spa,
  NightsStay,
  WbSunny,
  LocalHospitalOutlined,
  BookOnline,
  VideoCall,
  Chat,
  Menu as MenuIcon,
  Notifications,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  EventAvailable,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from '../../utils/axios';
import NoHospitalDashboard from '../../components/dashboard/NoHospitalDashboard';
import AiHealthAssistant from '../../components/dashboard/AiHealthAssistant';
import PatientDashboardRouter from '../../components/routing/PatientDashboardRouter';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: oldUser, isAuthenticated: oldAuth, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, isAuthenticated: newAuth, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const isAuthenticated = newAuth || oldAuth;
  const user = newUser || oldUser;
  const token = newToken || oldToken;
  const theme = useTheme();
  const [patientAssignment, setPatientAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Function to refresh dashboard data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('Dashboard: Refreshing data with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      // Refresh patient assignment if user is a patient
      if (user?.role === 'patient') {
        const response = await axios.get('/api/patient-assignments/my-assignment', config);
        setPatientAssignment(response.data);
      }

      // Add other data refresh logic here based on user role

      // Simulate a delay for the refresh animation
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setRefreshing(false);
    }
  }, [user, token]);

  // Check authentication on page load/refresh
  useEffect(() => {
    // Use a flag to prevent state updates after unmounting
    let isMounted = true;

    const checkAuth = async () => {
      // If token exists but user data is missing, we need to fetch user data
      if (token && !user) {
        try {
          // Try to get user data from localStorage first
          const userData = localStorage.getItem('userData');
          if (userData && isMounted) {
            // Use the cached data while we fetch the latest
            console.log('Using cached user data while fetching latest');
          } else if (isMounted) {
            // If no cached data, redirect to login
            navigate('/login');
          }
        } catch (error) {
          console.error('Error checking authentication:', error);
          if (isMounted) {
            navigate('/login');
          }
        }
      }

      // If not authenticated, redirect to login
      if (!isAuthenticated && isMounted) {
        navigate('/login');
      }
    };

    checkAuth();

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, token, user, navigate]);

  // Check if the patient has a hospital assignment
  useEffect(() => {
    const checkPatientAssignment = async () => {
      if (user?.role === 'patient') {
        try {
          setLoading(true);
          console.log('Dashboard: Checking patient assignment with token:', !!token);

          const config = {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          };

          const response = await axios.get('/api/patient-assignments/my-assignment', config);
          
          // Log the response for debugging
          console.log('Dashboard: Patient assignment response:', response.data);
          
          // Check if the response indicates an assignment
          if (response.data && response.data.assigned === true) {
            // Verify that the assignment has the required data
            if (response.data.primaryDoctor && response.data.hospital) {
              console.log('Dashboard: Valid patient assignment found with doctor and hospital');
              setPatientAssignment(response.data);
            } else {
              console.warn('Dashboard: Assignment missing primaryDoctor or hospital');
              setPatientAssignment(null);
            }
          } else if (response.data && !response.data.hasOwnProperty('assigned')) {
            // The API returned data but without an assigned property
            // Check if it has the required fields to be considered a valid assignment
            if (response.data.primaryDoctor && response.data.hospital) {
              // Add an assigned property for consistency
              const enhancedAssignment = {
                ...response.data,
                assigned: true
              };
              console.log('Dashboard: Enhanced assignment with assigned property');
              setPatientAssignment(enhancedAssignment);
            } else {
              console.warn('Dashboard: Response missing required fields');
              setPatientAssignment(null);
            }
          } else {
            // No assignment or assigned is false
            console.log('Dashboard: No valid patient assignment found');
            setPatientAssignment(null);
          }
        } catch (error) {
          console.error('Error fetching patient assignment:', error);
          // If there's an error or no assignment found, patientAssignment will remain null
          setPatientAssignment(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (user) {
      checkPatientAssignment();
    }
  }, [user, token]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Example data for charts

  const patientData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'New Patients',
        data: [20, 35, 15, 45, 30],
        backgroundColor: theme.palette.secondary.main,
        borderRadius: 6,
        barThickness: 12,
        maxBarThickness: 20,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        bodyFont: {
          family: theme.typography.fontFamily
        },
        titleFont: {
          family: theme.typography.fontFamily,
          weight: 'bold'
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: theme.typography.fontFamily
          }
        }
      },
      y: {
        grid: {
          borderDash: [2],
          drawBorder: false,
          color: theme.palette.divider,
        },
        ticks: {
          font: {
            family: theme.typography.fontFamily
          }
        }
      },
    },
  };

  // Stats data

  const doctorStats = [
    { title: 'My Patients', value: '124', icon: <People />, color: theme.palette.primary.main, trend: '+5%', trendUp: true },
    { title: 'Today\'s Appointments', value: '8', icon: <CalendarMonth />, color: theme.palette.success.main, trend: '2 pending', trendUp: null },
    { title: 'Completed Visits', value: '1,284', icon: <MedicalServices />, color: theme.palette.info.main, trend: '+12%', trendUp: true },
    { title: 'Patient Satisfaction', value: '94%', icon: <TrendingUp />, color: theme.palette.secondary.main, trend: '+2%', trendUp: true },
  ];

  const patientStats = [
    { title: 'Upcoming Appointments', value: '3', icon: <CalendarMonth />, color: theme.palette.primary.main, trend: 'Next: Jun 15', trendUp: null },
    { title: 'Prescriptions', value: '8', icon: <Medication />, color: theme.palette.success.main, trend: '2 active', trendUp: null },
    { title: 'Health Score', value: '85', icon: <MonitorHeart />, color: theme.palette.info.main, trend: '+5%', trendUp: true },
    { title: 'Medical Records', value: '12', icon: <MedicalServices />, color: theme.palette.secondary.main, trend: 'Updated', trendUp: null },
  ];

  // Stat card component
  const StatCard = ({ title, value, icon, color, trend, trendUp }) => (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          p: 1,
        }}
      >
        <IconButton size="small">
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trendUp !== null && (
              trendUp ? (
                <ArrowUpward fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
              ) : (
                <ArrowDownward fontSize="small" sx={{ color: theme.palette.error.main, mr: 0.5 }} />
              )
            )}
            <Typography
              variant="body2"
              color={trendUp === true ? 'success.main' : trendUp === false ? 'error.main' : 'text.secondary'}
              fontWeight={500}
            >
              {trend}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            vs. last month
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // State for hospital admin dashboard
  const [showChat, setShowChat] = useState(false);
  const [hospitalStats, setHospitalStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    pendingAppointments: 0,
    activeTreatments: 0
  });
  const [doctorPerformance, setDoctorPerformance] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch hospital admin specific data
  const fetchHospitalAdminData = useCallback(async () => {
    if (user?.role !== 'hospital_admin' || !user?.hospitalId) return;

    try {
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      // Fetch hospital stats
      try {
        // Make sure we have a valid hospitalId
        const hospitalId = user.hospitalId || 'default';
        console.log('Fetching stats for hospital ID:', hospitalId);

        const statsResponse = await axios.get(`/api/hospitals/${hospitalId}/stats`, config);
        if (statsResponse.data) {
          setHospitalStats({
            totalPatients: statsResponse.data.totalPatients || 0,
            totalDoctors: statsResponse.data.totalDoctors || 0,
            pendingAppointments: statsResponse.data.pendingAppointments || 0,
            activeTreatments: statsResponse.data.activeTreatments || 0
          });
        }
      } catch (error) {
        console.error('Error fetching hospital stats:', error);
        // Set default values if there's an error
        setHospitalStats({
          totalPatients: 0,
          totalDoctors: 0,
          pendingAppointments: 0,
          activeTreatments: 0
        });
      }

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

      // Fetch real doctor performance data
      try {
        const doctorResponse = await axios.get('/api/doctors/hospital/performance', config);
        if (doctorResponse.data && doctorResponse.data.length > 0) {
          setDoctorPerformance(doctorResponse.data);
        } else {
          // Fallback to mock data if API returns empty array
          const mockDoctorPerformance = [
            { name: 'Dr. Smith', patients: 45, satisfaction: 92, department: 'Cardiology' },
            { name: 'Dr. Johnson', patients: 38, satisfaction: 88, department: 'Neurology' },
            { name: 'Dr. Williams', patients: 52, satisfaction: 95, department: 'Orthopedics' },
            { name: 'Dr. Brown', patients: 31, satisfaction: 87, department: 'Pediatrics' },
            { name: 'Dr. Davis', patients: 42, satisfaction: 91, department: 'General Medicine' }
          ];
          setDoctorPerformance(mockDoctorPerformance);
        }
      } catch (error) {
        console.error('Error fetching doctor performance:', error);
        // Fallback to mock data on error
        const mockDoctorPerformance = [
          { name: 'Dr. Smith', patients: 45, satisfaction: 92, department: 'Cardiology' },
          { name: 'Dr. Johnson', patients: 38, satisfaction: 88, department: 'Neurology' },
          { name: 'Dr. Williams', patients: 52, satisfaction: 95, department: 'Orthopedics' },
          { name: 'Dr. Brown', patients: 31, satisfaction: 87, department: 'Pediatrics' },
          { name: 'Dr. Davis', patients: 42, satisfaction: 91, department: 'General Medicine' }
        ];
        setDoctorPerformance(mockDoctorPerformance);
      }

      // Fetch real department statistics
      try {
        const departmentResponse = await axios.get('/api/hospitals/departments/stats', config);
        if (departmentResponse.data && departmentResponse.data.length > 0) {
          setDepartmentStats(departmentResponse.data);
        } else {
          // Fallback to mock data if API returns empty array
          const mockDepartmentStats = [
            { name: 'Cardiology', patients: 120, appointments: 85, satisfaction: 90 },
            { name: 'Neurology', patients: 95, appointments: 72, satisfaction: 88 },
            { name: 'Orthopedics', patients: 110, appointments: 92, satisfaction: 93 },
            { name: 'Pediatrics', patients: 150, appointments: 105, satisfaction: 91 },
            { name: 'General Medicine', patients: 200, appointments: 145, satisfaction: 89 }
          ];
          setDepartmentStats(mockDepartmentStats);
        }
      } catch (error) {
        console.error('Error fetching department stats:', error);
        // Fallback to mock data on error
        const mockDepartmentStats = [
          { name: 'Cardiology', patients: 120, appointments: 85, satisfaction: 90 },
          { name: 'Neurology', patients: 95, appointments: 72, satisfaction: 88 },
          { name: 'Orthopedics', patients: 110, appointments: 92, satisfaction: 93 },
          { name: 'Pediatrics', patients: 150, appointments: 105, satisfaction: 91 },
          { name: 'General Medicine', patients: 200, appointments: 145, satisfaction: 89 }
        ];
        setDepartmentStats(mockDepartmentStats);
      }

      // Fetch real notifications
      try {
        const notificationsResponse = await axios.get('/api/notifications', config);
        if (notificationsResponse.data && notificationsResponse.data.length > 0) {
          setNotifications(notificationsResponse.data);
        } else {
          // Fallback to mock data if API returns empty array
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
        console.error('Error fetching notifications:', error);
        // Fallback to mock data on error
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
      console.error('Error fetching hospital admin data:', error);
    }
  }, [user?.role, user?.hospitalId, token]);

  // Call fetchHospitalAdminData when user or token changes
  useEffect(() => {
    if (user?.role === 'hospital_admin') {
      fetchHospitalAdminData();
    }
  }, [user, fetchHospitalAdminData]);

  // Helper function to get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <CalendarMonth />;
      case 'message':
        return <Chat />;
      case 'system':
        return <Notifications />;
      case 'patient':
        return <People />;
      case 'doctor':
        return <LocalHospital />;
      default:
        return <Notifications />;
    }
  };

  // Helper function to get notification color based on type
  const getNotificationColor = (type) => {
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
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Memoize the admin dashboard to prevent unnecessary re-renders
  const renderAdminDashboard = useCallback(() => {
    // Create hospital admin stats with real data
    const hospitalAdminStats = [
      {
        title: 'Total Patients',
        value: hospitalStats.totalPatients.toString(),
        icon: <People />,
        color: theme.palette.primary.main,
        trend: '+8% from last month',
        trendUp: true
      },
      {
        title: 'Total Doctors',
        value: hospitalStats.totalDoctors.toString(),
        icon: <LocalHospital />,
        color: theme.palette.success.main,
        trend: '+5% from last month',
        trendUp: true
      },
      {
        title: 'Pending Appointments',
        value: hospitalStats.pendingAppointments.toString(),
        icon: <CalendarMonth />,
        color: theme.palette.warning.main,
        trend: '+12% from last month',
        trendUp: true
      },
      {
        title: 'Active Treatments',
        value: hospitalStats.activeTreatments.toString(),
        icon: <Medication />,
        color: theme.palette.secondary.main,
        trend: '+3% from last month',
        trendUp: true
      },
    ];

    return (
      <>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '24px' }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
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
                startIcon={<PersonAdd />}
                onClick={() => navigate('/hospital/patients')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Add Patient
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EventAvailable />}
                onClick={() => navigate('/hospital/appointments')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Manage Appointments
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Chat />}
                onClick={() => setShowChat(prev => !prev)}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Open Chat
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Stats Cards */}
        <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          {hospitalAdminStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} component={motion.div} variants={itemVariants}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        {/* Main Dashboard Content */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Department Performance */}
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
                    Department Performance
                  </Typography>
                  <Button
                    endIcon={<KeyboardArrowRight />}
                    onClick={() => navigate('/hospital/doctors')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={{
                      labels: departmentStats.map(dept => dept.name),
                      datasets: [
                        {
                          label: 'Patients',
                          data: departmentStats.map(dept => dept.patients),
                          backgroundColor: theme.palette.primary.main,
                        },
                        {
                          label: 'Appointments',
                          data: departmentStats.map(dept => dept.appointments),
                          backgroundColor: theme.palette.success.main,
                        }
                      ]
                    }}
                    options={chartOptions}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Doctor Performance */}
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Doctor Performance
                  </Typography>
                  <Button
                    endIcon={<KeyboardArrowRight />}
                    onClick={() => navigate('/hospital/doctors')}
                    sx={{ textTransform: 'none' }}
                  >
                    View All
                  </Button>
                </Box>
                <Box sx={{ p: 1 }}>
                  {doctorPerformance.map((doctor, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            mr: 2,
                          }}
                        >
                          {getInitials(doctor.name)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {doctor.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doctor.department}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 3, textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={600}>
                            {doctor.patients}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Patients
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight={600} color="success.main">
                            {doctor.satisfaction}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Satisfaction
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              sx={{ borderRadius: 3, overflow: 'hidden' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Upcoming Appointments
                  </Typography>
                  <Button
                    endIcon={<KeyboardArrowRight />}
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
            {/* Chat or Communication Center */}
            {showChat ? (
              <Card
                component={motion.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', height: '600px' }}
              >
                <CardContent sx={{ p: 0, height: '100%' }}>
                  {/* Import and use the SimpleSuperAdminChat component */}
                  <iframe
                    src="/hospital/chat"
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      borderRadius: '12px'
                    }}
                    title="Chat"
                  />
                </CardContent>
              </Card>
            ) : (
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
                      endIcon={<Chat />}
                      onClick={() => setShowChat(true)}
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
                      startIcon={<Chat />}
                      onClick={() => setShowChat(true)}
                      sx={{ borderRadius: 2, textTransform: 'none', mb: 2 }}
                      fullWidth
                    >
                      Start Chatting
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      You have {notifications.filter(n => !n.read && n.type === 'message').length} unread messages
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            )}

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
                    <MoreVert fontSize="small" />
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
                          <Avatar sx={{ bgcolor: alpha(getNotificationColor(notification.type), 0.8) }}>
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
                    endIcon={<KeyboardArrowRight />}
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
      </>
    );
  }, [
    user,
    hospitalStats,
    departmentStats,
    doctorPerformance,
    upcomingAppointments,
    recentPatients,
    notifications,
    showChat,
    theme,
    containerVariants,
    itemVariants,
    navigate
  ]);

  // Memoize the doctor dashboard to prevent unnecessary re-renders
  const renderDoctorDashboard = useCallback(() => (
    <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      {doctorStats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard {...stat} />
        </Grid>
      ))}

      <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Today's Appointments
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ p: 1 }}>
              {/* Placeholder for appointment list */}
              {[1, 2, 3].map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                  component={motion.div}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item * 0.1 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>John Doe</Typography>
                    <Typography variant="caption" sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: theme.palette.success.light,
                      color: theme.palette.success.dark,
                      fontWeight: 500
                    }}>
                      10:30 AM
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">General Checkup</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Patient Statistics
              </Typography>
              <IconButton size="small">
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ height: 300, p: 1 }}>
              <Bar data={patientData} options={chartOptions} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  ), [doctorStats, patientData, chartOptions, containerVariants, itemVariants]);

  // Health tips data - wrapped in useMemo to prevent unnecessary re-renders
  const healthTips = useMemo(() => [
    {
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily to maintain optimal health.',
      icon: <WbSunny />,
      color: theme.palette.info.main,
    },
    {
      title: 'Regular Exercise',
      description: 'Aim for at least 30 minutes of moderate exercise 5 days a week.',
      icon: <FitnessCenter />,
      color: theme.palette.success.main,
    },
    {
      title: 'Balanced Diet',
      description: 'Include fruits, vegetables, whole grains, and lean proteins in your meals.',
      icon: <Restaurant />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Quality Sleep',
      description: 'Get 7-9 hours of quality sleep each night for better health.',
      icon: <NightsStay />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Stress Management',
      description: 'Practice meditation, deep breathing, or yoga to reduce stress.',
      icon: <Spa />,
      color: theme.palette.secondary.main,
    },
  ], [theme.palette.info.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.primary.main, theme.palette.secondary.main]);

  // Patient quick actions - wrapped in useMemo to prevent unnecessary re-renders
  const patientQuickActions = useMemo(() => [
    {
      title: 'Book Appointment',
      description: 'Schedule a visit with your doctor',
      icon: <BookOnline />,
      color: theme.palette.primary.main,
      action: () => navigate('/appointments/book'),
    },
    {
      title: 'Virtual Consultation',
      description: 'Connect with a doctor online',
      icon: <VideoCall />,
      color: theme.palette.info.main,
      action: () => navigate('/appointments/book', { state: { appointmentType: 'online' } }),
    },
    {
      title: 'Find Hospital',
      description: 'Locate hospitals near you',
      icon: <LocalHospitalOutlined />,
      color: theme.palette.error.main,
      action: () => navigate('/hospitals'),
    },
    {
      title: 'Message Doctor',
      description: 'Send a message to your doctor',
      icon: <Chat />,
      color: theme.palette.success.main,
      action: () => navigate('/messages'),
    },
  ], [theme.palette.primary.main, theme.palette.info.main, theme.palette.error.main, theme.palette.success.main, navigate]);

  // Health tip card component
  const HealthTipCard = ({ tip }) => (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        height: '100%',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 10px 20px ${alpha(tip.color, 0.15)}`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(tip.color, 0.1),
              color: tip.color,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {tip.icon}
          </Avatar>
          <Typography variant="h6" fontWeight={600}>
            {tip.title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {tip.description}
        </Typography>
      </CardContent>
    </Card>
  );

  // Quick action card component
  const QuickActionCard = ({ action }) => (
    <Card
      component={motion.div}
      variants={itemVariants}
      onClick={action.action}
      sx={{
        height: '100%',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 10px 20px ${alpha(action.color, 0.15)}`,
          bgcolor: alpha(action.color, 0.05),
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: alpha(action.color, 0.1),
              color: action.color,
              width: 48,
              height: 48,
              mr: 2,
            }}
          >
            {action.icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {action.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {action.description}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Memoize the patient dashboard to prevent unnecessary re-renders
  const renderPatientDashboard = useCallback(() => {
    // If the patient has no hospital assignment, show the NoHospitalDashboard
    if (!patientAssignment && !loading && user?.role === 'patient') {
      console.log('Rendering NoHospitalDashboard with user:', user);
      return <NoHospitalDashboard user={user} />
    }

    // Otherwise, show the regular patient dashboard
    return (
      <Grid container spacing={3} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
        {showAiAssistant ? (
          <Grid item xs={12}>
            <AiHealthAssistant onBookAppointment={() => setShowAiAssistant(false)} />
          </Grid>
        ) : (
          <>
            {/* Stats Cards */}
            {patientStats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard {...stat} />
              </Grid>
            ))}

            {/* Quick Actions Section */}
            <Grid item xs={12}>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  '&::after': {
                    content: '""',
                    display: 'block',
                    height: '2px',
                    width: '50px',
                    background: theme.palette.primary.main,
                    ml: 2,
                  }
                }}
              >
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {patientQuickActions.map((action, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <QuickActionCard action={action} />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Appointments and Medical Records */}
            <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Upcoming Appointments
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<BookOnline />}
                      onClick={() => navigate('/appointments/book')}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                        boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    >
                      Schedule New
                    </Button>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    {/* Placeholder for upcoming appointments */}
                    {[1, 2].map((item) => (
                      <Box
                        key={item}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        }}
                        component={motion.div}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item * 0.1 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>Dr. Sarah Johnson</Typography>
                          <Typography variant="caption" sx={{
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: theme.palette.info.light,
                            color: theme.palette.info.dark,
                            fontWeight: 500
                          }}>
                            {item === 1 ? 'Jun 15, 2:00 PM' : 'Jun 28, 10:30 AM'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item === 1 ? 'Regular Checkup' : 'Follow-up Consultation'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Recent Medical Records
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      View All
                    </Button>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    {/* Placeholder for medical records */}
                    {[1, 2, 3].map((item) => (
                      <Box
                        key={item}
                        sx={{
                          p: 2,
                          mb: 2,
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.05)}`,
                        }}
                        component={motion.div}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: item * 0.1 }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {item === 1 ? 'Blood Test Results' : item === 2 ? 'X-Ray Report' : 'Medical Certificate'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item === 1 ? 'May 28, 2023' : item === 2 ? 'Apr 15, 2023' : 'Mar 10, 2023'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item === 1 ? 'Dr. Michael Chen' : item === 2 ? 'Dr. Sarah Johnson' : 'Dr. Robert Williams'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Health Tips Section */}
            <Grid item xs={12}>
              <Typography
                variant="h5"
                sx={{
                  mt: 3,
                  mb: 2,
                  fontWeight: 700,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  '&::after': {
                    content: '""',
                    display: 'block',
                    height: '2px',
                    width: '50px',
                    background: theme.palette.primary.main,
                    ml: 2,
                  }
                }}
              >
                Daily Health Tips
              </Typography>
              <Grid container spacing={2}>
                {healthTips.map((tip, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <HealthTipCard tip={tip} />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* AI Health Assistant Button */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 4,
                  mb: 2,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: theme.palette.divider,
                    zIndex: 0,
                  }
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<SmartToy />}
                  onClick={() => setShowAiAssistant(true)}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 3,
                    boxShadow: `0 8px 16px ${alpha(theme.palette.secondary.main, 0.2)}`,
                    position: 'relative',
                    zIndex: 1,
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 12px 20px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Chat with AI Health Assistant
                </Button>
              </Box>
            </Grid>
          </>
        )}
      </Grid>
    );
  }, [patientAssignment, loading, user, showAiAssistant, patientStats, patientQuickActions, healthTips, containerVariants, itemVariants, navigate, setShowAiAssistant]);

  // Memoize dashboard content to prevent unnecessary re-renders
  const getDashboardContent = useCallback(() => {
    // Check if user exists to prevent errors during refresh
    if (!user) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h6" color="text.secondary">Loading dashboard...</Typography>
        </Box>
      );
    }

    // If user is super_admin, redirect to the SuperAdminDashboard
    if (user.role === 'super_admin') {
      // Use a timeout to avoid immediate redirect which can cause render issues
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 100);

      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h6" color="text.secondary">Redirecting to Admin Dashboard...</Typography>
        </Box>
      );
    }

    switch (user.role) {
      case 'hospital_admin':
        // Redirect to the dedicated hospital admin dashboard
        setTimeout(() => {
          navigate('/hospital/dashboard');
        }, 100);

        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography variant="h6" color="text.secondary">Redirecting to Hospital Admin Dashboard...</Typography>
          </Box>
        );
      case 'doctor':
        // Redirect to the dedicated doctor dashboard
        setTimeout(() => {
          navigate('/doctor/dashboard');
        }, 100);

        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Typography variant="h6" color="text.secondary">Redirecting to Doctor Dashboard...</Typography>
          </Box>
        );
      case 'patient':
        // Check if the patient has a valid assignment with a doctor
        if (loading) {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
              <CircularProgress />
            </Box>
          );
        }
        
        // If patientAssignment is null or doesn't have a primaryDoctor, show NoHospitalDashboard
        if (!patientAssignment || !patientAssignment.primaryDoctor || !patientAssignment.hospital) {
          console.log('Dashboard: Patient has no valid assignment, showing NoHospitalDashboard');
          return <NoHospitalDashboard user={user} />;
        }
        
        // Otherwise, use the PatientDashboardRouter to determine which dashboard to show
        console.log('Dashboard: Patient has valid assignment, using PatientDashboardRouter');
        return <PatientDashboardRouter />;
      default:
        return <Typography>Welcome to SoulSpace Health</Typography>;
    }
  }, [user, patientAssignment, loading, navigate]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Get role-specific colors
  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return theme.palette.error.main;
      case 'hospital_admin':
        return theme.palette.warning.main;
      case 'doctor':
        return theme.palette.info.main;
      case 'patient':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const roleColor = getRoleColor(user?.role);

  return (
    <Container maxWidth="xl">
      <Box
        sx={{ mt: 4, mb: 6 }}
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced header with role-specific styling */}
        {(patientAssignment || user?.role !== 'patient') && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${alpha(roleColor, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
                : `linear-gradient(135deg, ${alpha(roleColor, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.4)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(roleColor, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: `linear-gradient(90deg, ${roleColor} 0%, ${theme.palette.primary.main} 100%)`,
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                {/* Sidebar toggle button for dashboard header */}
                <IconButton
                  onClick={() => {
                    // Find the sidebar toggle button in the navbar and click it
                    const sidebarToggleBtn = document.querySelector('[aria-label="open drawer"]');
                    if (sidebarToggleBtn) {
                      sidebarToggleBtn.click();
                    }
                  }}
                  sx={{
                    mr: 2,
                    mt: 0.5,
                    color: roleColor,
                    bgcolor: alpha(roleColor, 0.1),
                    border: `1px solid ${alpha(roleColor, 0.2)}`,
                    '&:hover': {
                      bgcolor: alpha(roleColor, 0.15),
                    },
                  }}
                >
                  <MenuIcon />
                </IconButton>

                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(90deg, ${roleColor} 0%, ${theme.palette.primary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {user?.role === 'super_admin' ? 'Admin Dashboard' :
                     user?.role === 'hospital_admin' ? 'Hospital Dashboard' :
                     user?.role === 'doctor' ? 'Doctor Dashboard' : 'Patient Dashboard'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mr: 1 }}>
                      Welcome back, <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{user?.name || 'User'}</Box>
                    </Typography>
                    <Box
                      sx={{
                        height: '4px',
                        width: '4px',
                        borderRadius: '50%',
                        bgcolor: 'text.disabled',
                        mx: 1
                      }}
                    />
                    <Typography variant="subtitle1" color="text.secondary">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* Quick action buttons */}
                <Tooltip title="Notifications">
                  <IconButton
                    sx={{
                      mr: 2,
                      color: 'text.secondary',
                      bgcolor: alpha(theme.palette.background.paper, 0.6),
                      '&:hover': {
                        bgcolor: alpha(roleColor, 0.1),
                        color: roleColor,
                      },
                    }}
                  >
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title="Settings">
                  <IconButton
                    sx={{
                      mr: 2,
                      color: 'text.secondary',
                      bgcolor: alpha(theme.palette.background.paper, 0.6),
                      '&:hover': {
                        bgcolor: alpha(roleColor, 0.1),
                        color: roleColor,
                      },
                    }}
                    onClick={() => navigate('/settings')}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
                  onClick={refreshData}
                  disabled={refreshing}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.2,
                    boxShadow: `0 4px 12px ${alpha(roleColor, 0.2)}`,
                    background: `linear-gradient(90deg, ${roleColor} 0%, ${theme.palette.primary.main} 100%)`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0 6px 16px ${alpha(roleColor, 0.3)}`,
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Data'}
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        <Box sx={{ mb: 2 }}>
          {getDashboardContent()}
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
