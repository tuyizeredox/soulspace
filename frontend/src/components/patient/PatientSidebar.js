import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Badge,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  FolderShared as FolderSharedIcon,
  MonitorHeart as MonitorHeartIcon,
  Message as MessageIcon,
  LocalHospital as LocalHospitalIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  MedicalServices as MedicalServicesIcon,
  SmartToy as SmartToyIcon,
  Science as ScienceIcon,
  ShoppingCart as ShoppingCartIcon,
  DirectionsWalk as DirectionsWalkIcon,
  Opacity as OpacityIcon,
  Bedtime as BedtimeIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import axios from '../../utils/axiosConfig';
import { getAvatarUrl, getInitials } from '../../utils/avatarUtils';

const PatientSidebar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from Redux store
  const { user: oldAuthUser } = useSelector((state) => state.auth);
  const { user: userAuthUser } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = userAuthUser || oldAuthUser;

  // State for avatar and notifications
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState(0);
  const [hasWearableDevice, setHasWearableDevice] = useState(false);

  // Health stats
  const [healthStats, setHealthStats] = useState({
    steps: { current: 8742, target: 10000 },
    sleep: { current: 7.2, target: 8 },
    water: { current: 6, target: 8 },
    heartRate: { current: 72, target: 80 },
  });

  // Role color
  const roleColor = theme.palette.primary.main;

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Fetch user data
  useEffect(() => {
    if (user) {
      // Set avatar URL
      const url = getAvatarUrl(user);
      setAvatarUrl(url);

      // Fetch unread messages count
      const fetchUnreadMessages = async () => {
        try {
          const response = await axios.get('/api/chats/unread-count');
          if (response.data && response.data.count) {
            setUnreadMessages(response.data.count);
          }
        } catch (error) {
          console.error('Error fetching unread messages:', error);
          // Set a mock value for demo purposes
          setUnreadMessages(2);
        }
      };

      // Fetch upcoming appointments count
      const fetchUpcomingAppointments = async () => {
        try {
          const response = await axios.get('/api/appointments/upcoming-count');
          if (response.data && response.data.count) {
            setUpcomingAppointments(response.data.count);
          }
        } catch (error) {
          console.error('Error fetching upcoming appointments:', error);
          // Set a mock value for demo purposes
          setUpcomingAppointments(1);
        }
      };

      // Check if user has a wearable device
      const checkWearableDevice = async () => {
        try {
          const response = await axios.get('/api/patients/wearable-device');
          if (response.data && response.data.hasDevice) {
            setHasWearableDevice(true);

            // Update health stats if available
            if (response.data.healthData) {
              setHealthStats({
                steps: {
                  ...healthStats.steps,
                  current: response.data.healthData.steps || healthStats.steps.current
                },
                sleep: {
                  ...healthStats.sleep,
                  current: response.data.healthData.sleep || healthStats.sleep.current
                },
                water: {
                  ...healthStats.water,
                  current: response.data.healthData.water || healthStats.water.current
                },
                heartRate: {
                  ...healthStats.heartRate,
                  current: response.data.healthData.heartRate || healthStats.heartRate.current
                },
              });
            }
          } else {
            setHasWearableDevice(false);
          }
        } catch (error) {
          console.error('Error checking wearable device:', error);
          // Set a mock value for demo purposes
          setHasWearableDevice(true);
        }
      };

      fetchUnreadMessages();
      fetchUpcomingAppointments();
      checkWearableDevice();
    }
  }, [user]);

  // Menu items
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/patient/dashboard',
      badge: null
    },
    {
      text: 'Appointments',
      icon: <EventIcon />,
      path: '/patient/appointments',
      badge: upcomingAppointments > 0 ? { count: upcomingAppointments, color: 'primary' } : null
    },
    {
      text: 'Medical Records',
      icon: <FolderSharedIcon />,
      path: '/patient/medical-records',
      badge: null
    },
    {
      text: 'Health Metrics',
      icon: <MonitorHeartIcon />,
      path: '/patient/health-records',
      badge: null
    },
    {
      text: 'Chat',
      icon: <MessageIcon />,
      path: '/patient/chat',
      badge: unreadMessages > 0 ? { count: unreadMessages, color: 'error' } : null,
      highlight: true
    },
    {
      text: 'Find Doctors',
      icon: <MedicalServicesIcon />,
      path: '/patient/doctors',
      badge: null
    },
    {
      text: 'Hospitals',
      icon: <LocalHospitalIcon />,
      path: '/patient/hospitals',
      badge: null
    },
    {
      text: 'Prescriptions',
      icon: <MedicalServicesIcon />,
      path: '/patient/prescriptions',
      badge: null
    },
    {
      text: 'Lab Results',
      icon: <ScienceIcon />,
      path: '/patient/lab-results',
      badge: null
    },
    {
      text: 'AI Assistant',
      icon: <SmartToyIcon />,
      path: '/patient/ai-assistant',
      badge: null
    },
    {
      text: 'Shop',
      icon: <ShoppingCartIcon />,
      path: '/shop/wearables',
      badge: null
    }
  ];

  // Secondary menu items
  const secondaryMenuItems = [
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/patient/profile',
      badge: null
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/patient/settings',
      badge: null
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/patient/help',
      badge: null
    }
  ];

  // Handle logout
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('patientToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');

    // Redirect to login page
    navigate('/login');
  };

  // Calculate progress percentage
  const calculateProgress = (current, target) => {
    return Math.min(100, (current / target) * 100);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* User Profile */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${roleColor} 50%, transparent 100%)`,
            opacity: 0.7,
          }
        }}
      >
        <Avatar
          src={avatarUrl}
          alt={user?.name || 'Patient'}
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
        >
          {getInitials(user?.name)}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 600, textAlign: 'center' }}>
          {user?.name || 'Patient'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label="Patient"
            size="small"
            color="primary"
            sx={{
              fontWeight: 500,
              borderRadius: '12px',
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </Box>
      </Box>

      {/* Health Stats */}
      {hasWearableDevice && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Health Stats
          </Typography>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <DirectionsWalkIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.primary.main }} />
                <Typography variant="body2">Steps</Typography>
              </Box>
              <Typography variant="body2" fontWeight={500}>
                {healthStats.steps.current.toLocaleString()} / {healthStats.steps.target.toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calculateProgress(healthStats.steps.current, healthStats.steps.target)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: theme.palette.primary.main,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <BedtimeIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.info.main }} />
                <Typography variant="body2">Sleep</Typography>
              </Box>
              <Typography variant="body2" fontWeight={500}>
                {healthStats.sleep.current} / {healthStats.sleep.target} hrs
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calculateProgress(healthStats.sleep.current, healthStats.sleep.target)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: theme.palette.info.main,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <OpacityIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.secondary.main }} />
                <Typography variant="body2">Water</Typography>
              </Box>
              <Typography variant="body2" fontWeight={500}>
                {healthStats.water.current} / {healthStats.water.target} glasses
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={calculateProgress(healthStats.water.current, healthStats.water.target)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: theme.palette.secondary.main,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FavoriteIcon fontSize="small" sx={{ mr: 0.5, color: theme.palette.error.main }} />
                <Typography variant="body2">Heart Rate</Typography>
              </Box>
              <Typography variant="body2" fontWeight={500}>
                {healthStats.heartRate.current} bpm
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: theme.palette.error.main,
                }
              }}
            />
          </Box>
        </Box>
      )}

      <Divider sx={{ mt: hasWearableDevice ? 1 : 0 }} />

      {/* Main Navigation */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 1 }}>
        <List sx={{ px: 0 }} component="nav">
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                position: 'relative',
                ...(item.highlight && {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: theme.palette.success.main,
                    animation: item.badge ? 'none' : 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.4)}`
                      },
                      '70%': {
                        boxShadow: `0 0 0 6px ${alpha(theme.palette.success.main, 0)}`
                      },
                      '100%': {
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0)}`
                      }
                    }
                  }
                }),
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
                {item.badge ? (
                  <Badge
                    badgeContent={item.badge.count}
                    color={item.badge.color}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        height: 16,
                        minWidth: 16,
                      }
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <List sx={{ px: 0 }} component="nav">
          {secondaryMenuItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={isActive(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                position: 'relative',
                ...(item.highlight && {
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: theme.palette.success.main,
                    animation: item.badge ? 'none' : 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.4)}`
                      },
                      '70%': {
                        boxShadow: `0 0 0 6px ${alpha(theme.palette.success.main, 0)}`
                      },
                      '100%': {
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0)}`
                      }
                    }
                  }
                }),
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
                {item.badge ? (
                  <Badge
                    badgeContent={item.badge.count}
                    color={item.badge.color}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.6rem',
                        height: 16,
                        minWidth: 16,
                      }
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}

          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              color: theme.palette.error.main,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
              },
              '& .MuiListItemIcon-root': {
                color: theme.palette.error.main,
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
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
          <Tooltip title="Notifications">
            <IconButton
              size="small"
              onClick={() => navigate('/patient/notifications')}
              sx={{
                mr: 1,
                color: 'text.secondary',
                '&:hover': {
                  color: roleColor,
                  bgcolor: alpha(roleColor, 0.1),
                }
              }}
            >
              <NotificationsIcon fontSize="small" />
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
};

export default PatientSidebar;
