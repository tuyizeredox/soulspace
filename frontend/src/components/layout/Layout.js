import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../../store/slices/authSlice';
import { getCurrentUser } from '../../store/slices/userAuthSlice';
import { Box, useMediaQuery, useTheme, CircularProgress, alpha } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import PatientSidebar from './PatientSidebar';
import PatientWithHospitalSidebar from './PatientWithHospitalSidebar';
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
  const [patientHasHospital, setPatientHasHospital] = useState(false);
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [hospital, setHospital] = useState(null);

  // Force flag for development/testing - set to true to always show hospital sidebar
  const forceHospitalSidebar = true;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Check if patient has a hospital assignment
  useEffect(() => {
    const fetchPatientAssignment = async () => {
      if (user?.role === 'patient' && token) {
        try {
          console.log('Layout: Fetching patient assignment data');

          // Set up axios with the token
          const axios = require('axios').default;
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Fetch patient assignment data
          const response = await axios.get('/api/patient-assignments/my-assignment');

          // Log the full response for debugging
          console.log('Layout: Raw patient assignment response:', JSON.stringify(response.data));

          // The API doesn't return an 'assigned' property, it returns the full assignment object
          // If we got a response with primaryDoctor and hospital, the patient has an assignment
          if (response.data && response.data.primaryDoctor && response.data.hospital) {
            console.log('Layout: Patient has hospital assignment', response.data);
            setPatientHasHospital(true);
            setAssignedDoctor(response.data.primaryDoctor);
            setHospital(response.data.hospital);

            // Log the hospital data for debugging
            console.log('Layout: Hospital data set:', response.data.hospital);
            console.log('Layout: Doctor data set:', response.data.primaryDoctor);
          } else {
            console.log('Layout: Patient has no hospital assignment or incomplete data');
            console.log('Layout: Has primaryDoctor?', !!response.data?.primaryDoctor);
            console.log('Layout: Has hospital?', !!response.data?.hospital);
            setPatientHasHospital(false);
            setAssignedDoctor(null);
            setHospital(null);
          }
        } catch (error) {
          console.error('Layout: Error fetching patient assignment:', error);

          // For development/testing, you can use mock data
          if (process.env.NODE_ENV === 'development') {
            // Uncomment to test with mock data
            // const useMockData = true;
            const useMockData = false;

            if (useMockData) {
              console.log('Layout: Using mock data for development');
              setPatientHasHospital(true);
              setAssignedDoctor({
                _id: 'mock-doctor-id',
                name: 'Dr. Jane Smith',
                profile: {
                  specialization: 'Cardiologist'
                },
                avatar: null
              });
              setHospital({
                _id: 'mock-hospital-id',
                name: 'City General Hospital',
                address: '123 Medical Center Blvd, City, State'
              });
              return;
            }
          }

          setPatientHasHospital(false);
          setAssignedDoctor(null);
          setHospital(null);
        }
      } else {
        console.log('Layout: Non-patient role detected:', user?.role);
      }
    };

    fetchPatientAssignment();
  }, [user, token]);

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
      {user?.role === 'patient' && (patientHasHospital || forceHospitalSidebar) ? (
        <PatientWithHospitalSidebar
          user={user}
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          assignedDoctor={assignedDoctor || (forceHospitalSidebar ? {
            _id: 'force-doctor-id',
            name: 'Dr. John Doe',
            profile: {
              specialization: 'General Practitioner'
            },
            avatar: null
          } : null)}
          hospital={hospital || (forceHospitalSidebar ? {
            _id: 'force-hospital-id',
            name: 'SoulSpace Medical Center',
            address: '456 Health Avenue, Medical District'
          } : null)}
        />
      ) : user?.role === 'patient' ? (
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
