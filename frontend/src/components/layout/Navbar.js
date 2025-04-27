import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Button,
  Divider,
  ListItemIcon,
  Tooltip,
  Container,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpIcon from '@mui/icons-material/Help';
import SearchIcon from '@mui/icons-material/Search';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { logout } from '../../store/slices/authSlice';
import { logoutUser } from '../../store/slices/userAuthSlice';
import NotificationCenter from '../notifications/NotificationCenter';
import { getAvatarUrl, getInitials, getRoleColor as getUtilRoleColor, getRoleLabel as getUtilRoleLabel } from '../../utils/avatarUtils';

const Navbar = ({ onDrawerToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  console.log('Navbar: User data', {
    role: user?.role,
    name: user?.name,
    hasToken: !!token
  });
  const [anchorEl, setAnchorEl] = useState(null);
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
      console.log('Navbar: Updated avatar URL:', getAvatarUrl(user));
    } else {
      setAvatarUrl(null);
    }

    // Listen for avatar updates from other components
    const handleAvatarUpdated = (event) => {
      console.log('Navbar: Received avatar-updated event:', event.detail);
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

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };



  const handleLogout = () => {
    // Dispatch both logout actions to ensure all auth data is cleared
    dispatch(logout());
    dispatch(logoutUser());
    console.log('Logged out from both auth systems');
    handleClose();
    // Navigate to login page
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };



  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 3, // Higher than sidebar
        backgroundColor: theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.paper, 0.9)
          : alpha(theme.palette.background.paper, 0.95),
        color: 'text.primary',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        height: '64px', // Fixed height for consistency
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '64px' }}>
          {/* Sidebar toggle button - visible on all screen sizes */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{
              mr: 2,
              color: getRoleColor(user?.role),
              '&:hover': {
                backgroundColor: alpha(getRoleColor(user?.role), 0.1),
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          <HealthAndSafetyIcon
            sx={{
              display: { xs: 'none', md: 'flex' },
              mr: 1.5,
              color: getRoleColor(user?.role),
              fontSize: 28
            }}
          />

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              background: `linear-gradient(90deg, ${getRoleColor(user?.role)} 0%, ${theme.palette.primary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SoulSpace Health
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Search button */}
          <Tooltip title="Search">
            <IconButton
              color="inherit"
              sx={{
                mr: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>

          {/* Dashboard button */}
          <Tooltip title="Dashboard">
            <Button
              variant="text"
              color="inherit"
              startIcon={<DashboardIcon />}
              onClick={() => navigate('/dashboard')}
              sx={{
                mr: 1,
                display: { xs: 'none', md: 'flex' },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                }
              }}
            >
              Dashboard
            </Button>
          </Tooltip>

          {/* Role badge */}
          <Chip
            label={getRoleLabel(user?.role)}
            size="small"
            sx={{
              mr: 2,
              fontWeight: 600,
              backgroundColor: alpha(getRoleColor(user?.role), 0.1),
              color: getRoleColor(user?.role),
              border: `1px solid ${alpha(getRoleColor(user?.role), 0.3)}`,
              display: { xs: 'none', md: 'flex' },
            }}
          />

          {/* Notifications */}
          <NotificationCenter />

          {/* User menu */}
          {user && (
            <Box>
              <Tooltip title="Account settings">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                  sx={{
                    border: `2px solid ${alpha(getRoleColor(user?.role), 0.5)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: alpha(getRoleColor(user?.role), 0.1),
                      transform: 'scale(1.05)',
                    }
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(getRoleColor(user?.role), 0.8),
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                    alt={user.name}
                    src={avatarUrl}
                    slotProps={{
                      img: {
                        onError: (e) => {
                          console.error('Navbar: Error loading avatar image:', e.target.src);
                          // Hide the image and show initials instead
                          e.target.style.display = 'none';
                        }
                      }
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                  paper: {
                    sx: {
                      width: 220,
                      mt: 1.5,
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 8px 16px rgba(0, 0, 0, 0.5)'
                        : '0 8px 16px rgba(0, 0, 0, 0.1)',
                      border: '1px solid',
                      borderColor: 'divider',
                    }
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => handleNavigate('/profile')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/dashboard')}>
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Settings
                </MenuItem>
                <MenuItem onClick={() => handleNavigate('/help')}>
                  <ListItemIcon>
                    <HelpIcon fontSize="small" />
                  </ListItemIcon>
                  Help Center
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
