import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  MedicalInformation as MedicalIcon,
  LocalHospital as HospitalIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
  Event as EventIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axiosConfig';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import WebRTCService from '../../services/WebRTCService';
import CallNotification from '../../components/common/CallNotification';

const PatientDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for appointments
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for patient assignment
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(true);

  // State for call notification
  const [callNotification, setCallNotification] = useState(false);
  const [callData, setCallData] = useState(null);
  const [socket, setSocket] = useState(null);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);

        // Don't fetch appointments if there's no assigned doctor
        if (!assignedDoctor) {
          setUpcomingAppointments([]);
          setRecentAppointments([]);
          setLoading(false);
          return;
        }

        // Get token for the request
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('patientToken');

        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Fetch appointments with timeout
        const { data } = await axios.get('/api/appointments/patient', {
          timeout: 8000
        });

        if (!data || !Array.isArray(data)) {
          throw new Error('Invalid appointment data format');
        }

        // Split appointments into upcoming and recent
        const now = new Date();
        const upcoming = data.filter(apt => new Date(apt.date) >= now);
        const recent = data.filter(apt => new Date(apt.date) < now);

        setUpcomingAppointments(upcoming);
        setRecentAppointments(recent);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        // Clear appointments on error
        setUpcomingAppointments([]);
        setRecentAppointments([]);
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [assignedDoctor]); // Add assignedDoctor as dependency

  // Fetch patient assignment
  useEffect(() => {
    const fetchPatientAssignment = async () => {
      try {
        setAssignmentLoading(true);

        // Check if user has a hospitalId
        if (!user?.hospitalId) {
          setHospital(null);
          setAssignedDoctor(null);
          setUpcomingAppointments([]);
          setRecentAppointments([]);
          setAssignmentLoading(false);
          return;
        }

        // Get token for the request
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('patientToken');

        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        // Fetch patient assignment
        const { data } = await axios.get('/api/patient-assignments/my-assignment', {
          timeout: 8000
        });

        if (data && data.assigned && data.primaryDoctor && data.hospital) {
          setHospital(data.hospital);
          setAssignedDoctor(data.primaryDoctor);

          // If we have an assigned doctor, automatically create a chat
          if (data.primaryDoctor._id) {
            try {
              // Create or access chat with the doctor
              await axios.post('/api/chats', {
                userId: data.primaryDoctor._id
              });
              console.log('Chat with assigned doctor created/accessed');
            } catch (chatError) {
              console.error('Error creating/accessing chat:', chatError);
            }
          }
        } else {
          // Clear all related data when there's no assignment
          setHospital(null);
          setAssignedDoctor(null);
          setUpcomingAppointments([]);
          setRecentAppointments([]);
        }
        setAssignmentLoading(false);
      } catch (err) {
        console.error('Error fetching patient assignment:', err);
        // Clear all data on error
        setAssignmentLoading(false);
        setHospital(null);
        setAssignedDoctor(null);
        setUpcomingAppointments([]);
        setRecentAppointments([]);
      }
    };

    fetchPatientAssignment();
  }, [user]); // Add user as dependency

  // Initialize socket connection
  useEffect(() => {
    // Connect to socket server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Setup event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
    });

    // Setup WebRTC service for call notifications
    WebRTCService.setCallbacks({
      onCallRequest: (data) => {
        console.log('Call request received:', data);
        setCallData(data);
        setCallNotification(true);
      }
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Setup user in socket when user is available
  useEffect(() => {
    if (socket && user) {
      // Send user data to socket server
      socket.emit('setup', user);
      console.log('User setup sent to socket:', user._id || user.id);
    }
  }, [socket, user]);

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get appointment status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return theme.palette.success.main;
      case 'pending':
        return theme.palette.warning.main;
      case 'cancelled':
        return theme.palette.error.main;
      case 'completed':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Container maxWidth="xl">
      {/* Call Notification */}
      <CallNotification
        open={callNotification}
        onClose={() => {
          setCallNotification(false);
          setCallData(null);
        }}
        callData={callData}
      />

      {/* Welcome Section */}
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name || 'Patient'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Here's your health dashboard
        </Typography>
      </Box>

      {/* No Hospital/Doctor Warning */}
      {!assignmentLoading && (!user?.hospitalId || !assignedDoctor) && (
        <Card 
          sx={{ 
            mb: 4, 
            backgroundColor: theme.palette.warning.light,
            color: theme.palette.warning.dark
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {!user?.hospitalId ? 'No Hospital Assignment' : 'No Doctor Assigned'}
            </Typography>
            <Typography variant="body1">
              {!user?.hospitalId 
                ? "You are not currently assigned to any hospital. Please contact support or your healthcare provider to get assigned to a hospital first."
                : "You currently don't have an assigned doctor. Please contact your hospital or healthcare provider to get assigned to a doctor. You won't be able to book appointments or access certain features until you're assigned to a doctor."}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Content */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      onClick={() => navigate('/patient/appointments')}
                      disabled={!user?.hospitalId || !assignedDoctor}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      Book Appointment
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<MessageIcon />}
                      onClick={() => navigate('/patient/chat')}
                      disabled={!user?.hospitalId || !assignedDoctor}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      Messages
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<MedicalIcon />}
                      onClick={() => navigate('/patient/records')}
                      disabled={!user?.hospitalId || !assignedDoctor}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      Medical Records
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HospitalIcon />}
                      onClick={() => navigate('/patient/hospitals')}
                      sx={{ borderRadius: 2, py: 1 }}
                    >
                      Find Hospitals
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={user?.avatar || user?.profileImage}
                    sx={{ width: 60, height: 60, mr: 2, bgcolor: theme.palette.primary.main }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{user?.name || 'Patient'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Patient ID: {user?._id || user?.id || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <List dense disablePadding>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PersonIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Age"
                      secondary={user?.age || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <MedicalIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Blood Type"
                      secondary={user?.bloodType || 'Not specified'}
                    />
                  </ListItem>
                  <ListItem disableGutters>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <EventIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Checkup"
                      secondary={recentAppointments.length > 0 ? formatDate(recentAppointments[0].date) : 'No recent checkups'}
                    />
                  </ListItem>
                </List>
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate('/patient/profile')}
                    sx={{ borderRadius: 2 }}
                  >
                    View Full Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Upcoming Appointments - Only show if assigned to doctor */}
        {(user?.hospitalId && assignedDoctor) && (
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Upcoming Appointments
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => navigate('/patient/appointments')}
                      disabled={!user?.hospitalId || !assignedDoctor}
                    >
                      View All
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {upcomingAppointments.length > 0 ? (
                    <List>
                      {upcomingAppointments.slice(0, 3).map((appointment) => (
                        <ListItem
                          key={appointment._id}
                          sx={{
                            mb: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                          }}
                          secondaryAction={
                            appointment.type === 'virtual' ? (
                              <Box>
                                <IconButton
                                  color="primary"
                                  onClick={() => navigate(`/patient/call/${appointment.doctor._id}`)}
                                  disabled={new Date(appointment.date).getTime() > Date.now() + 900000}
                                >
                                  <VideoCallIcon />
                                </IconButton>
                                <IconButton
                                  color="primary"
                                  onClick={() => navigate(`/patient/call/${appointment.doctor._id}?audioOnly=true`)}
                                  disabled={new Date(appointment.date).getTime() > Date.now() + 900000}
                                >
                                  <PhoneIcon />
                                </IconButton>
                              </Box>
                            ) : null
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                              {appointment.type === 'virtual' ? <VideoCallIcon /> : <MedicalIcon />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={500}>
                                {appointment.doctor.name} - {appointment.doctor.specialization}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography variant="body2" component="span" display="block">
                                  {formatDate(appointment.date)} at {appointment.time}
                                </Typography>
                                <Typography variant="body2" component="span" display="block">
                                  {appointment.hospital.name}
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  <Chip
                                    size="small"
                                    label={appointment.status}
                                    sx={{
                                      bgcolor: alpha(getStatusColor(appointment.status), 0.1),
                                      color: getStatusColor(appointment.status),
                                      mr: 1
                                    }}
                                  />
                                  <Chip
                                    size="small"
                                    label={appointment.type}
                                    sx={{
                                      bgcolor: alpha(
                                        appointment.type === 'virtual' ? theme.palette.info.main : theme.palette.success.main,
                                        0.1
                                      ),
                                      color: appointment.type === 'virtual' ? theme.palette.info.main : theme.palette.success.main
                                    }}
                                  />
                                </Box>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No upcoming appointments
                      </Typography>
                      <Button
                        variant="contained"
                        sx={{ mt: 2, borderRadius: 2 }}
                        onClick={() => navigate('/patient/appointments')}
                        disabled={!user?.hospitalId || !assignedDoctor}
                      >
                        Book an Appointment
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Assigned Doctor & Hospital Section - Only show if assigned */}
            {assignedDoctor && hospital && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Your Care Team
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Doctor Information */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          src={assignedDoctor?.avatar || assignedDoctor?.profileImage}
                          sx={{ width: 60, height: 60, mr: 2, bgcolor: theme.palette.secondary.main }}
                        >
                          {assignedDoctor?.name ? assignedDoctor.name.charAt(0).toUpperCase() : 'D'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{assignedDoctor?.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {assignedDoctor?.profile?.specialization}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<MessageIcon />}
                          onClick={() => navigate(`/patient/chat/${assignedDoctor._id}`)}
                          sx={{ borderRadius: 2, flexGrow: 1 }}
                        >
                          Chat with Doctor
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<VideoCallIcon />}
                          onClick={() => navigate(`/patient/call/${assignedDoctor._id}`)}
                          sx={{ borderRadius: 2, flexGrow: 1 }}
                        >
                          Video Call
                        </Button>
                      </Box>
                    </Box>

                    {/* Hospital Information */}
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{ width: 50, height: 50, mr: 2, bgcolor: theme.palette.primary.light }}
                        >
                          <HospitalIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>
                            {hospital?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {hospital?.address || hospital?.location}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body2" paragraph>
                        You are currently assigned to this hospital. For any inquiries, please contact your doctor or the hospital directly.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Recent Activity - Only show if assigned */}
            {(user?.hospitalId && assignedDoctor) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Activity
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <List>
                      {recentAppointments.length > 0 ? (
                        recentAppointments.slice(0, 3).map((appointment) => (
                          <ListItem
                            key={appointment._id}
                            sx={{
                              mb: 1,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.grey[500], 0.05)
                            }}
                          >
                            <ListItemIcon>
                              <TimeIcon color="action" />
                            </ListItemIcon>
                            <ListItemText
                              primary={`Appointment with ${appointment.doctor.name}`}
                              secondary={formatDate(appointment.date)}
                            />
                            <Chip
                              size="small"
                              label={appointment.status}
                              sx={{
                                bgcolor: alpha(getStatusColor(appointment.status), 0.1),
                                color: getStatusColor(appointment.status)
                              }}
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText
                            primary="No recent activity"
                            secondary="Your recent activities will appear here"
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default PatientDashboard;
