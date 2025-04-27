import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Grid,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Chip,
  Avatar,
  useTheme,
  alpha,
  MobileStepper,
  useMediaQuery,
  Hidden,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Badge,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  CalendarMonth,
  LocalHospital,
  VideoCall,
  MeetingRoom,
  Search,
  LocationOn,
  Star,
  StarBorder,
  ArrowForward,
  HealthAndSafety,
  Favorite,
  TipsAndUpdates,
  SmartToy,
  CheckCircleOutline,
  LocalPharmacy,
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Circle as CircleIcon,
  Message as MessageIcon,
  Medication as MedicationIcon,
  Science as ScienceIcon,
  Info as InfoIcon,
  Alarm as AlarmIcon,
  VolumeUp,
  VolumeOff
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from '../../utils/axiosConfig';
import AiHealthAssistant from './AiHealthAssistant';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchUserNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification
} from '../../store/slices/notificationSlice';
import {
  WaterDrop,
  FitnessCenter,
  Restaurant,
  Bedtime,
  SelfImprovement,
  Psychology,
  Air,
  Bloodtype,
  MonitorHeart,
  LocalBar,
  SmokeFree,
  WbSunny,
  People,
  CleanHands,
  SetMeal,
  FactCheck,
  AccessibleForward
} from '@mui/icons-material';

// Default health tips in case API fails
const defaultHealthTips = [
  {
    title: 'Stay Hydrated',
    content: 'Drink at least 8 glasses of water daily to maintain optimal health.',
    iconName: 'WaterDrop',
    color: '#2196f3',
  },
  {
    title: 'Regular Exercise',
    content: 'Aim for at least 30 minutes of moderate exercise 5 days a week.',
    iconName: 'FitnessCenter',
    color: '#f44336',
  },
  {
    title: 'Balanced Diet',
    content: 'Include fruits, vegetables, whole grains, and lean proteins in your meals.',
    iconName: 'Restaurant',
    color: '#4caf50',
  },
  {
    title: 'Adequate Sleep',
    content: 'Get 7-9 hours of quality sleep each night for better health.',
    iconName: 'Bedtime',
    color: '#9c27b0',
  },
];

