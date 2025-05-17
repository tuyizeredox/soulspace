import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  TextField
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  ScreenShare,
  StopScreenShare,
  Assignment,
  MedicalServices
} from '@mui/icons-material';
import axios from '../../utils/axios';

const OnlineAppointment = ({ userRole = 'patient' }) => {
  const { appointmentId } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Get user data from Redux store
  const { user: oldAuthUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: userAuthUser, token: newToken } = useSelector((state) => state.userAuth);
  
  // Use either auth system, preferring the new one
  const user = userAuthUser || oldAuthUser;
  const token = newToken || oldToken;
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [otherParticipant, setOtherParticipant] = useState(null);
  
  // Video call controls
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Fetch appointment data
  useEffect(() => {
    const fetchAppointmentData = async () => {
      if (!appointmentId || !user || !token) {
        setError('Invalid appointment or authentication required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        
        // Fetch appointment details
        const appointmentResponse = await axios.get(`/api/appointments/${appointmentId}`, config);
        if (appointmentResponse.data) {
          setAppointment(appointmentResponse.data);
          
          // Determine the other participant (doctor or patient)
          if (userRole === 'doctor') {
            // Fetch patient details
            const patientResponse = await axios.get(`/api/patients/${appointmentResponse.data.patientId}`, config);
            setOtherParticipant(patientResponse.data);
          } else {
            // Fetch doctor details
            const doctorResponse = await axios.get(`/api/doctors/${appointmentResponse.data.doctorId}`, config);
            setOtherParticipant(doctorResponse.data);
          }
        }
        
        // Fetch chat messages
        const chatResponse = await axios.get(`/api/appointments/${appointmentId}/messages`, config);
        if (chatResponse.data) {
          setChatMessages(chatResponse.data);
        }
        
      } catch (error) {
        console.error('Error fetching appointment data:', error);
        setError('Failed to load appointment data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointmentData();
  }, [appointmentId, user, token, userRole]);
  
  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const messageData = {
        appointmentId,
        message: newMessage,
        senderId: user._id,
        senderRole: userRole
      };
      
      await axios.post('/api/appointments/messages', messageData, config);
      
      // Add message to local state
      setChatMessages([
        ...chatMessages,
        {
          ...messageData,
          createdAt: new Date().toISOString(),
          _id: Date.now().toString() // Temporary ID
        }
      ]);
      
      // Clear input
      setNewMessage('');
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Handle ending the appointment
  const handleEndAppointment = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.put(`/api/appointments/${appointmentId}/complete`, {}, config);
      
      // Redirect based on user role
      if (userRole === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
      
    } catch (error) {
      console.error('Error ending appointment:', error);
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !appointment) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <Typography color="error">{error || 'Appointment not found'}</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 3, md: 4 } }}>
        {/* Appointment Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.15)} 0%, ${alpha(theme.palette.info.light, 0.05)} 100%)`,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography
              variant="h5"
              fontWeight={600}
              gutterBottom
            >
              Online Appointment
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {new Date(appointment.date).toLocaleDateString()} at {appointment.time || '10:00 AM'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {appointment.type || 'Consultation'} with {otherParticipant?.name || (userRole === 'doctor' ? 'Patient' : 'Dr. Unknown')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            onClick={handleEndAppointment}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            End Appointment
          </Button>
        </Paper>
        
        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Video Call Area */}
          <Grid item xs={12} md={showChat ? 8 : 12}>
            <Card sx={{ borderRadius: 3, overflow: 'hidden', height: '60vh' }}>
              <Box
                sx={{
                  height: '100%',
                  bgcolor: '#000',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                {/* Main video display */}
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff'
                  }}
                >
                  {!videoEnabled ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          fontSize: '3rem',
                          mx: 'auto',
                          mb: 2,
                          bgcolor: theme.palette.info.dark
                        }}
                      >
                        {getInitials(user?.name || 'User')}
                      </Avatar>
                      <Typography variant="h6">
                        Your camera is off
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body1">
                      Video stream would appear here
                    </Typography>
                  )}
                </Box>
                
                {/* Small self-view */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 80,
                    right: 20,
                    width: 180,
                    height: 120,
                    bgcolor: '#333',
                    borderRadius: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {!videoEnabled ? (
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        fontSize: '1.5rem',
                        bgcolor: theme.palette.info.dark
                      }}
                    >
                      {getInitials(user?.name || 'User')}
                    </Avatar>
                  ) : (
                    <Typography variant="body2">
                      Your video
                    </Typography>
                  )}
                </Box>
                
                {/* Video controls */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 70,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <IconButton
                    color={videoEnabled ? 'primary' : 'error'}
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    {videoEnabled ? <Videocam /> : <VideocamOff />}
                  </IconButton>
                  
                  <IconButton
                    color={audioEnabled ? 'primary' : 'error'}
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    {audioEnabled ? <Mic /> : <MicOff />}
                  </IconButton>
                  
                  <IconButton
                    color={screenShareEnabled ? 'primary' : 'inherit'}
                    onClick={() => setScreenShareEnabled(!screenShareEnabled)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    {screenShareEnabled ? <StopScreenShare /> : <ScreenShare />}
                  </IconButton>
                  
                  <IconButton
                    color={showChat ? 'primary' : 'inherit'}
                    onClick={() => setShowChat(!showChat)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <ChatIcon />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </Grid>
          
          {/* Chat Area */}
          {showChat && (
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, height: '60vh', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" fontWeight={600}>
                    Chat
                  </Typography>
                  <IconButton size="small" onClick={() => setShowChat(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                
                {/* Messages area */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {chatMessages.length > 0 ? (
                    chatMessages.map((msg, index) => (
                      <Box
                        key={msg._id || index}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: msg.senderId === user?._id ? 'flex-end' : 'flex-start',
                          mb: 2
                        }}
                      >
                        <Box
                          sx={{
                            maxWidth: '80%',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: msg.senderId === user?._id ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.grey[200], 0.7),
                            color: 'text.primary'
                          }}
                        >
                          <Typography variant="body2">{msg.message}</Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography color="text.secondary">No messages yet</Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Message input */}
                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    variant="outlined"
                    size="small"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <IconButton color="primary" onClick={handleSendMessage}>
                    <SendIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          )}
        </Grid>
        
        {/* Additional Tools - Only for doctors */}
        {userRole === 'doctor' && (
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Assignment sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight={600}>
                      Medical Notes
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter medical notes for this appointment..."
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                  >
                    Save Notes
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MedicalServices sx={{ mr: 1, color: theme.palette.success.main }} />
                    <Typography variant="h6" fontWeight={600}>
                      Prescriptions
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Enter prescription details..."
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    color="success"
                    sx={{ mt: 2, borderRadius: 2, textTransform: 'none' }}
                  >
                    Create Prescription
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default OnlineAppointment;
