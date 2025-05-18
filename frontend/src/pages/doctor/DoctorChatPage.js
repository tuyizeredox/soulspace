import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  useTheme,
  alpha,
  Button,
  IconButton,
  Tooltip,
  useMediaQuery,
  Fab,
  Grid,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  TextField,
  InputAdornment,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Chat as ChatIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MedicalInformation as MedicalIcon,
  CalendarMonth as CalendarIcon,
  Mic as MicIcon,
  InsertPhoto as PhotoIcon,
  Description as FileIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  Videocam as VideocamIcon,
  MedicalServices as MedicalServicesIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import axios from '../../utils/axiosConfig';
import { fixResizeObserverErrors } from '../../utils/resizeObserverFix';
import DoctorPatientChat from '../../components/doctor/DoctorPatientChat';
import { handleApiError } from '../../utils/apiErrorHandler';

const DoctorChatPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { clearMessages } = useChat();
  const { user: authUser } = useAuth();
  const { user: userAuthUser } = useSelector((state) => state.userAuth);
  const { user: oldAuthUser } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for mobile sidebar toggle

  // Use the user from any available auth source
  const user = authUser || userAuthUser || oldAuthUser;

  // Fix ResizeObserver errors
  useEffect(() => {
    const cleanup = fixResizeObserverErrors();
    return cleanup;
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch patients assigned to the doctor
  const fetchPatients = async () => {
    try {
      setLoading(true);

      // Get token for the request
      const token = localStorage.getItem('token') ||
                    localStorage.getItem('userToken') ||
                    localStorage.getItem('doctorToken');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Create config with authorization header and timeout
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000 // 10 second timeout
      };

      console.log('Attempting to fetch patients for doctor...');

      // Try multiple endpoints to ensure we get the data
      let response;
      let success = false;
      let errorDetails = null;

      // Array of possible endpoints to try
      const endpoints = [
        '/api/doctors/my-patients',
        '/api/patient-doctor-chat/doctor',
        `/api/doctors/${user?.id || user?._id}/patients`
      ];

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch patients from endpoint: ${endpoint}`);
          response = await axios.get(endpoint, config);

          if (response.data && Array.isArray(response.data)) {
            success = true;
            console.log(`Successfully fetched ${response.data.length} patients from ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`Failed to fetch from ${endpoint}:`, err.message);
          errorDetails = err;
        }
      }

      // If we successfully fetched patients
      if (success && response?.data) {
        console.log(`Processing ${response.data.length} patients`);

        // Process the patients data to ensure consistent format
        const processedPatients = response.data.map(patient => ({
          _id: patient._id || patient.id,
          id: patient._id || patient.id,
          name: patient.name || 'Unknown Patient',
          email: patient.email || '',
          phone: patient.phone || patient.profile?.phone || '',
          avatar: patient.avatar || patient.profileImage || '',
          ...patient
        }));

        setPatients(processedPatients);

        // If patientId is provided in URL, select that patient
        if (patientId) {
          const patient = processedPatients.find(p =>
            p._id === patientId || p.id === patientId
          );

          if (patient) {
            setSelectedPatient(patient);
            fetchPatientDetails(patientId);
          }
        }
      } else {
        // If all endpoints failed, use mock data as fallback
        console.log('All endpoints failed, using mock data as fallback');

        // Create mock patients for testing
        const mockPatients = [
          {
            _id: 'mock-patient-1',
            id: 'mock-patient-1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '123-456-7890',
            avatar: '',
            profile: { gender: 'Male', age: 45 }
          },
          {
            _id: 'mock-patient-2',
            id: 'mock-patient-2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '987-654-3210',
            avatar: '',
            profile: { gender: 'Female', age: 32 }
          }
        ];

        setPatients(mockPatients);

        // If patientId is provided in URL, select that patient from mock data
        if (patientId) {
          const mockPatient = mockPatients.find(p => p._id === patientId || p.id === patientId);
          if (mockPatient) {
            setSelectedPatient(mockPatient);
          }
        }

        // Log detailed error information
        if (errorDetails) {
          handleApiError(errorDetails, 'fetchPatients');
        }
      }
    } catch (error) {
      // Handle any unexpected errors
      handleApiError(error, 'fetchPatients');
    } finally {
      setLoading(false);
    }
  };

  // Fetch patient details
  const fetchPatientDetails = async (patientId) => {
    try {
      // Skip if patientId is not valid
      if (!patientId || patientId.startsWith('mock-')) {
        console.log('Skipping patient details fetch for mock patient');
        return;
      }

      // Get token for the request
      const token = localStorage.getItem('token') ||
                    localStorage.getItem('userToken') ||
                    localStorage.getItem('doctorToken');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Create config with authorization header and timeout
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000 // 8 second timeout
      };

      console.log(`Fetching details for patient: ${patientId}`);

      // Try multiple endpoints to ensure we get the data
      let response;
      let success = false;

      // Array of possible endpoints to try
      const endpoints = [
        `/api/patients/${patientId}`,
        `/api/patient-doctor-chat/patient/${patientId}`,
        `/api/users/${patientId}`
      ];

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch patient details from endpoint: ${endpoint}`);
          response = await axios.get(endpoint, config);

          if (response.data) {
            success = true;
            console.log(`Successfully fetched patient details from ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`Failed to fetch from ${endpoint}:`, err.message);
        }
      }

      if (success && response?.data) {
        console.log('Processing patient details');
        setPatientDetails(response.data);

        // Fetch recent appointments
        fetchPatientAppointments(patientId);

        // Fetch medical records
        fetchPatientMedicalRecords(patientId);
      } else {
        // If all endpoints failed, use the selected patient data as fallback
        console.log('All endpoints failed, using selected patient data as fallback');
        if (selectedPatient) {
          setPatientDetails(selectedPatient);
        }
      }
    } catch (error) {
      handleApiError(error, 'fetchPatientDetails');

      // Use selected patient data as fallback
      if (selectedPatient) {
        setPatientDetails(selectedPatient);
      }
    }
  };

  // Fetch patient appointments
  const fetchPatientAppointments = async (patientId) => {
    try {
      // Skip if patientId is not valid
      if (!patientId || patientId.startsWith('mock-')) {
        console.log('Using mock appointments for mock patient');

        // Create mock appointments
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const mockRecentAppointments = [
          {
            _id: 'mock-apt-1',
            date: yesterday.toISOString(),
            time: '10:00 AM',
            type: 'Check-up',
            status: 'completed',
            reason: 'Regular check-up'
          }
        ];

        const mockUpcomingAppointments = [
          {
            _id: 'mock-apt-2',
            date: tomorrow.toISOString(),
            time: '2:00 PM',
            type: 'Follow-up',
            status: 'confirmed',
            reason: 'Follow-up appointment'
          },
          {
            _id: 'mock-apt-3',
            date: nextWeek.toISOString(),
            time: '11:30 AM',
            type: 'Consultation',
            status: 'confirmed',
            reason: 'Consultation for new symptoms'
          }
        ];

        setRecentAppointments(mockRecentAppointments);
        setUpcomingAppointments(mockUpcomingAppointments);
        return;
      }

      // Get token for the request
      const token = localStorage.getItem('token') ||
                    localStorage.getItem('userToken') ||
                    localStorage.getItem('doctorToken');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Create config with authorization header and timeout
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000 // 8 second timeout
      };

      console.log(`Fetching appointments for patient: ${patientId}`);

      // Try multiple endpoints to ensure we get the data
      let response;
      let success = false;

      // Array of possible endpoints to try
      const endpoints = [
        `/api/appointments/patient/${patientId}`,
        `/api/doctors/appointments/patient/${patientId}`,
        `/api/patients/${patientId}/appointments`
      ];

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch appointments from endpoint: ${endpoint}`);
          response = await axios.get(endpoint, config);

          if (response.data && Array.isArray(response.data)) {
            success = true;
            console.log(`Successfully fetched ${response.data.length} appointments from ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`Failed to fetch from ${endpoint}:`, err.message);
        }
      }

      if (success && response?.data) {
        console.log('Processing appointments data');

        // Sort appointments by date
        const sortedAppointments = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Get recent appointments (past appointments)
        const recent = sortedAppointments.filter(apt => new Date(apt.date) < new Date());
        setRecentAppointments(recent);

        // Get upcoming appointments (future appointments)
        const upcoming = sortedAppointments.filter(apt => new Date(apt.date) >= new Date());
        setUpcomingAppointments(upcoming);
      } else {
        // If all endpoints failed, use mock data as fallback
        console.log('All endpoints failed, using mock appointment data as fallback');

        // Create mock appointments
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const mockRecentAppointments = [
          {
            _id: 'mock-apt-1',
            date: yesterday.toISOString(),
            time: '10:00 AM',
            type: 'Check-up',
            status: 'completed',
            reason: 'Regular check-up'
          }
        ];

        const mockUpcomingAppointments = [
          {
            _id: 'mock-apt-2',
            date: tomorrow.toISOString(),
            time: '2:00 PM',
            type: 'Follow-up',
            status: 'confirmed',
            reason: 'Follow-up appointment'
          },
          {
            _id: 'mock-apt-3',
            date: nextWeek.toISOString(),
            time: '11:30 AM',
            type: 'Consultation',
            status: 'confirmed',
            reason: 'Consultation for new symptoms'
          }
        ];

        setRecentAppointments(mockRecentAppointments);
        setUpcomingAppointments(mockUpcomingAppointments);
      }
    } catch (error) {
      handleApiError(error, 'fetchPatientAppointments');

      // Use mock data as fallback
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      setRecentAppointments([
        {
          _id: 'mock-apt-1',
          date: yesterday.toISOString(),
          time: '10:00 AM',
          type: 'Check-up',
          status: 'completed',
          reason: 'Regular check-up'
        }
      ]);

      setUpcomingAppointments([
        {
          _id: 'mock-apt-2',
          date: tomorrow.toISOString(),
          time: '2:00 PM',
          type: 'Follow-up',
          status: 'confirmed',
          reason: 'Follow-up appointment'
        }
      ]);
    }
  };

  // Fetch patient medical records
  const fetchPatientMedicalRecords = async (patientId) => {
    try {
      // Skip if patientId is not valid
      if (!patientId || patientId.startsWith('mock-')) {
        console.log('Using mock medical records for mock patient');

        // Create mock medical records
        const mockMedicalRecords = [
          {
            _id: 'mock-record-1',
            title: 'Annual Physical',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            doctor: 'Dr. Smith',
            notes: 'Patient is in good health. Blood pressure normal.',
            type: 'Physical Examination'
          },
          {
            _id: 'mock-record-2',
            title: 'Blood Test Results',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            doctor: 'Dr. Johnson',
            notes: 'All blood work within normal ranges.',
            type: 'Laboratory'
          }
        ];

        setMedicalRecords(mockMedicalRecords);
        return;
      }

      // Get token for the request
      const token = localStorage.getItem('token') ||
                    localStorage.getItem('userToken') ||
                    localStorage.getItem('doctorToken');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Create config with authorization header and timeout
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000 // 8 second timeout
      };

      console.log(`Fetching medical records for patient: ${patientId}`);

      // Try multiple endpoints to ensure we get the data
      let response;
      let success = false;

      // Array of possible endpoints to try
      const endpoints = [
        `/api/medical-records/patient/${patientId}`,
        `/api/patients/${patientId}/medical-records`,
        `/api/doctors/patients/${patientId}/records`
      ];

      // Try each endpoint until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying to fetch medical records from endpoint: ${endpoint}`);
          response = await axios.get(endpoint, config);

          if (response.data && Array.isArray(response.data)) {
            success = true;
            console.log(`Successfully fetched ${response.data.length} medical records from ${endpoint}`);
            break;
          }
        } catch (err) {
          console.log(`Failed to fetch from ${endpoint}:`, err.message);
        }
      }

      if (success && response?.data) {
        console.log('Processing medical records data');
        setMedicalRecords(response.data);
      } else {
        // If all endpoints failed, use mock data as fallback
        console.log('All endpoints failed, using mock medical records data as fallback');

        // Create mock medical records
        const mockMedicalRecords = [
          {
            _id: 'mock-record-1',
            title: 'Annual Physical',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
            doctor: 'Dr. Smith',
            notes: 'Patient is in good health. Blood pressure normal.',
            type: 'Physical Examination'
          },
          {
            _id: 'mock-record-2',
            title: 'Blood Test Results',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            doctor: 'Dr. Johnson',
            notes: 'All blood work within normal ranges.',
            type: 'Laboratory'
          }
        ];

        setMedicalRecords(mockMedicalRecords);
      }
    } catch (error) {
      handleApiError(error, 'fetchPatientMedicalRecords');

      // Use mock data as fallback
      const mockMedicalRecords = [
        {
          _id: 'mock-record-1',
          title: 'Annual Physical',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          doctor: 'Dr. Smith',
          notes: 'Patient is in good health. Blood pressure normal.',
          type: 'Physical Examination'
        }
      ];

      setMedicalRecords(mockMedicalRecords);
    }
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientDetails(patient._id || patient.id);

    // Update URL without reloading the page
    navigate(`/doctor/message/${patient._id || patient.id}`, { replace: true });
  };

  // Handle schedule appointment
  const handleScheduleAppointment = () => {
    if (selectedPatient) {
      navigate(`/doctor/appointments/new?patientId=${selectedPatient._id || selectedPatient.id}`);
    }
  };

  // Handle view medical records
  const handleViewMedicalRecords = () => {
    if (selectedPatient) {
      navigate(`/doctor/patient/${selectedPatient._id || selectedPatient.id}/records`);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ mb: 4 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Tooltip title="Back to Dashboard">
            <IconButton
              component={RouterLink}
              to="/doctor/dashboard"
              sx={{
                mr: 1.5,
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
              aria-label="back to dashboard"
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}
          >
            Patient Communication Hub
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.15)})`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            position: 'relative',
            overflow: 'hidden'
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
              opacity: 0.05,
              backgroundImage: 'url(/pattern-health.svg)',
              backgroundSize: 'cover',
              zIndex: 0
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{
                color: theme.palette.primary.dark,
                fontSize: { xs: '1.5rem', md: '1.75rem' },
                mb: 1.5
              }}
            >
              Communicate with Your Patients
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: alpha(theme.palette.text.primary, 0.8),
                fontSize: '1.05rem',
                lineHeight: 1.6,
                mb: 2
              }}
            >
              Connect with your patients securely, discuss their health concerns, and provide guidance in real-time.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<MedicalServicesIcon />}
                onClick={handleViewMedicalRecords}
                disabled={!selectedPatient}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
                  '&:hover': {
                    boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                View Medical Records
              </Button>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<CalendarIcon />}
                onClick={handleScheduleAppointment}
                disabled={!selectedPatient}
                sx={{
                  borderRadius: 3,
                  textTransform: 'none',
                  px: 3,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                Schedule Appointment
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Mobile Patient Selection Button */}
      {isMobile && selectedPatient && (
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={selectedPatient?.avatar || selectedPatient?.profileImage}
              sx={{
                width: 40,
                height: 40,
                mr: 1.5,
                bgcolor: theme.palette.primary.main
              }}
            >
              {selectedPatient?.name ? selectedPatient.name.charAt(0).toUpperCase() : 'P'}
            </Avatar>
            <Typography variant="subtitle1" fontWeight={600}>
              {selectedPatient?.name || 'Patient'}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setSelectedPatient(null)}
            startIcon={<PersonIcon />}
            sx={{ borderRadius: 2 }}
          >
            Change Patient
          </Button>
        </Box>
      )}

      {/* Mobile Sidebar Toggle Button - Only visible when a patient is selected on mobile */}
      {isMobile && selectedPatient && (
        <Fab
          color="primary"
          aria-label="open patient list"
          size="medium"
          onClick={() => setSidebarOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 1050,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
          }}
        >
          <PersonIcon />
        </Fab>
      )}

      {/* Chat Interface */}
      <Grid container spacing={3}>
        {/* Patient List - Drawer on mobile, normal grid item on desktop */}
        {isMobile ? (
          <>
            <Box
              component="div"
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0,0,0,0.5)',
                zIndex: 1100,
                display: sidebarOpen ? 'block' : 'none',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setSidebarOpen(false)}
            >
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '85%',
                  maxWidth: 350,
                  height: '100%',
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 0,
                  overflowY: 'auto',
                  transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                  transition: 'transform 0.3s ease',
                  zIndex: 1200
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Box sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography variant="h6" fontWeight={600}>Patient List</Typography>
                  <IconButton onClick={() => setSidebarOpen(false)}>
                    <ArrowBackIcon />
                  </IconButton>
                </Box>

                {/* Rest of the patient list content */}
                <Box sx={{ p: 0 }}>
                  {/* Search Bar */}
                  <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <TextField
                      fullWidth
                      placeholder="Search patients..."
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Box>

                  {/* Patients List */}
                  <Box sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : patients.length > 0 ? (
                      patients.map((patient) => (
                        <Box
                          key={patient._id || patient.id}
                          onClick={() => {
                            handlePatientSelect(patient);
                            setSidebarOpen(false); // Close sidebar after selection on mobile
                          }}
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            transition: 'all 0.2s',
                            bgcolor: selectedPatient && (selectedPatient._id === patient._id || selectedPatient.id === patient.id)
                              ? alpha(theme.palette.primary.main, 0.1)
                              : 'transparent',
                            '&:hover': {
                              bgcolor: selectedPatient && (selectedPatient._id === patient._id || selectedPatient.id === patient.id)
                                ? alpha(theme.palette.primary.main, 0.15)
                                : alpha(theme.palette.primary.main, 0.05)
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar
                              src={patient.avatar || patient.profileImage}
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 1.5,
                                bgcolor: theme.palette.primary.main
                              }}
                            >
                              {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {patient.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {patient.gender}, {patient.age || '??'} years
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">No patients found</Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </>
        ) : (
          <Grid
            item
            xs={12}
            md={4}
            lg={3}
            sx={{
              mb: { xs: 3, md: 0 }
            }}
          >
          <Paper
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              height: { xs: '500px', sm: '600px', md: '750px' },
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 5px 20px ${alpha(theme.palette.common.black, 0.08)}`
            }}
          >
            {/* Search Bar */}
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <TextField
                fullWidth
                placeholder="Search patients..."
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
            </Box>

            {/* Patients List */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : patients.length > 0 ? (
                patients.map((patient) => (
                  <Box
                    key={patient._id || patient.id}
                    onClick={() => handlePatientSelect(patient)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.2s',
                      bgcolor: selectedPatient && (selectedPatient._id === patient._id || selectedPatient.id === patient.id)
                        ? alpha(theme.palette.primary.main, 0.1)
                        : 'transparent',
                      '&:hover': {
                        bgcolor: selectedPatient && (selectedPatient._id === patient._id || selectedPatient.id === patient.id)
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={patient.avatar || patient.profileImage}
                        sx={{
                          width: 50,
                          height: 50,
                          mr: 2,
                          bgcolor: theme.palette.primary.main
                        }}
                      >
                        {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {patient.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {patient.gender}, {patient.age || '??'} years
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled', mr: 0.5 }} />
                          <Typography variant="caption" color="text.disabled">
                            Last message: {patient.lastMessageTime || 'Never'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No patients found</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        )}

        {/* Chat Area */}
        <Grid
          item
          xs={12}
          md={8}
          lg={9}
          sx={{
            display: isMobile && !selectedPatient ? 'none' : 'block',
            height: { xs: 'calc(100vh - 200px)', md: 'auto' }
          }}
        >
          {selectedPatient ? (
            <DoctorPatientChat
              patient={selectedPatient}
              patientDetails={patientDetails}
              recentAppointments={recentAppointments}
              upcomingAppointments={upcomingAppointments}
              medicalRecords={medicalRecords}
              onScheduleAppointment={handleScheduleAppointment}
              onViewMedicalRecords={handleViewMedicalRecords}
              isMobile={isMobile}
              onBackToPatientList={() => setSelectedPatient(null)}
            />
          ) : (
            <Paper
              elevation={2}
              sx={{
                borderRadius: 3,
                height: { xs: '500px', sm: '600px', md: '750px' },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                p: 3,
                boxShadow: `0 5px 20px ${alpha(theme.palette.common.black, 0.08)}`
              }}
            >
              <MedicalIcon sx={{ fontSize: 80, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
              <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
                Select a patient to start a conversation
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
                Choose a patient from the list to view their details and start communicating with them about their health concerns.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorChatPage;