const NoHospitalDashboard = ({ user }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [reason, setReason] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [healthTips, setHealthTips] = useState(defaultHealthTips);
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(true);
  const [voiceNotificationEnabled, setVoiceNotificationEnabled] = useState(true);

  // Get notifications from Redux store
  const { notifications, unreadCount, loading: notificationsLoading } = useSelector((state) => state.notifications);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  // Get token from Redux store
  const { token: oldToken } = useSelector((state) => state.auth);
  const { token: newToken } = useSelector((state) => state.userAuth);
  const token = newToken || oldToken;

  // Fetch hospitals, health tips, and notifications
  useEffect(() => {
    // Skip fetching if token is not available
    if (!token) {
      console.log('NoHospitalDashboard: No token available, skipping data fetch');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('NoHospitalDashboard: Fetching data with token:', !!token);

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        // Fetch hospitals
        const hospitalsResponse = await axios.get('/api/hospitals', config);
        setHospitals(hospitalsResponse.data);

        // Fetch personalized health tips
        const tipsResponse = await axios.get('/api/ai-assistant/health-tips', config);
        if (tipsResponse.data && tipsResponse.data.length > 0) {
          setHealthTips(tipsResponse.data);
        }

        // Fetch notifications
        dispatch(fetchUserNotifications({ limit: 5 }));
        dispatch(fetchUnreadCount());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Set up notification refresh interval
    const notificationInterval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000); // Check for new notifications every 30 seconds

    return () => {
      clearInterval(notificationInterval);
    };
  }, [dispatch, token]); // Add token to dependency array

  // Fetch doctors when hospital is selected
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedHospital) return;

      try {
        console.log('NoHospitalDashboard: Fetching doctors with token:', !!token);

        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };

        const response = await axios.get(`/api/hospitals/${selectedHospital}/doctors`, config);
        setDoctors(response.data);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
  }, [selectedHospital, token]);

  // Handle new notifications and play voice notifications
  useEffect(() => {
    // Skip if token is not available
    if (!token) {
      console.log('NoHospitalDashboard: No token available, skipping WebSocket setup');
      return;
    }

    // Set up socket connection for real-time notifications
    const setupNotificationSocket = () => {
      // Check if WebSocket is supported
      if ('WebSocket' in window) {
        try {
          // Create WebSocket connection with token
          const socket = new WebSocket(
            `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api/notifications/ws?token=${token}`
          );

          // Connection opened
          socket.addEventListener('open', () => {
            console.log('NoHospitalDashboard: Connected to notification server with token');
          });

          // Listen for messages
          socket.addEventListener('message', (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'notification') {
                // Play voice notification
                playVoiceNotification(data.notification);
              }
            } catch (error) {
              console.error('Error processing notification:', error);
            }
          });

          // Connection closed
          socket.addEventListener('close', () => {
            console.log('NoHospitalDashboard: Disconnected from notification server');
            // Try to reconnect after 5 seconds
            setTimeout(setupNotificationSocket, 5000);
          });

          // Connection error
          socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
          });

          return socket;
        } catch (error) {
          console.error('Error setting up WebSocket:', error);
          return null;
        }
      } else {
        console.log('WebSocket is not supported by this browser');
        return null;
      }
    };

    // Initialize socket connection
    const socket = setupNotificationSocket();

    // Cleanup function
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [notificationSoundEnabled, voiceNotificationEnabled, token]); // Add token to dependency array

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAppointmentTypeChange = (event) => {
    setAppointmentType(event.target.value);
  };

  const handleHospitalChange = (event) => {
    setSelectedHospital(event.target.value);
    setSelectedDoctor(''); // Reset doctor when hospital changes
  };

  const handleDoctorChange = (event) => {
    setSelectedDoctor(event.target.value);
  };

  const handleSubmitAppointment = async () => {
    setLoading(true);
    try {
      console.log('NoHospitalDashboard: Submitting appointment with token:', !!token);

      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const appointmentData = {
        patient: user.id,
        doctor: selectedDoctor,
        hospital: selectedHospital,
        date: selectedDate,
        type: appointmentType === 'in-person' ? 'General Checkup' : 'Online Consultation',
        reason: reason,
        isOnline: appointmentType === 'online',
      };

      await axios.post('/api/appointments', appointmentData, config);
      // Show success message or redirect
      setActiveStep(3); // Move to confirmation step
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Notification handling functions
  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleDeleteNotification = (id) => {
    dispatch(removeNotification(id));
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }

    // Navigate to the appropriate page based on notification type and actionLink
    if (notification.actionLink) {
      navigate(notification.actionLink);
    } else {
      switch (notification.type) {
        case 'appointment':
          navigate('/appointments');
          break;
        case 'message':
          navigate('/messages');
          break;
        case 'prescription':
          navigate('/prescriptions');
          break;
        case 'lab_result':
          navigate('/records/lab-results');
          break;
        default:
          // For other types, just close the menu
          break;
      }
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return <CalendarMonth color="primary" />;
      case 'message':
        return <MessageIcon color="info" />;
      case 'prescription':
        return <MedicationIcon color="secondary" />;
      case 'lab_result':
        return <ScienceIcon color="success" />;
      case 'reminder':
        return <AlarmIcon color="warning" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  // Format date
  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Play notification sound with voice
  const playVoiceNotification = (notification) => {
    if (!notificationSoundEnabled) return;

    // Play notification sound
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });

    // Use speech synthesis for voice notification if enabled
    if (voiceNotificationEnabled && 'speechSynthesis' in window) {
      const message = `New notification: ${notification.title}`;
      const speech = new SpeechSynthesisUtterance(message);
      speech.volume = 0.8;
      speech.rate = 1;
      speech.pitch = 1;
      window.speechSynthesis.speak(speech);
    }
  };



  const renderAppointmentSteps = () => {
    const steps = [
      'Select Appointment Type',
      'Choose Hospital & Doctor',
      'Schedule Appointment',
      'Confirmation'
    ];

    return (
      <Box sx={{ width: '100%', mb: 3 }}>
        {/* Desktop Stepper */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3
            }}
          >
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Box>

        {/* Mobile Stepper */}
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              mb: 3,
              textAlign: 'center'
            }}
          >
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                fontWeight: 700,
                color: theme.palette.primary.main
              }}
            >
              {steps[activeStep]}
            </Typography>
            <MobileStepper
              variant="dots"
              steps={steps.length}
              position="static"
              activeStep={activeStep}
              sx={{
                background: 'transparent',
                justifyContent: 'center',
                '& .MuiMobileStepper-dot': {
                  width: 12,
                  height: 12,
                  mx: 0.8,
                  my: 2
                },
                '& .MuiMobileStepper-dotActive': {
                  backgroundColor: theme.palette.primary.main
                }
              }}
              nextButton={null}
              backButton={null}
            />
            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Paper>
        </Box>

        <Box sx={{ mt: 2 }}>
          {activeStep === 0 && (
            <Card component={motion.div} variants={itemVariants}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Select Appointment Type
                </Typography>
                <RadioGroup
                  value={appointmentType}
                  onChange={handleAppointmentTypeChange}
                >
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={appointmentType === 'in-person' ? 8 : 1}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: appointmentType === 'in-person'
                            ? `2px solid ${theme.palette.primary.main}`
                            : '2px solid transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          }
                        }}
                        onClick={() => setAppointmentType('in-person')}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            mb: 2
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              width: { xs: 40, sm: 48 },
                              height: { xs: 40, sm: 48 },
                              mr: 2,
                              mb: { xs: 1, sm: 0 }
                            }}
                          >
                            <MeetingRoom />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                            >
                              In-Person Visit
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Visit the hospital for a face-to-face consultation
                            </Typography>
                          </Box>
                          <FormControlLabel
                            value="in-person"
                            control={<Radio />}
                            label=""
                            sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 1, sm: 0 } }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Choose this option if you prefer a traditional in-person appointment at the hospital or clinic.
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500, mt: 1 }}>
                          In-person visits can be converted to online if needed for continuous monitoring.
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={appointmentType === 'online' ? 8 : 1}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: appointmentType === 'online'
                            ? `2px solid ${theme.palette.secondary.main}`
                            : '2px solid transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                          }
                        }}
                        onClick={() => setAppointmentType('online')}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            mb: 2
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.secondary.main, 0.1),
                              color: theme.palette.secondary.main,
                              width: { xs: 40, sm: 48 },
                              height: { xs: 40, sm: 48 },
                              mr: 2,
                              mb: { xs: 1, sm: 0 }
                            }}
                          >
                            <VideoCall />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                            >
                              Online Consultation
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Video call with a doctor from your home
                            </Typography>
                          </Box>
                          <FormControlLabel
                            value="online"
                            control={<Radio />}
                            label=""
                            sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 1, sm: 0 } }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Choose this option for a convenient video consultation with a doctor without leaving your home.
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500, mt: 1 }}>
                          Online consultations include options for wearable device integration and medication delivery!
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </RadioGroup>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    mt: 3
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={() => navigate('/appointments/book', { state: { appointmentType } })}
                    endIcon={<ArrowForward />}
                    fullWidth={isMobile}
                    sx={{
                      py: { xs: 1.5, sm: 1 },
                      fontSize: { xs: '0.9rem', sm: '0.875rem' }
                    }}
                  >
                    Continue to Full Booking
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeStep === 1 && (
            <Card component={motion.div} variants={itemVariants}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Choose Hospital & Doctor
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Select Hospital</InputLabel>
                      <Select
                        value={selectedHospital}
                        onChange={handleHospitalChange}
                        label="Select Hospital"
                      >
                        {hospitals.map((hospital) => (
                          <MenuItem key={hospital.id} value={hospital.id}>
                            {hospital.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth disabled={!selectedHospital}>
                      <InputLabel>Select Doctor</InputLabel>
                      <Select
                        value={selectedDoctor}
                        onChange={handleDoctorChange}
                        label="Select Doctor"
                      >
                        {doctors.map((doctor) => (
                          <MenuItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  {selectedHospital && (
                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Hospital Information
                        </Typography>
                        {hospitals.filter(h => h.id === selectedHospital).map((hospital) => (
                          <Paper
                            key={hospital.id}
                            sx={{
                              p: { xs: 2, sm: 3 },
                              borderRadius: 2,
                              display: 'flex',
                              flexDirection: { xs: 'column', sm: 'row' },
                              alignItems: { xs: 'flex-start', sm: 'center' },
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                width: { xs: 48, sm: 56 },
                                height: { xs: 48, sm: 56 },
                                mr: { xs: 0, sm: 2 },
                                mb: { xs: 2, sm: 0 },
                                alignSelf: { xs: 'center', sm: 'flex-start' }
                              }}
                            >
                              <LocalHospital />
                            </Avatar>
                            <Box sx={{ width: '100%' }}>
                              <Typography
                                variant="h6"
                                sx={{
                                  textAlign: { xs: 'center', sm: 'left' },
                                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                                }}
                              >
                                {hospital.name}
                              </Typography>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mt: 0.5,
                                  justifyContent: { xs: 'center', sm: 'flex-start' }
                                }}
                              >
                                <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {hospital.location}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mt: 0.5,
                                  justifyContent: { xs: 'center', sm: 'flex-start' }
                                }}
                              >
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Box key={star} component="span" sx={{ color: '#FFB400' }}>
                                    {star <= 4 ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                                  </Box>
                                ))}
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                  (120 reviews)
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: { xs: 2, sm: 0 },
                    mt: 3
                  }}
                >
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    fullWidth={isMobile}
                    sx={{ order: { xs: 2, sm: 1 } }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!selectedHospital || !selectedDoctor}
                    endIcon={<ArrowForward />}
                    fullWidth={isMobile}
                    sx={{
                      order: { xs: 1, sm: 2 },
                      py: { xs: 1.5, sm: 1 }
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeStep === 2 && (
            <Card component={motion.div} variants={itemVariants}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Schedule Appointment
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DateTimePicker
                        label="Appointment Date & Time"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            variant: 'outlined',
                          },
                        }}
                        minDate={new Date()}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Reason for Visit"
                      multiline
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please describe your symptoms or reason for the appointment"
                    />
                  </Grid>
                </Grid>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: { xs: 2, sm: 0 },
                    mt: 3
                  }}
                >
                  <Button
                    onClick={handleBack}
                    variant="outlined"
                    fullWidth={isMobile}
                    sx={{ order: { xs: 2, sm: 1 } }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmitAppointment}
                    disabled={!selectedDate || !reason}
                    endIcon={<ArrowForward />}
                    fullWidth={isMobile}
                    sx={{
                      order: { xs: 1, sm: 2 },
                      py: { xs: 1.5, sm: 1 }
                    }}
                  >
                    Book Appointment
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {activeStep === 3 && (
            <Card component={motion.div} variants={itemVariants}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  component={motion.div}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  sx={{ mb: 3 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.success.main,
                      width: 80,
                      height: 80,
                      mx: 'auto',
                    }}
                  >
                    <CheckCircleOutline sx={{ fontSize: 48 }} />
                  </Avatar>
                </Box>
                <Typography variant="h5" gutterBottom>
                  Appointment Booked Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Your appointment has been scheduled. You will receive a confirmation email shortly.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{
                    minWidth: { xs: '100%', sm: 200 },
                    py: { xs: 1.5, sm: 1 }
                  }}
                >
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    );
  };

  const renderAiAssistant = () => {
    return (
      <AiHealthAssistant onBookAppointment={() => setShowAiAssistant(false)} />
    );
  };

  // Render notifications component
  const renderNotifications = () => {
    return (
      <Card
        component={motion.div}
        variants={itemVariants}
        sx={{
          height: '100%',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NotificationsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6" fontWeight={600}>
                Notifications
                {unreadCount > 0 && (
                  <Chip
                    label={unreadCount}
                    color="error"
                    size="small"
                    sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Toggle sound notifications">
                <IconButton
                  size="small"
                  onClick={() => setNotificationSoundEnabled(!notificationSoundEnabled)}
                  color={notificationSoundEnabled ? "primary" : "default"}
                >
                  {notificationSoundEnabled ? <VolumeUp fontSize="small" /> : <VolumeOff fontSize="small" />}
                </IconButton>
              </Tooltip>
              {unreadCount > 0 && (
                <Tooltip title="Mark all as read">
                  <IconButton size="small" onClick={handleMarkAllAsRead} sx={{ ml: 1 }}>
                    <MarkReadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {notificationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : notifications && notifications.length > 0 ? (
              <List sx={{ p: 0 }}>
                {notifications.slice(0, 5).map((notification) => (
                  <ListItem
                    key={notification._id}
                    component="div"
                    sx={{
                      borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                      bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                      cursor: 'pointer',
                    }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>

                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={notification.read ? 400 : 600}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              fontSize: '0.75rem',
                            }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', fontSize: '0.7rem' }}
                          >
                            {formatDate(notification.createdAt)}
                          </Typography>
                        </>
                      }
                    />

                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {!notification.read && (
                          <Tooltip title="Mark as read">
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification._id);
                              }}
                              sx={{ mb: 1 }}
                            >
                              <CircleIcon sx={{ fontSize: 12, color: theme.palette.primary.main }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification._id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderTop: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            }}
          >
            <Button
              size="small"
              onClick={() => navigate('/notifications')}
              endIcon={<ArrowForward fontSize="small" />}
            >
              View All Notifications
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card
            component={motion.div}
            variants={itemVariants}
            sx={{
              borderRadius: { xs: '1.5rem', md: '2rem' },
              overflow: 'hidden',
              position: 'relative',
              mb: { xs: 4, sm: 5, md: 6 },
              boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
              transform: 'translateZ(0)',// For better performance on animations
              height: { xs: '450px', sm: '500px', md: '550px' },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: `linear-gradient(135deg,
                  ${alpha(theme.palette.primary.main, 0.95)} 0%,
                  ${alpha(theme.palette.secondary.main, 0.9)} 50%,
                  ${alpha(theme.palette.primary.dark, 0.85)} 100%)`,
                zIndex: 1,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)',
                  zIndex: 1
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '90%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
                  zIndex: 1
                }
              }}
            />
            <CardMedia
              component="img"
              height="100%"
              image="/images/health-banner.jpg"
              alt="Health Banner"
              sx={{
                opacity: 0.3,
                objectFit: 'cover',
                objectPosition: 'center 30%'
              }}
            />
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                p: { xs: 2, sm: 2, md: 3 },
              }}
            >
              <Box
                sx={{
                  maxWidth: 1000,
                  width: '100%',
                  height: { xs: '400px', sm: '450px', md: '500px' },
                  textAlign: 'center',
                  background: { xs: 'rgba(0,0,0,0.25)', md: 'rgba(0,0,0,0.15)' },
                  backdropFilter: 'blur(8px)',
                  borderRadius: '2rem',
                  p: { xs: 2, sm: 3, md: 4 },
                  py: { xs: 3, sm: 4, md: 5 },
                  boxShadow: '0 15px 50px rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: { xs: 1, md: 2 }
                    }}
                  >
                    <HealthAndSafety
                      sx={{
                        color: 'white',
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                        mr: 2,
                        filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))'
                      }}
                    />
                    <Typography
                      variant="h3"
                      component="h1"
                      color="white"
                      gutterBottom
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        letterSpacing: { xs: '0.5px', md: '1px' },
                        lineHeight: 1.2,
                        mb: 0,
                        textTransform: 'uppercase'
                      }}
                    >
                      Welcome to SoulSpace Health
                    </Typography>
                  </Box>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <Typography
                    variant="h6"
                    color="white"
                    sx={{
                      mb: { xs: 2, md: 3 },
                      opacity: 0.95,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                      px: { xs: 1, sm: 2, md: 3 },
                      fontWeight: 500,
                      textShadow: '0 1px 5px rgba(0,0,0,0.3)',
                      maxWidth: '90%',
                      mx: 'auto',
                      lineHeight: 1.4
                    }}
                  >
                    Book an appointment or chat with our AI assistant for personalized care.
                  </Typography>

                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: { xs: 1, md: 1.5 },
                      mb: { xs: 2, md: 3 }
                    }}
                  >
                    <Chip
                      icon={<MonitorHeart sx={{ color: 'white !important', fontSize: '1rem' }} />}
                      label="Health Monitoring"
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.4),
                        color: 'white',
                        backdropFilter: 'blur(5px)',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', md: '0.8rem' },
                        py: 1,
                        px: 0.5,
                        '& .MuiChip-icon': { color: 'white' },
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Chip
                      icon={<LocalPharmacy sx={{ color: 'white !important', fontSize: '1rem' }} />}
                      label="Medication"
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.4),
                        color: 'white',
                        backdropFilter: 'blur(5px)',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', md: '0.8rem' },
                        py: 1,
                        px: 0.5,
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Chip
                      icon={<VideoCall sx={{ color: 'white !important', fontSize: '1rem' }} />}
                      label="Online Consults"
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.4),
                        color: 'white',
                        backdropFilter: 'blur(5px)',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', md: '0.8rem' },
                        py: 1,
                        px: 0.5,
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: 1,
                      mb: { xs: 2, md: 3 }
                    }}
                  >
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<HealthAndSafety sx={{ fontSize: '0.9rem' }} />}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(5px)',
                        px: 1,
                        py: 0.5,
                        borderRadius: '0.8rem',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        minWidth: 'auto',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                        }
                      }}
                      onClick={() => navigate('/health-tips')}
                    >
                      Tips
                    </Button>

                    <Button
                      variant="text"
                      size="small"
                      startIcon={<Favorite sx={{ fontSize: '0.9rem' }} />}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(5px)',
                        px: 1,
                        py: 0.5,
                        borderRadius: '0.8rem',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        minWidth: 'auto',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                        }
                      }}
                      onClick={() => navigate('/wearable-devices')}
                    >
                      Devices
                    </Button>

                    <Button
                      variant="text"
                      size="small"
                      startIcon={<LocalPharmacy sx={{ fontSize: '0.9rem' }} />}
                      sx={{
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(5px)',
                        px: 1,
                        py: 0.5,
                        borderRadius: '0.8rem',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        minWidth: 'auto',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.2)',
                        }
                      }}
                      onClick={() => navigate('/medication')}
                    >
                      Meds
                    </Button>
                  </Box>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'row', sm: 'row' },
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: { xs: 2, md: 3 }
                    }}
                  >
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<CalendarMonth />}
                      onClick={() => setShowAiAssistant(false)}
                      sx={{
                        bgcolor: 'white',
                        color: theme.palette.primary.main,
                        py: { xs: 1, sm: 1, md: 1.5 },
                        px: { xs: 2, md: 3 },
                        borderRadius: '1.5rem',
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        fontWeight: 600,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.common.white, 0.9),
                          boxShadow: '0 6px 15px rgba(0,0,0,0.25)',
                        }
                      }}
                    >
                      Book Appointment
                    </Button>
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<SmartToy />}
                      onClick={() => setShowAiAssistant(true)}
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        py: { xs: 1, sm: 1, md: 1.5 },
                        px: { xs: 2, md: 3 },
                        borderRadius: '1.5rem',
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: alpha(theme.palette.common.white, 0.15),
                        }
                      }}
                    >
                      AI Assistant
                    </Button>
                  </Box>
                </motion.div>
              </Box>
            </Box>

            {/* Animated elements for visual interest */}
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 0.6, x: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              sx={{
                position: 'absolute',
                top: '15%',
                left: '5%',
                zIndex: 2,
                display: { xs: 'none', md: 'block' }
              }}
            >
              <Favorite sx={{ fontSize: '3rem', color: 'white', opacity: 0.7 }} />
            </Box>

            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 0.6, x: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              sx={{
                position: 'absolute',
                bottom: '15%',
                right: '5%',
                zIndex: 2,
                display: { xs: 'none', md: 'block' }
              }}
            >
              <LocalHospital sx={{ fontSize: '3rem', color: 'white', opacity: 0.7 }} />
            </Box>
          </Card>
        </Grid>

        {showAiAssistant ? (
          <>
            <Grid item xs={12} md={8}>
              {renderAiAssistant()}
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                component={motion.div}
                variants={itemVariants}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    How AI Can Help You
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Get quick answers to common health questions
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Receive guidance on whether you should see a doctor
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Learn about preventive health measures
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Get help with booking appointments
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setShowAiAssistant(false)}
                    >
                      Switch to Appointment Booking
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </>
        ) : (
          <>
            <Grid item xs={12} md={8}>
              {renderAppointmentSteps()}
            </Grid>
            <Grid item xs={12} md={4}>
              {renderNotifications()}
            </Grid>
          </>
        )}

        <Grid item xs={12} sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
            Health Tips & Resources
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {healthTips.map((tip, index) => {
              // Dynamically select the icon based on iconName
              let IconComponent;
              switch(tip.iconName) {
                case 'WaterDrop': IconComponent = WaterDrop; break;
                case 'FitnessCenter': IconComponent = FitnessCenter; break;
                case 'Restaurant': IconComponent = Restaurant; break;
                case 'Bedtime': IconComponent = Bedtime; break;
                case 'SelfImprovement': IconComponent = SelfImprovement; break;
                case 'Psychology': IconComponent = Psychology; break;
                case 'Air': IconComponent = Air; break;
                case 'Bloodtype': IconComponent = Bloodtype; break;
                case 'MonitorHeart': IconComponent = MonitorHeart; break;
                case 'NoAlcohol': IconComponent = LocalBar; break;
                case 'SmokeFree': IconComponent = SmokeFree; break;
                case 'WbSunny': IconComponent = WbSunny; break;
                case 'People': IconComponent = People; break;
                case 'CleanHands': IconComponent = CleanHands; break;
                case 'SetMeal': IconComponent = SetMeal; break;
                case 'FactCheck': IconComponent = FactCheck; break;
                case 'AccessibleForward': IconComponent = AccessibleForward; break;
                default: IconComponent = TipsAndUpdates;
              }

              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    component={motion.div}
                    variants={itemVariants}
                    sx={{
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: alpha(tip.color, 0.1),
                            color: tip.color,
                            mr: 1.5,
                            width: 32,
                            height: 32
                          }}
                        >
                          <IconComponent fontSize="small" />
                        </Avatar>
                        <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>{tip.title}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {tip.content}
                      </Typography>
                      {tip.source && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right', fontSize: '0.7rem' }}>
                          Source: {tip.source}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NoHospitalDashboard;
