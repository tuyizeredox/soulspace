import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  fetchHealthStats,
  fetchHealthRecommendations,
  fetchNearbyHospitals,
  fetchNotifications
} from '../../services/healthDataService';
import { getAvatarUrl, getInitials, getRoleColor as getUtilRoleColor } from '../../utils/avatarUtils';
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
  Message as MessageIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  ExpandLess,
  ExpandMore,
  Favorite,
  DirectionsRun,
  Restaurant,
  Bedtime,
  Notifications as NotificationsIcon,
  CalendarMonth,
  VideoCall,
  SmartToy,
  LocalHospital,
  Person,
  WaterDrop,
  FitnessCenter,
  Psychology,
  Star,
  School,
  Spa,
  Forum,
  ReceiptLong,
  ShoppingCart,

} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Component starts here

// Define the PatientSidebar component
const PatientSidebar = ({ user, mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Get token from Redux store
  const { token: oldToken } = useSelector((state) => state.auth);
  const { token: newToken } = useSelector((state) => state.userAuth);
  const token = newToken || oldToken;

  console.log('PatientSidebar: Using token:', !!token);

  // State for health data
  const [healthStats, setHealthStats] = useState({
    steps: { current: 0, goal: 10000, unit: 'steps', icon: <DirectionsRun />, color: '#4caf50' },
    sleep: { current: 0, goal: 8, unit: 'hours', icon: <Bedtime />, color: '#9c27b0' },
    water: { current: 0, goal: 8, unit: 'glasses', icon: <WaterDrop />, color: '#2196f3' },
    heartRate: { current: 0, unit: 'bpm', icon: <Favorite />, color: '#f44336' },
  });

  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openCategories, setOpenCategories] = useState({
    health: true,
    appointments: true,
    records: false,
    wellness: false,
    education: false,
    community: false,
    insurance: false,
    shop: false,
  });

  // Fetch real data when component mounts
  useEffect(() => {
    // Skip if token is not available
    if (!token) {
      console.log('PatientSidebar: No token available, skipping data fetch');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('PatientSidebar: Fetching data with token:', !!token);

        // Fetch health stats (token is handled by the service)
        const statsData = await fetchHealthStats();

        // Use functional update to avoid dependency on healthStats
        setHealthStats(prevStats => ({
          steps: {
            ...prevStats.steps,
            current: statsData.steps?.current || 8742
          },
          sleep: {
            ...prevStats.sleep,
            current: statsData.sleep?.current || 7.2
          },
          water: {
            ...prevStats.water,
            current: statsData.water?.current || 6
          },
          heartRate: {
            ...prevStats.heartRate,
            current: statsData.heartRate?.current || 72
          },
        }));

        // Fetch recommendations (token is handled by the service)
        const recommendationsData = await fetchHealthRecommendations();
        setRecommendations(recommendationsData.map(rec => ({
          ...rec,
          icon: getIconForRecommendation(rec.icon)
        })));

        // Fetch nearby hospitals (token is handled by the service)
        await fetchNearbyHospitals(); // Just fetch but don't store

        // Fetch notifications (token is handled by the service)
        const notificationsData = await fetchNotifications();
        setNotifications(notificationsData);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up a refresh interval (optional)
    const refreshInterval = setInterval(() => {
      console.log('PatientSidebar: Refreshing data on interval');
      fetchData();
    }, 5 * 60 * 1000); // Refresh every 5 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, [token]); // Remove healthStats from dependency array

  // Helper function to get icon component based on string name
  const getIconForRecommendation = (iconName) => {
    const iconMap = {
      'Psychology': <Psychology />,
      'Restaurant': <Restaurant />,
      'Bedtime': <Bedtime />,
      'FitnessCenter': <FitnessCenter />
    };

    return iconMap[iconName] || <Star />;
  };

  // Function to toggle category collapse
  const handleCategoryToggle = (category) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category],
    });
  };

  // Function to get role-specific color using utility function
  const getRoleColor = (role) => {
    // Use the utility function but adapt colors to the theme
    const baseColor = getUtilRoleColor(role);

    // Map the utility colors to theme colors for consistency
    const colors = {
      super_admin: theme.palette.error.main,
      hospital_admin: theme.palette.warning.main,
      doctor: theme.palette.info.main,
      patient: theme.palette.success.main,
    };

    return colors[role] || baseColor || theme.palette.primary.main;
  };

  const roleColor = getRoleColor(user?.role);

  // State to track avatar URL
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Update avatar URL when user changes
  useEffect(() => {
    if (user) {
      setAvatarUrl(getAvatarUrl(user));
      console.log('PatientSidebar: Updated avatar URL:', getAvatarUrl(user));
    } else {
      setAvatarUrl(null);
    }

    // Listen for avatar updates from other components
    const handleAvatarUpdated = (event) => {
      console.log('PatientSidebar: Received avatar-updated event:', event.detail);
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

  // Function to check if a menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Quick actions for patients
  const quickActions = [
    {
      icon: <CalendarMonth />,
      label: 'Book Appointment',
      path: '/appointments/book',
      color: theme.palette.primary.main
    },
    {
      icon: <VideoCall />,
      label: 'Virtual Consult',
      path: '/appointments/virtual',
      color: theme.palette.secondary.main
    },
    {
      icon: <SmartToy />,
      label: 'AI Assistant',
      path: '/ai-assistant',
      color: theme.palette.info.main
    },
    {
      icon: <LocalHospital />,
      label: 'Find Hospital',
      path: '/hospitals',
      color: theme.palette.error.main
    },
  ];

  // Health categories
  const healthCategories = [
    {
      title: 'Appointments',
      icon: <EventIcon />,
      open: openCategories.appointments,
      items: [
        { text: 'Book Appointment', path: '/appointments/book', badge: null },
        { text: 'My Appointments', path: '/appointments', badge: { count: 2, color: 'primary' } },
        { text: 'Virtual Consultations', path: '/appointments/virtual', badge: null },
        { text: 'Upcoming Visits', path: '/appointments/upcoming', badge: null },
        { text: 'Appointment History', path: '/appointments/history', badge: null },
      ],
    },
    {
      title: 'Health Monitoring',
      icon: <MonitorHeartIcon />,
      open: openCategories.health,
      items: [
        { text: 'Dashboard', path: '/monitoring', badge: null },
        { text: 'Vital Signs', path: '/monitoring/vitals', badge: null },
        { text: 'Activity Tracking', path: '/monitoring/activity', badge: null },
        { text: 'Sleep Analysis', path: '/monitoring/sleep', badge: null },
        { text: 'Nutrition Tracking', path: '/monitoring/nutrition', badge: null },
        { text: 'Weight Management', path: '/monitoring/weight', badge: null },
        { text: 'Stress Levels', path: '/monitoring/stress', badge: null },
        { text: 'Blood Glucose', path: '/monitoring/glucose', badge: null },
      ],
    },
    {
      title: 'Medical Records',
      icon: <FolderSharedIcon />,
      open: openCategories.records,
      items: [
        { text: 'Health Records', path: '/records', badge: null },
        { text: 'Lab Results', path: '/records/lab-results', badge: { count: 3, color: 'info' } },
        { text: 'Prescriptions', path: '/prescriptions', badge: { count: 1, color: 'warning' } },
        { text: 'Allergies & Conditions', path: '/records/conditions', badge: null },
        { text: 'Vaccination Records', path: '/records/vaccinations', badge: null },
        { text: 'Medical History', path: '/records/history', badge: null },
        { text: 'Family Health History', path: '/records/family', badge: null },
      ],
    },
    {
      title: 'Wellness Center',
      icon: <Spa />,
      open: openCategories.wellness,
      items: [
        { text: 'Wellness Dashboard', path: '/wellness', badge: null },
        { text: 'Meditation & Mindfulness', path: '/wellness/meditation', badge: null },
        { text: 'Stress Management', path: '/wellness/stress', badge: null },
        { text: 'Sleep Improvement', path: '/wellness/sleep', badge: null },
        { text: 'Nutrition Planning', path: '/wellness/nutrition', badge: { count: 1, color: 'success' } },
        { text: 'Fitness Programs', path: '/wellness/fitness', badge: null },
        { text: 'Mental Wellness', path: '/wellness/mental', badge: null },
      ],
    },
    {
      title: 'Education Hub',
      icon: <School />,
      open: openCategories.education,
      items: [
        { text: 'Health Library', path: '/education/library', badge: null },
        { text: 'Video Tutorials', path: '/education/videos', badge: { count: 5, color: 'info' } },
        { text: 'Health Assessments', path: '/education/assessments', badge: null },
        { text: 'Disease Information', path: '/education/diseases', badge: null },
        { text: 'Medication Guide', path: '/education/medications', badge: null },
        { text: 'First Aid & Emergency', path: '/education/first-aid', badge: null },
      ],
    },
    {
      title: 'Community',
      icon: <Forum />,
      open: openCategories.community,
      items: [
        { text: 'Discussion Forums', path: '/community', badge: { count: 8, color: 'error' } },
        { text: 'Support Groups', path: '/community/groups', badge: null },
        { text: 'Health Challenges', path: '/community/challenges', badge: { count: 2, color: 'success' } },
        { text: 'Expert Q&A', path: '/community/experts', badge: null },
        { text: 'Success Stories', path: '/community/stories', badge: null },
      ],
    },
    {
      title: 'Insurance & Billing',
      icon: <ReceiptLong />,
      open: openCategories.insurance,
      items: [
        { text: 'Insurance Information', path: '/insurance', badge: null },
        { text: 'Claims & Coverage', path: '/insurance/claims', badge: null },
        { text: 'Payment History', path: '/insurance/payments', badge: null },
        { text: 'Billing Questions', path: '/insurance/billing', badge: null },
      ],
    },
    {
      title: 'Health Shop',
      icon: <ShoppingCart />,
      open: openCategories.shop,
      items: [
        { text: 'Wearable Devices', path: '/shop/wearables', badge: null },
        { text: 'Health Supplements', path: '/shop/supplements', badge: null },
        { text: 'Medical Supplies', path: '/shop/supplies', badge: null },
        { text: 'Wellness Products', path: '/shop/wellness', badge: null },
        { text: 'My Orders', path: '/shop/orders', badge: null },
      ],
    },
  ];

  // Default recommended content (will be replaced by API data)
  const defaultRecommendations = [
    { title: 'Managing Stress', path: '/articles/stress-management', icon: <Psychology /> },
    { title: 'Healthy Diet Tips', path: '/articles/diet-tips', icon: <Restaurant /> },
    { title: 'Sleep Improvement', path: '/articles/sleep-tips', icon: <Bedtime /> },
    { title: 'Exercise Routines', path: '/articles/exercise', icon: <FitnessCenter /> },
  ];

  const drawer = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
    }}>
      {/* User Profile Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: `linear-gradient(180deg, ${alpha(roleColor, 0.05)} 0%, rgba(0, 0, 0, 0) 100%)`,
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, transparent 0%, ${roleColor} 50%, transparent 100%)`,
            opacity: 0.7,
          }
        }}
      >
        <Avatar
          src={avatarUrl}
          alt={user?.name || 'User'}
          sx={{
            width: 80,
            height: 80,
            mb: 1,
            border: `3px solid ${roleColor}`,
            boxShadow: `0 0 0 3px ${alpha(roleColor, 0.3)}`,
            bgcolor: roleColor,
            fontSize: '2rem',
            fontWeight: 'bold',
          }}
          slotProps={{
            img: {
              onError: (e) => {
                console.error('PatientSidebar: Error loading avatar image:', e.target.src);
                // Hide the image and show initials instead
                e.target.style.display = 'none';
              }
            }
          }}
        >
          {getInitials(user?.name)}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
          {user?.name || 'Guest User'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label="Unassigned Patient"
            size="small"
            color="primary"
            sx={{
              fontWeight: 500,
              borderRadius: '12px',
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Tooltip title="Messages">
            <IconButton
              size="small"
              onClick={() => navigate('/patient/messages')}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: roleColor,
                  bgcolor: alpha(roleColor, 0.1),
                }
              }}
            >
              <Badge badgeContent={notifications.filter(n => !n.read && n.type === 'message').length || 0} color="error">
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
                  color: roleColor,
                  bgcolor: alpha(roleColor, 0.1),
                }
              }}
            >
              <Badge badgeContent={notifications.filter(n => !n.read).length || 0} color="primary">
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
                  color: roleColor,
                  bgcolor: alpha(roleColor, 0.1),
                }
              }}
            >
              <Person fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Find Hospital Section - Only for patients without hospital */}
      <Box
        sx={{
          px: 2,
          py: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          borderBottom: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: theme.palette.primary.main,
            borderRadius: '0 4px 4px 0'
          }
        }}
      >
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
          Find Your Hospital
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You're not assigned to a hospital yet. Find and book an appointment with a hospital to get started.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<LocalHospital />}
          onClick={() => navigate('/patient/hospitals')}
          sx={{ borderRadius: 2, textTransform: 'none', mb: 1 }}
        >
          Find Hospitals
        </Button>

        <Button
          variant="outlined"
          color="primary"
          fullWidth
          startIcon={<CalendarMonth />}
          onClick={() => navigate('/patient/appointments')}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Book Appointment
        </Button>
      </Box>

      {/* Health Stats Summary */}
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, px: 1, fontWeight: 600 }}>
          Health Stats
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between' }}>
          {Object.entries(healthStats).map(([key, stat]) => (
            <Paper
              key={key}
              component={motion.div}
              whileHover={{ y: -4, boxShadow: theme.shadows[4] }}
              sx={{
                p: 1,
                width: 'calc(50% - 4px)',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                '&:hover': {
                  borderColor: alpha(stat.color, 0.5),
                },
              }}
              onClick={() => navigate('/monitoring')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                    mr: 1,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 700, color: stat.color }}>
                {stat.current} {stat.unit}
              </Typography>
              {stat.goal && (
                <Box sx={{ width: '100%', mt: 0.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(stat.current / stat.goal) * 100}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(stat.color, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: stat.color,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                    {Math.round((stat.current / stat.goal) * 100)}% of {stat.goal} {stat.unit}
                  </Typography>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Quick Actions */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, px: 1, fontWeight: 600 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between' }}>
          {quickActions.map((action, index) => (
            <Paper
              key={index}
              component={motion.div}
              whileHover={{ y: -4, boxShadow: theme.shadows[4] }}
              sx={{
                p: 1,
                width: 'calc(50% - 4px)',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `1px solid ${alpha(action.color, 0.2)}`,
                '&:hover': {
                  borderColor: alpha(action.color, 0.5),
                },
              }}
              onClick={() => navigate(action.path)}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: alpha(action.color, 0.1),
                  color: action.color,
                  mb: 0.5,
                }}
              >
                {action.icon}
              </Avatar>
              <Typography variant="caption" sx={{ fontWeight: 500, textAlign: 'center' }}>
                {action.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
        <List sx={{ px: 0 }} component="nav">
          <ListItemButton
            selected={isActive('/patient/dashboard')}
            onClick={() => navigate('/patient/dashboard')}
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
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          {/* Health Categories */}
          {healthCategories.map((category, index) => (
            <React.Fragment key={index}>
              <ListItemButton
                onClick={() => handleCategoryToggle(category.title.toLowerCase().replace(' ', '_'))}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: alpha(roleColor, 0.05),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {category.icon}
                </ListItemIcon>
                <ListItemText primary={category.title} />
                {openCategories[category.title.toLowerCase().replace(' ', '_')] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openCategories[category.title.toLowerCase().replace(' ', '_')]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {category.items.map((item, itemIndex) => (
                    <ListItemButton
                      key={itemIndex}
                      selected={isActive(item.path)}
                      onClick={() => navigate(item.path)}
                      sx={{
                        pl: 4,
                        borderRadius: 2,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: alpha(roleColor, 0.1),
                          '&:hover': {
                            bgcolor: alpha(roleColor, 0.15),
                          },
                        },
                      }}
                    >
                      <ListItemText primary={item.text} />
                      {item.badge && (
                        <Badge badgeContent={item.badge.count} color={item.badge.color} sx={{ ml: 1 }} />
                      )}
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}

          <Divider sx={{ my: 1.5 }} />

          {/* Recommended Content */}
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1, px: 1, fontWeight: 600 }}>
            Recommended For You
          </Typography>

          {loading ? (
            // Show loading skeleton
            Array(3).fill(0).map((_, index) => (
              <ListItemButton
                key={index}
                disabled
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  opacity: 0.7,
                  animation: 'pulse 1.5s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { opacity: 0.5 },
                    '50%': { opacity: 0.8 },
                    '100%': { opacity: 0.5 },
                  },
                }}
              >
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'action.disabled', mr: 2 }} />
                <Box sx={{ width: '70%', height: 16, borderRadius: 1, bgcolor: 'action.disabled' }} />
              </ListItemButton>
            ))
          ) : (
            // Show real recommendations or fallback to defaults
            (recommendations.length > 0 ? recommendations : defaultRecommendations).map((item, index) => (
              <ListItemButton
                key={index}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { fontWeight: 500 }
                  }}
                />
                <Chip
                  icon={<Star sx={{ fontSize: '0.7rem !important' }} />}
                  label="New"
                  size="small"
                  sx={{
                    height: 20,
                    '& .MuiChip-label': { px: 0.5, fontSize: '0.65rem' },
                    '& .MuiChip-icon': { ml: 0.5 }
                  }}
                  color="primary"
                  variant="outlined"
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
            SoulSpace Health
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
            v1.0.0
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Settings">
            <IconButton
              size="small"
              onClick={() => navigate('/patient/settings')}
              sx={{
                mr: 1,
                color: 'text.secondary',
                '&:hover': {
                  color: roleColor,
                  bgcolor: alpha(roleColor, 0.1),
                }
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton
              size="small"
              onClick={() => navigate('/patient/help')}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: roleColor,
                  bgcolor: alpha(roleColor, 0.1),
                }
              }}
            >
              <HelpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { sm: 280 },
        flexShrink: { sm: 0 },
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
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
            borderRight: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            mt: '64px', // Adjust based on your header height
            height: 'calc(100% - 64px)',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: (theme) => alpha(theme.palette.text.primary, 0.2),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: (theme) => alpha(theme.palette.text.primary, 0.3),
            },
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            mt: '64px', // Adjust based on your header height
            height: 'calc(100% - 64px)',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: (theme) => alpha(theme.palette.text.primary, 0.2),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: (theme) => alpha(theme.palette.text.primary, 0.3),
            },
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default PatientSidebar;
