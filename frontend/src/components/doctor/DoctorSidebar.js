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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  VideoCall as VideoCallIcon,
  Medication as MedicationIcon,
  Message as MessageIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  MedicalServices as MedicalServicesIcon,
  MonitorHeart as MonitorHeartIcon,
} from '@mui/icons-material';
import axios from '../../utils/axiosConfig';
import { getAvatarUrl, getInitials } from '../../utils/avatarUtils';

const DoctorSidebar = () => {
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
          setUnreadMessages(3);
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
          setUpcomingAppointments(2);
        }
      };

      fetchUnreadMessages();
      fetchUpcomingAppointments();
    }
  }, [user]);

  // Menu items
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/doctor/dashboard',
      badge: null
    },
    {
      text: 'Appointments',
      icon: <EventIcon />,
      path: '/doctor/appointments',
      badge: upcomingAppointments > 0 ? { count: upcomingAppointments, color: 'primary' } : null
    },
    {
      text: 'My Patients',
      icon: <PeopleIcon />,
      path: '/doctor/patients',
      badge: null
    },
    {
      text: 'Online Consultations',
      icon: <VideoCallIcon />,
      path: '/doctor/online-appointments',
      badge: null
    },
    {
      text: 'Prescriptions',
      icon: <MedicationIcon />,
      path: '/doctor/prescriptions',
      badge: null
    },
    {
      text: 'Chat',
      icon: <MessageIcon />,
      path: '/doctor/patients/chat',
      badge: unreadMessages > 0 ? { count: unreadMessages, color: 'error' } : null,
      highlight: true
    },
    {
      text: 'Health Monitoring',
      icon: <MonitorHeartIcon />,
      path: '/doctor/monitoring',
      badge: null
    },
    {
      text: 'Medical Records',
      icon: <MedicalServicesIcon />,
      path: '/doctor/medical-records',
      badge: null
    }
  ];

  // Secondary menu items
  const secondaryMenuItems = [
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/doctor/profile',
      badge: null
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/doctor/settings',
      badge: null
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      badge: null
    }
  ];

  // Handle logout
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userToken');
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');

    // Redirect to login page
    navigate('/login');
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
          alt={user?.name || 'Doctor'}
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
          Dr. {user?.name || 'Doctor'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label={user?.specialization || "Doctor"}
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
              onClick={() => navigate('/doctor/notifications')}
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
              onClick={() => navigate('/help')}
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

export default DoctorSidebar;
