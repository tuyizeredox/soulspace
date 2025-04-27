import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import {
  // Add LocalHospital to the imports from @mui/icons-material
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Dashboard,
  People,
  CalendarMonth,
  MonitorHeart,
  Medication,
  Settings,
  Logout,
  LocalHospital, // Add this import
  AssignmentInd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useColorMode } from '../../theme/ThemeContext';
import { logout } from '../../store/slices/authSlice';

const Navigation = () => {
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getSuperAdminMenuItems = () => [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard' },
    { text: 'Hospitals', icon: <LocalHospital />, path: '/admin/hospitals' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
  ];

  const getHospitalAdminMenuItems = () => [
    { text: 'Dashboard', icon: <Dashboard />, path: '/hospital/dashboard' },
    { text: 'Patients', icon: <People />, path: '/hospital/patients' },
    { text: 'Doctors', icon: <LocalHospital />, path: '/hospital/doctors' },
    { text: 'Pharmacists', icon: <Medication />, path: '/hospital/pharmacists' },
    { text: 'Appointments', icon: <CalendarMonth />, path: '/hospital/appointments' },
    { text: 'Patient Assignments', icon: <AssignmentInd />, path: '/hospital/patient-assignments' },
  ];

  const menuItems = user?.role === 'super_admin'
    ? getSuperAdminMenuItems()
    : user?.role === 'hospital_admin'
    ? getHospitalAdminMenuItems()
    : [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
        { text: 'Patients', icon: <People />, path: '/patients' },
        { text: 'Appointments', icon: <CalendarMonth />, path: '/appointments' },
        { text: 'Monitoring', icon: <MonitorHeart />, path: '/monitoring' },
        { text: 'Prescriptions', icon: <Medication />, path: '/prescriptions' },
      ];

  const DrawerContent = () => (
    <Box sx={{ width: 250 }} role="presentation">
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Avatar
          sx={{ width: 64, height: 64, mb: 1, bgcolor: 'secondary.main' }}
          alt={user?.name}
          src={user?.avatar}
        />
        <Typography variant="h6">{user?.name}</Typography>
        <Typography variant="body2">{user?.role}</Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setDrawerOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
            >
              SoulSpace Health
            </Typography>

            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              <IconButton
                sx={{ ml: 1 }}
                onClick={toggleColorMode}
                color="inherit"
              >
                {theme.palette.mode === 'dark' ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>

              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 2 }}>
                  <Avatar
                    alt={user?.name}
                    src={user?.avatar || '/images/default-avatar.png'}
                    sx={{ bgcolor: 'secondary.main' }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => navigate('/profile')}>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>
                <MenuItem onClick={() => navigate('/settings')}>
                  <Typography textAlign="center">Settings</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Typography textAlign="center">Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <DrawerContent />
      </Drawer>
      <Toolbar /> {/* This is for spacing below the AppBar */}
    </>
  );
};

export default Navigation;
