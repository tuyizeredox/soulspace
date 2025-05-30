import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/icons-material';
import { getAvatarUrl, getInitials } from '../../utils/avatarUtils';
import axios from '../../utils/axiosConfig';
import mockChatService from '../../services/mockChatService';

const PatientWithHospitalSidebar = ({ user, mobileOpen, handleDrawerToggle, assignedDoctor, hospital }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

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

        try {
          // First try to get the chat ID
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
            // Create a controller to abort the request if it takes too long
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
              // No unread messages in a new chat
              setUnreadMessages(0);
            }
          } catch (createError) {
            console.error('PatientWithHospitalSidebar: Error creating chat:', createError);
            
            // Use mock service as fallback
            try {
              console.log('PatientWithHospitalSidebar: Using mock chat service as fallback');
              
              // Try to get or create a chat with the doctor using mock service
              const mockChatResponse = await mockChatService.createChat(doctorId, mockUser);
              console.log('PatientWithHospitalSidebar: Mock chat created:', mockChatResponse.data._id);
              
              // Get unread count from mock service
              const unreadResponse = await mockChatService.getUnreadCount(mockUser._id);
              setUnreadMessages(unreadResponse.data.count || 0);
            } catch (mockError) {
              console.error('PatientWithHospitalSidebar: Mock service error:', mockError);
              // Default to 0 unread messages
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
            // If we don't have user or doctor data, just set to 0
            setUnreadMessages(0);
          }
        } catch (mockError) {
          console.error('PatientWithHospitalSidebar: Mock service error:', mockError);
          // Set a default value as last resort
          setUnreadMessages(0);
        }
      }
    };

    fetchUnreadMessages();

    // Set up interval to refresh unread messages count
    const unreadMessagesInterval = setInterval(fetchUnreadMessages, 60000); // Every minute

    // Listen for messages-seen event from chat page
    const handleMessagesSeen = (event) => {
      console.log('PatientWithHospitalSidebar: Received messages-seen event:', event.detail);
      // Reset unread messages count
      setUnreadMessages(0);
    };

    // Add event listener
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* User Profile Section - Styled differently for patients with hospital */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.dark, 0.05)} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.2)} 0%, transparent 70%)`,
            zIndex: 0
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent 0%, ${theme.palette.secondary.main} 50%, transparent 100%)`,
          }
        }}
      >
        {/* Refresh Button - Top Right */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
          <Tooltip title="Refresh Hospital Data">
            <IconButton
              size="small"
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.2),
                }
              }}
            >
              {loading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <RefreshIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1
          }}
        >
          <Avatar
            src={avatarUrl}
            alt={user?.name || 'User'}
            sx={{
              width: 85,
              height: 85,
              mb: 1,
              border: `3px solid ${roleColor}`,
              boxShadow: `0 0 0 3px ${alpha(roleColor, 0.3)}, 0 4px 10px ${alpha(theme.palette.common.black, 0.2)}`,
              bgcolor: roleColor,
              fontSize: '2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 0 0 3px ${alpha(roleColor, 0.5)}, 0 8px 15px ${alpha(theme.palette.common.black, 0.3)}`,
              }
            }}
          >
            {getInitials(user?.name)}
          </Avatar>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              textAlign: 'center',
              background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}
          >
            {user?.name || 'Guest User'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip
              label="Hospital Patient"
              size="small"
              color="secondary"
              sx={{
                fontWeight: 600,
                borderRadius: '12px',
                boxShadow: `0 2px 4px ${alpha(theme.palette.secondary.main, 0.25)}`,
                '& .MuiChip-label': { px: 1 }
              }}
            />
            {upcomingAppointments > 0 && (
              <Chip
                label={`${upcomingAppointments} Upcoming`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 500,
                  borderRadius: '12px',
                  '& .MuiChip-label': { px: 1, fontSize: '0.7rem' }
                }}
              />
            )}
          </Box>

          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              gap: 1,
              mt: 1,
              p: 0.5,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.paper, 0.7),
              backdropFilter: 'blur(8px)',
              border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
            }}
          >
            <Tooltip title="Messages">
              <IconButton
                size="small"
                onClick={() => navigate('/patient/messages')}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: theme.palette.secondary.main,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  }
                }}
              >
                <Badge
                  badgeContent={Array.isArray(notifications) ? notifications.filter(n => !n.read && n.type === 'message').length : 0}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      height: 16,
                      minWidth: 16,
                      padding: '0 4px'
                    }
                  }}
                >
                  <MessageIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                size="small"
                onClick={() => navigate('/patient/notifications')}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: theme.palette.secondary.main,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  }
                }}
              >
                <Badge
                  badgeContent={Array.isArray(notifications) ? notifications.filter(n => !n.read).length : 0}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      height: 16,
                      minWidth: 16,
                      padding: '0 4px'
                    }
                  }}
                >
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton
                size="small"
                onClick={() => navigate('/patient/profile')}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: theme.palette.secondary.main,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                  }
                }}
              >
                <Person fontSize="small" />
              </IconButton>
            </Tooltip>
          </Paper>
        </Box>
      </Box>

      {/* Hospital & Doctor Section - Enhanced for patients with hospital */}
      {loading && (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CircularProgress size={30} color="secondary" sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Loading hospital data...
          </Typography>
        </Box>
      )}

      {!loading && (hospitalData || doctorData) && (
        <Box
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.secondary.main, 0.08),
            borderBottom: `1px solid ${theme.palette.divider}`,
            position: 'relative',
            backgroundImage: `linear-gradient(to bottom, ${alpha(theme.palette.secondary.light, 0.05)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: `linear-gradient(to bottom, ${theme.palette.secondary.light}, ${theme.palette.secondary.main})`,
              borderRadius: '0 4px 4px 0'
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography
              variant="subtitle2"
              color="secondary.main"
              sx={{
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.75rem'
              }}
            >
              <HealthAndSafety fontSize="small" sx={{ mr: 0.5 }} />
              Your Care Team
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Refresh hospital data">
                <IconButton
                  size="small"
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{
                    p: 0.5,
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.1)
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <RefreshIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Chip
                label="Active"
                size="small"
                color="success"
                variant="outlined"
                sx={{
                  height: 20,
                  '& .MuiChip-label': {
                    px: 1,
                    fontSize: '0.65rem',
                    fontWeight: 600
                  }
                }}
              />
            </Box>
          </Box>

          {hospitalData && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 2,
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
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 45,
                    height: 45,
                    mr: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <LocalHospital fontSize="small" color="primary" />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} color="primary.main" noWrap>
                    {hospitalData.name || 'Your Hospital'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                    {hospitalData.address ||
                     (hospitalData.location && hospitalData.location.address) ||
                     (hospitalData.location && `${hospitalData.location.city || ''}, ${hospitalData.location.state || ''}`) ||
                     'Location information unavailable'}
                  </Typography>
                  {(hospitalData.phone || (hospitalData.location && hospitalData.location.phone)) && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                      {hospitalData.phone || (hospitalData.location && hospitalData.location.phone)}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Button
                size="small"
                fullWidth
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/hospitals/${hospitalData._id}`)}
                sx={{
                  mt: 1.5,
                  borderRadius: 2,
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  py: 0.5
                }}
              >
                View Hospital Details
              </Button>
            </Paper>
          )}

          {doctorData && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: `0 4px 8px ${alpha(theme.palette.secondary.main, 0.15)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  src={doctorData?.avatar || doctorData?.profileImage || doctorData?.profile?.avatar}
                  sx={{
                    width: 45,
                    height: 45,
                    mr: 1.5,
                    bgcolor: alpha(theme.palette.secondary.main, 0.15),
                    border: `2px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  }}
                >
                  {getInitials(doctorData?.name || 'Dr')}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} color="secondary.main" noWrap>
                    {doctorData?.name || 'Your Doctor'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                    {doctorData?.profile?.specialization || doctorData?.specialization || 'Specialist'}
                  </Typography>
                  {(doctorData?.email || doctorData?.profile?.email) && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                      {doctorData?.email || doctorData?.profile?.email}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  startIcon={<Chat />}
                  onClick={() => navigate(`/patient/chat/${doctorData._id || doctorData.id}`)}
                  sx={{
                    borderRadius: 2,
                    flex: 1,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    py: 0.5,
                    boxShadow: 2
                  }}
                >
                  Message
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  startIcon={<Videocam />}
                  onClick={() => navigate(`/patient/call/${doctorData._id || doctorData.id}`)}
                  sx={{
                    borderRadius: 2,
                    flex: 1,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    py: 0.5
                  }}
                >
                  Video Call
                </Button>
              </Box>
            </Paper>
          )}

          {/* Show message if no doctor data is available */}
          {!doctorData && !loading && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.light, 0.1),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    mr: 1.5,
                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                  }}
                >
                  <MedicalServices fontSize="small" color="warning" />
                </Avatar>
                <Typography variant="body2" fontWeight={600} color="warning.main">
                  No Doctor Assigned
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                You don't have a doctor assigned yet. Please book an appointment to get assigned to a doctor.
              </Typography>
              <Button
                size="small"
                fullWidth
                variant="outlined"
                color="warning"
                startIcon={<CalendarMonth fontSize="small" />}
                onClick={() => navigate('/appointments/book')}
                sx={{
                  mt: 1.5,
                  borderRadius: 2,
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  py: 0.5
                }}
              >
                Book Appointment
              </Button>
            </Paper>
          )}

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<CalendarMonth fontSize="small" />}
              onClick={() => navigate('/appointments/book')}
              sx={{
                borderRadius: 2,
                flex: 1,
                fontSize: '0.7rem',
                textTransform: 'none',
                py: 0.5
              }}
            >
              Book Appointment
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<FolderSharedIcon fontSize="small" />}
              onClick={() => navigate('/patient/records')}
              sx={{
                borderRadius: 2,
                flex: 1,
                fontSize: '0.7rem',
                textTransform: 'none',
                py: 0.5
              }}
            >
              Records
            </Button>
          </Box>
        </Box>
      )}

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
        <List sx={{ px: 0 }} component="nav">
          {/* Dashboard */}
          <ListItemButton
            selected={isActive('/patient/dashboard')}
            onClick={() => navigate('/patient/dashboard')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              transition: 'all 0.2s',
              '&.Mui-selected': {
                bgcolor: alpha(roleColor, 0.1),
                boxShadow: `0 2px 6px ${alpha(roleColor, 0.15)}`,
                '&:hover': {
                  bgcolor: alpha(roleColor, 0.15),
                },
                '& .MuiListItemIcon-root': {
                  color: roleColor,
                },
                '& .MuiListItemText-primary': {
                  fontWeight: 600,
                  color: roleColor,
                },
              },
              '&:hover': {
                bgcolor: alpha(roleColor, 0.05),
                transform: 'translateX(3px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: isActive('/patient/dashboard') ? 600 : 500
              }}
            />
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
              '&.Mui-selected': {
                bgcolor: alpha(roleColor, 0.1),
                '&:hover': {
                  bgcolor: alpha(roleColor, 0.15),
                },
                '& .MuiListItemIcon-root': {
                  color: roleColor,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <EventIcon />
            </ListItemIcon>
            <ListItemText primary="My Appointments" />
            <Badge badgeContent={upcomingAppointments} color="primary" />
          </ListItemButton>

          <ListItemButton
            selected={isActive('/patient/online-appointments')}
            onClick={() => navigate('/patient/online-appointments')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: alpha(roleColor, 0.1),
                '&:hover': {
                  bgcolor: alpha(roleColor, 0.15),
                },
                '& .MuiListItemIcon-root': {
                  color: roleColor,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <VideoCallIcon />
            </ListItemIcon>
            <ListItemText primary="Virtual Consultations" />
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
              '&.Mui-selected': {
                bgcolor: alpha(roleColor, 0.1),
                '&:hover': {
                  bgcolor: alpha(roleColor, 0.15),
                },
                '& .MuiListItemIcon-root': {
                  color: roleColor,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <FolderSharedIcon />
            </ListItemIcon>
            <ListItemText primary="Medical Records" />
          </ListItemButton>

          <ListItemButton
            selected={isActive('/patient/prescriptions')}
            onClick={() => navigate('/patient/prescriptions')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: alpha(roleColor, 0.1),
                '&:hover': {
                  bgcolor: alpha(roleColor, 0.15),
                },
                '& .MuiListItemIcon-root': {
                  color: roleColor,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <MedicationIcon />
            </ListItemIcon>
            <ListItemText primary="Prescriptions" />
          </ListItemButton>

          <ListItemButton
            selected={isActive('/patient/lab-results')}
            onClick={() => navigate('/patient/lab-results')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: alpha(roleColor, 0.1),
                '&:hover': {
                  bgcolor: alpha(roleColor, 0.15),
                },
                '& .MuiListItemIcon-root': {
                  color: roleColor,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ScienceIcon />
            </ListItemIcon>
            <ListItemText primary="Lab Results" />
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
              '&:hover': {
                bgcolor: alpha(roleColor, 0.05),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <MonitorHeartIcon />
            </ListItemIcon>
            <ListItemText primary="Health Stats" />
            {healthStatsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={healthStatsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <Box sx={{ px: 2, py: 1 }}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                bgcolor: theme.palette.warning.main,
                mr: 1.5,
                boxShadow: `0 2px 4px ${alpha(theme.palette.warning.main, 0.25)}`
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
                color: theme.palette.warning.main,
                textShadow: `0 1px 2px ${alpha(theme.palette.warning.main, 0.2)}`
              }}
            >
              Communication
            </Typography>
          </Box>

          {doctorData ? (
            <>
              <ListItemButton
                selected={isActive(`/patient/message/${doctorData._id || doctorData.id}`)}
                onClick={() => navigate(`/patient/message/${doctorData._id || doctorData.id}`)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(roleColor, 0.1),
                    '&:hover': {
                      bgcolor: alpha(roleColor, 0.15),
                    },
                    '& .MuiListItemIcon-root': {
                      color: roleColor,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <MessageIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Chat with Doctor"
                  secondary={doctorData.name ? `Dr. ${doctorData.name.split(' ')[0]}` : 'Your Doctor'}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
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
                  '&.Mui-selected': {
                    bgcolor: alpha(roleColor, 0.1),
                    '&:hover': {
                      bgcolor: alpha(roleColor, 0.15),
                    },
                    '& .MuiListItemIcon-root': {
                      color: roleColor,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <VideoCallIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Video Call"
                  secondary={doctorData.name ? `Dr. ${doctorData.name.split(' ')[0]}` : 'Your Doctor'}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
              </ListItemButton>
            </>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 1.5,
                mx: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.warning.light, 0.1),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    mr: 1.5,
                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                  }}
                >
                  <MessageIcon fontSize="small" color="warning" />
                </Avatar>
                <Typography variant="body2" fontWeight={600} color="warning.main">
                  No Doctor Assigned
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Book an appointment to get assigned to a doctor and start communicating.
              </Typography>
              <Button
                size="small"
                fullWidth
                variant="outlined"
                color="warning"
                startIcon={<CalendarMonth fontSize="small" />}
                onClick={() => navigate('/appointments/book')}
                sx={{
                  mt: 1,
                  borderRadius: 2,
                  fontSize: '0.7rem',
                  textTransform: 'none',
                  py: 0.5
                }}
              >
                Book Appointment
              </Button>
            </Paper>
          )}

          {/* Resources Section */}
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
              Resources
            </Typography>
          </Box>

          <ListItemButton
            selected={isActive('/patient/ai-assistant')}
            onClick={() => navigate('/patient/ai-assistant')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: alpha(roleColor, 0.1),
                '&:hover': {
                  bgcolor: alpha(roleColor, 0.15),
                },
                '& .MuiListItemIcon-root': {
                  color: roleColor,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SmartToy />
            </ListItemIcon>
            <ListItemText primary="AI Assistant" />
          </ListItemButton>

          <ListItemButton
            selected={isActive('/patient/hospitals')}
            onClick={() => navigate('/patient/hospitals')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: alpha(roleColor, 0.1),
                '&:hover': {
                  bgcolor: alpha(roleColor, 0.15),
                },
                '& .MuiListItemIcon-root': {
                  color: roleColor,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LocalHospital />
            </ListItemIcon>
            <ListItemText primary="Find Hospitals" />
          </ListItemButton>

          {/* Shop Section */}
          <ListItemButton
            onClick={() => setOpenCategories(prev => ({ ...prev, shop: !prev.shop }))}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              mt: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ShoppingCart />
            </ListItemIcon>
            <ListItemText primary="Health Shop" />
            {openCategories.shop ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          <Collapse in={openCategories.shop} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                selected={isActive('/shop/wearables')}
                onClick={() => navigate('/shop/wearables')}
                sx={{
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(roleColor, 0.1),
                    '&:hover': {
                      bgcolor: alpha(roleColor, 0.15),
                    },
                    '& .MuiListItemIcon-root': {
                      color: roleColor,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Watch />
                </ListItemIcon>
                <ListItemText primary="Wearable Devices" />
              </ListItemButton>

              <ListItemButton
                selected={isActive('/shop/cart')}
                onClick={() => navigate('/shop/cart')}
                sx={{
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(roleColor, 0.1),
                    '&:hover': {
                      bgcolor: alpha(roleColor, 0.15),
                    },
                    '& .MuiListItemIcon-root': {
                      color: roleColor,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ShoppingBasket />
                </ListItemIcon>
                <ListItemText primary="Shopping Cart" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Logout Button */}
          <Divider sx={{ my: 1.5 }} />

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: theme.palette.error.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: theme.palette.error.main }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          pt: 2,
          pb: 1.5,
          px: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          background: `linear-gradient(to bottom, ${alpha(theme.palette.background.paper, 0.5)}, ${alpha(theme.palette.background.paper, 0.8)})`,
          backdropFilter: 'blur(8px)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, transparent 100%)`,
          }
        }}
      >
        {/* Quick Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1.5,
            pb: 1.5,
            borderBottom: `1px dashed ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          <Tooltip title="Settings">
            <Paper
              elevation={0}
              onClick={() => navigate('/patient/settings')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.primary.main,
                  }
                }
              }}
            >
              <SettingsIcon
                fontSize="small"
                sx={{
                  color: 'text.secondary',
                  mb: 0.5,
                  transition: 'all 0.2s'
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 500
                }}
              >
                Settings
              </Typography>
            </Paper>
          </Tooltip>

          <Tooltip title="Help Center">
            <Paper
              elevation={0}
              onClick={() => navigate('/patient/help')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.primary.main,
                  }
                }
              }}
            >
              <HelpIcon
                fontSize="small"
                sx={{
                  color: 'text.secondary',
                  mb: 0.5,
                  transition: 'all 0.2s'
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 500
                }}
              >
                Help
              </Typography>
            </Paper>
          </Tooltip>

          <Tooltip title="AI Assistant">
            <Paper
              elevation={0}
              onClick={() => navigate('/patient/ai-assistant')}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: alpha(theme.palette.background.paper, 0.7),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  '& .MuiSvgIcon-root': {
                    color: theme.palette.primary.main,
                  }
                }
              }}
            >
              <SmartToy
                fontSize="small"
                sx={{
                  color: 'text.secondary',
                  mb: 0.5,
                  transition: 'all 0.2s'
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 500
                }}
              >
                AI Help
              </Typography>
            </Paper>
          </Tooltip>
        </Box>

        {/* Copyright and Version */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontWeight: 600,
                background: `linear-gradient(90deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SoulSpace Health
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
              © 2025 • v1.0.0
            </Typography>
          </Box>

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
              minWidth: 'auto'
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: 280 }, flexShrink: { sm: 0 } }}
      aria-label="patient sidebar"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            boxShadow: theme.shadows[8],
            mt: '64px', // Add top margin to account for navbar height
            height: 'calc(100% - 64px)', // Adjust height to account for navbar
            overflow: 'hidden',
            '&:hover': {
              overflowY: 'auto',
            },
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.text.primary, 0.2),
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: alpha(theme.palette.text.primary, 0.3),
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            mt: '64px', // Add top margin to account for navbar height
            height: 'calc(100% - 64px)', // Adjust height to account for navbar
            overflow: 'hidden',
            '&:hover': {
              overflowY: 'auto',
            },
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.text.primary, 0.2),
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: alpha(theme.palette.text.primary, 0.3),
            },
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default PatientWithHospitalSidebar;
