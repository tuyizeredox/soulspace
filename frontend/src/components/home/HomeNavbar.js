import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { logoutUser } from '../../store/slices/userAuthSlice';
import { useColorMode } from '../../theme/ThemeContext';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  useTheme,
  alpha,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Login,
  PersonAdd,
  Dashboard,
  Logout,
  Person,
  Settings,
  HealthAndSafety,
  ArrowForward,
} from '@mui/icons-material';

const HomeNavbar = () => {
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated: oldAuth, user: oldUser } = useSelector((state) => state.auth);
  const { isAuthenticated: newAuth, user: newUser } = useSelector((state) => state.userAuth);

  // Use either the new or old auth state, preferring the new one
  const isAuthenticated = newAuth || oldAuth;
  const user = newUser || oldUser;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // Initialize navbar as scrolled to always show attractive colors
  useEffect(() => {
    // Set scrolled to true by default to always show attractive colors
    setScrolled(true);

    // No need for scroll event listener since we always want the navbar to be in scrolled state
  }, []);

  const handleOpenUserMenu = (event) => {
    setUserMenu(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenu(null);
  };

  const handleLogout = () => {
    // Logout from both auth slices to ensure complete logout
    dispatch(logout());
    dispatch(logoutUser());
    handleCloseUserMenu();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    handleCloseUserMenu();
    setDrawerOpen(false);
  };

  const menuItems = [
    { text: 'Home', path: '/' },
    { text: 'About', path: '/about' },
    { text: 'Services', path: '/services' },
    { text: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <AppBar
        position="fixed"
        elevation={4}
        sx={{
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(90deg, rgba(79, 70, 229, 0.95) 0%, rgba(45, 212, 191, 0.95) 100%)'
            : 'linear-gradient(90deg, rgba(79, 70, 229, 0.95) 0%, rgba(45, 212, 191, 0.95) 100%)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          borderBottom: `1px solid ${alpha('#a5f3fc', 0.3)}`,
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("/pattern-dots.svg")',
            backgroundSize: '30px',
            opacity: 0.1,
            zIndex: -1,
          },
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Mobile menu icon */}
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{
                mr: 2,
                display: { md: 'none' },
                color: '#ffffff',
                bgcolor: alpha('#ffffff', 0.1),
                '&:hover': {
                  bgcolor: alpha('#ffffff', 0.2),
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              <HealthAndSafety
                sx={{
                  display: { xs: 'flex' },
                  mr: 1,
                  fontSize: 32,
                  color: '#ffffff',
                  filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
                }}
              />
              <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '.1rem',
                  color: '#ffffff',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  textShadow: '0 0 10px rgba(255,255,255,0.3)',
                }}
                onClick={() => navigate('/')}
              >
                SoulSpace Health
              </Typography>
            </Box>

            {/* Desktop menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    mx: 1.5,
                    my: 2,
                    color: '#ffffff',
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '1rem',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: '0%',
                      height: '2px',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#ffffff',
                      transition: 'width 0.3s ease',
                    },
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#ffffff',
                      textShadow: '0 0 10px rgba(255,255,255,0.5)',
                      '&::after': {
                        width: '70%',
                      },
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

            {/* Right side actions */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Theme toggle */}
              <IconButton
                onClick={toggleColorMode}
                sx={{
                  color: '#ffffff',
                  mr: 2,
                  bgcolor: alpha('#ffffff', 0.1),
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.2),
                    transform: 'rotate(30deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>

              {/* User menu or login/register buttons */}
              {isAuthenticated ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={<Dashboard />}
                    onClick={() => navigate('/dashboard')}
                    sx={{
                      mr: 2,
                      display: { xs: 'none', sm: 'flex' },
                      borderRadius: 3,
                      textTransform: 'none',
                      py: 1,
                      px: 3,
                      fontWeight: 600,
                      bgcolor: 'white',
                      color: '#4f46e5',
                      boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        bgcolor: 'white',
                        boxShadow: '0 6px 20px rgba(255, 255, 255, 0.4)',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Dashboard
                  </Button>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        alt={user?.name}
                        src={user?.avatar || '/images/default-avatar.png'}
                        sx={{
                          bgcolor: '#4f46e5',
                          border: '2px solid #ffffff',
                          width: 40,
                          height: 40,
                          boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={userMenu}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(userMenu)}
                    onClose={handleCloseUserMenu}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user?.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => handleNavigate('/profile')}>
                      <ListItemIcon>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Profile</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/dashboard')}>
                      <ListItemIcon>
                        <Dashboard fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Dashboard</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/settings')}>
                      <ListItemIcon>
                        <Settings fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Settings</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Login />}
                    onClick={() => navigate('/login')}
                    sx={{
                      mr: 2,
                      display: { xs: 'none', sm: 'flex' },
                      color: '#ffffff',
                      borderColor: '#ffffff',
                      borderWidth: 2,
                      py: 1,
                      px: 3,
                      '&:hover': {
                        borderColor: '#ffffff',
                        borderWidth: 2,
                        backgroundColor: alpha('#ffffff', 0.1),
                        transform: 'translateY(-3px)',
                      },
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/register')}
                    sx={{
                      display: { xs: 'none', sm: 'flex' },
                      borderRadius: 3,
                      textTransform: 'none',
                      py: 1,
                      px: 3,
                      fontWeight: 600,
                      bgcolor: 'white',
                      color: '#4f46e5',
                      boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        bgcolor: 'white',
                        boxShadow: '0 6px 20px rgba(255, 255, 255, 0.4)',
                        transform: 'translateY(-3px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center' }}>
          <HealthAndSafety sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" fontWeight={700} color="primary">
            SoulSpace Health
          </Typography>
        </Box>
        <Divider />
        <List sx={{ px: 2, py: 1 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          {isAuthenticated ? (
            <>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Dashboard />}
                onClick={() => handleNavigate('/dashboard')}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Dashboard
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Login />}
                onClick={() => handleNavigate('/login')}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Login
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PersonAdd />}
                onClick={() => handleNavigate('/register')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default HomeNavbar;
