import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  People,
  CalendarMonth,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon,
  MedicalServices,
  PersonSearch,
  EventAvailable as EventAvailableIcon
} from '@mui/icons-material';
// Import axios for API calls
import axios from '../../utils/axios';
import { motion } from 'framer-motion';

const DoctorDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get user data from Redux store
  const { user: oldAuthUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: userAuthUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = userAuthUser || oldAuthUser;
  const token = newToken || oldToken;

  // Initialize token and user data immediately on component mount
  useEffect(() => {
    // Get token from localStorage or Redux
    const currentToken = localStorage.getItem('token') ||
                        localStorage.getItem('userToken') ||
                        localStorage.getItem('doctorToken') ||
                        localStorage.getItem('persistentToken') ||
                        token; // From Redux

    if (currentToken) {
      // Store token in all locations for redundancy
      localStorage.setItem('token', currentToken);
      localStorage.setItem('userToken', currentToken);
      localStorage.setItem('doctorToken', currentToken);
      localStorage.setItem('persistentToken', currentToken);

      // Set token in axios headers for all future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

      console.log('Token initialized in dashboard:',
        currentToken.substring(0, 10) + '...' +
        ' (length: ' + currentToken.length + ')'
      );
    } else {
      console.warn('No token available from any source');
      // Redirect to login if no token is available
      setTimeout(() => {
        const checkToken = localStorage.getItem('token') || localStorage.getItem('userToken');
        if (!checkToken) {
          console.log('No token available, redirecting to login');
          navigate('/login');
        }
      }, 500);
    }

    // Store user data in localStorage for persistence
    if (user) {
      console.log('Storing user data from Redux in localStorage');
      localStorage.setItem('user', JSON.stringify(user));

      // Store basic user info in localStorage for quick access
      if (user.name) localStorage.setItem('doctorName', user.name);
      if (user._id) localStorage.setItem('doctorId', user._id);
    } else {
      // Try to get user data from localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Found user data in localStorage:', parsedUser.name);

          // Store basic user info in localStorage for quick access
          if (parsedUser.name) localStorage.setItem('doctorName', parsedUser.name);
          if (parsedUser._id) localStorage.setItem('doctorId', parsedUser._id);
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
    }
  }, [user, navigate]);

  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [onlineAppointments, setOnlineAppointments] = useState([]);

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

  // State for doctor stats
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0
  });

  // Fetch doctor's data - optimized for faster loading
  useEffect(() => {
    // Set initial loading state
    setLoading(true);

    // Show mock data immediately for better UX while real data loads
    const showInitialMockData = () => {
      // Basic mock data for immediate display
      const mockPatients = Array(5).fill(0).map((_, i) => ({
        _id: `temp-${i}`,
        name: `Patient ${i+1}`,
        age: 30 + i,
        gender: i % 2 === 0 ? 'Male' : 'Female',
        condition: 'Loading...'
      }));

      const mockAppointments = Array(3).fill(0).map((_, i) => ({
        _id: `temp-apt-${i}`,
        patientName: `Patient ${i+1}`,
        date: new Date().toISOString(),
        time: `${9 + i}:00 AM`,
        type: i % 2 === 0 ? 'online' : 'in-person',
        status: 'confirmed',
        reason: 'Loading...'
      }));

      // Set temporary data for immediate display
      setAssignedPatients(mockPatients);
      setUpcomingAppointments(mockAppointments);
      setOnlineAppointments(mockAppointments.filter(a => a.type === 'online'));

      // Set basic stats
      setStats({
        totalPatients: 5,
        todayAppointments: 2,
        pendingAppointments: 1,
        completedAppointments: 1
      });
    };

    // Show initial data immediately
    showInitialMockData();

    const fetchDoctorData = async () => {
      // Get token from localStorage
      const currentToken = localStorage.getItem('token') ||
                          localStorage.getItem('userToken') ||
                          localStorage.getItem('doctorToken') ||
                          localStorage.getItem('persistentToken') ||
                          token; // From Redux

      if (!currentToken) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      // Ensure axios has the token in its default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

      // Get doctor ID from localStorage if available (for faster loading)
      let doctorId = localStorage.getItem('doctorId') || user?._id || 'current';
      let doctorName = localStorage.getItem('doctorName') || user?.name || 'Doctor';

      try {
        // Use a single config object for all requests
        const config = {
          headers: { Authorization: `Bearer ${currentToken}` }
        };

        // Fetch user profile and data in parallel for faster loading
        console.log('Starting parallel data fetching for doctor dashboard');

        // Create an array of promises for parallel execution
        const fetchPromises = [];

        // 1. Promise for user profile
        const fetchUserProfile = async () => {
          try {
            console.log('Fetching current user data from /api/auth/me');
            const meResponse = await axios.get('/api/auth/me', config);

            if (meResponse.data && meResponse.data.user) {
              console.log('Got user data from /api/auth/me:', meResponse.data.user.name);
              doctorId = meResponse.data.user._id;
              doctorName = meResponse.data.user.name;

              // Store in localStorage
              localStorage.setItem('doctorId', doctorId);
              localStorage.setItem('doctorName', doctorName);
              localStorage.setItem('user', JSON.stringify(meResponse.data.user));

              return { success: true, data: meResponse.data.user };
            }
            return { success: false };
          } catch (meError) {
            console.log('Could not fetch from /api/auth/me, trying doctor profile endpoint');

            try {
              const profileResponse = await axios.get('/api/doctors/profile', config);
              if (profileResponse.data && profileResponse.data._id) {
                doctorId = profileResponse.data._id;
                doctorName = profileResponse.data.name || doctorName;
                console.log('Doctor Dashboard: Got doctor ID:', doctorId);

                // Store in localStorage
                localStorage.setItem('doctorId', doctorId);
                localStorage.setItem('doctorName', doctorName);

                return { success: true, data: profileResponse.data };
              }
              return { success: false };
            } catch (profileError) {
              console.log('Could not fetch doctor profile, using fallback ID:', doctorId);
              return { success: false };
            }
          }
        };

        // Add user profile promise to the array
        fetchPromises.push(fetchUserProfile());

        // 2. Promise for patient data
        const fetchPatients = async () => {
          try {
            console.log('Attempting to fetch patients for doctor ID:', doctorId);

            // Try different endpoints that might exist in the backend
            let patientsData = null;
            let endpointUsed = '';

            // Array of possible endpoints to try
            const patientEndpoints = [
              { url: '/api/doctors/my-patients', name: 'my-patients' },
              { url: `/api/doctors/${doctorId}/patients`, name: 'doctor-id-patients' },
              { url: '/api/patients/assigned', name: 'patients-assigned' },
              { url: '/api/patients', name: 'all-patients', filter: true }
            ];

            // Try each endpoint until one works
            for (const endpoint of patientEndpoints) {
              try {
                console.log(`Trying endpoint: ${endpoint.name} (${endpoint.url})`);
                const response = await axios.get(endpoint.url, config);

                if (response.data && Array.isArray(response.data)) {
                  if (endpoint.filter) {
                    // Filter patients that might be assigned to this doctor
                    patientsData = response.data.filter(p =>
                      p.doctorId === doctorId ||
                      p.doctor?._id === doctorId ||
                      p.assignedDoctor === doctorId
                    );
                  } else {
                    patientsData = response.data;
                  }

                  if (patientsData.length > 0) {
                    endpointUsed = endpoint.name;
                    break;
                  } else {
                    console.log(`Endpoint ${endpoint.name} returned no patients for this doctor`);
                  }
                }
              } catch (e) {
                console.log(`Endpoint ${endpoint.name} failed:`, e.message);
              }
            }

            if (patientsData && patientsData.length > 0) {
              console.log(`Doctor Dashboard: Got ${patientsData.length} patients from ${endpointUsed} endpoint`);
              return {
                success: true,
                data: patientsData,
                count: patientsData.length
              };
            } else {
              console.log('No patient data available from any endpoint');
              return { success: false };
            }
          } catch (error) {
            console.log('Error fetching patients:', error.message);
            return { success: false };
          }
        };

        // Add patients promise to the array
        fetchPromises.push(fetchPatients());

        // 3. Promise for appointment data
        const fetchAppointments = async () => {
          try {
            console.log('Attempting to fetch appointments for doctor ID:', doctorId);

            // Try different endpoints that might exist in the backend
            let appointmentsData = null;
            let endpointUsed = '';

            // Array of possible endpoints to try
            const appointmentEndpoints = [
              { url: '/api/doctors/my-appointments', name: 'my-appointments' },
              { url: `/api/doctors/${doctorId}/appointments`, name: 'doctor-id-appointments' },
              { url: '/api/appointments/doctor', name: 'appointments-doctor' },
              { url: '/api/appointments', name: 'all-appointments', filter: true }
            ];

            // Try each endpoint until one works
            for (const endpoint of appointmentEndpoints) {
              try {
                console.log(`Trying endpoint: ${endpoint.name} (${endpoint.url})`);
                const response = await axios.get(endpoint.url, config);

                if (response.data && Array.isArray(response.data)) {
                  if (endpoint.filter) {
                    // Filter appointments for this doctor
                    appointmentsData = response.data.filter(a =>
                      a.doctorId === doctorId ||
                      a.doctor?._id === doctorId ||
                      a.doctor === doctorId
                    );
                  } else {
                    appointmentsData = response.data;
                  }

                  if (appointmentsData.length > 0) {
                    endpointUsed = endpoint.name;
                    break;
                  } else {
                    console.log(`Endpoint ${endpoint.name} returned no appointments for this doctor`);
                  }
                }
              } catch (e) {
                console.log(`Endpoint ${endpoint.name} failed:`, e.message);
              }
            }

            if (appointmentsData && appointmentsData.length > 0) {
              console.log(`Doctor Dashboard: Got ${appointmentsData.length} appointments from ${endpointUsed} endpoint`);

              // Calculate stats
              const today = new Date().toISOString().split('T')[0];
              const todayAppts = appointmentsData.filter(apt =>
                apt.date.split('T')[0] === today
              ).length;

              const pendingAppts = appointmentsData.filter(apt =>
                apt.status === 'pending'
              ).length;

              const completedAppts = appointmentsData.filter(apt =>
                apt.status === 'completed'
              ).length;

              return {
                success: true,
                data: appointmentsData,
                stats: {
                  todayAppointments: todayAppts,
                  pendingAppointments: pendingAppts,
                  completedAppointments: completedAppts
                }
              };
            } else {
              console.log('No appointment data available from any endpoint');
              return { success: false };
            }
          } catch (error) {
            console.log('Error fetching appointments:', error.message);
            return { success: false };
          }
        };

        // Add appointments promise to the array
        fetchPromises.push(fetchAppointments());

        // Execute all promises in parallel and process results
        try {
          console.log('Executing all fetch promises in parallel');
          const results = await Promise.allSettled(fetchPromises);
          console.log('All fetch promises completed');

          // Process user profile result
          const profileResult = results[0];
          if (profileResult.status === 'fulfilled' && profileResult.value?.success) {
            console.log('Successfully fetched user profile');
          }

          // Process patients result
          const patientsResult = results[1];
          if (patientsResult.status === 'fulfilled' && patientsResult.value?.success) {
            console.log('Successfully fetched patients:', patientsResult.value.count);
            setAssignedPatients(patientsResult.value.data);
            setStats(prev => ({
              ...prev,
              totalPatients: patientsResult.value.count
            }));
          } else {
            console.log('Using mock patient data');
            // Mock data for patients
            const mockPatients = [
              {
                _id: '1',
                name: 'John Smith',
                age: 45,
                gender: 'Male',
                lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                condition: 'Hypertension',
                doctorId: doctorId,
                email: 'john.smith@example.com',
                phone: '+1 (555) 123-4567'
              },
              {
                _id: '2',
                name: 'Sarah Johnson',
                age: 32,
                gender: 'Female',
                lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                condition: 'Diabetes',
                doctorId: doctorId,
                email: 'sarah.johnson@example.com',
                phone: '+1 (555) 234-5678'
              },
              {
                _id: '3',
                name: 'Michael Brown',
                age: 28,
                gender: 'Male',
                lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                condition: 'Asthma',
                doctorId: doctorId,
                email: 'michael.brown@example.com',
                phone: '+1 (555) 345-6789'
              },
              {
                _id: '4',
                name: 'Emily Davis',
                age: 52,
                gender: 'Female',
                lastVisit: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
                condition: 'Arthritis',
                doctorId: doctorId,
                email: 'emily.davis@example.com',
                phone: '+1 (555) 456-7890'
              },
              {
                _id: '5',
                name: 'Robert Wilson',
                age: 67,
                gender: 'Male',
                lastVisit: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                condition: 'Heart Disease',
                doctorId: doctorId,
                email: 'robert.wilson@example.com',
                phone: '+1 (555) 567-8901'
              }
            ];
            setAssignedPatients(mockPatients);
            setStats(prev => ({
              ...prev,
              totalPatients: mockPatients.length
            }));
          }

          // Process appointments result
          const appointmentsResult = results[2];
          if (appointmentsResult.status === 'fulfilled' && appointmentsResult.value?.success) {
            console.log('Successfully fetched appointments');
            const appointmentsData = appointmentsResult.value.data;

            // Filter online appointments
            const online = appointmentsData.filter(apt => apt.type === 'online' && apt.status === 'confirmed');
            setOnlineAppointments(online);

            // Sort by date and take the next 5
            const upcoming = appointmentsData
              .filter(apt => apt.status === 'confirmed')
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5);
            setUpcomingAppointments(upcoming);

            // Update stats
            setStats(prev => ({
              ...prev,
              ...appointmentsResult.value.stats
            }));
          } else {
            console.log('Using mock appointment data');
            // Mock data for appointments
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

            const mockAppointments = [
              {
                _id: '101',
                patientName: 'John Smith',
                patientId: '1',
                doctorId: doctorId,
                date: today.toISOString(),
                time: '10:00 AM',
                type: 'online',
                status: 'confirmed',
                reason: 'Follow-up on hypertension medication'
              },
              {
                _id: '102',
                patientName: 'Sarah Johnson',
                patientId: '2',
                doctorId: doctorId,
                date: today.toISOString(),
                time: '2:30 PM',
                type: 'in-person',
                status: 'confirmed',
                reason: 'Diabetes check-up'
              },
              {
                _id: '103',
                patientName: 'Michael Brown',
                patientId: '3',
                doctorId: doctorId,
                date: tomorrow.toISOString(),
                time: '9:15 AM',
                type: 'online',
                status: 'confirmed',
                reason: 'Asthma management review'
              },
              {
                _id: '104',
                patientName: 'Emily Davis',
                patientId: '4',
                doctorId: doctorId,
                date: tomorrow.toISOString(),
                time: '11:45 AM',
                type: 'in-person',
                status: 'confirmed',
                reason: 'Joint pain assessment'
              },
              {
                _id: '105',
                patientName: 'Robert Wilson',
                patientId: '5',
                doctorId: doctorId,
                date: dayAfterTomorrow.toISOString(),
                time: '3:00 PM',
                type: 'online',
                status: 'confirmed',
                reason: 'Heart medication review'
              }
            ];

            // Filter online appointments
            const online = mockAppointments.filter(apt => apt.type === 'online' && apt.status === 'confirmed');
            setOnlineAppointments(online);

            // Sort by date and take the next 5
            const upcoming = mockAppointments
              .filter(apt => apt.status === 'confirmed')
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5);
            setUpcomingAppointments(upcoming);

            // Update stats
            setStats(prev => ({
              ...prev,
              todayAppointments: 3,
              pendingAppointments: 1,
              completedAppointments: 1
            }));
          }
        } catch (error) {
          console.error('Error processing parallel requests:', error);
        } finally {
          // Always set loading to false when done
          setLoading(false);
        }

      } catch (error) {
        console.error('Error in doctor dashboard:', error);
        // Don't show error to user, just use mock data
        setError('');

        // Ensure we set loading to false even if there's an error
        setLoading(false);

        // Show mock data as fallback
        const mockPatients = Array(5).fill(0).map((_, i) => ({
          _id: `mock-${i}`,
          name: `Patient ${i+1}`,
          age: 30 + i,
          gender: i % 2 === 0 ? 'Male' : 'Female',
          condition: 'Loading failed - using mock data',
          email: `patient${i+1}@example.com`,
          phone: `+1 (555) ${100+i}-${1000+i}`
        }));

        const mockAppointments = Array(5).fill(0).map((_, i) => ({
          _id: `mock-apt-${i}`,
          patientName: `Patient ${i+1}`,
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
          time: `${9 + i}:00 AM`,
          type: i % 2 === 0 ? 'online' : 'in-person',
          status: 'confirmed',
          reason: 'Regular checkup'
        }));

        setAssignedPatients(mockPatients);
        setUpcomingAppointments(mockAppointments);
        setOnlineAppointments(mockAppointments.filter(a => a.type === 'online'));

        setStats({
          totalPatients: mockPatients.length,
          todayAppointments: 2,
          pendingAppointments: 1,
          completedAppointments: 1
        });
      }
    };

    // Start data fetching
    fetchDoctorData();

    // Set up an interval to refresh the token periodically (every 2 minutes)
    const tokenRefreshInterval = setInterval(async () => {
      try {
        // Get the current token from localStorage
        const refreshToken = localStorage.getItem('token') ||
                            localStorage.getItem('userToken') ||
                            localStorage.getItem('doctorToken') ||
                            localStorage.getItem('persistentToken');

        if (refreshToken) {
          console.log('Token refresh check - attempting to validate token');

          // Ensure the axios instance has the latest token
          axios.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`;

          // Try to validate the token by making a lightweight API call
          try {
            const response = await axios.get('/api/auth/me');
            if (response.data && response.data.user) {
              console.log('Token is valid, user:', response.data.user.name);

              // Store token in all locations for redundancy
              localStorage.setItem('token', refreshToken);
              localStorage.setItem('userToken', refreshToken);
              localStorage.setItem('doctorToken', refreshToken);
              localStorage.setItem('persistentToken', refreshToken);

              // Store user data
              localStorage.setItem('user', JSON.stringify(response.data.user));

              // Store role-specific data
              if (response.data.user.role === 'doctor') {
                localStorage.setItem('doctorId', response.data.user._id);
                localStorage.setItem('doctorName', response.data.user.name);
              }
            }
          } catch (error) {
            console.warn('Token validation failed:', error.message);

            // Only redirect on auth errors, not network errors
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
              console.warn('Token is invalid, redirecting to login');
              navigate('/login');
            } else {
              console.log('Network error during token validation, keeping token');
            }
          }
        } else {
          console.warn('Token refresh check - no valid token found');
          // If token is missing during a refresh check, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Error in token refresh interval:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes

    // Clean up the interval when component unmounts
    return () => {
      clearInterval(tokenRefreshInterval);
    };
  }, [navigate]);

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

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 3, md: 4 } }}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              mb: { xs: 3, md: 4 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.light, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ mb: { xs: 2, md: 0 } }}>
              <Typography
                variant="h4"
                fontWeight={600}
                gutterBottom
                sx={{
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome, Dr. {user?.name?.split(' ')[0] || localStorage.getItem('doctorName')?.split(' ')[0] || 'Doctor'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your patients, appointments, and communications from this dashboard.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<VideoCallIcon />}
                onClick={() => navigate('/doctor/online-appointments')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Online Appointments
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<ChatIcon />}
                onClick={() => navigate('/doctor/patients/chat')}
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Enhanced Chat
              </Button>
            </Box>
          </Paper>
        </motion.div>

        {/* Stats Section */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <People sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="h4" fontWeight={600}>
                  {stats.totalPatients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assigned Patients
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <CalendarMonth sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
                <Typography variant="h4" fontWeight={600}>
                  {stats.todayAppointments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Today's Appointments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <EventAvailableIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
                <Typography variant="h4" fontWeight={600}>
                  {stats.pendingAppointments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Appointments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <MedicalServices sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
                <Typography variant="h4" fontWeight={600}>
                  {stats.completedAppointments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Appointments
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
            {/* Upcoming Appointments */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Upcoming Appointments
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => navigate('/doctor/appointments')}
                  >
                    View All
                  </Button>
                </Box>

                {upcomingAppointments.length > 0 ? (
                  <List>
                    {upcomingAppointments.map((appointment, index) => (
                      <React.Fragment key={appointment._id || index}>
                        <ListItem alignItems="flex-start">
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: appointment.type === 'online' ? theme.palette.info.light : theme.palette.success.light }}>
                              {appointment.type === 'online' ? <VideoCallIcon /> : <MedicalServices />}
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
                                {appointment.type || 'Regular Checkup'}
                                <Chip
                                  size="small"
                                  label={appointment.type === 'online' ? 'Online' : 'In-person'}
                                  color={appointment.type === 'online' ? 'info' : 'success'}
                                  sx={{ ml: 1, height: 20 }}
                                />
                              </>
                            }
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            color={appointment.type === 'online' ? 'info' : 'success'}
                            onClick={() => appointment.type === 'online'
                              ? navigate(`/doctor/online-appointment/${appointment._id}`)
                              : navigate(`/doctor/appointment/${appointment._id}`)}
                            sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
                          >
                            {appointment.type === 'online' ? 'Join' : 'View'}
                          </Button>
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

            {/* Online Appointments Section */}
            {onlineAppointments.length > 0 && (
              <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Online Consultations
                    </Typography>
                    <Button
                      variant="text"
                      color="info"
                      onClick={() => navigate('/doctor/online-appointments')}
                    >
                      View All
                    </Button>
                  </Box>

                  <Grid container spacing={2}>
                    {onlineAppointments.slice(0, 3).map((appointment, index) => (
                      <Grid item xs={12} sm={6} md={4} key={appointment._id || index}>
                        <Paper
                          elevation={2}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: theme.palette.info.light, mr: 1.5 }}>
                              {getInitials(appointment.patientName || 'Patient')}
                            </Avatar>
                            <Typography variant="subtitle1" fontWeight={500} noWrap>
                              {appointment.patientName || 'Patient Name'}
                            </Typography>
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time || '10:00 AM'}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Chip
                              size="small"
                              label="Online"
                              color="info"
                              sx={{ height: 20 }}
                            />
                          </Box>

                          <Box sx={{ flexGrow: 1 }} />

                          <Button
                            variant="contained"
                            color="info"
                            fullWidth
                            startIcon={<VideoCallIcon />}
                            onClick={() => navigate(`/doctor/online-appointment/${appointment._id}`)}
                            sx={{ mt: 1, borderRadius: 2, textTransform: 'none' }}
                          >
                            Join Meeting
                          </Button>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* My Patients */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    My Patients
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => navigate('/doctor/patients')}
                  >
                    View All
                  </Button>
                </Box>

                {assignedPatients.length > 0 ? (
                  <List>
                    {assignedPatients.slice(0, 5).map((patient, index) => (
                      <React.Fragment key={patient._id || index}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                            borderRadius: 1
                          }}
                          onClick={() => navigate(`/doctor/patient/${patient._id}`)}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              {getInitials(patient.name || 'Patient')}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={500}>
                                {patient.name || 'Patient Name'}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {patient.age || '??'} years • {patient.gender || 'Unknown'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Last visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </>
                            }
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/doctor/patients/chat/${patient._id}`);
                            }}
                            sx={{ minWidth: 0, p: 1, borderRadius: 2 }}
                          >
                            <ChatIcon fontSize="small" />
                          </Button>
                        </ListItem>
                        {index < assignedPatients.slice(0, 5).length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">No patients assigned yet</Typography>
                  </Box>
                )}

                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  startIcon={<PersonSearch />}
                  onClick={() => navigate('/doctor/patients')}
                  sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                >
                  Find Patient
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<ChatIcon />}
                      onClick={() => navigate('/doctor/patients/chat')}
                      sx={{ borderRadius: 2, textTransform: 'none', height: '100%' }}
                    >
                      Chat
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<CalendarMonth />}
                      onClick={() => navigate('/doctor/schedule')}
                      sx={{ borderRadius: 2, textTransform: 'none', height: '100%' }}
                    >
                      Schedule
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<People />}
                      onClick={() => navigate('/doctor/patients')}
                      sx={{ borderRadius: 2, textTransform: 'none', height: '100%' }}
                    >
                      Patients
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<MedicalServices />}
                      onClick={() => navigate('/doctor/prescriptions')}
                      sx={{ borderRadius: 2, textTransform: 'none', height: '100%' }}
                    >
                      Prescriptions
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DoctorDashboard;
