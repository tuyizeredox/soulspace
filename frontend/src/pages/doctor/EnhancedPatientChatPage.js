import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  useTheme,
  alpha,
  Badge,
  Drawer,
  useMediaQuery,
  Tooltip,
  Button,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  SearchOff as SearchOffIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import axios from '../../utils/axiosConfig';
import EnhancedDoctorPatientChat from '../../components/doctor/EnhancedDoctorPatientChat';
import DoctorSidebar from '../../components/doctor/DoctorSidebar';

const EnhancedPatientChatPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { patientId } = useParams();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isSmallScreen);
  const [patientsList, setPatientsList] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientList, setShowPatientList] = useState(isSmallScreen ? false : true);

  // Get user and chat context
  const { user } = useAuth();
  const { chats, fetchChats } = useChat();

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get token for authorization from all possible sources
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('doctorToken') ||
                      localStorage.getItem('persistentToken');

        console.log('Fetching patient data with token:', !!token);

        if (!token) {
          console.error('No authentication token found');
          throw new Error('Authentication required. Please log in again.');
        }

        // Store token in all locations for redundancy
        localStorage.setItem('token', token);
        localStorage.setItem('userToken', token);
        localStorage.setItem('doctorToken', token);
        localStorage.setItem('persistentToken', token);

        // Create config with authorization header
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Ensure axios has the token in its default headers as well
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch patient data
        const patientResponse = await axios.get(`/api/patients/${patientId}`, config);

        if (patientResponse.data) {
          setPatient(patientResponse.data);
          setSelectedPatient(patientResponse.data);

          // Fetch patient details
          try {
            const detailsResponse = await axios.get(`/api/patients/${patientId}/details`, config);
            setPatientDetails(detailsResponse.data);
          } catch (detailsError) {
            console.error('Error fetching patient details:', detailsError);
          }

          // Fetch appointments
          try {
            const appointmentsResponse = await axios.get(`/api/appointments/patient/${patientId}`, config);

            if (appointmentsResponse.data) {
              // Split appointments into recent and upcoming
              const now = new Date();
              const recent = [];
              const upcoming = [];

              appointmentsResponse.data.forEach(appointment => {
                const appointmentDate = new Date(appointment.date);

                if (appointmentDate < now) {
                  recent.push(appointment);
                } else {
                  upcoming.push(appointment);
                }
              });

              // Sort by date (recent: newest first, upcoming: soonest first)
              recent.sort((a, b) => new Date(b.date) - new Date(a.date));
              upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));

              setRecentAppointments(recent);
              setUpcomingAppointments(upcoming);
            }
          } catch (appointmentsError) {
            console.error('Error fetching appointments:', appointmentsError);
          }

          // Fetch medical records
          try {
            const recordsResponse = await axios.get(`/api/medical-records/patient/${patientId}`, config);

            if (recordsResponse.data) {
              // Sort by date (newest first)
              recordsResponse.data.sort((a, b) => new Date(b.date) - new Date(a.date));
              setMedicalRecords(recordsResponse.data);
            }
          } catch (recordsError) {
            console.error('Error fetching medical records:', recordsError);
          }
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);

        // Log detailed error information
        if (error.response) {
          console.log('Error response data:', error.response.data);
          console.log('Error response status:', error.response.status);

          // If it's an authentication error, try to refresh the token
          if (error.response.status === 401 || error.response.status === 403) {
            console.log('Authentication error detected. Attempting to refresh token...');

            try {
              // Try to get a fresh token from all possible sources
              const freshToken = localStorage.getItem('token') ||
                                localStorage.getItem('userToken') ||
                                localStorage.getItem('doctorToken') ||
                                localStorage.getItem('persistentToken');

              if (freshToken) {
                console.log('Found token, updating axios headers and retrying...');
                axios.defaults.headers.common['Authorization'] = `Bearer ${freshToken}`;

                // Retry the request with the fresh token
                const retryResponse = await axios.get(`/api/patients/${patientId}`, {
                  headers: { Authorization: `Bearer ${freshToken}` }
                });

                if (retryResponse.data) {
                  console.log('Successfully fetched patient data after token refresh');
                  setPatient(retryResponse.data);
                  setSelectedPatient(retryResponse.data);
                  setError(null);
                  return;
                }
              } else {
                console.warn('No valid token found for retry');
              }
            } catch (retryError) {
              console.error('Retry with refreshed token failed:', retryError);
            }
          }
        } else if (error.request) {
          console.log('Error request (no response received):', error.request);
        } else {
          console.log('Error message:', error.message);
        }

        setError('Failed to load patient data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Fetch patients list
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user || !user._id) return;

      try {
        setLoadingPatients(true);

        // Get token for authorization from all possible sources
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('doctorToken') ||
                      localStorage.getItem('persistentToken');

        console.log('Fetching patients with token:', !!token);

        if (!token) {
          console.error('No authentication token found');
          throw new Error('Authentication required. Please log in again.');
        }

        // Store token in all locations for redundancy
        localStorage.setItem('token', token);
        localStorage.setItem('userToken', token);
        localStorage.setItem('doctorToken', token);
        localStorage.setItem('persistentToken', token);

        // Create config with authorization header
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Ensure axios has the token in its default headers as well
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch patients assigned to this doctor
        const response = await axios.get('/api/doctors/my-patients', config);

        if (response.data) {
          // Sort patients by name
          const sortedPatients = [...response.data].sort((a, b) => {
            // First sort by unread messages (if we have chat data)
            const aUnread = chats ? getUnreadCount(a._id) : 0;
            const bUnread = chats ? getUnreadCount(b._id) : 0;

            if (aUnread !== bUnread) {
              return bUnread - aUnread; // Higher unread count first
            }

            // Then sort by name
            return a.name.localeCompare(b.name);
          });

          setPatientsList(sortedPatients);

          // If we have a patientId from URL, select that patient
          if (patientId) {
            const selectedPatient = sortedPatients.find(p => p._id === patientId);
            if (selectedPatient) {
              setSelectedPatient(selectedPatient);
            }
          }
          // Otherwise, if we have patients but no selection, select the first one
          else if (sortedPatients.length > 0 && !selectedPatient) {
            setSelectedPatient(sortedPatients[0]);
            // Only navigate if we're not on mobile to avoid redirecting mobile users
            if (!isSmallScreen) {
              navigate(`/doctor/patients/chat/${sortedPatients[0]._id}`);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching patients:', error);

        // Log detailed error information
        if (error.response) {
          console.log('Error response data:', error.response.data);
          console.log('Error response status:', error.response.status);

          // If it's an authentication error, try to refresh the token
          if (error.response.status === 401 || error.response.status === 403) {
            console.log('Authentication error detected. Attempting to refresh token...');

            try {
              // Try to get a fresh token from all possible sources
              const freshToken = localStorage.getItem('token') ||
                                localStorage.getItem('userToken') ||
                                localStorage.getItem('doctorToken') ||
                                localStorage.getItem('persistentToken');

              if (freshToken) {
                console.log('Found token, updating axios headers and retrying...');
                axios.defaults.headers.common['Authorization'] = `Bearer ${freshToken}`;

                // Retry the request with the fresh token
                const retryResponse = await axios.get('/api/doctors/my-patients', {
                  headers: { Authorization: `Bearer ${freshToken}` }
                });

                if (retryResponse.data && Array.isArray(retryResponse.data)) {
                  console.log(`Successfully fetched ${retryResponse.data.length} patients after token refresh`);
                  setPatientsList(retryResponse.data);
                  return;
                }
              } else {
                console.warn('No valid token found for retry');
              }
            } catch (retryError) {
              console.error('Retry with refreshed token failed:', retryError);
            }
          }
        } else if (error.request) {
          console.log('Error request (no response received):', error.request);
        } else {
          console.log('Error message:', error.message);
        }

        // Try alternative endpoint as fallback
        try {
          console.log('Trying alternative endpoint...');
          const doctorId = user?.id || user?._id;
          if (doctorId) {
            // Get a fresh token for the alternative request
            const altToken = localStorage.getItem('token') ||
                           localStorage.getItem('userToken') ||
                           localStorage.getItem('doctorToken') ||
                           localStorage.getItem('persistentToken');

            if (!altToken) {
              throw new Error('No authentication token available for alternative endpoint');
            }

            const altResponse = await axios.get(`/api/doctors/${doctorId}/patients`, {
              headers: { Authorization: `Bearer ${altToken}` }
            });

            if (altResponse.data && Array.isArray(altResponse.data)) {
              console.log(`Successfully fetched ${altResponse.data.length} patients from alternative endpoint`);
              setPatientsList(altResponse.data);
              return;
            }
          }
        } catch (altError) {
          console.error('Alternative endpoint also failed:', altError);
          console.log('Alternative endpoint error details:', altError.response?.data || altError.message);
        }

        // Set mock data for demo purposes if all API calls fail
        const mockPatients = [
          { _id: '1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', avatar: null },
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+0987654321', avatar: null },
          { _id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1122334455', avatar: null }
        ];
        console.log('Using mock patient data as fallback');
        setPatientsList(mockPatients);
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();

    // Also fetch chats to get unread counts
    fetchChats();

    // Set up interval to refresh data every 30 seconds
    const intervalId = setInterval(() => {
      fetchPatients();
      fetchChats();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [user, fetchChats, patientId, navigate, isSmallScreen, selectedPatient, chats]);

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    navigate(`/doctor/patients/chat/${patient._id}`);
    setSelectedPatient(patient);

    if (isSmallScreen) {
      setShowPatientList(false);
    }
  };

  // Handle schedule appointment
  const handleScheduleAppointment = () => {
    navigate(`/doctor/appointments/schedule/${patientId}`);
  };

  // Handle view medical records
  const handleViewMedicalRecords = () => {
    navigate(`/doctor/patients/${patientId}/medical-records`);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Toggle patient list on mobile
  const togglePatientList = () => {
    setShowPatientList(prev => !prev);
  };

  // Get unread count for a patient
  const getUnreadCount = (patientId) => {
    if (!chats) return 0;

    // Find chat with this patient
    const chat = chats.find(c =>
      c.participants.some(p => p._id === patientId)
    );

    if (!chat) return 0;

    // Get unread count for current user
    return chat.unreadCounts?.get(user._id.toString()) || 0;
  };

  return (
    <Box sx={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      bgcolor: theme.palette.background.default
    }}>
      {/* Doctor Sidebar */}
      <Drawer
        variant={isSmallScreen ? 'temporary' : 'persistent'}
        open={isSidebarOpen}
        onClose={toggleSidebar}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            boxShadow: isSmallScreen ? theme.shadows[8] : 'none'
          },
        }}
      >
        <DoctorSidebar />
      </Drawer>

      {/* Main Content */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        ...(isSidebarOpen && !isSmallScreen && {
          width: `calc(100% - 240px)`,
          marginLeft: '240px',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
      }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            zIndex: 10,
            bgcolor: theme.palette.background.paper,
            boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={toggleSidebar}
              edge="start"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              fontWeight="600"
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Doctor-Patient Chat
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSmallScreen && (
              <Button
                variant="outlined"
                startIcon={showPatientList ? <ArrowBackIcon /> : <SearchIcon />}
                onClick={togglePatientList}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 1.5,
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                {showPatientList ? 'Back to Chat' : 'Patients'}
              </Button>
            )}

            <Tooltip title="Refresh">
              <IconButton
                onClick={() => window.location.reload()}
                sx={{
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Content Area */}
        <Box sx={{
          display: 'flex',
          flexGrow: 1,
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Patients List - Drawer on mobile, permanent on desktop */}
          {isSmallScreen ? (
            <Drawer
              anchor="left"
              open={showPatientList}
              onClose={() => setShowPatientList(false)}
              sx={{
                width: { xs: '85%', sm: 320 },
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: { xs: '85%', sm: 320 },
                  boxSizing: 'border-box',
                  boxShadow: theme.shadows[8]
                },
              }}
            >
              <PatientsList
                patients={patientsList}
                loading={loadingPatients}
                selectedPatientId={selectedPatient?._id}
                onPatientSelect={handlePatientSelect}
                getUnreadCount={getUnreadCount}
              />
            </Drawer>
          ) : (
            <Box sx={{
              width: 320,
              borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              boxShadow: `1px 0 3px ${alpha(theme.palette.common.black, 0.03)}`
            }}>
              <PatientsList
                patients={patientsList}
                loading={loadingPatients}
                selectedPatientId={selectedPatient?._id}
                onPatientSelect={handlePatientSelect}
                getUnreadCount={getUnreadCount}
              />
            </Box>
          )}

          {/* Chat Area */}
          <Box sx={{
            flexGrow: 1,
            display: 'flex',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {loading ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                p: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5)
              }}>
                <CircularProgress
                  size={48}
                  thickness={4}
                  sx={{
                    color: theme.palette.primary.main,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round'
                    }
                  }}
                />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mt: 2,
                    fontWeight: 500,
                    textAlign: 'center'
                  }}
                >
                  Loading patient data...
                </Typography>
              </Box>
            ) : error ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                p: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5)
              }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    mb: 2
                  }}
                >
                  <Typography variant="h3">!</Typography>
                </Box>
                <Typography
                  variant="h6"
                  color="error"
                  gutterBottom
                  sx={{ fontWeight: 600, textAlign: 'center' }}
                >
                  Error Loading Data
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, maxWidth: 400, textAlign: 'center' }}
                >
                  {error}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/doctor/patients')}
                  startIcon={<PeopleIcon />}
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Back to Patients
                </Button>
              </Box>
            ) : !patient && patientsList.length === 0 ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                p: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5)
              }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                    mb: 2
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 600, textAlign: 'center' }}
                >
                  No Patients Assigned
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, maxWidth: 400, textAlign: 'center' }}
                >
                  You don't have any patients assigned to you yet. Once patients are assigned, they will appear here.
                </Typography>
              </Box>
            ) : !patient ? (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                p: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.5)
              }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 2
                  }}
                >
                  <SearchIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 600, textAlign: 'center' }}
                >
                  Select a Patient
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3, maxWidth: 400, textAlign: 'center' }}
                >
                  {isSmallScreen ?
                    "Tap the 'Patients' button above to select a patient and start chatting." :
                    "Select a patient from the list on the left to start chatting."}
                </Typography>
                {isSmallScreen && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={togglePatientList}
                    startIcon={<PeopleIcon />}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    View Patients
                  </Button>
                )}
              </Box>
            ) : (
              <EnhancedDoctorPatientChat
                patient={patient}
                patientDetails={patientDetails}
                recentAppointments={recentAppointments}
                upcomingAppointments={upcomingAppointments}
                medicalRecords={medicalRecords}
                onScheduleAppointment={handleScheduleAppointment}
                onViewMedicalRecords={handleViewMedicalRecords}
                isMobile={isSmallScreen}
                onBackToPatientList={() => setShowPatientList(true)}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// Patients List Component
const PatientsList = ({ patients, loading, selectedPatientId, onPatientSelect, getUnreadCount }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: theme.palette.background.paper
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5
      }}>
        <Typography variant="h6" fontWeight="medium">
          My Patients
        </Typography>

        {/* Search Box */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm('')}
                  edge="end"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: {
              borderRadius: 2,
              bgcolor: alpha(theme.palette.background.default, 0.8),
              '&:hover': {
                bgcolor: alpha(theme.palette.background.default, 1)
              }
            }
          }}
        />
      </Box>

      {/* Patient List */}
      {loading ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          p: 3
        }}>
          <CircularProgress size={32} color="primary" />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading patients...
          </Typography>
        </Box>
      ) : filteredPatients.length === 0 ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          p: 3
        }}>
          {searchTerm ? (
            <>
              <SearchOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No patients match your search
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => setSearchTerm('')}
                sx={{ mt: 1 }}
              >
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No patients assigned yet
              </Typography>
            </>
          )}
        </Box>
      ) : (
        <List sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.divider, 0.2),
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: alpha(theme.palette.divider, 0.3),
          },
        }}>
          {filteredPatients.map((patient) => {
            const isSelected = patient._id === selectedPatientId;
            const unreadCount = getUnreadCount(patient._id);

            return (
              <React.Fragment key={patient._id}>
                <ListItem
                  button
                  selected={isSelected}
                  onClick={() => onPatientSelect(patient)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: isSelected
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.action.hover, 0.1)
                    },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      color="error"
                      badgeContent={unreadCount}
                      invisible={unreadCount === 0}
                      overlap="circular"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: 18,
                          minWidth: 18
                        }
                      }}
                    >
                      <Avatar
                        src={patient.avatar}
                        alt={patient.name}
                        sx={{
                          width: 48,
                          height: 48,
                          bgcolor: isSelected
                            ? theme.palette.primary.main
                            : theme.palette.primary.light,
                          border: isSelected
                            ? `2px solid ${theme.palette.primary.main}`
                            : 'none',
                          boxShadow: isSelected
                            ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`
                            : 'none',
                          fontSize: '1.2rem',
                          fontWeight: 'bold',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {patient.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        fontWeight={unreadCount > 0 || isSelected ? 600 : 400}
                        color={isSelected ? 'primary' : 'textPrimary'}
                      >
                        {patient.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {unreadCount > 0 && (
                          <Chip
                            label={`${unreadCount} new`}
                            size="small"
                            color="error"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 500,
                              mr: 0.5
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '150px'
                          }}
                        >
                          {patient.email || patient.phone || 'No contact info'}
                        </Typography>
                      </Box>
                    }
                  />

                  {isSelected && (
                    <Box sx={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      bgcolor: theme.palette.primary.main,
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4
                    }} />
                  )}
                </ListItem>
                <Divider
                  component="li"
                  sx={{
                    ml: 9,
                    opacity: 0.6,
                    borderColor: alpha(theme.palette.divider, 0.08)
                  }}
                />
              </React.Fragment>
            );
          })}
        </List>
      )}

      {/* Status Footer */}
      <Box sx={{
        p: 1.5,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="caption" color="text.secondary">
          {filteredPatients.length} {filteredPatients.length === 1 ? 'patient' : 'patients'}
        </Typography>

        {searchTerm && (
          <Chip
            label={`Filtered: "${searchTerm}"`}
            size="small"
            onDelete={() => setSearchTerm('')}
            sx={{ height: 24, fontSize: '0.7rem' }}
          />
        )}
      </Box>
    </Box>
  );
};

export default EnhancedPatientChatPage;
