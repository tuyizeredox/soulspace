import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../../store/slices/authSlice';
import { getCurrentUser } from '../../store/slices/userAuthSlice';
import { Box, useMediaQuery, useTheme, CircularProgress, alpha } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PatientSidebar from './PatientSidebar';
import HospitalAdminSidebar from './HospitalAdminSidebar';

const Layout = ({ children }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated: oldAuth, user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { isAuthenticated: newAuth, user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const isAuthenticated = newAuth || oldAuth;
  const user = newUser || oldUser;
  const token = newToken || oldToken;
  const [patientHasHospital, setPatientHasHospital] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Check if patient has a hospital assignment
  useEffect(() => {
    if (user?.role === 'patient') {
      // In a real implementation, this would be an API call to check hospital assignment
      // For now, we'll simulate this with a random value for demonstration
      setPatientHasHospital(false); // Set to false to show the enhanced sidebar
      console.log('Layout: Patient detected, using PatientSidebar');
    } else {
      console.log('Layout: Non-patient role detected:', user?.role);
    }
  }, [user]);

  // Check authentication status on mount and when auth state changes
  useEffect(() => {
    // If we have a token but no user data, fetch user data
    // This helps with page refreshes where Redux state is reset but token persists in localStorage
    if (token && !user) {
      console.log('Layout: Token exists but no user data, fetching user data');

      // Try the new auth system first
      if (newToken) {
        dispatch(getCurrentUser())
          .unwrap()
          .then(() => {
            console.log('Layout: Successfully fetched user data with new token');
            setLoading(false);
          })
          .catch((error) => {
            console.error('Layout: Failed to fetch user with new token:', error);

            // If new auth fails but we have an old token, try the old system
            if (oldToken) {
              dispatch(checkAuthStatus())
                .unwrap()
                .then(() => {
                  console.log('Layout: Successfully fetched user data with old token');
                  setLoading(false);
                })
                .catch((error) => {
                  console.error('Layout: Failed to fetch user with old token:', error);
                  setLoading(false);
                });
            } else {
              setLoading(false);
            }
          });
      }
      // If only old token exists, use the old auth system
      else if (oldToken) {
        dispatch(checkAuthStatus())
          .unwrap()
          .then(() => {
            console.log('Layout: Successfully fetched user data with old token');
            setLoading(false);
          })
          .catch(() => {
            // If token validation fails, we'll be redirected to login by the next useEffect
            console.error('Layout: Failed to fetch user with old token');
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
    }
  }, [token, user, newToken, oldToken, dispatch]);

  // Redirect to login if not authenticated
  useEffect(() => {
    // Use a flag to prevent state updates after unmounting
    let isMounted = true;

    const checkAuth = async () => {
      // Only redirect if still not authenticated after loading completes
      if (!loading && !isAuthenticated && isMounted) {
        console.log('Layout: Not authenticated, redirecting to login');
        navigate('/login');
      } else if (isAuthenticated && isMounted) {
        // Log the user role for debugging
        console.log('Layout: User authenticated with role:', user?.role);
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, loading, navigate, user]);

  // Show loading state while checking authentication, but only on initial load
  if (loading && !user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: theme.palette.background.default
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Log that we're rendering the layout
  console.log('Layout: Rendering with user role:', user?.role);
  console.log('Layout: User data:', {
    name: user?.name,
    email: user?.email,
    role: user?.role,
    id: user?.id,
    fromNewAuth: !!newUser,
    fromOldAuth: !!oldUser
  });

  // If not authenticated after loading, don't render the layout
  if (!isAuthenticated) {
    return <Box>{children}</Box>;
  }

  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar onDrawerToggle={handleDrawerToggle} />
      {user?.role === 'patient' && !patientHasHospital ? (
        <PatientSidebar
          user={user}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />
      ) : user?.role === 'super_admin' ? (
        <Sidebar
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
        />
      ) : user?.role === 'hospital_admin' ? (
        <HospitalAdminSidebar
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
        />
      ) : user?.role === 'doctor' ? (
        <Sidebar
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
        />
      ) : (
        <Sidebar
          mobileOpen={mobileOpen}
          onDrawerToggle={handleDrawerToggle}
        />
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { xs: '100%', sm: `calc(100% - ${280}px)` },
          ml: { xs: 0, sm: `${280}px` },
          mt: '64px', // Match the header height
          minHeight: 'calc(100vh - 64px)',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.default, 0.98)
            : alpha(theme.palette.background.default, 0.98),
          backgroundImage: theme.palette.mode === 'dark'
            ? 'radial-gradient(at 100% 0%, rgba(30, 41, 59, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(15, 23, 42, 0.3) 0px, transparent 50%)'
            : 'radial-gradient(at 100% 0%, rgba(224, 242, 254, 0.3) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(224, 231, 255, 0.3) 0px, transparent 50%)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
