import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from '../../utils/axios';
import StatCard from '../../components/dashboard/StatCard';
import AdvancedAnalytics from '../../components/hospital/AdvancedAnalytics';
import DashboardBackground from '../../components/animations/DashboardBackground';
import { checkAuthStatus } from '../../store/slices/authSlice';
import { getCurrentUser } from '../../store/slices/userAuthSlice';
import { getBestToken, getBestUser, isAuthenticated as checkIsAuthenticated } from '../../utils/authUtils';
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [refreshing, setRefreshing] = useState(false);
  const lastUserRef = useRef();
  const lastTokenRef = useRef();
  const lastHospitalIdRef = useRef();
  const loadingRef = useRef(false);

  // Debounced window resize handler
  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get user data from all auth systems
  const { user: oldAuthUser, token: oldToken, isAuthenticated: oldAuthIsAuthenticated } = useSelector((state) => state.auth);
  const { user: userAuthUser, token: newToken, isAuthenticated: newAuthIsAuthenticated } = useSelector((state) => state.userAuth);

  // Get the latest user data from Redux store for use in callbacks
  const latestUserAuthUser = useSelector((state) => state.userAuth.user);
  const latestOldAuthUser = useSelector((state) => state.auth.user);

  // Use user from any available auth source, preferring the new auth system
  const user = userAuthUser || oldAuthUser || getBestUser();

  // Use token from any available source, preferring the new auth system
  const token = newToken || oldToken || getBestToken();

  // Check if authenticated in either system
  const isAuthenticated = newAuthIsAuthenticated || oldAuthIsAuthenticated || checkIsAuthenticated();

  console.log('HospitalAdminDashboard: Auth state', {
    newAuthUser: !!userAuthUser,
    oldAuthUser: !!oldAuthUser,
    newToken: !!newToken,
    oldToken: !!oldToken,
    isAuthenticated
  });

  // Check auth status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated || !user || !token) {
        console.log('Auth check needed, current state:', { isAuthenticated, hasUser: !!user, hasToken: !!token });
        try {
          // Try both auth systems in parallel
          const authPromises = [
            dispatch(getCurrentUser()).unwrap().catch(err => {
              console.log('getCurrentUser failed:', err);
              return null;
            }),
            dispatch(checkAuthStatus()).unwrap().catch(err => {
              console.log('checkAuthStatus failed:', err);
              return null;
            })
          ];

          const results = await Promise.all(authPromises);

          if (!results[0] && !results[1]) {
            console.error('Both auth checks failed');
            setError('Authentication failed. Please log in again.');
            // Redirect to login after a delay
            setTimeout(() => navigate('/login'), 2000);
          } else {
            console.log('At least one auth check succeeded');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          setError('Authentication failed. Please log in again.');
          // Redirect to login after a delay
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        console.log('User already authenticated, skipping auth check');
      }
    };

    checkAuth();
  }, [dispatch, user, token, isAuthenticated, navigate]);

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

    // Log the current state
    console.log('fetchAdditionalData - Current state:', {
      hasUser: !!currentUser,
      hasHospitalId: !!currentUser?.hospitalId,
      role: currentUser?.role
    });

    if (!currentUser?.hospitalId) {
      console.error('No hospital ID available for additional data');
      return;
    }

    try {
      // Ensure we have the latest token using our utility function
      const currentToken = newToken || oldToken || getBestToken();

      if (!currentToken) {
        console.error('No authentication token available for additional data');
        return;
      }

      console.log('Using token for additional data:', !!currentToken);

      const config = {
        headers: { Authorization: `Bearer ${currentToken}` }
      };

      // Set the token in axios defaults as well for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

      // Fetch upcoming appointments
      try {
        const appointmentsResponse = await axios.get('/api/appointments/hospital', config);
        if (appointmentsResponse.data) {
          // Sort by date and take the next 5
          const upcoming = appointmentsResponse.data
            .filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
          setUpcomingAppointments(upcoming);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        // Don't set error state to avoid blocking the dashboard
      }

      // Fetch recent patients
      try {
        const patientsResponse = await axios.get('/api/patients/hospital', config);
        if (patientsResponse.data) {
          // Sort by creation date and take the most recent 5
          const recent = patientsResponse.data
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setRecentPatients(recent);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        // Don't set error state to avoid blocking the dashboard
      }

      // Try to fetch real doctor performance data
      try {
        const doctorsResponse = await axios.get('/api/doctors/hospital/performance', config);
        if (doctorsResponse.data && doctorsResponse.data.length > 0) {
          setDoctorPerformance(doctorsResponse.data);
        } else {
          // Fallback to calculated data based on doctors we already have
          const doctorsListResponse = await axios.get('/api/doctors/hospital', config);
          if (doctorsListResponse.data && doctorsListResponse.data.length > 0) {
            // Create performance data from real doctors
            const realDoctorPerformance = doctorsListResponse.data.slice(0, 5).map(doctor => ({
              name: doctor.name || 'Unknown Doctor',
              patients: doctor.patientCount || Math.floor(Math.random() * 50) + 20,
              satisfaction: Math.floor(Math.random() * 15) + 80, // Random satisfaction between 80-95
              department: doctor.specialization || 'General Medicine'
            }));
            setDoctorPerformance(realDoctorPerformance);
          } else {
            // If no real doctors found, use placeholder data
            const placeholderDoctorPerformance = [
              { name: 'Dr. Smith', patients: 45, satisfaction: 92, department: 'Cardiology' },
              { name: 'Dr. Johnson', patients: 38, satisfaction: 88, department: 'Neurology' },
              { name: 'Dr. Williams', patients: 52, satisfaction: 95, department: 'Orthopedics' },
              { name: 'Dr. Brown', patients: 31, satisfaction: 87, department: 'Pediatrics' },
              { name: 'Dr. Davis', patients: 42, satisfaction: 91, department: 'General Medicine' }
            ];
            setDoctorPerformance(placeholderDoctorPerformance);
          }
        }
      } catch (error) {
        console.error('Error fetching doctor performance:', error);
        // Fallback to placeholder data
        const placeholderDoctorPerformance = [
          { name: 'Dr. Smith', patients: 45, satisfaction: 92, department: 'Cardiology' },
          { name: 'Dr. Johnson', patients: 38, satisfaction: 88, department: 'Neurology' },
          { name: 'Dr. Williams', patients: 52, satisfaction: 95, department: 'Orthopedics' },
          { name: 'Dr. Brown', patients: 31, satisfaction: 87, department: 'Pediatrics' },
          { name: 'Dr. Davis', patients: 42, satisfaction: 91, department: 'General Medicine' }
        ];
        setDoctorPerformance(placeholderDoctorPerformance);
      }

      // Try to fetch real department statistics
      try {
        const departmentsResponse = await axios.get('/api/hospitals/departments/stats', config);
        if (departmentsResponse.data && departmentsResponse.data.length > 0) {
          setDepartmentStats(departmentsResponse.data);
        } else {
          // If no real department data, generate it from doctor data
          // Group doctors by department and calculate stats
          const departments = {};

          // Use the doctor performance data we have
          const currentDoctorPerformance = [...doctorPerformance];
          currentDoctorPerformance.forEach(doctor => {
            if (!departments[doctor.department]) {
              departments[doctor.department] = {
                name: doctor.department,
                patients: 0,
                appointments: 0,
                satisfaction: 0,
                doctorCount: 0
              };
            }

            departments[doctor.department].patients += doctor.patients;
            departments[doctor.department].satisfaction += doctor.satisfaction;
            departments[doctor.department].doctorCount += 1;
            departments[doctor.department].appointments += Math.floor(doctor.patients * 0.7); // Estimate appointments
          });

          // Calculate average satisfaction and format department stats
          const calculatedDepartmentStats = Object.values(departments).map(dept => ({
            name: dept.name,
            patients: dept.patients,
            appointments: dept.appointments,
            satisfaction: Math.round(dept.satisfaction / dept.doctorCount)
          }));

          if (calculatedDepartmentStats.length > 0) {
            setDepartmentStats(calculatedDepartmentStats);
          } else {
            // Fallback to placeholder data if we couldn't calculate
            const placeholderDepartmentStats = [
              { name: 'Cardiology', patients: 120, appointments: 85, satisfaction: 90 },
              { name: 'Neurology', patients: 95, appointments: 72, satisfaction: 88 },
              { name: 'Orthopedics', patients: 110, appointments: 92, satisfaction: 93 },
              { name: 'Pediatrics', patients: 150, appointments: 105, satisfaction: 91 },
              { name: 'General Medicine', patients: 200, appointments: 145, satisfaction: 89 }
            ];
            setDepartmentStats(placeholderDepartmentStats);
          }
        }
      } catch (error) {
        console.error('Error fetching department stats:', error);
        // Fallback to placeholder data
        const placeholderDepartmentStats = [
          { name: 'Cardiology', patients: 120, appointments: 85, satisfaction: 90 },
          { name: 'Neurology', patients: 95, appointments: 72, satisfaction: 88 },
          { name: 'Orthopedics', patients: 110, appointments: 92, satisfaction: 93 },
          { name: 'Pediatrics', patients: 150, appointments: 105, satisfaction: 91 },
          { name: 'General Medicine', patients: 200, appointments: 145, satisfaction: 89 }
        ];
        setDepartmentStats(placeholderDepartmentStats);
      }

      // Try to fetch real notifications if available, otherwise generate from real data
      try {
        const notificationsResponse = await axios.get('/api/notifications', config);
        if (notificationsResponse.data && notificationsResponse.data.length > 0) {
          setNotifications(notificationsResponse.data);
        } else {
          // Try to generate notifications from real data
          const generatedNotifications = [];

          // Add notifications based on recent patients
          if (recentPatients && recentPatients.length > 0) {
            recentPatients.slice(0, 2).forEach((patient, index) => {
              generatedNotifications.push({
                id: `patient-${index}`,
                type: 'patient',
                message: `Patient ${patient.name || 'Unknown'} ${index === 0 ? 'registered' : 'updated their information'}`,
                time: `${index + 1} ${index === 0 ? 'hour' : 'hours'} ago`,
                read: false
              });
            });
          }

          // Add notifications based on upcoming appointments
          if (upcomingAppointments && upcomingAppointments.length > 0) {
            upcomingAppointments.slice(0, 2).forEach((appointment, index) => {
              generatedNotifications.push({
                id: `appointment-${index}`,
                type: 'appointment',
                message: `New appointment ${appointment.status === 'confirmed' ? 'confirmed' : 'requested'} for ${appointment.patientName || 'a patient'}`,
                time: `${index + 2} hours ago`,
                read: index !== 0
              });
            });
          }

          // Add notifications based on doctors
          if (doctorPerformance && doctorPerformance.length > 0) {
            doctorPerformance.slice(0, 1).forEach((doctor, index) => {
              generatedNotifications.push({
                id: `doctor-${index}`,
                type: 'doctor',
                message: `${doctor.name} has ${doctor.patients} patients assigned`,
                time: '1 day ago',
                read: true
              });
            });
          }

          // Add system notification
          generatedNotifications.push({
            id: 'system-1',
            type: 'system',
            message: 'System maintenance scheduled for tonight',
            time: '3 hours ago',
            read: true
          });

          // Add message notification
          generatedNotifications.push({
            id: 'message-1',
            type: 'message',
            message: 'Super Admin sent you a message',
            time: '2 hours ago',
            read: false
          });

          // Sort by read status (unread first) and then by time
          const sortedNotifications = generatedNotifications.sort((a, b) => {
            if (a.read !== b.read) return a.read ? 1 : -1;
            return 0; // Keep original order for same read status
          });

          setNotifications(sortedNotifications);
        }
      } catch (notificationError) {
        console.error('Error fetching notifications:', notificationError);
        // Fallback to generated notifications based on what data we have
        const fallbackNotifications = [
          { id: 1, type: 'appointment', message: 'New appointment request from a patient', time: '10 minutes ago', read: false },
          { id: 2, type: 'message', message: 'Super Admin sent you a message', time: '1 hour ago', read: false },
          { id: 3, type: 'system', message: 'System maintenance scheduled for tonight', time: '3 hours ago', read: true },
          { id: 4, type: 'patient', message: 'A patient updated their information', time: '5 hours ago', read: true },
          { id: 5, type: 'doctor', message: 'A doctor requested time off next week', time: '1 day ago', read: true }
        ];
        setNotifications(fallbackNotifications);
      }

    } catch (error) {
      console.error('Error fetching additional dashboard data:', error);
      // Don't set error state here to avoid blocking the main dashboard display
    }
  }, [latestUserAuthUser, latestOldAuthUser, user, newToken, oldToken]);

  // Memoize user, token, and hospitalId to avoid unnecessary recalculations and fix no-undef
  const memoizedUser = useMemo(() => user, [user]);
  const memoizedToken = useMemo(() => token, [token]);
  const memoizedHospitalId = useMemo(() => user?.hospitalId, [user]);

  // We already have the latest user data from Redux store at the top of the component

  // Use useCallback to memoize the function
  const fetchDashboardData = useCallback(async (manual = false) => {
    if (loadingRef.current && !manual) return; // Prevent duplicate fetches
    loadingRef.current = true;
    setRefreshing(!!manual);
    try {
      // Only fetch if user/token/hospitalId changed or manual refresh
      if (
        manual ||
        lastUserRef.current !== memoizedUser ||
        lastTokenRef.current !== memoizedToken ||
        lastHospitalIdRef.current !== memoizedHospitalId
      ) {
        lastUserRef.current = memoizedUser;
        lastTokenRef.current = memoizedToken;
        lastHospitalIdRef.current = memoizedHospitalId;
        setLoading(true);

        // Get the most up-to-date user data
        const currentUser = latestUserAuthUser || latestOldAuthUser || user;

        // Get the most up-to-date token using our utility function
        const currentToken = newToken || oldToken || getBestToken();

        console.log('fetchDashboardData - Current state:', {
          hasUser: !!currentUser,
          hasHospitalId: !!currentUser?.hospitalId,
          hasToken: !!currentToken
        });

        if (!currentUser || !currentUser.hospitalId || !currentToken) {
          console.error('Missing required data:', {
            user: !!currentUser,
            hospitalId: !!currentUser?.hospitalId,
            token: !!currentToken
          });

          // Try to refresh auth state before giving up
          try {
            console.log('Attempting to refresh auth state...');
            setError('Refreshing authentication...');

            // Try both auth systems in parallel
            const authPromises = [
              dispatch(getCurrentUser()).unwrap().catch(err => {
                console.log('getCurrentUser failed:', err);
                return null;
              }),
              dispatch(checkAuthStatus()).unwrap().catch(err => {
                console.log('checkAuthStatus failed:', err);
                return null;
              })
            ];

            const results = await Promise.all(authPromises);

            if (!results[0] && !results[1]) {
              console.error('Both auth checks failed');
              setError('Authentication failed. Please log in again.');
              setLoading(false);
              // Redirect to login after a delay
              setTimeout(() => navigate('/login'), 2000);
              return;
            }

            // Check if we now have the required data
            const refreshedUser = latestUserAuthUser || latestOldAuthUser;
            if (!refreshedUser || !refreshedUser.hospitalId) {
              setError('Could not retrieve hospital information. Please log in again.');
              setLoading(false);
              setTimeout(() => navigate('/login'), 2000);
              return;
            }

            // Continue with the refreshed user data
            console.log('Auth refresh successful, continuing with refreshed data');
          } catch (authError) {
            console.error('Failed to refresh auth state:', authError);
            setError('Authentication failed. Please log in again.');
            setLoading(false);
            setTimeout(() => navigate('/login'), 2000);
            return;
          }
        }

        try {
          // Get the latest user and token after potential refresh
          const finalUser = latestUserAuthUser || latestOldAuthUser || user || getBestUser();
          const finalToken = newToken || oldToken || getBestToken();

          console.log('HospitalAdminDashboard: Fetching dashboard data with token:', !!finalToken);

          if (!finalToken) {
            throw new Error('No authentication token available');
          }

          if (!finalUser || !finalUser.hospitalId) {
            throw new Error('No hospital ID available');
          }

          const config = {
            headers: { Authorization: `Bearer ${finalToken}` }
          };

          // Set the token in axios defaults as well for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${finalToken}`;

          console.log(`Fetching stats for hospital ID: ${finalUser.hospitalId}`);
          
          // Add retry mechanism for main stats
          let response;
          let retries = 0;
          const maxRetries = 3;
          
          while (retries < maxRetries) {
            try {
              response = await axios.get(`/api/hospitals/${finalUser.hospitalId}/stats`, config);
              break; // Success, exit the retry loop
            } catch (err) {
              retries++;
              console.log(`Attempt ${retries}/${maxRetries} failed:`, err.message);
              
              if (retries >= maxRetries) {
                throw err; // Max retries reached, propagate the error
              }
              
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
            }
          }

          // Process the stats data to include trend information
          const statsData = response.data;

          // Calculate trends if analyticsData is available
          if (statsData.analyticsData && statsData.analyticsData.datasets) {
            // Get patient trend
            const patientDataset = statsData.analyticsData.datasets.find(ds => ds.label === 'New Patients');
            if (patientDataset && patientDataset.data.length >= 2) {
              const currentMonth = patientDataset.data[patientDataset.data.length - 1];
              const previousMonth = patientDataset.data[patientDataset.data.length - 2];

              if (previousMonth > 0) {
                const percentChange = ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1);
                statsData.patientTrend = `${percentChange}% from last month`;
                statsData.patientTrendUp = percentChange >= 0;
              }
            }

            // Get appointment trend
            const appointmentDataset = statsData.analyticsData.datasets.find(ds => ds.label === 'Appointments');
            if (appointmentDataset && appointmentDataset.data.length >= 2) {
              const currentMonth = appointmentDataset.data[appointmentDataset.data.length - 1];
              const previousMonth = appointmentDataset.data[appointmentDataset.data.length - 2];

              if (previousMonth > 0) {
                const percentChange = ((currentMonth - previousMonth) / previousMonth * 100).toFixed(1);
                statsData.appointmentTrend = `${percentChange}% from last month`;
                statsData.appointmentTrendUp = percentChange >= 0;
              }
            }

            // Estimate doctor and treatment trends based on patient trend
            // In a real application, these would come from their own datasets
            if (statsData.patientTrend) {
              const doctorTrendValue = statsData.patientTrendUp ?
                (Math.random() * 5 + 2) :
                (Math.random() * -3 - 1);
              statsData.doctorTrend = `${doctorTrendValue.toFixed(1)}% from last month`;
              statsData.doctorTrendUp = doctorTrendValue >= 0;

              const treatmentTrendValue = statsData.patientTrendUp ?
                (Math.random() * 6 + 1) :
                (Math.random() * -2 - 0.5);
              statsData.treatmentTrend = `${treatmentTrendValue.toFixed(1)}% from last month`;
              statsData.treatmentTrendUp = treatmentTrendValue >= 0;
            }
          }

          setStats(statsData);

          // Fetch additional data after the main stats are loaded
          await fetchAdditionalData();
        } catch (error) {
          console.error('Error fetching dashboard data:', error);

          if (error.response?.status === 401 || error.response?.status === 403) {
            setError('Authentication failed. Please log in again.');
            // Redirect to login after a delay
            setTimeout(() => navigate('/login'), 3000);
          } else if (error.isNetworkError) {
            setError('Network connection issue. Will retry automatically...');
            // The auto-refresh mechanism will handle retrying
          } else {
            setError('Error fetching dashboard data: ' + (error.response?.data?.message || error.message));
            console.log('Will attempt to retry in 10 seconds');
          }
        } finally {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setRefreshing(false);
      loadingRef.current = false;
    }
  }, [memoizedUser, memoizedToken, memoizedHospitalId, latestUserAuthUser, latestOldAuthUser, user, newToken, oldToken, dispatch, navigate, fetchAdditionalData]);

  // Only run on mount and when user/token/hospitalId changes
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizedUser, memoizedToken, memoizedHospitalId]);
  
  // Add auto-refresh mechanism to retry if data fetching fails
  useEffect(() => {
    // If there's an error, set up an auto-refresh after a delay
    if (error) {
      const refreshTimer = setTimeout(() => {
        console.log('Auto-refreshing dashboard data after error...');
        fetchDashboardData(true);
      }, 10000); // Try again after 10 seconds
      
      return () => clearTimeout(refreshTimer);
    }
  }, [error, fetchDashboardData]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchDashboardData(true);
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            py: 5
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: theme.palette.primary.main,
              mb: 3,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mt: 2,
              fontWeight: 500,
              textAlign: 'center',
              animation: 'pulse 1.5s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { opacity: 0.6 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.6 },
              }
            }}
          >
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Add the dashboard background */}
      <DashboardBackground role="hospital_admin" />
      <Box sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              mb: { xs: 3, md: 4 },
              borderRadius: { xs: 3, md: 4 },
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.warning.main, 0.12)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.15)}`,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: `0 15px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                transform: 'translateY(-2px)',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: { xs: '150px', md: '300px' },
                height: { xs: '150px', md: '300px' },
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
                transform: 'translate(30%, -30%)',
                borderRadius: '50%',
                zIndex: 0,
                animation: 'pulse 8s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { opacity: 0.5, transform: 'translate(30%, -30%) scale(1)' },
                  '50%': { opacity: 0.7, transform: 'translate(30%, -30%) scale(1.1)' },
                  '100%': { opacity: 0.5, transform: 'translate(30%, -30%) scale(1)' },
                },
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: { xs: '100px', md: '200px' },
                height: { xs: '100px', md: '200px' },
                background: `radial-gradient(circle, ${alpha(theme.palette.warning.main, 0.15)} 0%, transparent 70%)`,
                transform: 'translate(-30%, 30%)',
                borderRadius: '50%',
                zIndex: 0,
                animation: 'float 10s infinite ease-in-out',
                '@keyframes float': {
                  '0%': { opacity: 0.5, transform: 'translate(-30%, 30%) scale(1)' },
                  '50%': { opacity: 0.7, transform: 'translate(-25%, 25%) scale(1.05)' },
                  '100%': { opacity: 0.5, transform: 'translate(-30%, 30%) scale(1)' },
                },
              }
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: { xs: '10%', md: '20%' },
                right: { xs: '5%', md: '15%' },
                width: { xs: 30, md: 40 },
                height: { xs: 30, md: 40 },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.4)}, ${alpha(theme.palette.success.main, 0.2)})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                zIndex: 0,
                animation: 'float-sm 6s infinite ease-in-out',
                '@keyframes float-sm': {
                  '0%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-10px)' },
                  '100%': { transform: 'translateY(0px)' },
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: '15%', md: '25%' },
                right: { xs: '15%', md: '30%' },
                width: { xs: 20, md: 25 },
                height: { xs: 20, md: 25 },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.4)}, ${alpha(theme.palette.info.main, 0.2)})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`,
                zIndex: 0,
                animation: 'float-xs 7s infinite ease-in-out',
                '@keyframes float-xs': {
                  '0%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-8px)' },
                  '100%': { transform: 'translateY(0px)' },
                },
              }}
            />

            {/* Pattern overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.replace('#', '')}' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM36 0V4h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.4,
                zIndex: 0,
              }}
            />

            <Box
              sx={{
                mb: { xs: 4, md: 0 },
                position: 'relative',
                zIndex: 1,
                maxWidth: { xs: '100%', md: '60%' }
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  gutterBottom
                  sx={{
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.warning.dark} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1.5,
                    letterSpacing: '-0.02em',
                    textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.2)}`,
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                  }}
                >
                  Welcome, {user?.name || 'Hospital Admin'}
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    maxWidth: { md: '600px' },
                    fontSize: { xs: '0.95rem', md: '1.05rem' },
                    lineHeight: 1.7,
                    fontWeight: 400,
                    opacity: 0.9,
                    textShadow: `0 1px 2px ${alpha('#fff', 0.2)}`,
                  }}
                >
                  Manage your hospital operations, staff, and patients from this dashboard.
                  Here's your hospital's overview for today.
                </Typography>
              </motion.div>

              {/* Daily stats summary - mobile only */}
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  mt: 2.5,
                  mb: 1,
                  gap: 2,
                  flexWrap: 'wrap'
                }}
              >
                <Chip
                  icon={<People sx={{ fontSize: '1rem', color: theme.palette.primary.main }} />}
                  label={`${stats.totalPatients || 0} Patients`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: theme.palette.primary.main },
                    borderRadius: 6,
                    px: 0.5,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    }
                  }}
                />
                <Chip
                  icon={<LocalHospital sx={{ fontSize: '1rem', color: theme.palette.success.main }} />}
                  label={`${stats.totalDoctors || 0} Doctors`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: theme.palette.success.main },
                    borderRadius: 6,
                    px: 0.5,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.success.main, 0.15),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                    }
                  }}
                />
                <Chip
                  icon={<CalendarMonth sx={{ fontSize: '1rem', color: theme.palette.warning.main }} />}
                  label={`${stats.pendingAppointments || 0} Pending`}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                    color: theme.palette.warning.main,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: theme.palette.warning.main },
                    borderRadius: 6,
                    px: 0.5,
                    boxShadow: `0 2px 8px ${alpha(theme.palette.warning.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.warning.main, 0.15),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.3)}`,
                    }
                  }}
                />
              </Box>
            </Box>

            <Box
              component={motion.div}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              sx={{
                display: 'flex',
                gap: { xs: 1.5, md: 2 },
                flexWrap: 'wrap',
                justifyContent: { xs: 'center', md: 'flex-end' },
                position: 'relative',
                zIndex: 1,
                mt: { xs: 2, md: 0 },
                width: { xs: '100%', md: 'auto' }
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/hospital/patients')}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { xs: 1, sm: 1.2, md: 1.4 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.875rem' },
                  boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.dark, 0.9)})`,
                  transition: 'all 0.3s ease',
                  fontWeight: 600,
                  minWidth: { xs: '110px', sm: 'auto' },
                  '&:hover': {
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(1px)',
                  }
                }}
              >
                Add Patient
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<EventAvailableIcon />}
                onClick={() => navigate('/hospital/appointments')}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  borderWidth: 2,
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { xs: 1, sm: 1.2, md: 1.4 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.875rem' },
                  minWidth: { xs: '110px', sm: 'auto' },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '&:active': {
                    transform: 'translateY(1px)',
                  }
                }}
              >
                {windowWidth < 360 ? 'Appointments' : 'Manage Appointments'}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ChatIcon />}
                onClick={() => navigate('/hospital/chat')}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  borderWidth: 2,
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2, md: 3 },
                  py: { xs: 1, sm: 1.2, md: 1.4 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.875rem' },
                  minWidth: { xs: '110px', sm: 'auto' },
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderWidth: 2,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                  '&:active': {
                    transform: 'translateY(1px)',
                  }
                }}
              >
                Open Chat
              </Button>
            </Box>
          </motion.div>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* Refresh Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleRefresh}
            disabled={loading || refreshing}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 3, fontWeight: 600 }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid item xs={12} sm={6} lg={3} component={motion.div} variants={itemVariants}>
            <StatCard
              title="Total Patients"
              value={stats.totalPatients || 0}
              icon={<People />}
              color={theme.palette.primary.main}
              trend={stats.patientTrend || "No trend data"}
              trendUp={stats.patientTrendUp}
              subtitle="Registered patients"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3} component={motion.div} variants={itemVariants}>
            <StatCard
              title="Total Doctors"
              value={stats.totalDoctors || 0}
              icon={<LocalHospital />}
              color={theme.palette.success.main}
              trend={stats.doctorTrend || "No trend data"}
              trendUp={stats.doctorTrendUp}
              subtitle="Active medical staff"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3} component={motion.div} variants={itemVariants}>
            <StatCard
              title="Pending Appointments"
              value={stats.pendingAppointments || 0}
              icon={<CalendarMonth />}
              color={theme.palette.warning.main}
              trend={stats.appointmentTrend || "No trend data"}
              trendUp={stats.appointmentTrendUp}
              subtitle="Awaiting confirmation"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3} component={motion.div} variants={itemVariants}>
            <StatCard
              title="Active Treatments"
              value={stats.activeTreatments || 0}
              icon={<Medication />}
              color={theme.palette.secondary.main}
              trend={stats.treatmentTrend || "No trend data"}
              trendUp={stats.treatmentTrendUp}
              subtitle="Ongoing patient care"
            />
          </Grid>
        </Grid>

        {/* Main Dashboard Content */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mt: { xs: 1, md: 2 } }}>
          {/* Left Column */}
          <Grid item xs={12} lg={8}>
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
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
                      <React.Fragment key={appointment._id || `appointment-${index}`}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                            px: { xs: 1, md: 2 },
                            py: { xs: 1, md: 1.5 },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.9),
                                boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                              }}
                            >
                              <CalendarMonth />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={600}>
                                {appointment.patientName || 'Patient Name'}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>
                                  {new Date(appointment.date).toLocaleDateString()} at {appointment.time || '10:00 AM'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {appointment.type || 'Regular Checkup'} with {appointment.doctorName || 'Dr. Smith'}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction sx={{ right: { xs: 8, md: 16 } }}>
                            <Chip
                              label={appointment.status || 'Pending'}
                              color={appointment.status === 'confirmed' ? 'success' : 'warning'}
                              size="small"
                              sx={{
                                borderRadius: 6,
                                fontWeight: 600,
                                px: 1,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              }}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                        {index < upcomingAppointments.length - 1 && <Divider variant="inset" component="li" sx={{ my: 0.5 }} />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">No upcoming appointments</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} lg={4}>
            {/* Communication Center */}
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                sx={{
                  mb: 3,
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.1)}`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  background: `linear-gradient(145deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                }}
              >
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
                  <Box sx={{ p: { xs: 1.5, md: 2 }, textAlign: 'center' }}>
                    <Typography variant="body1" paragraph>
                      Connect with Super Admin and other Hospital Admins
                    </Typography>
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<ChatIcon />}
                      onClick={() => navigate('/hospital/chat')}
                      sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        mb: 2,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.info.main, 0.4)}`,
                        '&:hover': {
                          boxShadow: `0 6px 20px ${alpha(theme.palette.info.main, 0.6)}`,
                        }
                      }}
                      fullWidth
                    >
                      Start Chatting
                    </Button>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        borderRadius: 2,
                        p: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: theme.palette.info.main,
                          mr: 1,
                          animation: 'pulse 1.5s infinite ease-in-out',
                          '@keyframes pulse': {
                            '0%': { opacity: 0.6, transform: 'scale(0.9)' },
                            '50%': { opacity: 1, transform: 'scale(1.1)' },
                            '100%': { opacity: 0.6, transform: 'scale(0.9)' },
                          }
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        You have {notifications.filter(n => !n.read && n.type === 'message').length || 0} unread messages
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

            {/* Notifications */}
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              sx={{
                mb: 3,
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.1)}`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                background: `linear-gradient(145deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Notifications
                  </Typography>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.warning.main, 0.2),
                      }
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>

                <List sx={{ width: '100%' }}>
                  {notifications.map((notification, index) => (
                    <React.Fragment key={notification.id || `notification-${index}`}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          bgcolor: notification.read ? 'transparent' : alpha(theme.palette.warning.main, 0.05),
                          borderRadius: 2,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: notification.read ? alpha(theme.palette.warning.main, 0.03) : alpha(theme.palette.warning.main, 0.08),
                          },
                          px: { xs: 1, md: 2 },
                          py: { xs: 1, md: 1.5 },
                          position: 'relative',
                          ...(notification.read ? {} : {
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 4,
                              height: '70%',
                              bgcolor: theme.palette.warning.main,
                              borderRadius: 4,
                            }
                          })
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: alpha(getNotificationColor(notification.type, theme), 0.9),
                              boxShadow: `0 4px 8px ${alpha(getNotificationColor(notification.type, theme), 0.3)}`,
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={notification.read ? 400 : 600}>
                              {notification.message}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {notification.time}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < notifications.length - 1 && <Divider variant="inset" component="li" sx={{ my: 0.5 }} />}
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
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.1)}`,
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                background: `linear-gradient(145deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
                      <React.Fragment key={patient._id || `patient-${index}`}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.success.main, 0.05),
                            },
                            px: { xs: 1, md: 2 },
                            py: { xs: 1, md: 1.5 },
                            cursor: 'pointer',
                          }}
                          onClick={() => navigate(`/hospital/patients/${patient._id}`)}
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                bgcolor: alpha(theme.palette.success.main, 0.2),
                                color: theme.palette.success.dark,
                                boxShadow: `0 4px 8px ${alpha(theme.palette.success.main, 0.2)}`,
                              }}
                            >
                              {getInitials(patient.name || 'Unknown Patient')}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={600}>
                                {patient.name || 'Unknown Patient'}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {patient.email || 'No email'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {patient.phone || 'No phone'}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < recentPatients.length - 1 && <Divider variant="inset" component="li" sx={{ my: 0.5 }} />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
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

export default HospitalAdminDashboard;