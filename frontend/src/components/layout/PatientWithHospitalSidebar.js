import React, { useState, useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Collapse,
  Badge,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  useTheme,
  alpha,
  Paper,
  Drawer,
  Button,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  FolderShared as FolderSharedIcon,
  MonitorHeart as MonitorHeartIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  VideoCall as VideoCallIcon,
  CalendarMonth,
  SmartToy,
  LocalHospital,
  ExpandMore,
  ExpandLess,
  Favorite,
  LocalDrink,
  DirectionsWalk,
  Bedtime,
  Person,
  MedicalServices,
  Chat,
  Phone,
  Videocam,
  HealthAndSafety,
  Logout,
  Refresh as RefreshIcon,
  ShoppingCart,
  ShoppingBasket,
  Watch,
  ChevronRight,
  ChevronLeft,
} from '@mui/icons-material';
import { getAvatarUrl, getInitials } from '../../utils/avatarUtils';
import axios from '../../utils/axiosConfig';
import mockChatService from '../../services/mockChatService';
import SidebarMinimizeToggle from './SidebarMinimizeToggle';
import { useSidebarMinimization } from './useSidebarMinimization';
import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 280;
const miniDrawerWidth = 72;

const PatientWithHospitalSidebar = ({ user, mobileOpen, handleDrawerToggle, assignedDoctor, hospital }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [isMinimized, setIsMinimized] = useState(true); // Sidebar starts minimized
  const sidebarWidth = isMinimized ? 70 : isDesktop ? 320 : isLaptop ? 260 : 220;

  // Fix: define location and navigate using react-router-dom hooks
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMinimized = () => setIsMinimized((prev) => !prev);

  // State for avatar and user info
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [notifications, setNotifications] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);

  // State for hospital and doctor data
  const [hospitalData, setHospitalData] = useState(hospital || null);
  const [doctorData, setDoctorData] = useState(assignedDoctor || null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // State for health stats
  const [healthStatsOpen, setHealthStatsOpen] = useState(false);
  const [healthStats, setHealthStats] = useState({
    steps: { current: 0, target: 10000 },
    sleep: { current: 0, target: 8 },
    water: { current: 0, target: 8 },
    heartRate: { current: 0, target: 80 },
  });

  // State for sidebar categories
  const [openCategories, setOpenCategories] = useState({
    shop: false
  });

  // Sidebar minimization state
  const isLaptopOrDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Fetch patient assignment data (hospital and doctor)
  useEffect(() => {
    const fetchPatientAssignment = async () => {
      try {
        setLoading(true);
        console.log('PatientWithHospitalSidebar: Starting to fetch patient assignment data');

        // Get token for the request
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('patientToken') ||
                      localStorage.getItem('persistentToken');

        if (!token) {
          console.error('PatientWithHospitalSidebar: No token found for API request');
          return;
        }

        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch patient assignment data from the backend
        console.log('PatientWithHospitalSidebar: Fetching patient assignment data');
        const { data } = await axios.get('/api/patient-assignments/my-assignment');

        if (data) {
          console.log('PatientWithHospitalSidebar: Patient assignment data fetched:', data);

          // Check if we have hospital data
          if (data.hospital) {
            setHospitalData(data.hospital);
            console.log('PatientWithHospitalSidebar: Hospital data set from API:', data.hospital);
          } else {
            console.warn('PatientWithHospitalSidebar: No hospital data in assignment response');

            // If we have hospital from props, use it as fallback
            if (hospital) {
              console.log('PatientWithHospitalSidebar: Using hospital prop as fallback');
              setHospitalData(hospital);
            }
          }

          // Check if we have doctor data
          if (data.primaryDoctor) {
            setDoctorData(data.primaryDoctor);
            console.log('PatientWithHospitalSidebar: Doctor data set from API:', data.primaryDoctor);
          } else {
            console.warn('PatientWithHospitalSidebar: No doctor data in assignment response');

            // If we have assignedDoctor from props, use it as fallback
            if (assignedDoctor) {
              console.log('PatientWithHospitalSidebar: Using assignedDoctor prop as fallback');
              setDoctorData(assignedDoctor);
            }
          }
        } else {
          console.warn('PatientWithHospitalSidebar: Empty response from patient assignment API');

          // If we have props, use them as fallback
          if (hospital) {
            console.log('PatientWithHospitalSidebar: Using hospital prop as fallback');
            setHospitalData(hospital);
          }

          if (assignedDoctor) {
            console.log('PatientWithHospitalSidebar: Using assignedDoctor prop as fallback');
            setDoctorData(assignedDoctor);
          }
        }
      } catch (error) {
        console.error('PatientWithHospitalSidebar: Error fetching patient assignment:', error);

        // If we have props, use them as fallback
        if (hospital) {
          console.log('PatientWithHospitalSidebar: Using hospital prop as fallback after error');
          setHospitalData(hospital);
        }

        if (assignedDoctor) {
          console.log('PatientWithHospitalSidebar: Using assignedDoctor prop as fallback after error');
          setDoctorData(assignedDoctor);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatientAssignment();
  }, [hospital, assignedDoctor]);

  // Fetch health stats
  useEffect(() => {
    const fetchHealthStats = async () => {
      try {
        setLoading(true);

        // Get token for the request
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('patientToken') ||
                      localStorage.getItem('persistentToken');

        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Fetch health stats from the backend
        const { data } = await axios.get('/api/health/stats');

        if (data) {
          console.log('PatientWithHospitalSidebar: Health stats fetched:', data);

          // Update health stats with real data
          setHealthStats({
            steps: {
              current: data.steps?.current || data.steps || 8742,
              target: data.steps?.target || 10000
            },
            sleep: {
              current: data.sleep?.current || data.sleep || 7.2,
              target: data.sleep?.target || 8
            },
            water: {
              current: data.water?.current || data.water || 6,
              target: data.water?.target || 8
            },
            heartRate: {
              current: data.heartRate?.current || data.heartRate || 72,
              target: data.heartRate?.target || 80
            },
          });

          // Auto-open health stats if there's real data
          if (data.steps || data.sleep || data.water || data.heartRate) {
            setHealthStatsOpen(true);
          }
        }
      } catch (error) {
        console.error('Error fetching health stats:', error);
        // Set default values if API fails
        setHealthStats({
          steps: {
            current: 8742,
            target: 10000
          },
          sleep: {
            current: 7.2,
            target: 8
          },
          water: {
            current: 6,
            target: 8
          },
          heartRate: {
            current: 72,
            target: 80
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHealthStats();
  }, []);

  // Role color - use secondary color for patients with hospital to differentiate
  const roleColor = theme.palette.secondary.main;

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Get token for the request
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('patientToken');

        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const { data } = await axios.get('/api/notifications');
        // Ensure data is an array before setting it
        if (data && Array.isArray(data)) {
          setNotifications(data);
          console.log('PatientWithHospitalSidebar: Notifications fetched:', data.length);
        } else {
          console.warn('PatientWithHospitalSidebar: Notifications data is not an array:', data);
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Set mock notifications as fallback
        setNotifications([
          { _id: '1', message: 'Appointment reminder', read: false, type: 'appointment' },
          { _id: '2', message: 'New message from doctor', read: false, type: 'message' },
          { _id: '3', message: 'Prescription updated', read: true, type: 'prescription' }
        ]);
      }
    };

    fetchNotifications();
  }, []);

  // Update avatar URL when user changes
  useEffect(() => {
    if (user) {
      setAvatarUrl(getAvatarUrl(user));
    } else {
      setAvatarUrl(null);
    }

    // Listen for avatar updates from other components
    const handleAvatarUpdated = (event) => {
      if (event.detail && event.detail.avatarUrl) {
        setAvatarUrl(event.detail.avatarUrl);
      }
    };

    // Add event listener
    window.addEventListener('user-avatar-updated', handleAvatarUpdated);

    // Clean up on unmount
    return () => {
      window.removeEventListener('user-avatar-updated', handleAvatarUpdated);
    };
  }, [user]);

  // Fetch upcoming appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Get token for the request
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('patientToken');

        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Fetch upcoming appointments
        const { data } = await axios.get('/api/appointments/patient');

        if (data && Array.isArray(data)) {
          // Filter for upcoming appointments (status: confirmed or pending)
          const upcoming = data.filter(apt =>
            (apt.status === 'confirmed' || apt.status === 'pending') &&
            new Date(apt.appointmentDate) >= new Date()
          );

          setUpcomingAppointments(upcoming.length);
          console.log('PatientWithHospitalSidebar: Upcoming appointments:', upcoming.length);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
        // Set a default value if the API fails
        setUpcomingAppointments(0);
      }
    };

    fetchAppointments();
  }, []);

  // Fetch unread messages
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!doctorData) return;
      try {
        // Get token for the request
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('patientToken') ||
                      localStorage.getItem('persistentToken');

        if (!token) {
          console.error('PatientWithHospitalSidebar: No token found for unread messages request');
          return;
        }

        // Set the token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Fetch unread messages count
        const doctorId = doctorData._id || doctorData.id;
        console.log('PatientWithHospitalSidebar: Fetching unread messages for doctor:', doctorId);
        // Create a mock user object for fallback
        const mockUser = { 
          _id: user._id || user.id, 
          name: user.name 
        };
        // First try to get the chat ID
        try {
          const chatResponse = await axios.get(`/api/chats/find/${doctorId}`);
          if (chatResponse.data && chatResponse.data._id) {
            const chatId = chatResponse.data._id;
            console.log('PatientWithHospitalSidebar: Found chat ID:', chatId);
            // Now get unread messages for this chat
            const messagesResponse = await axios.get(`/api/chats/${chatId}/messages/unread`);
            if (messagesResponse.data && typeof messagesResponse.data.count === 'number') {
              setUnreadMessages(messagesResponse.data.count);
              console.log('PatientWithHospitalSidebar: Unread messages count:', messagesResponse.data.count);
            }
          }
        } catch (chatError) {
          console.log('PatientWithHospitalSidebar: Chat not found or API error, trying alternatives');
          // Try to create a chat using the API
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            const createChatResponse = await axios.post('/api/chats',
              { userId: doctorId },
              { 
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
                timeout: 5000 // 5 second timeout
              }
            );
            clearTimeout(timeoutId);
            if (createChatResponse.data && createChatResponse.data._id) {
              console.log('PatientWithHospitalSidebar: Chat created successfully');
              setUnreadMessages(0);
            }
          } catch (createError) {
            console.error('PatientWithHospitalSidebar: Error creating chat:', createError);
            // Use mock service as fallback
            try {
              console.log('PatientWithHospitalSidebar: Using mock chat service as fallback');
              const mockChatResponse = await mockChatService.createChat(doctorId, mockUser);
              console.log('PatientWithHospitalSidebar: Mock chat created:', mockChatResponse.data._id);
              const unreadResponse = await mockChatService.getUnreadCount(mockUser._id);
              setUnreadMessages(unreadResponse.data.count || 0);
            } catch (mockError) {
              console.error('PatientWithHospitalSidebar: Mock service error:', mockError);
              setUnreadMessages(0);
            }
          }
        }
      } catch (error) {
        console.error('PatientWithHospitalSidebar: Error fetching unread messages:', error);
        // Try mock service as a last resort
        try {
          if (doctorData && user) {
            const docId = doctorData._id || doctorData.id;
            const currentUser = { 
              _id: user._id || user.id, 
              name: user.name 
            };
            console.log('PatientWithHospitalSidebar: Using mock chat service after general error');
            const mockChatResponse = await mockChatService.createChat(docId, currentUser);
            const unreadResponse = await mockChatService.getUnreadCount(currentUser._id);
            setUnreadMessages(unreadResponse.data.count || 0);
          } else {
            setUnreadMessages(0);
          }
        } catch (mockError) {
          console.error('PatientWithHospitalSidebar: Mock service error:', mockError);
          setUnreadMessages(0);
        }
      }
    };
    fetchUnreadMessages();
    const unreadMessagesInterval = setInterval(fetchUnreadMessages, 60000); // Every minute
    const handleMessagesSeen = (event) => {
      console.log('PatientWithHospitalSidebar: Received messages-seen event:', event.detail);
      setUnreadMessages(0);
    };
    window.addEventListener('messages-seen', handleMessagesSeen);
    return () => {
      clearInterval(unreadMessagesInterval);
      window.removeEventListener('messages-seen', handleMessagesSeen);
    };
  }, [doctorData]);

  // Function to check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Function to handle logout
  const handleLogout = () => {
    // Clear all tokens
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('patientToken');
    localStorage.removeItem('persistentToken');

    // Redirect to login page
    navigate('/login');
  };

  // Function to handle refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);

      // Fetch patient assignment data
      const token = localStorage.getItem('token') ||
                    localStorage.getItem('userToken') ||
                    localStorage.getItem('patientToken') ||
                    localStorage.getItem('persistentToken');

      if (!token) {
        console.error('PatientWithHospitalSidebar: No token found for refresh');

        // Show an error message
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            message: 'Authentication token not found. Please log in again.',
            severity: 'error'
          }
        }));
        return;
      }

      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Fetch patient assignment data from the backend
      console.log('PatientWithHospitalSidebar: Refreshing patient assignment data');
      const { data } = await axios.get('/api/patient-assignments/my-assignment');

      let refreshSuccess = false;

      if (data) {
        console.log('PatientWithHospitalSidebar: Refreshed patient assignment data:', data);

        // Update hospital data
        if (data.hospital) {
          setHospitalData(data.hospital);
          console.log('PatientWithHospitalSidebar: Hospital data refreshed:', data.hospital);
          refreshSuccess = true;
        } else {
          console.warn('PatientWithHospitalSidebar: No hospital data in refreshed response');
        }

        // Update doctor data
        if (data.primaryDoctor) {
          setDoctorData(data.primaryDoctor);
          console.log('PatientWithHospitalSidebar: Doctor data refreshed:', data.primaryDoctor);
          refreshSuccess = true;
        } else {
          console.warn('PatientWithHospitalSidebar: No doctor data in refreshed response');
        }

        // Show appropriate message based on what was refreshed
        if (refreshSuccess) {
          // Show a success message
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: {
              message: 'Hospital and doctor data refreshed successfully',
              severity: 'success'
            }
          }));
        } else {
          // Show a warning message
          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: {
              message: 'No hospital or doctor data found',
              severity: 'warning'
            }
          }));
        }
      } else {
        console.warn('PatientWithHospitalSidebar: Empty response from patient assignment API');

        // Show an error message
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: {
            message: 'Failed to refresh hospital and doctor data',
            severity: 'error'
          }
        }));
      }
    } catch (error) {
      console.error('PatientWithHospitalSidebar: Error refreshing data:', error);

      // Show an error message
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: 'Error refreshing hospital and doctor data',
          severity: 'error'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Debug function to log hospital and doctor data
  const logDebugData = () => {
    console.group('PatientWithHospitalSidebar Debug Data');
    console.log('Props received:');
    console.log('- hospital prop:', hospital);
    console.log('- assignedDoctor prop:', assignedDoctor);
    console.log('State values:');
    console.log('- hospitalData:', hospitalData);
    console.log('- doctorData:', doctorData);
    console.log('Authentication:');
    console.log('- token:', localStorage.getItem('token') ? 'Exists' : 'None');
    console.log('- userToken:', localStorage.getItem('userToken') ? 'Exists' : 'None');
    console.log('- patientToken:', localStorage.getItem('patientToken') ? 'Exists' : 'None');
    console.log('- persistentToken:', localStorage.getItem('persistentToken') ? 'Exists' : 'None');
    console.groupEnd();
  };

  // Log debug data when component renders or data changes
  useEffect(() => {
    logDebugData();
  }, [hospitalData, doctorData, hospital, assignedDoctor]);

  // Drawer content
  const drawerContent = (
    <Box
      sx={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1300, // Higher z-index to ensure above header
        bgcolor: theme.palette.background.default,
        borderRight: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
        boxShadow: isMinimized ? 1 : 3,
      }}
    >
      {/* Minimize/Expand Button - always visible, fixed at top left of sidebar */}
      <Box sx={{ position: 'fixed', top: 16, left: sidebarWidth - (isMinimized ? 40 : 48), zIndex: 1400 }}>
        <IconButton size="small" onClick={toggleMinimized} color="primary" sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
          {isMinimized ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
        </IconButton>
      </Box>

      {/* Sidebar Content Scrollable */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: isMinimized ? 0.5 : 2, py: 1 }}>
        <List sx={{ px: 0 }} component="nav">
          {/* Only show icons and tooltips when minimized */}
          <ListItemButton
            selected={isActive('/patient/dashboard')}
            onClick={() => navigate('/patient/dashboard')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: isMinimized ? 'center' : 'flex-start',
              px: isMinimized ? 0.5 : 2,
              ...(isMinimized && {
                flexDirection: 'column',
                alignItems: 'center',
                py: 1.5,
                minHeight: 56,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  boxShadow: 3,
                },
              }),
            }}
          >
            <Tooltip title={isMinimized ? 'Dashboard' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: isActive('/patient/dashboard') ? theme.palette.primary.main : 'inherit', fontSize: 28 }}>
                <DashboardIcon fontSize="medium" />
              </ListItemIcon>
            </Tooltip>
            {!isMinimized && (
              <ListItemText
                primary="Dashboard"
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive('/patient/dashboard') ? 600 : 500 }}
              />
            )}
          </ListItemButton>

          {/* Appointments Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2.5,
              mb: 1.5,
              px: 1
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 16,
                borderRadius: 1,
                bgcolor: theme.palette.primary.main,
                mr: 1.5,
                boxShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.25)}`
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
                color: theme.palette.primary.main,
                textShadow: `0 1px 2px ${alpha(theme.palette.primary.main, 0.2)}`
              }}
            >
              Appointments
            </Typography>
          </Box>

          <ListItemButton
            selected={isActive('/patient/appointments')}
            onClick={() => navigate('/patient/appointments')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: isMinimized ? 'center' : 'flex-start',
              px: isMinimized ? 0.5 : 2,
              ...(isMinimized && {
                flexDirection: 'column',
                alignItems: 'center',
                py: 1.5,
                minHeight: 56,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  boxShadow: 3,
                },
              }),
            }}
          >
            <Tooltip title={isMinimized ? 'Appointments' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: isActive('/patient/appointments') ? theme.palette.primary.main : 'inherit', fontSize: 28 }}>
                <EventIcon fontSize="medium" />
              </ListItemIcon>
            </Tooltip>
            {!isMinimized && <ListItemText primary="My Appointments" />}
            {isMinimized && upcomingAppointments > 0 && (
              <Badge badgeContent={upcomingAppointments} color="primary" sx={{ position: 'absolute', top: 8, right: 8 }} />
            )}
          </ListItemButton>

          <ListItemButton
            selected={isActive('/patient/online-appointments')}
            onClick={() => navigate('/patient/online-appointments')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: isMinimized ? 'center' : 'flex-start',
              px: isMinimized ? 0.5 : 2,
              ...(isMinimized && {
                flexDirection: 'column',
                alignItems: 'center',
                py: 1.5,
                minHeight: 56,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  boxShadow: 3,
                },
              }),
            }}
          >
            <Tooltip title={isMinimized ? 'Virtual Consultations' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: isActive('/patient/online-appointments') ? theme.palette.primary.main : 'inherit', fontSize: 28 }}>
                <VideoCallIcon fontSize="medium" />
              </ListItemIcon>
            </Tooltip>
            {!isMinimized && <ListItemText primary="Virtual Consultations" />}
          </ListItemButton>

          {/* Medical Records Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2.5,
              mb: 1.5,
              px: 1
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 16,
                borderRadius: 1,
                bgcolor: theme.palette.secondary.main,
                mr: 1.5,
                boxShadow: `0 2px 4px ${alpha(theme.palette.secondary.main, 0.25)}`
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
                color: theme.palette.secondary.main,
                textShadow: `0 1px 2px ${alpha(theme.palette.secondary.main, 0.2)}`
              }}
            >
              Medical Information
            </Typography>
          </Box>

          <ListItemButton
            selected={isActive('/patient/records')}
            onClick={() => navigate('/patient/records')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: isMinimized ? 'center' : 'flex-start',
              px: isMinimized ? 0.5 : 2,
              ...(isMinimized && {
                flexDirection: 'column',
                alignItems: 'center',
                py: 1.5,
                minHeight: 56,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.08),
                  boxShadow: 3,
                },
              }),
            }}
          >
            <Tooltip title={isMinimized ? 'Medical Records' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: isActive('/patient/records') ? theme.palette.primary.main : 'inherit', fontSize: 28 }}>
                <FolderSharedIcon fontSize="medium" />
              </ListItemIcon>
            </Tooltip>
            {!isMinimized && <ListItemText primary="Medical Records" />}
          </ListItemButton>

          <ListItemButton
            selected={isActive('/patient/prescriptions')}
            onClick={() => navigate('/patient/prescriptions')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: isMinimized ? 'center' : 'flex-start',
              px: isMinimized ? 0.5 : 2,
              ...(isMinimized && {
                flexDirection: 'column',
                alignItems: 'center',
                py: 1.5,
                minHeight: 56,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.08),
                  boxShadow: 3,
                },
              }),
            }}
          >
            <Tooltip title={isMinimized ? 'Prescriptions' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: isActive('/patient/prescriptions') ? theme.palette.primary.main : 'inherit', fontSize: 28 }}>
                <MedicationIcon fontSize="medium" />
              </ListItemIcon>
            </Tooltip>
            {!isMinimized && <ListItemText primary="Prescriptions" />}
          </ListItemButton>

          <ListItemButton
            selected={isActive('/patient/lab-results')}
            onClick={() => navigate('/patient/lab-results')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: isMinimized ? 'center' : 'flex-start',
              px: isMinimized ? 0.5 : 2,
              ...(isMinimized && {
                flexDirection: 'column',
                alignItems: 'center',
                py: 1.5,
                minHeight: 56,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.08),
                  boxShadow: 3,
                },
              }),
            }}
          >
            <Tooltip title={isMinimized ? 'Lab Results' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: isActive('/patient/lab-results') ? theme.palette.primary.main : 'inherit', fontSize: 28 }}>
                <ScienceIcon fontSize="medium" />
              </ListItemIcon>
            </Tooltip>
            {!isMinimized && <ListItemText primary="Lab Results" />}
          </ListItemButton>

          {/* Health Monitoring Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2.5,
              mb: 1.5,
              px: 1
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 16,
                borderRadius: 1,
                bgcolor: theme.palette.info.main,
                mr: 1.5,
                boxShadow: `0 2px 4px ${alpha(theme.palette.info.main, 0.25)}`
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
                color: theme.palette.info.main,
                textShadow: `0 1px 2px ${alpha(theme.palette.info.main, 0.2)}`
              }}
            >
              Health Monitoring
            </Typography>
          </Box>

          <ListItemButton
            onClick={() => setHealthStatsOpen(!healthStatsOpen)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: isMinimized ? 'center' : 'flex-start',
              px: isMinimized ? 0.5 : 2,
              ...(isMinimized && {
                flexDirection: 'column',
                alignItems: 'center',
                py: 1.5,
                minHeight: 56,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  boxShadow: 3,
                },
              }),
            }}
          >
            <Tooltip title={isMinimized ? 'Health Stats' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: isActive('/patient/health-stats') ? theme.palette.primary.main : 'inherit', fontSize: 28 }}>
                <MonitorHeartIcon fontSize="medium" />
              </ListItemIcon>
            </Tooltip>
            {!isMinimized && <ListItemText primary="Health Stats" />}
            {healthStatsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={healthStatsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Health stats cards - Steps, Sleep, Water, Heart Rate */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Steps */}
                <Paper
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          mr: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        }}
                      >
                        <DirectionsWalk fontSize="small" color="primary" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>Steps</Typography>
                    </Box>
                    <Chip
                      label={`${Math.round((healthStats.steps.current / healthStats.steps.target) * 100)}%`}
                      size="small"
                      color="primary"
                      variant={(healthStats.steps.current / healthStats.steps.target) >= 0.8 ? "filled" : "outlined"}
                      sx={{
                        height: 20,
                        minWidth: 40,
                        '& .MuiChip-label': { px: 1, fontSize: '0.65rem', fontWeight: 600 }
                      }}
                    />
                  </Box>

                  <Box sx={{ px: 0.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(healthStats.steps.current / healthStats.steps.target) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        mb: 0.5,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.primary.main,
                          borderRadius: 4,
                        }
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {healthStats.steps.current.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Goal: {healthStats.steps.target.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Sleep */}
                <Paper
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 4px 8px ${alpha(theme.palette.info.main, 0.15)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          mr: 1,
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                        }}
                      >
                        <Bedtime fontSize="small" color="info" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>Sleep</Typography>
                    </Box>
                    <Chip
                      label={`${Math.round((healthStats.sleep.current / healthStats.sleep.target) * 100)}%`}
                      size="small"
                      color="info"
                      variant={(healthStats.sleep.current / healthStats.sleep.target) >= 0.8 ? "filled" : "outlined"}
                      sx={{
                        height: 20,
                        minWidth: 40,
                        '& .MuiChip-label': { px: 1, fontSize: '0.65rem', fontWeight: 600 }
                      }}
                    />
                  </Box>

                  <Box sx={{ px: 0.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(healthStats.sleep.current / healthStats.sleep.target) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        mb: 0.5,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.info.main,
                          borderRadius: 4,
                        }
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {healthStats.sleep.current} hours
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Goal: {healthStats.sleep.target} hours
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Water */}
                <Paper
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    border: `1px solid ${alpha(theme.palette.info.light, 0.1)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 4px 8px ${alpha(theme.palette.info.light, 0.15)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          mr: 1,
                          bgcolor: alpha(theme.palette.info.light, 0.1),
                        }}
                      >
                        <LocalDrink fontSize="small" sx={{ color: theme.palette.info.light }} />
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>Water</Typography>
                    </Box>
                    <Chip
                      label={`${Math.round((healthStats.water.current / healthStats.water.target) * 100)}%`}
                      size="small"
                      sx={{
                        height: 20,
                        minWidth: 40,
                        bgcolor: (healthStats.water.current / healthStats.water.target) >= 0.8 ? theme.palette.info.light : 'transparent',
                        color: (healthStats.water.current / healthStats.water.target) >= 0.8 ? 'white' : theme.palette.info.light,
                        border: `1px solid ${theme.palette.info.light}`,
                        '& .MuiChip-label': { px: 1, fontSize: '0.65rem', fontWeight: 600 }
                      }}
                    />
                  </Box>

                  <Box sx={{ px: 0.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(healthStats.water.current / healthStats.water.target) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.info.light, 0.1),
                        mb: 0.5,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: theme.palette.info.light,
                          borderRadius: 4,
                        }
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {healthStats.water.current} glasses
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Goal: {healthStats.water.target} glasses
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Heart Rate */}
                <Paper
                  elevation={0}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                    border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      boxShadow: `0 4px 8px ${alpha(theme.palette.error.main, 0.15)}`,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          mr: 1,
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        }}
                      >
                        <Favorite fontSize="small" color="error" />
                      </Avatar>
                      <Typography variant="body2" fontWeight={600}>Heart Rate</Typography>
                    </Box>
                    <Chip
                      label={healthStats.heartRate.current <= healthStats.heartRate.target ? "Normal" : "Elevated"}
                      size="small"
                      color={healthStats.heartRate.current <= healthStats.heartRate.target ? "success" : "error"}
                      variant="outlined"
                      sx={{
                        height: 20,
                        minWidth: 40,
                        '& .MuiChip-label': { px: 1, fontSize: '0.65rem', fontWeight: 600 }
                      }}
                    />
                  </Box>

                  <Box sx={{ px: 0.5 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}
                    >
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="error.main"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          animation: healthStats.heartRate.current > healthStats.heartRate.target ? 'pulse 1.5s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.05)' },
                            '100%': { transform: 'scale(1)' },
                          }
                        }}
                      >
                        {healthStats.heartRate.current}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 0.5 }}
                        >
                          BPM
                        </Typography>
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Resting
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Target: {healthStats.heartRate.target} bpm
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </List>
          </Collapse>

          {/* Communication Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2.5,
              mb: 1.5,
              px: 1
            }}
          >
            <Box
              sx={{
                width: 4,
                height: 16,
                borderRadius: 1,
                bgcolor: theme.palette.success.main,
                mr: 1.5,
                boxShadow: `0 2px 4px ${alpha(theme.palette.success.main, 0.25)}`
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
                color: theme.palette.success.main,
                textShadow: `0 1px 2px ${alpha(theme.palette.success.main, 0.2)}`
              }}
            >
              Communication
            </Typography>
          </Box>

          <ListItemButton
            selected={isActive(`/patient/message/${doctorData._id || doctorData.id}`)}
            onClick={() => navigate(`/patient/message/${doctorData._id || doctorData.id}`)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: isMinimized ? 'center' : 'flex-start',
              px: isMinimized ? 0.5 : 2,
              ...(isMinimized && {
                flexDirection: 'column',
                alignItems: 'center',
                py: 1.5,
                minHeight: 56,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  boxShadow: 3,
                },
              }),
            }}
          >
            <Tooltip title={isMinimized ? 'Chat with Doctor' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: isActive(`/patient/message/${doctorData._id || doctorData.id}`) ? theme.palette.primary.main : 'inherit', fontSize: 28 }}>
                <MessageIcon fontSize="medium" />
              </ListItemIcon>
            </Tooltip>
            {!isMinimized && (
              <ListItemText
                primary="Chat with Doctor"
                secondary={doctorData.name ? `Dr. ${doctorData.name.split(' ')[0]}` : 'Your Doctor'}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
              />
            )}
            {unreadMessages > 0 && (
              <Badge
                badgeContent={unreadMessages}
                color="error"
                sx={{ '& .MuiBadge-badge': { right: 3, top: 13 } }}
              />
            )}
          </ListItemButton>

          <ListItemButton
            selected={isActive(`/patient/call/${doctorData._id || doctorData.id}`)}
            onClick={() => navigate(`/patient/call/${doctorData._id || doctorData.id}`)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              justifyContent: isMinimized ? 'center' : 'flex-start',
              px: isMinimized ? 0.5 : 2,
              ...(isMinimized && {
                flexDirection: 'column',
                alignItems: 'center',
                py: 1.5,
                minHeight: 56,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  boxShadow: 3,
                },
              }),
            }}
          >
            <Tooltip title={isMinimized ? 'Video Call' : ''} placement="right">
              <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: isActive(`/patient/call/${doctorData._id || doctorData.id}`) ? theme.palette.primary.main : 'inherit', fontSize: 28 }}>
                <VideoCallIcon fontSize="medium" />
              </ListItemIcon>
            </Tooltip>
            {!isMinimized && (
              <ListItemText
                primary="Video Call"
                secondary={doctorData.name ? `Dr. ${doctorData.name.split(' ')[0]}` : 'Your Doctor'}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
              />
            )}
          </ListItemButton>
        </List>
      </Box>

      {/* Footer: Only show logo and logout in minimized mode */}
      <Box
        sx={{
          pt: 2,
          pb: 1.5,
          px: isMinimized ? 0.5 : 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.5)}, ${alpha(theme.palette.background.paper, 0.8)})`,
          backdropFilter: 'blur(8px)',
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: isMinimized ? 'center' : 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontWeight: 600,
                background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textAlign: isMinimized ? 'center' : 'left',
              }}
            >
              SoulSpace Health
            </Typography>
            {!isMinimized && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                © 2025 • v1.0.0
              </Typography>
            )}
          </Box>
          {!isMinimized && (
            <Button
              variant="text"
              size="small"
              color="secondary"
              onClick={handleLogout}
              startIcon={<Logout fontSize="small" />}
              sx={{
                fontSize: '0.7rem',
                textTransform: 'none',
                py: 0.5,
                px: 1,
                minWidth: 'auto',
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );

  return drawerContent;
};

export default PatientWithHospitalSidebar;
