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
  useMediaQuery,
} from '@mui/material';
import { getAvatarUrl, getInitials, getRoleColor as getUtilRoleColor, getRoleLabel as getUtilRoleLabel } from '../../utils/avatarUtils';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventIcon from '@mui/icons-material/Event';
import MessageIcon from '@mui/icons-material/Message';
import SettingsIcon from '@mui/icons-material/Settings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicationIcon from '@mui/icons-material/Medication';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ScienceIcon from '@mui/icons-material/Science';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import HelpIcon from '@mui/icons-material/Help';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StorageIcon from '@mui/icons-material/Storage';
import BackupIcon from '@mui/icons-material/Backup';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ForumIcon from '@mui/icons-material/Forum';
import FeedbackIcon from '@mui/icons-material/Feedback';
import BugReportIcon from '@mui/icons-material/BugReport';
import CodeIcon from '@mui/icons-material/Code';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LanguageIcon from '@mui/icons-material/Language';
import SchoolIcon from '@mui/icons-material/School';
import CampaignIcon from '@mui/icons-material/Campaign';
import ChatIcon from '@mui/icons-material/Chat';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MenuIcon from '@mui/icons-material/Menu';

// Full width and minimized width for the drawer
const drawerWidth = 240;
const miniDrawerWidth = 72;

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(false);

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  // Check if we're on desktop or larger screens
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // Toggle sidebar minimized state
  const toggleMinimized = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    
    // Store preference in localStorage
    localStorage.setItem('sidebarMinimized', newState ? 'true' : 'false');
    
    // Dispatch custom event for direct communication with Layout component
    window.dispatchEvent(
      new CustomEvent('sidebar-toggle', { 
        detail: { isMinimized: newState } 
      })
    );
  };

  // Load minimized preference from localStorage on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('sidebarMinimized');
    if (savedPreference === 'true' && isDesktop) {
      setIsMinimized(true);
    }
  }, [isDesktop]);

  console.log('Sidebar: User data', {
    role: user?.role,
    name: user?.name,
    hasToken: !!token
  });

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

  // State to track avatar URL
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Update avatar URL when user changes
  useEffect(() => {
    if (user) {
      setAvatarUrl(getAvatarUrl(user));
      console.log('Sidebar: Updated avatar URL:', getAvatarUrl(user));
    } else {
      setAvatarUrl(null);
    }

    // Listen for avatar updates from other components
    const handleAvatarUpdated = (event) => {
      console.log('Sidebar: Received avatar-updated event:', event.detail);
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

  const getSuperAdminMenuItems = () => [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin/dashboard',
      badge: null
    },
    {
      text: 'Hospital Management',
      icon: <LocalHospitalIcon />,
      path: '/admin/hospitals',
      badge: { count: 3, color: 'success' }
    },
    {
      text: 'User Management',
      icon: <PeopleIcon />,
      path: '/admin/users',
      badge: { count: 12, color: 'info' }
    },
    {
      text: 'System Security',
      icon: <SecurityIcon />,
      path: '/admin/security',
      badge: null
    },
    {
      text: 'Role Management',
      icon: <AdminPanelSettingsIcon />,
      path: '/admin/roles',
      badge: null
    },
    {
      text: 'Organization Setup',
      icon: <BusinessIcon />,
      path: '/admin/organizations',
      badge: null
    },
    {
      text: 'Compliance & Audit',
      icon: <VerifiedUserIcon />,
      path: '/admin/compliance',
      badge: { count: 2, color: 'warning' }
    },
    {
      text: 'Admin Accounts',
      icon: <SupervisorAccountIcon />,
      path: '/admin/admins',
      badge: null
    },
    {
      text: 'Analytics Dashboard',
      icon: <BarChartIcon />,
      path: '/admin/analytics',
      badge: null
    },
    {
      text: 'Performance Metrics',
      icon: <PieChartIcon />,
      path: '/admin/performance',
      badge: null
    },
    {
      text: 'User Activity',
      icon: <TimelineIcon />,
      path: '/admin/user-activity',
      badge: null
    },
    {
      text: 'Growth Trends',
      icon: <TrendingUpIcon />,
      path: '/admin/trends',
      badge: null
    },
    {
      text: 'Database Management',
      icon: <StorageIcon />,
      path: '/admin/database',
      badge: null
    },
    {
      text: 'Backup & Recovery',
      icon: <BackupIcon />,
      path: '/admin/backup',
      badge: null
    },
    {
      text: 'System Integration',
      icon: <CloudSyncIcon />,
      path: '/admin/integration',
      badge: null
    },
    {
      text: 'Notifications',
      icon: <NotificationsIcon />,
      path: '/admin/notifications',
      badge: { count: 5, color: 'error' }
    },
    {
      text: 'Communication Center',
      icon: <ChatIcon />,
      path: '/admin/chat',
      badge: { count: 3, color: 'primary' }
    },
    {
      text: 'Community Management',
      icon: <ForumIcon />,
      path: '/admin/community',
      badge: null
    },
    {
      text: 'User Feedback',
      icon: <FeedbackIcon />,
      path: '/admin/feedback',
      badge: { count: 7, color: 'info' }
    },
    {
      text: 'Bug Reports',
      icon: <BugReportIcon />,
      path: '/admin/bugs',
      badge: null
    },
    {
      text: 'API Management',
      icon: <CodeIcon />,
      path: '/admin/api',
      badge: null
    },
    {
      text: 'Webhooks',
      icon: <IntegrationInstructionsIcon />,
      path: '/admin/webhooks',
      badge: null
    },
    {
      text: 'Payment Processing',
      icon: <PaymentIcon />,
      path: '/admin/payments',
      badge: null
    },
    {
      text: 'Financial Reports',
      icon: <AccountBalanceIcon />,
      path: '/admin/finance',
      badge: null
    },
    {
      text: 'Billing Management',
      icon: <AttachMoneyIcon />,
      path: '/admin/billing',
      badge: null
    },
    {
      text: 'Localization',
      icon: <LanguageIcon />,
      path: '/admin/localization',
      badge: null
    },
    {
      text: 'Training Resources',
      icon: <SchoolIcon />,
      path: '/admin/training',
      badge: null
    },
    {
      text: 'Announcements',
      icon: <CampaignIcon />,
      path: '/admin/announcements',
      badge: null
    },
    {
      text: 'System Settings',
      icon: <SettingsIcon />,
      path: '/admin/settings',
      badge: null
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      badge: null
    },
  ];

  const getPatientMenuItems = () => [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: null
    },
    {
      text: 'Book Appointment',
      icon: <EventIcon />,
      path: '/appointments/book',
      badge: null
    },
    {
      text: 'Virtual Consultations',
      icon: <VideoCallIcon />,
      path: '/appointments/virtual',
      badge: null
    },
    {
      text: 'My Appointments',
      icon: <EventIcon />,
      path: '/appointments',
      badge: { count: 2, color: 'primary' }
    },
    {
      text: 'Medical Records',
      icon: <FolderSharedIcon />,
      path: '/records',
      badge: null
    },
    {
      text: 'Lab Results',
      icon: <ScienceIcon />,
      path: '/records/lab-results',
      badge: { count: 3, color: 'info' }
    },
    {
      text: 'Prescriptions',
      icon: <MedicationIcon />,
      path: '/prescriptions',
      badge: { count: 1, color: 'warning' }
    },
    {
      text: 'Health Monitoring',
      icon: <MonitorHeartIcon />,
      path: '/monitoring',
      badge: null
    },
    {
      text: 'Insurance',
      icon: <HealthAndSafetyIcon />,
      path: '/insurance',
      badge: null
    },
    {
      text: 'Messages',
      icon: <MessageIcon />,
      path: '/messages',
      badge: { count: 3, color: 'error' }
    },
    {
      text: 'AI Health Assistant',
      icon: <SmartToyIcon />,
      path: '/ai-assistant',
      badge: null
    },
    {
      text: 'Messages',
      icon: <MessageIcon />,
      path: '/messages',
      badge: { count: 3, color: 'error' }
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      badge: null
    },
  ];

  const getDoctorMenuItems = () => [
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
      badge: { count: 5, color: 'primary' }
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
      text: 'Messages',
      icon: <MessageIcon />,
      path: '/doctor/messages',
      badge: { count: 7, color: 'error' }
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      badge: null
    },
  ];

  const getHospitalAdminMenuItems = () => [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      badge: null
    },
    {
      text: 'Staff Management',
      icon: <PeopleIcon />,
      path: '/staff',
      badge: null
    },
    {
      text: 'Patients',
      icon: <PeopleIcon />,
      path: '/patients',
      badge: { count: 12, color: 'info' }
    },
    {
      text: 'Appointments',
      icon: <EventIcon />,
      path: '/appointments',
      badge: { count: 8, color: 'warning' }
    },
    {
      text: 'Billing',
      icon: <ReceiptIcon />,
      path: '/billing',
      badge: null
    },
    {
      text: 'Analytics',
      icon: <AssessmentIcon />,
      path: '/analytics',
      badge: null
    },
    {
      text: 'Messages',
      icon: <MessageIcon />,
      path: '/messages',
      badge: { count: 4, color: 'error' }
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      badge: null
    },
  ];

  const getMenuItems = () => {
    console.log('Sidebar: Getting menu items for role:', user?.role);
    console.log('Sidebar: User data:', {
      name: user?.name,
      email: user?.email,
      role: user?.role,
      id: user?.id
    });

    switch (user?.role) {
      case 'super_admin':
        console.log('Sidebar: Returning superAdminMenuItems');
        return getSuperAdminMenuItems();
      case 'hospital_admin':
        console.log('Sidebar: Returning hospitalAdminMenuItems');
        return getHospitalAdminMenuItems();
      case 'doctor':
        console.log('Sidebar: Returning doctorMenuItems');
        return getDoctorMenuItems();
      case 'patient':
        console.log('Sidebar: Returning patientMenuItems');
        return getPatientMenuItems();
      default:
        console.log('Sidebar: Unknown role, returning default menu');
        return [{ text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' }];
    }
  };

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

  // Helper to render sidebar content with a given minimized state
  const renderDrawerContent = (minimized) => (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
      width: minimized ? miniDrawerWidth : drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }}>
      {/* Toggle Button - Only visible on desktop */}
      {isDesktop && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: minimized ? 'center' : 'flex-end',
            p: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tooltip title={minimized ? "Expand sidebar" : "Collapse sidebar"}>
            <IconButton 
              onClick={toggleMinimized}
              size="small"
              sx={{
                color: getRoleColor(user?.role),
                bgcolor: alpha(getRoleColor(user?.role), 0.1),
                '&:hover': {
                  bgcolor: alpha(getRoleColor(user?.role), 0.2),
                },
                transition: 'all 0.2s ease',
              }}
            >
              {minimized ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* User Profile Section */}
      <Box
        sx={{
          p: minimized ? 1.5 : 3,
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
            width: minimized ? 50 : 90,
            height: minimized ? 50 : 90,
            mb: minimized ? 0.5 : 1,
            border: '3px solid',
            borderColor: getRoleColor(user?.role),
            boxShadow: `0 0 0 3px ${alpha(getRoleColor(user?.role), 0.2)}, 0 8px 16px ${alpha(theme.palette.common.black, 0.15)}`,
            background: `linear-gradient(135deg, ${alpha(getRoleColor(user?.role), 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.9)} 100%)`,
            color: '#fff',
            fontSize: minimized ? '1.2rem' : '2rem',
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
        
        {!minimized && (
          <>
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
          </>
        )}
      </Box>

      {/* Menu Items */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto', 
        px: minimized ? 0.5 : 2, 
        py: minimized ? 2 : 3 
      }}>
        <List component="nav" sx={{ width: '100%' }}>
          {getMenuItems().map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Tooltip 
                title={minimized ? item.text : ""} 
                placement="right"
                key={item.text}
              >
                <ListItemButton
                  selected={isActive}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    px: minimized ? 1 : 2,
                    py: 1.2,
                    justifyContent: minimized ? 'center' : 'flex-start',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: minimized ? '48px' : 'auto',
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
                      transform: minimized ? 'scale(1.05)' : 'translateX(4px)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? getRoleColor(user?.role) : 'text.secondary',
                      minWidth: minimized ? 0 : 40,
                      mr: minimized ? 0 : 2,
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  
                  {!minimized && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 700 : 500,
                        variant: 'body2',
                        color: isActive ? 'text.primary' : 'text.secondary',
                        noWrap: true,
                      }}
                    />
                  )}
                  
                  {!minimized && item.badge && (
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
                  
                  {/* Show badges as dots when minimized */}
                  {minimized && item.badge && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: theme.palette[item.badge.color].main,
                        boxShadow: `0 0 0 2px ${alpha(theme.palette[item.badge.color].main, 0.3)}`,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: minimized ? 1 : 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: minimized ? 'center' : 'space-between',
          background: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)',
          flexDirection: minimized ? 'column' : 'row',
        }}
      >
        {!minimized && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}>
              SoulSpace Health
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
              v1.0.0
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: minimized ? 'column' : 'row', gap: minimized ? 1 : 0 }}>
          <Tooltip title="Settings">
            <IconButton
              size="small"
              onClick={() => navigate('/settings')}
              sx={{
                mr: minimized ? 0 : 1,
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
              onClick={() => navigate('/help')}
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

  // Render the sidebar content with forced maximized state on mobile
  const drawerMobile = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }}>
      {/* Toggle Button - Only visible on desktop */}
      {/* ...existing code for toggle button, but skip on mobile... */}
      {/* User Profile Section, Menu Items, Footer ... */}
      {/* Copy the content of 'drawer' but always use isMinimized = false here */}
      {/* ...existing code, but set isMinimized = false for all relevant sections... */}
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { 
          xs: drawerWidth,
          sm: isMinimized ? miniDrawerWidth : drawerWidth 
        },
        flexShrink: { sm: 0 },
        zIndex: (theme) => theme.zIndex.drawer + 2,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
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
            width: drawerWidth, // Always full width on mobile
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
        {/* Always maximized sidebar on mobile */}
        {renderDrawerContent(false)}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isMinimized ? miniDrawerWidth : drawerWidth,
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
        {renderDrawerContent(isMinimized)}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
