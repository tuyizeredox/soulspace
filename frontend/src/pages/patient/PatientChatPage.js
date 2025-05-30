import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  useTheme,
  alpha,
  Button,
  Paper
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

import axios from '../../utils/axiosConfig';
import PatientChat from '../../components/patient/PatientChat';
import { motion } from 'framer-motion';

const PatientChatPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { doctorId } = useParams();

  // State variables
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Function to get the most recent token
  const getAuthToken = () => {
    return localStorage.getItem('token') ||
           localStorage.getItem('userToken') ||
           localStorage.getItem('patientToken') ||
           localStorage.getItem('persistentToken');
  };

  // Fetch doctor details with enhanced name handling and better error handling
  const fetchDoctorDetails = useCallback(async (id) => {
    try {
      setLoading(true);
      setError('');

      // Get token
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Try to load cached doctor details first
      const cachedDoctorKey = `doctor_${id}`;
      const cachedDoctor = localStorage.getItem(cachedDoctorKey);
      let usedCachedData = false;

      if (cachedDoctor) {
        try {
          const parsedDoctor = JSON.parse(cachedDoctor);
          setSelectedDoctor(parsedDoctor);
          usedCachedData = true;
          console.log('Using cached doctor data:', parsedDoctor.name);
        } catch (e) {
          console.error('Error parsing cached doctor:', e);
        }
      }

      // Create a controller to abort the request if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      try {
        // Fetch doctor details from API with timeout
        const response = await axios.get(`/api/doctors/${id}`, {
          signal: controller.signal,
          timeout: 8000 // 8 second timeout
        });

        // Clear the timeout since the request completed
        clearTimeout(timeoutId);

        if (response.data) {
          // Process the doctor data
          const doctorData = response.data;

          // Process doctor name to handle different formats
          let doctorName = doctorData.name || 'Doctor';

          // If name already has "Dr." prefix, keep it as is
          if (!doctorName.toLowerCase().startsWith('dr.') &&
              !doctorName.toLowerCase().startsWith('doctor ')) {
            // Check if name has a title like "Dr" without the period
            if (doctorName.startsWith('Dr ')) {
              doctorName = doctorName.replace('Dr ', 'Dr. ');
            } else {
              // Add "Dr." prefix if not present
              doctorName = `Dr. ${doctorName}`;
            }
          }

          // Process specialization
          let specialization = doctorData.specialization ||
                              (doctorData.profile && doctorData.profile.specialization);

          // If specialization is missing, try to extract from other fields
          if (!specialization) {
            if (doctorData.department) {
              specialization = doctorData.department;
            } else if (doctorData.title) {
              specialization = doctorData.title;
            } else {
              specialization = 'Specialist';
            }
          }

          // Create processed doctor object with enhanced data
          const processedDoctor = {
            ...doctorData,
            _id: doctorData._id || doctorData.id || id,
            id: doctorData._id || doctorData.id || id, // Ensure both _id and id are set
            name: doctorName,
            role: doctorData.role || 'doctor',
            profile: doctorData.profile || {},
            specialization: specialization,
            // Add additional fields that might be useful
            hospital: doctorData.hospital || doctorData.hospitalName || null,
            hospitalId: doctorData.hospitalId || null,
            email: doctorData.email || null,
            phone: doctorData.phone || (doctorData.profile && doctorData.profile.phone) || null,
            avatar: doctorData.avatar || doctorData.profileImage || null
          };

          setSelectedDoctor(processedDoctor);

          // Cache the doctor details
          localStorage.setItem(cachedDoctorKey, JSON.stringify(processedDoctor));
        }
      } catch (error) {
        // Clear the timeout if there was an error
        clearTimeout(timeoutId);
        
        console.error('Error fetching doctor details:', error);

        // If we already used cached data, don't show an error
        if (usedCachedData) {
          console.log('Using cached doctor data due to API error');
          return;
        }

        // If we don't have cached data, create a minimal doctor object
        if (!selectedDoctor) {
          console.log('Creating minimal doctor object due to API error');
          const minimalDoctor = {
            _id: id,
            id: id,
            name: 'Dr. Specialist',
            role: 'doctor',
            profile: {
              specialization: 'General Medicine'
            },
            specialization: 'General Medicine',
            avatar: null
          };

          setSelectedDoctor(minimalDoctor);
          localStorage.setItem(cachedDoctorKey, JSON.stringify(minimalDoctor));
        }
      }
    } catch (error) {
      console.error('Error in fetchDoctorDetails:', error);
      // Only set error if we don't have a doctor object yet
      if (!selectedDoctor) {
        setError('Error loading doctor information. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor]);

  // Fetch doctor details when doctorId changes
  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails(doctorId);
    } else {
      setSelectedDoctor(null);
      setLoading(false);
    }
  }, [doctorId, fetchDoctorDetails]);

  // Handle video call with doctor
  const handleVideoCall = () => {
    if (selectedDoctor) {
      navigate(`/patient/call/${selectedDoctor._id}`);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    if (doctorId) {
      setRefreshing(true);
      fetchDoctorDetails(doctorId);

      // Set a timeout to reset the refreshing state
      setTimeout(() => {
        setRefreshing(false);
      }, 1000); // Add a delay to show the refreshing state
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate('/patient/dashboard');
  };

  // Animation variants
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
      bgcolor: alpha(theme.palette.background.default, 0.8)
    }}>
      {/* Header */}
      {selectedDoctor && (
        <Box
          component={motion.div}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: { xs: 1.5, sm: 2 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: theme.palette.background.paper,
            zIndex: 10,
            flexShrink: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleBack}
              sx={{ color: theme.palette.text.primary }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight="medium"
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: { xs: '180px', sm: '300px', md: 'none' }
              }}
            >
              Chat with Dr. {selectedDoctor?.name || 'Doctor'}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
            size="small"
            sx={{
              whiteSpace: 'nowrap',
              minWidth: { xs: 'auto', sm: '100px' },
              px: { xs: 1, sm: 2 }
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Paper
          elevation={0}
          sx={{
            p: 1,
            borderRadius: 0,
            bgcolor: alpha(theme.palette.error.light, 0.2),
            color: theme.palette.error.dark,
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            flexShrink: 0,
            zIndex: 5
          }}
        >
          <Typography variant="body2">
            {error}
          </Typography>
        </Paper>
      )}

      {/* Main Content Area */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: 0,
        overflow: 'hidden'
      }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              p: 4
            }}
          >
            <CircularProgress />
          </Box>
        ) : !selectedDoctor ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              p: 3,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" color="text.primary" gutterBottom>
              No Doctor Selected
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Please select a doctor to start a chat.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBack}
            >
              Return to Dashboard
            </Button>
          </Box>
        ) : (
          <PatientChat
            doctor={selectedDoctor}
            onVideoCall={handleVideoCall}
          />
        )}
      </Box>
    </Box>
  );
};

export default PatientChatPage;
