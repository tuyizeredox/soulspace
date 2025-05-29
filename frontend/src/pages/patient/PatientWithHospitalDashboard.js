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
  Chip,
  IconButton,
  Badge,
  Tooltip,
  Dialog,
  DialogContent,
  Grow,
  SwipeableDrawer
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  CalendarMonth,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon,
  MedicalServices,
  MedicalServices as MedicalServicesIcon,
  LocalHospital,
  Person,
  HealthAndSafety,
  Assignment,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  MarkChatUnread as UnreadIcon,
  MarkEmailRead as ReadIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  MonitorHeart as HeartIcon,
  Medication as MedicationIcon,
  WaterDrop as WaterIcon,
  DirectionsWalk as WalkIcon,
  Watch as WatchIcon,
  ShoppingCart as ShoppingCartIcon,
  MedicalInformation as MedicalInfoIcon,
  SmartToy as SmartToyIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from '../../utils/axiosConfig';
import { motion } from 'framer-motion';
import AiHealthAssistant from '../../components/dashboard/AiHealthAssistant';

const PatientWithHospitalDashboard = ({ assignedDoctor: propAssignedDoctor, hospital: propHospital }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Get user data from Redux store
  const { user: oldAuthUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: userAuthUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = userAuthUser || oldAuthUser;

  // Try to get token from multiple sources
  const reduxToken = newToken || oldToken;
  const localStorageToken = localStorage.getItem('token') ||
                           localStorage.getItem('userToken') ||
                           localStorage.getItem('patientToken') ||
                           localStorage.getItem('persistentToken');

  // Use token from Redux or localStorage, preferring Redux
  const token = reduxToken || localStorageToken;

  // State variables
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [onlineAppointments, setOnlineAppointments] = useState([]);
  const [hospital, setHospital] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: { value: 72, unit: 'bpm', status: 'normal' },
    bloodPressure: { value: '120/80', unit: 'mmHg', status: 'normal' },
    bloodSugar: { value: 90, unit: 'mg/dL', status: 'normal' },
    weight: { value: 70, unit: 'kg', status: 'normal' }
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [hasWearableDevice, setHasWearableDevice] = useState(false);

  // New state variables for doctor messages
  const [doctorMessages, setDoctorMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [chatId, setChatId] = useState(null);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Animation variants for future use

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPatientData();
    setRefreshing(false);
  };

  // Fetch doctor messages
  const fetchDoctorMessages = async () => {
    if (!assignedDoctor || !token) return;

    try {
      setNotificationLoading(true);

      // Ensure axios has the token in its default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // First try to get the chat ID if we don't have it yet
      if (!chatId) {
        try {
          const doctorId = assignedDoctor._id || assignedDoctor.id;
          console.log('Fetching chat with doctor:', doctorId);

          // Try to find existing chat
          const chatResponse = await axios.get(`/api/chats/find/${doctorId}`);

          if (chatResponse.data && chatResponse.data._id) {
            setChatId(chatResponse.data._id);
            console.log('Found existing chat:', chatResponse.data._id);

            // Fetch messages for this chat
            const messagesResponse = await axios.get(`/api/chats/${chatResponse.data._id}`);

            if (messagesResponse.data && messagesResponse.data.messages) {
              // Sort messages by timestamp (newest first)
              const sortedMessages = [...messagesResponse.data.messages].sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
              );

              setDoctorMessages(sortedMessages);
              console.log('Fetched messages:', sortedMessages.length);

              // Get unread count
              const unreadResponse = await axios.get(`/api/chats/${chatResponse.data._id}/messages/unread`);
              if (unreadResponse.data && typeof unreadResponse.data.count === 'number') {
                setUnreadMessages(unreadResponse.data.count);
              }
            }
          }
        } catch (error) {
          console.log('No existing chat found or error fetching chat:', error);
          // If no chat exists, we'll create one when the user sends a message
        }
      } else {
        // We already have a chat ID, just fetch messages
        const messagesResponse = await axios.get(`/api/chats/${chatId}`);

        if (messagesResponse.data && messagesResponse.data.messages) {
          // Sort messages by timestamp (newest first)
          const sortedMessages = [...messagesResponse.data.messages].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
          );

          setDoctorMessages(sortedMessages);

          // Get unread count
          const unreadResponse = await axios.get(`/api/chats/${chatId}/messages/unread`);
          if (unreadResponse.data && typeof unreadResponse.data.count === 'number') {
            setUnreadMessages(unreadResponse.data.count);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching doctor messages:', error);
      // Use mock data for testing if API fails
      setDoctorMessages([
        {
          _id: 'm1',
          sender: { _id: 'd1', name: 'Dr. Jennifer Wilson' },
          content: "Hello! Just checking in on how you're feeling today. Have your symptoms improved?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        },
        {
          _id: 'm2',
          sender: { _id: 'd1', name: 'Dr. Jennifer Wilson' },
          content: 'Your latest test results look good. We should discuss them at your next appointment.',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          read: true
        }
      ]);
      setUnreadMessages(1);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Check if patient has a wearable device
  const checkWearableDevice = async () => {
    if (!user || !token) return;

    try {
      // Ensure axios has the token in its default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Try to fetch wearable device data - using a mock endpoint for now
      // In a real implementation, this would be a real API endpoint
      // const response = await axios.get('/api/patients/wearable-device');

      // Using mock data since the endpoint doesn't exist yet
      const mockResponse = {
        data: {
          hasDevice: false,
          healthData: null
        }
      };

      if (mockResponse.data && mockResponse.data.hasDevice) {
        setHasWearableDevice(true);
        console.log('Patient has a wearable device');

        // If there's real health data, update the metrics
        if (mockResponse.data.healthData) {
          setHealthMetrics({
            heartRate: mockResponse.data.healthData.heartRate || healthMetrics.heartRate,
            bloodPressure: mockResponse.data.healthData.bloodPressure || healthMetrics.bloodPressure,
            bloodSugar: mockResponse.data.healthData.bloodSugar || healthMetrics.bloodSugar,
            weight: mockResponse.data.healthData.weight || healthMetrics.weight
          });
        }
      } else {
        setHasWearableDevice(false);
        console.log('Patient does not have a wearable device');
      }
    } catch (error) {
      console.log('Error checking wearable device or API not available:', error);
      setHasWearableDevice(false);
    }
  };

  // Fetch patient's data
  const fetchPatientData = async () => {
    if (!user || !token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      if (!refreshing) {
        setLoading(true);
      }

      // Ensure axios has the token in its default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Check if patient has a wearable device
      await checkWearableDevice();

      // Use props if available, otherwise fetch from API
      if (propAssignedDoctor && propHospital) {
        console.log('Using doctor and hospital from props:', {
          doctor: propAssignedDoctor,
          hospital: propHospital
        });
        setAssignedDoctor(propAssignedDoctor);
        setHospital(propHospital);
      } else {
        // Try to fetch patient assignment if props are not available
        try {
          const assignmentResponse = await axios.get('/api/patient-assignments/my-assignment', config);
          console.log('Patient assignment API response:', assignmentResponse.data);

          // Check if the response has the assigned property and it's true
          if (assignmentResponse.data && assignmentResponse.data.assigned === true) {
            console.log('Patient has an assigned doctor and hospital');

            // Check if the response has primaryDoctor and hospital with all required fields
            if (assignmentResponse.data.primaryDoctor && 
                assignmentResponse.data.hospital && 
                assignmentResponse.data.primaryDoctor._id && 
                assignmentResponse.data.primaryDoctor.name) {
              
              setAssignedDoctor(assignmentResponse.data.primaryDoctor);
              setHospital(assignmentResponse.data.hospital);
              console.log('Successfully set doctor and hospital from API:', {
                doctorId: assignmentResponse.data.primaryDoctor._id,
                doctorName: assignmentResponse.data.primaryDoctor.name,
                hospitalId: assignmentResponse.data.hospital._id,
                hospitalName: assignmentResponse.data.hospital.name
              });
            } else {
              console.warn('Assignment response missing primaryDoctor or hospital details:', assignmentResponse.data);
              throw new Error('Incomplete doctor or hospital data');
            }
          } else if (assignmentResponse.data && !assignmentResponse.data.hasOwnProperty('assigned')) {
            // The API returned data but without an assigned property
            // Check if it has the required fields to be considered a valid assignment
            if (assignmentResponse.data.primaryDoctor && 
                assignmentResponse.data.hospital && 
                assignmentResponse.data.primaryDoctor._id && 
                assignmentResponse.data.primaryDoctor.name) {
              
              setAssignedDoctor(assignmentResponse.data.primaryDoctor);
              setHospital(assignmentResponse.data.hospital);
              console.log('Successfully set doctor and hospital from API (legacy format):', {
                doctorId: assignmentResponse.data.primaryDoctor._id,
                doctorName: assignmentResponse.data.primaryDoctor.name,
                hospitalId: assignmentResponse.data.hospital._id,
                hospitalName: assignmentResponse.data.hospital.name
              });
            } else {
              console.warn('Assignment response missing required doctor or hospital fields');
              throw new Error('Incomplete doctor or hospital data');
            }
          } else {
            console.log('No valid patient assignment found');
            throw new Error('No assignment found or missing doctor information');
          }
        } catch (error) {
          console.error('Error fetching patient assignment:', error);
          
          // For production, we should handle this gracefully
          if (process.env.NODE_ENV === 'production') {
            // In production, we might want to redirect to a different page or show an error
            setError('Unable to load your doctor and hospital information. Please contact support.');
          } else {
            // For development/testing, use mock data
            console.log('Development mode: Using mock doctor and hospital data');
            
            // Mock data for doctor and hospital
            const mockDoctor = {
              _id: 'd1',
              name: 'Dr. Jennifer Wilson',
              profile: {
                specialization: 'Cardiology',
                phone: '+1 (555) 123-4567'
              },
              email: 'jennifer.wilson@soulspace.com'
            };

            const mockHospital = {
              _id: 'h1',
              name: 'SoulSpace General Hospital',
              address: '123 Health Avenue, Medical District',
              phone: '+1 (555) 987-6543',
              email: 'info@soulspace-general.com'
            };

            setAssignedDoctor(mockDoctor);
            setHospital(mockHospital);
          }
        }
      }

      // Try to fetch appointments, use mock data if endpoint not available
      try {
        // Use the correct endpoint for patient appointments
        // Check which endpoint is available
        let appointmentsResponse;
        try {
          appointmentsResponse = await axios.get('/api/appointments/patient', config);
        } catch (error) {
          // Try alternative endpoint
          console.log('Trying alternative appointment endpoint');
          appointmentsResponse = await axios.get('/api/appointments', config);
        }

        console.log('Appointments response:', appointmentsResponse.data);

        if (appointmentsResponse.data) {
          const appointments = appointmentsResponse.data;

          // Filter online appointments
          const online = appointments.filter(apt => apt.type === 'online' && apt.status === 'confirmed');
          setOnlineAppointments(online);

          // Sort by date and take the next 5
          const upcoming = appointments
            .filter(apt => apt.status === 'confirmed')
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);
          setUpcomingAppointments(upcoming);
        }
      } catch (error) {
        console.log('API endpoint for patient appointments not available, using mock data');
        // Mock data for appointments
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const mockAppointments = [
          {
            _id: 'a1',
            doctorName: 'Dr. Jennifer Wilson',
            doctorId: 'd1',
            date: tomorrow.toISOString(),
            time: '10:30 AM',
            type: 'online',
            status: 'confirmed',
            reason: 'Heart checkup'
          },
          {
            _id: 'a2',
            doctorName: 'Dr. Michael Chen',
            doctorId: 'd2',
            date: nextWeek.toISOString(),
            time: '2:00 PM',
            type: 'in-person',
            status: 'confirmed',
            reason: 'Annual physical'
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
      }

      // Try to fetch medical records, use mock data if endpoint not available
      try {
        // Use the new endpoint for patients to get their own medical records
        const recordsResponse = await axios.get('/api/medical-records/my-records', config);
        console.log('Medical records response:', recordsResponse.data);
        if (recordsResponse.data) {
          setMedicalRecords(recordsResponse.data);
        }
      } catch (error) {
        console.log('API endpoint for medical records not available, using mock data');
        // Mock data for medical records
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const mockRecords = [
          {
            _id: 'mr1',
            title: 'Cardiology Consultation',
            date: lastMonth.toISOString(),
            doctorName: 'Dr. Jennifer Wilson',
            doctorId: 'd1',
            content: 'Patient\'s blood pressure is within normal range. EKG shows normal sinus rhythm.'
          },
          {
            _id: 'mr2',
            title: 'Blood Test Results',
            date: twoMonthsAgo.toISOString(),
            doctorName: 'Dr. Michael Chen',
            doctorId: 'd2',
            content: 'All blood parameters are within normal range. Cholesterol levels slightly elevated.'
          },
          {
            _id: 'mr3',
            title: 'Annual Physical Examination',
            date: threeMonthsAgo.toISOString(),
            doctorName: 'Dr. Michael Chen',
            doctorId: 'd2',
            content: 'Patient is in good health. Recommended regular exercise and balanced diet.'
          }
        ];

        setMedicalRecords(mockRecords);
      }

      // Try to fetch notifications
      try {
        const notificationsResponse = await axios.get('/api/notifications?limit=5', config);
        if (notificationsResponse.data) {
          setNotifications(notificationsResponse.data);
        }

        // Get unread count
        const unreadResponse = await axios.get('/api/notifications/unread-count', config);
        if (unreadResponse.data && unreadResponse.data.count !== undefined) {
          setUnreadNotifications(unreadResponse.data.count);
        }
      } catch (error) {
        console.log('API endpoint for notifications not available, using mock data');
        // Mock notifications
        setNotifications([
          {
            _id: 'n1',
            title: 'Appointment Reminder',
            message: 'You have an appointment tomorrow at 10:30 AM',
            date: new Date().toISOString(),
            read: false,
            type: 'appointment'
          },
          {
            _id: 'n2',
            title: 'New Message',
            message: 'You have a new message from Dr. Jennifer Wilson',
            date: new Date().toISOString(),
            read: true,
            type: 'message'
          }
        ]);
        setUnreadNotifications(1);
      }

      // Try to fetch prescriptions
      try {
        // Use the new endpoint for patients to get their own prescriptions
        const prescriptionsResponse = await axios.get('/api/prescriptions/my-prescriptions', config);
        console.log('Prescriptions response:', prescriptionsResponse.data);
        if (prescriptionsResponse.data) {
          setPrescriptions(prescriptionsResponse.data);
        }
      } catch (error) {
        console.log('API endpoint for prescriptions not available, using mock data');
        // Mock prescriptions
        setPrescriptions([
          {
            _id: 'p1',
            medication: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
            doctorName: 'Dr. Jennifer Wilson',
            doctorId: 'd1'
          },
          {
            _id: 'p2',
            medication: 'Atorvastatin',
            dosage: '20mg',
            frequency: 'Once daily at bedtime',
            startDate: new Date().toISOString(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
            doctorName: 'Dr. Jennifer Wilson',
            doctorId: 'd1'
          }
        ]);
      }

    } catch (error) {
      console.error('Error in patient dashboard:', error);
      // Don't show error to user, just use mock data
      setError('');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    // Set token in axios headers immediately
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Setting initial token in axios headers');
    }

    fetchPatientData();

    // Set up token refresh interval
    const tokenRefreshInterval = setInterval(async () => {
      try {
        // Get the current token from localStorage
        const refreshToken = localStorage.getItem('token') ||
                            localStorage.getItem('userToken') ||
                            localStorage.getItem('patientToken') ||
                            localStorage.getItem('persistentToken');

        if (refreshToken) {
          // Ensure the axios instance has the latest token
          axios.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`;
          console.log('Refreshed token in axios headers');
        } else {
          console.warn('No token found during refresh interval');
        }
      } catch (error) {
        console.error('Error in token refresh interval:', error);
      }
    }, 60 * 1000); // Every minute

    // Clean up interval on unmount
    return () => {
      clearInterval(tokenRefreshInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, propAssignedDoctor, propHospital]);

  // Effect to handle token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Token changed, updating axios headers');
    }
  }, [token]);

  // Fetch doctor messages when assigned doctor changes
  useEffect(() => {
    if (assignedDoctor) {
      fetchDoctorMessages();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedDoctor]);

  // Set up message notification polling
  useEffect(() => {
    if (!assignedDoctor) return;

    // Check for new messages every minute
    const messageInterval = setInterval(() => {
      fetchDoctorMessages();
    }, 60000);

    return () => clearInterval(messageInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedDoctor, chatId]);

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

  // Debug function to log hospital and doctor data
  const logDebugData = () => {
    console.group('PatientWithHospitalDashboard Debug Data');
    console.log('Props received:');
    console.log('- propAssignedDoctor:', propAssignedDoctor);
    console.log('- propHospital:', propHospital);
    console.log('State values:');
    console.log('- assignedDoctor:', assignedDoctor);
    console.log('- hospital:', hospital);

    // Log detailed hospital data if available
    if (hospital) {
      console.group('Hospital Details');
      console.log('- hospital._id:', hospital._id);
      console.log('- hospital.name:', hospital.name);
      console.log('- hospital.address:', hospital.address);
      console.log('- hospital.location:', hospital.location);
      console.log('- hospital.phone:', hospital.phone);
      console.log('- hospital.email:', hospital.email);

      // Check if location is available
      if (hospital.location) {
        console.log('- hospital.location.address:', hospital.location.address);
        console.log('- hospital.location.city:', hospital.location.city);
        console.log('- hospital.location.state:', hospital.location.state);
        console.log('- hospital.location.zipCode:', hospital.location.zipCode);
        console.log('- hospital.location.phone:', hospital.location.phone);
      }
      console.groupEnd();
    }

    // Log authentication info
    console.group('Authentication Info');
    console.log('- user:', user);
    console.log('- token:', token ? 'Token exists' : 'No token');
    console.log('- localStorage tokens:');
    console.log('  - token:', localStorage.getItem('token') ? 'Exists' : 'None');
    console.log('  - userToken:', localStorage.getItem('userToken') ? 'Exists' : 'None');
    console.log('  - patientToken:', localStorage.getItem('patientToken') ? 'Exists' : 'None');
    console.log('  - persistentToken:', localStorage.getItem('persistentToken') ? 'Exists' : 'None');
    console.groupEnd();

    console.groupEnd();
  };

  // Log debug data when component renders
  useEffect(() => {
    logDebugData();
  }, [assignedDoctor, hospital, logDebugData]);

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

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Handle opening the message drawer
  const handleOpenMessageDrawer = () => {
    setShowNotificationDrawer(true);
    fetchDoctorMessages();
  };

  // Handle marking messages as read
  const handleMarkMessagesAsRead = async () => {
    if (!chatId || unreadMessages === 0) return;

    try {
      await axios.put(`/api/chats/${chatId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUnreadMessages(0);

      // Refresh messages to update read status
      fetchDoctorMessages();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Message Notification Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        onOpen={() => setShowNotificationDrawer(true)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            borderRadius: { xs: '16px 16px 0 0', sm: '16px 0 0 16px' },
            height: { xs: '80%', sm: '100%' },
            top: { xs: 'auto', sm: 0 },
            bottom: { xs: 0, sm: 'auto' },
            boxShadow: '0 0 24px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              Messages from Doctor
            </Typography>
            <IconButton onClick={() => setShowNotificationDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {assignedDoctor && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                sx={{ mr: 1, bgcolor: theme.palette.secondary.light }}
                src={assignedDoctor.avatar}
              >
                {getInitials(assignedDoctor.name)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2">{assignedDoctor.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {assignedDoctor.profile?.specialization || assignedDoctor.specialization || 'Doctor'}
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              size="small"
              startIcon={<ReadIcon />}
              onClick={handleMarkMessagesAsRead}
              disabled={unreadMessages === 0}
            >
              Mark all as read
            </Button>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => {
                setShowNotificationDrawer(false);
                navigate(`/patient/chat/${assignedDoctor?._id || assignedDoctor?.id}`);
              }}
            >
              Open enhanced chat
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 0, overflowY: 'auto', height: '100%' }}>
          {notificationLoading ? (
            <Box sx={{ p: 2 }}>
              <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />
            </Box>
          ) : doctorMessages.length > 0 ? (
            <List sx={{ p: 0 }}>
              {doctorMessages.map((message) => (
                <ListItem
                  key={message._id}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderLeft: message.read ? 'none' : `4px solid ${theme.palette.secondary.main}`,
                    bgcolor: message.read ? 'transparent' : alpha(theme.palette.secondary.light, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.light, 0.05)
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{ bgcolor: message.read ? theme.palette.grey[300] : theme.palette.secondary.light }}
                    >
                      {message.read ? <ReadIcon /> : <UnreadIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={message.read ? 400 : 600}>
                          {message.sender?.name || assignedDoctor?.name || 'Doctor'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatMessageTime(message.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color={message.read ? 'text.secondary' : 'text.primary'}
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          fontWeight: message.read ? 400 : 500
                        }}
                      >
                        {message.content}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ mb: 1 }}>No messages yet</Typography>
              <Button
                variant="outlined"
                startIcon={<ChatIcon />}
                onClick={() => {
                  setShowNotificationDrawer(false);
                  navigate(`/patient/chat/${assignedDoctor?._id || assignedDoctor?.id}`);
                }}
              >
                Start enhanced chat
              </Button>
            </Box>
          )}
        </Box>
      </SwipeableDrawer>

      {/* AI Health Assistant Dialog */}
      <Dialog
        open={showAiAssistant}
        onClose={() => setShowAiAssistant(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            height: { xs: '90vh', md: '80vh' },
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setShowAiAssistant(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ flexGrow: 1, p: 0, display: 'flex', flexDirection: 'column' }}>
          <AiHealthAssistant onBookAppointment={() => {
            setShowAiAssistant(false);
            navigate('/appointments/book');
          }} />
        </DialogContent>
      </Dialog>

      <Box sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 3, md: 4 } }}>
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={4}
            sx={{
              p: { xs: 2.5, md: 3 },
              mb: { xs: 3, md: 4 },
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Background pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                opacity: 0.07,
                backgroundImage: 'url(/pattern-health.svg)',
                backgroundSize: 'cover',
                zIndex: 0
              }}
            />

            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.3)} 0%, transparent 70%)`,
                zIndex: 0
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: '20%',
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.2)} 0%, transparent 70%)`,
                zIndex: 0
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: '40%',
                right: '10%',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${alpha('#ffffff', 0.1)} 0%, transparent 70%)`,
                zIndex: 0
              }}
            />

            {/* Refresh button */}
            <Box sx={{ position: 'absolute', top: 0, right: 0, p: 2, zIndex: 2 }}>
              <Tooltip title="Refresh Dashboard">
                <IconButton
                  color="inherit"
                  onClick={handleRefresh}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' }
                  }}
                >
                  {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={2} sx={{ position: 'relative', zIndex: 1 }}>
              <Grid item xs={12} md={7}>
                <Box sx={{ mb: { xs: 2, md: 0 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={user?.avatar}
                      alt={user?.name}
                      sx={{
                        width: { xs: 60, md: 70 },
                        height: { xs: 60, md: 70 },
                        mr: 2,
                        border: '3px solid white',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                        bgcolor: alpha(theme.palette.common.white, 0.9),
                        color: theme.palette.secondary.main,
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getInitials(user?.name || 'Patient')}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                          fontSize: { xs: '1.5rem', md: '2.2rem' },
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                          letterSpacing: '-0.5px',
                          mb: 0.5
                        }}
                      >
                        Welcome, {user?.name?.split(' ')[0] || 'Patient'}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <AccessTimeIcon sx={{ fontSize: '1rem', mr: 0.5, opacity: 0.8 }} />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      p: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: alpha('#ffffff', 0.1),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha('#ffffff', 0.2)}`
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        lineHeight: 1.5,
                        letterSpacing: '0.015em'
                      }}
                    >
                      Manage your appointments, medical records, and communicate with your assigned doctor. Your health journey is our priority.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label="Hospital Patient"
                      color="secondary"
                      variant="filled"
                      sx={{
                        fontWeight: 600,
                        bgcolor: 'white',
                        color: theme.palette.secondary.main,
                        '& .MuiChip-label': { px: 1.5 },
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    />
                    {assignedDoctor && (
                      <Chip
                        icon={<CheckCircleIcon sx={{ color: theme.palette.success.main }} />}
                        label="Doctor Assigned"
                        variant="filled"
                        sx={{
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                          '& .MuiChip-label': { px: 1.5 }
                        }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {hospital && (
                      <Chip
                        icon={<LocalHospital />}
                        label={hospital.name}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    )}
                    {assignedDoctor && (
                      <Chip
                        icon={<MedicalServicesIcon />}
                        label={`${assignedDoctor.name}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          '& .MuiChip-icon': { color: 'white' }
                        }}
                      />
                    )}
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`${upcomingAppointments.length} Upcoming Appointments`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '& .MuiChip-icon': { color: 'white' }
                      }}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={5}>
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  justifyContent: { xs: 'center', md: 'flex-end' },
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                    {onlineAppointments.length > 0 && (
                      <Button
                        variant="contained"
                        startIcon={<VideoCallIcon />}
                        onClick={() => navigate('/patient/online-appointments')}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          bgcolor: 'white',
                          color: theme.palette.primary.main,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          '&:hover': {
                            bgcolor: alpha('#ffffff', 0.9),
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
                          }
                        }}
                      >
                        Join Online Appointment
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={
                        <Badge badgeContent={unreadMessages} color="error" sx={{ '.MuiBadge-badge': { top: -5, right: -5 } }}>
                          <ChatIcon />
                        </Badge>
                      }
                      onClick={() => navigate(`/patient/chat/${assignedDoctor?._id || assignedDoctor?.id}`)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      {unreadMessages > 0 ? `${unreadMessages} New Messages` : 'Enhanced Chat'}
                    </Button>
                  </Box>

                  <Box sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    justifyContent: { xs: 'center', md: 'flex-end' }
                  }}>
                    <Button
                      variant="contained"
                      startIcon={<CalendarMonth />}
                      onClick={() => navigate('/appointments/book')}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        bgcolor: 'white',
                        color: theme.palette.primary.main,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                          bgcolor: alpha('#ffffff', 0.9),
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
                        }
                      }}
                    >
                      Book Appointment
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SmartToyIcon />}
                      onClick={() => setShowAiAssistant(true)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        bgcolor: alpha('#ffffff', 0.85),
                        color: theme.palette.secondary.main,
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          bgcolor: 'white',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
                        }
                      }}
                    >
                      AI Health Assistant
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<MedicalInfoIcon />}
                      onClick={() => navigate('/patient/health-records')}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255, 255, 255, 0.1)'
                        }
                      }}
                    >
                      Health Records
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

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
                    onClick={() => navigate('/patient/appointments')}
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
                                {appointment.doctorName || 'Dr. Unknown'}
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
                          {appointment.type === 'online' && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="info"
                              onClick={() => navigate(`/patient/online-appointment/${appointment._id}`)}
                              sx={{ borderRadius: 2, textTransform: 'none', minWidth: 100 }}
                            >
                              Join
                            </Button>
                          )}
                        </ListItem>
                        {index < upcomingAppointments.length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">No upcoming appointments</Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/appointments/book')}
                      sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                    >
                      Book an Appointment
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Health Metrics */}
            <Grow in={true} timeout={800}>
              <Card sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: theme.shadows[3],
                background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.9)}, ${theme.palette.background.paper})`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <HeartIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" fontWeight={600}>
                        Health Metrics
                      </Typography>
                    </Box>
                    <Chip
                      label="Last updated today"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>

                  {hasWearableDevice ? (
                    <>
                      <Grid container spacing={2.5}>
                        <Grid item xs={6} sm={3}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.primary.light, 0.1),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <HeartIcon color="error" sx={{ mb: 1, fontSize: '2rem' }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Heart Rate
                            </Typography>
                            <Typography variant="h5" fontWeight={700} color="primary.dark">
                              {healthMetrics.heartRate.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                              {healthMetrics.heartRate.unit}
                            </Typography>
                            <Chip
                              label={healthMetrics.heartRate.status}
                              size="small"
                              color={healthMetrics.heartRate.status === 'normal' ? 'success' : 'warning'}
                              sx={{ height: 20, fontWeight: 600 }}
                            />
                          </Paper>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.info.light, 0.1),
                              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: `0 4px 20px ${alpha(theme.palette.info.main, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <WaterIcon color="info" sx={{ mb: 1, fontSize: '2rem' }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Blood Pressure
                            </Typography>
                            <Typography variant="h5" fontWeight={700} color="info.dark">
                              {healthMetrics.bloodPressure.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                              {healthMetrics.bloodPressure.unit}
                            </Typography>
                            <Chip
                              label={healthMetrics.bloodPressure.status}
                              size="small"
                              color={healthMetrics.bloodPressure.status === 'normal' ? 'success' : 'warning'}
                              sx={{ height: 20, fontWeight: 600 }}
                            />
                          </Paper>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.warning.light, 0.1),
                              border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: `0 4px 20px ${alpha(theme.palette.warning.main, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <MedicationIcon color="warning" sx={{ mb: 1, fontSize: '2rem' }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Blood Sugar
                            </Typography>
                            <Typography variant="h5" fontWeight={700} color="warning.dark">
                              {healthMetrics.bloodSugar.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                              {healthMetrics.bloodSugar.unit}
                            </Typography>
                            <Chip
                              label={healthMetrics.bloodSugar.status}
                              size="small"
                              color={healthMetrics.bloodSugar.status === 'normal' ? 'success' : 'warning'}
                              sx={{ height: 20, fontWeight: 600 }}
                            />
                          </Paper>
                        </Grid>

                        <Grid item xs={6} sm={3}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.success.light, 0.1),
                              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: `0 4px 20px ${alpha(theme.palette.success.main, 0.15)}`,
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <WalkIcon color="success" sx={{ mb: 1, fontSize: '2rem' }} />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Weight
                            </Typography>
                            <Typography variant="h5" fontWeight={700} color="success.dark">
                              {healthMetrics.weight.value}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                              {healthMetrics.weight.unit}
                            </Typography>
                            <Chip
                              label={healthMetrics.weight.status}
                              size="small"
                              color={healthMetrics.weight.status === 'normal' ? 'success' : 'warning'}
                              sx={{ height: 20, fontWeight: 600 }}
                            />
                          </Paper>
                        </Grid>
                      </Grid>

                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => navigate('/patient/health-metrics')}
                          startIcon={<HealthAndSafety />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 3,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                            '&:hover': {
                              boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                            }
                          }}
                        >
                          View Detailed Health Metrics
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            mb: 2
                          }}
                        >
                          <WatchIcon sx={{ fontSize: '2.5rem' }} />
                        </Avatar>
                      </Box>

                      <Typography variant="h6" gutterBottom>
                        No Wearable Device Connected
                      </Typography>

                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                        The health metrics shown are simulated data. For real-time health monitoring,
                        connect a SoulSpace wearable device to your account.
                      </Typography>

                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 3,
                          borderRadius: 2,
                          bgcolor: alpha(theme.palette.info.light, 0.1),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                          maxWidth: 600,
                          mx: 'auto'
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Note:</strong> The SoulSpace wearable device provides:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                          <Typography component="li" variant="body2" color="text.secondary">
                            Real-time heart rate monitoring
                          </Typography>
                          <Typography component="li" variant="body2" color="text.secondary">
                            Blood pressure tracking
                          </Typography>
                          <Typography component="li" variant="body2" color="text.secondary">
                            Blood sugar level monitoring
                          </Typography>
                          <Typography component="li" variant="body2" color="text.secondary">
                            Activity and sleep tracking
                          </Typography>
                        </Box>
                      </Paper>

                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/shop/wearables')}
                        startIcon={<ShoppingCartIcon />}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 3,
                          mr: 2,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                          '&:hover': {
                            boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                          }
                        }}
                      >
                        Buy Wearable Device
                      </Button>

                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => navigate('/patient/health-metrics')}
                        startIcon={<HealthAndSafety />}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          px: 3
                        }}
                      >
                        View Health Metrics
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grow>

            {/* Medical Records */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Medical Records
                  </Typography>
                  <Button
                    variant="text"
                    color="primary"
                    onClick={() => navigate('/patient/medical-records')}
                  >
                    View All
                  </Button>
                </Box>

                {medicalRecords.length > 0 ? (
                  <List>
                    {medicalRecords.slice(0, 3).map((record, index) => (
                      <React.Fragment key={record._id || index}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                            borderRadius: 1
                          }}
                          onClick={() => navigate(`/patient/medical-record/${record._id}`)}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                              <Assignment />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={500}>
                                {record.title || 'Medical Record'}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography component="span" variant="body2" color="text.primary">
                                  {new Date(record.date).toLocaleDateString()}
                                </Typography>
                                {" — "}
                                <Typography component="span" variant="body2" color="text.secondary">
                                  By Dr. {record.doctorName || 'Unknown'}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < medicalRecords.slice(0, 3).length - 1 && <Divider variant="inset" component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography color="text.secondary">No medical records available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            {/* Message Notifications */}
            {assignedDoctor && (
              <Grow in={true} timeout={800}>
                <Card sx={{
                  mb: 3,
                  borderRadius: 3,
                  boxShadow: theme.shadows[2],
                  position: 'relative',
                  overflow: 'hidden',
                  background: unreadMessages > 0
                    ? `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
                    : undefined,
                  border: unreadMessages > 0
                    ? `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                    : undefined,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '4px',
                    backgroundColor: unreadMessages > 0
                      ? theme.palette.secondary.main
                      : theme.palette.primary.main
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" fontWeight={600}>
                        Doctor Messages
                      </Typography>
                      {unreadMessages > 0 && (
                        <Chip
                          label={`${unreadMessages} New`}
                          color="secondary"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      )}
                    </Box>

                    {doctorMessages.length > 0 ? (
                      <>
                        <Box sx={{ mb: 2 }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.background.paper, 0.7),
                              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar
                                  sx={{ width: 32, height: 32, mr: 1, bgcolor: theme.palette.secondary.main }}
                                  src={assignedDoctor.avatar}
                                >
                                  {getInitials(assignedDoctor.name)}
                                </Avatar>
                                <Typography variant="subtitle2">
                                  {assignedDoctor.name}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                {formatMessageTime(doctorMessages[0].timestamp)}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                ml: 5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {doctorMessages[0].content}
                            </Typography>
                          </Paper>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<ChatIcon />}
                            onClick={() => navigate(`/patient/chat/${assignedDoctor._id || assignedDoctor.id}`)}
                            sx={{ borderRadius: 2, textTransform: 'none', flex: 1 }}
                          >
                            Chat
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={unreadMessages > 0 ? <UnreadIcon /> : <ReadIcon />}
                            onClick={handleOpenMessageDrawer}
                            sx={{ borderRadius: 2, textTransform: 'none', flex: 1 }}
                          >
                            {unreadMessages > 0 ? 'View New' : 'View All'}
                          </Button>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography color="text.secondary" paragraph>
                          No messages from your doctor yet.
                        </Typography>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<ChatIcon />}
                          onClick={() => navigate(`/patient/chat/${assignedDoctor._id || assignedDoctor.id}`)}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                          Start Conversation
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grow>
            )}

            {/* My Doctor */}
            {assignedDoctor && (
              <Card sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  backgroundColor: theme.palette.secondary.main
                }
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    My Doctor
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        mr: 2,
                        bgcolor: theme.palette.success.light
                      }}
                    >
                      {getInitials(assignedDoctor.name || 'Doctor')}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {assignedDoctor.name || 'Unknown'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {assignedDoctor.profile?.specialization || assignedDoctor.specialization || 'General Physician'}
                      </Typography>
                      {assignedDoctor.email && (
                        <Typography variant="body2" color="text.secondary">
                          {assignedDoctor.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Contact information */}
                  {(assignedDoctor.profile?.phone || assignedDoctor.phone) && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Phone:</strong> {assignedDoctor.profile?.phone || assignedDoctor.phone}
                    </Typography>
                  )}

                  {/* Specialization details */}
                  {assignedDoctor.profile?.department && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Department:</strong> {assignedDoctor.profile.department}
                    </Typography>
                  )}

                  {/* Experience */}
                  {assignedDoctor.profile?.experience && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Experience:</strong> {assignedDoctor.profile.experience} years
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant="contained"
                      color="info"
                      startIcon={<ChatIcon />}
                      fullWidth
                      onClick={() => navigate(`/patient/chat/${assignedDoctor._id}`)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Enhanced Chat
                    </Button>
                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={<VideoCallIcon />}
                      fullWidth
                      onClick={() => navigate(`/patient/call/${assignedDoctor._id}`)}
                      sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                      Video Call
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Hospital Information */}
            {hospital ? (
              <Card sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  backgroundColor: theme.palette.secondary.main
                }
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    My Hospital
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        mr: 2,
                        bgcolor: theme.palette.primary.light
                      }}
                    >
                      <LocalHospital />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {hospital.name || 'Hospital Name'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {hospital.address || hospital.location?.address || 'Hospital Address'}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Phone:</strong> {hospital.phone || hospital.location?.phone || 'N/A'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Email:</strong> {hospital.email || 'N/A'}
                  </Typography>

                  {hospital.location && hospital.location.city && hospital.location.state && (
                    <Typography variant="body2" color="text.secondary" paragraph>
                      <strong>Location:</strong> {hospital.location.city}, {hospital.location.state}
                    </Typography>
                  )}

                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => navigate(`/hospitals/${hospital._id}`)}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    View Hospital Details
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Fallback when hospital data is missing
              <Card sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: theme.shadows[2],
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '4px',
                  backgroundColor: theme.palette.warning.main
                }
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Hospital Information
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        mr: 2,
                        bgcolor: theme.palette.warning.light
                      }}
                    >
                      <LocalHospital />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        SoulSpace Medical Center
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Default Hospital Information
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary" paragraph>
                    Your hospital information is currently being loaded or updated. Please refresh the page or contact support if this message persists.
                  </Typography>

                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleRefresh}
                    startIcon={refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                </CardContent>
              </Card>
            )}

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
                      startIcon={<CalendarMonth />}
                      onClick={() => navigate('/appointments/book')}
                      sx={{ borderRadius: 2, textTransform: 'none', height: '100%' }}
                    >
                      Book Appointment
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<Person />}
                      onClick={() => navigate('/patient/profile')}
                      sx={{ borderRadius: 2, textTransform: 'none', height: '100%' }}
                    >
                      My Profile
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<HealthAndSafety />}
                      onClick={() => navigate('/patient/health-records')}
                      sx={{ borderRadius: 2, textTransform: 'none', height: '100%' }}
                    >
                      Health Records
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={<MedicalServices />}
                      onClick={() => navigate('/patient/prescriptions')}
                      sx={{ borderRadius: 2, textTransform: 'none', height: '100%' }}
                    >
                      Prescriptions
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<SmartToyIcon />}
                      onClick={() => setShowAiAssistant(true)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        height: '100%',
                        py: 1.5,
                        mt: 1,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`,
                        '&:hover': {
                          boxShadow: `0 6px 16px ${alpha(theme.palette.secondary.main, 0.3)}`
                        }
                      }}
                    >
                      Chat with AI Health Assistant
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

export default PatientWithHospitalDashboard;
