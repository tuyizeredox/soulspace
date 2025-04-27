import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  alpha,
  useTheme,
  ListItemButton,
  Badge,
  Tooltip,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import { getAvatarUrl, getInitials, getRoleColor as getUtilRoleColor, getRoleLabel as getUtilRoleLabel } from '../../utils/avatarUtils';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventIcon from '@mui/icons-material/Event';
import MessageIcon from '@mui/icons-material/Message';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MedicationIcon from '@mui/icons-material/Medication';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HelpIcon from '@mui/icons-material/Help';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import MoneyIcon from '@mui/icons-material/Money';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import axios from '../../utils/axiosConfig';

const drawerWidth = 240;

const HospitalAdminSidebar = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  const theme = useTheme();
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    unreadMessages: 0,
    newPatients: 0,
    staffRequests: 0
  });

  // State to track avatar URL
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Role-specific styling using utility functions
  const getRoleColor = (role) => {
    // Use the utility function but adapt colors to the theme
    const baseColor = getUtilRoleColor(role);

    // Map the utility colors to theme colors for consistency
    switch (role) {
      case 'super_admin':
        return theme.palette.error.main;
      case 'hospital_admin':
        return theme.palette.warning.main;
      case 'doctor':
        return theme.palette.info.main;
      case 'patient':
        return theme.palette.success.main;
      default:
        return baseColor || theme.palette.primary.main;
    }
  };

  const getRoleLabel = (role) => {
    // Use the utility function directly
    return getUtilRoleLabel(role);
  };

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

  // Fetch real-time stats for badges
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.hospitalId || !token) return;

      try {
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };

        // Fetch hospital stats
        const response = await axios.get(`/api/hospitals/${user.hospitalId}/stats`, config);

        if (response.data) {
          setStats({
            pendingAppointments: response.data.pendingAppointments || 0,
            unreadMessages: Math.floor(Math.random() * 10), // Mock data for now
            newPatients: Math.floor(Math.random() * 5), // Mock data for now
            staffRequests: Math.floor(Math.random() * 3) // Mock data for now
          });
        }
      } catch (error) {
        console.error('Error fetching sidebar stats:', error);
      }
    };

    fetchStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.hospitalId, token]);

  const getHospitalAdminMenuItems = () => [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/hospital/dashboard',
      badge: null
    },
    {
      text: 'Doctors',
      icon: <LocalHospitalIcon />,
      path: '/hospital/doctors',
      badge: null
    },
    {
      text: 'Patients',
      icon: <PeopleIcon />,
      path: '/hospital/patients',
      badge: stats.newPatients > 0 ? { count: stats.newPatients, color: 'info' } : null
    },
    {
      text: 'Appointments',
      icon: <EventIcon />,
      path: '/hospital/appointments',
      badge: stats.pendingAppointments > 0 ? { count: stats.pendingAppointments, color: 'warning' } : null
    },
    {
      text: 'Patient Assignments',
      icon: <AssignmentIcon />,
      path: '/hospital/patient-assignments',
      badge: null
    },
    {
      text: 'Pharmacists',
      icon: <LocalPharmacyIcon />,
      path: '/hospital/pharmacists',
      badge: null
    },
    {
      text: 'Staff Management',
      icon: <SupervisorAccountIcon />,
      path: '/hospital/staff',
      badge: stats.staffRequests > 0 ? { count: stats.staffRequests, color: 'success' } : null
    },
    {
      text: 'Analytics',
      icon: <BarChartIcon />,
      path: '/hospital/analytics',
      badge: null
    },
    {
      text: 'Inventory',
      icon: <InventoryIcon />,
      path: '/hospital/inventory',
      badge: null
    },
    {
      text: 'Billing',
      icon: <MoneyIcon />,
      path: '/hospital/billing',
      badge: null
    },
    {
      text: 'Communication',
      icon: <ChatIcon />,
      path: '/hospital/chat',
      badge: stats.unreadMessages > 0 ? { count: stats.unreadMessages, color: 'error' } : null
    },
    {
      text: 'Notifications',
      icon: <NotificationsIcon />,
      path: '/hospital/notifications',
      badge: { count: stats.pendingAppointments + stats.unreadMessages, color: 'error' }
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/hospital/help',
      badge: null
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/hospital/settings',
      badge: null
    },
  ];

  // Get role-specific sidebar theme
  const getSidebarTheme = () => {
    const baseGradient = {
      super_admin: 'linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
      hospital_admin: 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
      doctor: 'linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
      patient: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(0, 0, 0, 0) 100%)',
    };

    return {
      headerBg: baseGradient[user?.role] || 'transparent',
      borderColor: getRoleColor(user?.role),
      iconHighlight: getRoleColor(user?.role),
    };
  };

  const sidebarTheme = getSidebarTheme();

  // Quick Actions section
  const QuickActions = () => (
    <Box sx={{ px: 2, py: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Quick Actions
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Tooltip title="Add Patient">
          <IconButton
            size="small"
            onClick={() => navigate('/hospital/patients')}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
            }}
          >
            <PersonAddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Schedule Appointment">
          <IconButton
            size="small"
            onClick={() => navigate('/hospital/appointments')}
            sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.main,
              '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.2) }
            }}
          >
            <EventAvailableIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Assign Doctor">
          <IconButton
            size="small"
            onClick={() => navigate('/hospital/patient-assignments')}
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
            }}
          >
            <MedicalServicesIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chat">
          <IconButton
            size="small"
            onClick={() => navigate('/hospital/chat')}
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
            }}
          >
            <ChatIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  // Hospital Stats section
  const HospitalStats = () => (
    <Box sx={{ px: 2, py: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Hospital Stats
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">Patients</Typography>
          <Chip
            label={stats.newPatients > 0 ? `+${stats.newPatients} new` : "No new"}
            size="small"
            color={stats.newPatients > 0 ? "info" : "default"}
            sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0.5, fontSize: '0.65rem' } }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">Appointments</Typography>
          <Chip
            label={`${stats.pendingAppointments} pending`}
            size="small"
            color={stats.pendingAppointments > 0 ? "warning" : "default"}
            sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0.5, fontSize: '0.65rem' } }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">Messages</Typography>
          <Chip
            label={`${stats.unreadMessages} unread`}
            size="small"
            color={stats.unreadMessages > 0 ? "error" : "default"}
            sx={{ height: 20, '& .MuiChip-label': { px: 1, py: 0.5, fontSize: '0.65rem' } }}
          />
        </Box>
      </Box>
    </Box>
  );

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
          background: sidebarTheme.headerBg,
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
            background: `linear-gradient(90deg, transparent 0%, ${getRoleColor(user?.role)} 50%, transparent 100%)`,
            opacity: 0.7,
          }
        }}
      >
        <Avatar
          sx={{
            width: 90,
            height: 90,
            mb: 1,
            border: '3px solid',
            borderColor: getRoleColor(user?.role),
            boxShadow: `0 0 0 3px ${alpha(getRoleColor(user?.role), 0.2)}, 0 8px 16px ${alpha(theme.palette.common.black, 0.15)}`,
            background: `linear-gradient(135deg, ${alpha(getRoleColor(user?.role), 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: `0 0 0 4px ${alpha(getRoleColor(user?.role), 0.3)}, 0 10px 20px ${alpha(theme.palette.common.black, 0.2)}`,
            }
          }}
          alt={user?.name}
          src={avatarUrl}
          slotProps={{
            img: {
              onError: (e) => {
                console.error('Sidebar: Error loading avatar image:', e.target.src);
                // Hide the image and show initials instead
                e.target.style.display = 'none';
              }
            }
          }}
        >
          {getInitials(user?.name)}
        </Avatar>
        <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, textAlign: 'center' }}>
          {user?.name || 'User'}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            px: 2,
            py: 0.7,
            borderRadius: 5,
            bgcolor: alpha(getRoleColor(user?.role), 0.15),
            color: getRoleColor(user?.role),
            fontWeight: 600,
            mt: 0.5,
            boxShadow: `0 2px 6px ${alpha(getRoleColor(user?.role), 0.2)}`,
            border: `1px solid ${alpha(getRoleColor(user?.role), 0.2)}`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {getRoleLabel(user?.role)}
        </Typography>
      </Box>

      {/* Quick Actions Section */}
      <QuickActions />

      <Divider sx={{ mx: 2 }} />

      {/* Hospital Stats Section */}
      <HospitalStats />

      <Divider sx={{ mx: 2 }} />

      {/* Menu Items */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2, py: 3 }}>
        <List component="nav" sx={{ width: '100%' }}>
          {getHospitalAdminMenuItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.text}
                selected={isActive}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1.2,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&.Mui-selected': {
                    bgcolor: alpha(getRoleColor(user?.role), 0.12),
                    '&:hover': {
                      bgcolor: alpha(getRoleColor(user?.role), 0.18),
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      backgroundColor: getRoleColor(user?.role),
                      borderRadius: '0 4px 4px 0',
                    }
                  },
                  '&:hover': {
                    bgcolor: alpha(getRoleColor(user?.role), 0.08),
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? getRoleColor(user?.role) : 'text.secondary',
                    minWidth: 40,
                    transition: 'all 0.2s ease',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 500,
                    variant: 'body2',
                    color: isActive ? 'text.primary' : 'text.secondary',
                  }}
                />
                {item.badge && (
                  <Badge
                    badgeContent={item.badge.count}
                    color={item.badge.color}
                    sx={{
                      ml: 1,
                      '& .MuiBadge-badge': {
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        minWidth: '20px',
                        height: '20px',
                        borderRadius: '10px',
                      }
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
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
          background: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)',
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
              onClick={() => navigate('/hospital/settings')}
              sx={{
                mr: 1,
                color: 'text.secondary',
                '&:hover': {
                  color: getRoleColor(user?.role),
                  bgcolor: alpha(getRoleColor(user?.role), 0.1),
                }
              }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton
              size="small"
              onClick={() => navigate('/hospital/help')}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: getRoleColor(user?.role),
                  bgcolor: alpha(getRoleColor(user?.role), 0.1),
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
        width: { sm: drawerWidth },
        flexShrink: { sm: 0 },
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
      aria-label="sidebar navigation"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: theme.palette.mode === 'dark'
              ? '4px 0 15px rgba(0, 0, 0, 0.3)'
              : '4px 0 15px rgba(0, 0, 0, 0.05)',
            backgroundImage: 'none',
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
            overflow: 'auto',
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
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: theme.palette.mode === 'dark'
              ? '4px 0 15px rgba(0, 0, 0, 0.3)'
              : '4px 0 15px rgba(0, 0, 0, 0.05)',
            backgroundImage: 'none',
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
            overflow: 'auto',
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

// We're already importing getInitials from avatarUtils

export default HospitalAdminSidebar;
