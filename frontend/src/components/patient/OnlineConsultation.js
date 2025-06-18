import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  Badge,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  Fade
} from '@mui/material';
import {
  VideoCall as VideoCallIcon,
  Call as CallIcon,
  CallEnd as CallEndIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Refresh as RefreshIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as DoctorIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns';
import axios from '../../utils/axiosConfig';
import { isAuthenticated, ensureValidToken, getStoredUserId } from '../../utils/tokenManager';
import WebRTCService from '../../services/WebRTCService';
import useCallNotifications from '../../hooks/useCallNotifications';

const PatientOnlineConsultation = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Video call states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callStartTime = useRef(null);
  const callTimer = useRef(null);
  const webRTCService = useRef(null);
  
  // Dialog states
  const [doctorDialog, setDoctorDialog] = useState({ open: false, doctor: null });
  const [consultationRequestDialog, setConsultationRequestDialog] = useState({ open: false, doctor: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [incomingCall, setIncomingCall] = useState(null);

  // Get current user info
  const patientId = getStoredUserId();
  const patientInfo = {
    id: patientId,
    name: patientId || 'Patient',
    role: 'patient'
  };

  // Utility functions
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Handler functions defined before hook calls
  const handleIncomingCall = (callData) => {
    console.log('Incoming call from doctor:', callData.caller);
    setIncomingCall(callData);
    showSnackbar(`Incoming call from ${callData.caller.name}`, 'info');
  };

  const handleCallStatusChange = (status, callData) => {
    switch (status) {
      case 'accepted':
        showSnackbar(`Call accepted by ${callData.receiver?.name || 'Doctor'}`, 'success');
        break;
      case 'rejected':
        showSnackbar(`Call declined by ${callData.receiver?.name || 'Doctor'}`, 'warning');
        // endCall will be called after hook is defined
        break;
      case 'ended':
        showSnackbar('Call ended', 'info');
        // endCall will be called after hook is defined
        break;
      default:
        break;
    }
  };

  // Call notifications hook
  const {
    socket,
    isConnected,
    notifications,
    sendCallRequest,
    acceptCall: acceptCallNotification,
    rejectCall: rejectCallNotification,
    endCall: endCallNotification,
    updateOnlineStatus
  } = useCallNotifications(handleIncomingCall, handleCallStatusChange);

  // Mock data for development
  const mockDoctors = [
    {
      id: 'doc1',
      name: 'Dr. Sarah Johnson',
      specialization: 'Cardiologist',
      hospital: 'Central Hospital',
      avatar: null,
      isOnline: true,
      rating: 4.8,
      experience: '15 years',
      nextAvailable: new Date(Date.now() + 30 * 60000),
      consultationFee: 50,
      phone: '+1234567890',
      email: 'dr.sarah@hospital.com'
    },
    {
      id: 'doc2',
      name: 'Dr. Michael Brown',
      specialization: 'General Physician',
      hospital: 'General Hospital',
      avatar: null,
      isOnline: false,
      rating: 4.6,
      experience: '12 years',
      nextAvailable: new Date(Date.now() + 2 * 60 * 60000),
      consultationFee: 40,
      phone: '+1234567891',
      email: 'dr.michael@hospital.com'
    },
    {
      id: 'doc3',
      name: 'Dr. Emily Davis',
      specialization: 'Pediatrician',
      hospital: 'Children\'s Hospital',
      avatar: null,
      isOnline: true,
      rating: 4.9,
      experience: '18 years',
      nextAvailable: new Date(Date.now() + 15 * 60000),
      consultationFee: 60,
      phone: '+1234567892',
      email: 'dr.emily@hospital.com'
    }
  ];

  const mockConsultations = [
    {
      id: 1,
      doctor: mockDoctors[0],
      scheduledTime: new Date(Date.now() + 30 * 60000),
      type: 'follow-up',
      status: 'scheduled',
      duration: 30,
      reason: 'Follow-up on blood pressure medication',
      consultationFee: 50
    },
    {
      id: 2,
      doctor: mockDoctors[2],
      scheduledTime: new Date(Date.now() + 60 * 60000),
      type: 'consultation',
      status: 'scheduled',
      duration: 45,
      reason: 'General health checkup',
      consultationFee: 60
    }
  ];

  // Fetch doctors and consultations
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isAuthenticated()) {
        throw new Error('User not authenticated');
      }

      const isValidToken = await ensureValidToken();
      if (!isValidToken) {
        throw new Error('Invalid authentication token');
      }

      let doctorsData = [];
      let consultationsData = [];
      
      try {
        // Try to fetch from backend first
        console.log('Fetching doctors and consultations for patient:', patientId);
        
        const [doctorsResponse, consultationsResponse] = await Promise.all([
          axios.get('/api/doctors/online'),
          axios.get(`/api/consultations/patient/${patientId}`)
        ]);
        
        doctorsData = doctorsResponse.data || [];
        consultationsData = consultationsResponse.data || [];
        
        console.log('Fetched from backend:', doctorsData.length, 'doctors,', consultationsData.length, 'consultations');
      } catch (apiError) {
        console.warn('Backend API not available, using mock data:', apiError.message);
        // Fallback to mock data
        doctorsData = mockDoctors;
        consultationsData = mockConsultations;
      }
      
      setDoctors(doctorsData);
      setConsultations(consultationsData);
      
      console.log('Successfully loaded data:', doctorsData.length, 'doctors,', consultationsData.length, 'consultations');

    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch data');
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.location.href = '/login?expired=true';
        return;
      }
      
      // Use mock data on error for development
      setDoctors(mockDoctors);
      setConsultations(mockConsultations);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    initializeWebRTC();
    
    // Set up real-time updates
    const interval = setInterval(fetchData, 30000);
    
    return () => {
      clearInterval(interval);
      cleanupWebRTC();
    };
  }, []);

  // Initialize WebRTC service
  const initializeWebRTC = () => {
    if (!patientId) return;

    webRTCService.current = new WebRTCService();
    
    // Set up callbacks
    webRTCService.current.onCallRequestCallback = handleIncomingCall;
    webRTCService.current.onRemoteStreamCallback = handleRemoteStream;
    webRTCService.current.onConnectionStateChangeCallback = handleConnectionStateChange;
    webRTCService.current.onMessageCallback = handleChatMessage;
    
    // Initialize the service
    webRTCService.current.initialize(patientId, null, null);
    
    console.log('WebRTC service initialized for patient:', patientId);
  };

  // Cleanup WebRTC service
  const cleanupWebRTC = () => {
    if (webRTCService.current) {
      webRTCService.current.hangup();
      webRTCService.current = null;
    }
  };

  // Handle remote stream
  const handleRemoteStream = (stream) => {
    console.log('Remote stream received');
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  };

  // Handle connection state change
  const handleConnectionStateChange = (state) => {
    console.log('Connection state changed:', state);
    if (state === 'connected') {
      showSnackbar('Call connected successfully', 'success');
    } else if (state === 'disconnected' || state === 'failed') {
      showSnackbar('Call disconnected', 'warning');
      endCall();
    }
  };

  // Handle chat message
  const handleChatMessage = (data) => {
    const message = {
      id: Date.now(),
      sender: data.userId === patientId ? 'patient' : 'doctor',
      text: data.message,
      timestamp: new Date(),
      type: 'text'
    };
    
    setChatMessages(prev => [...prev, message]);
  };



  // Start call with doctor
  const startCallWithDoctor = async (doctor) => {
    try {
      // Set current call state
      const consultation = {
        doctor,
        patient: patientInfo,
        scheduledTime: new Date(),
        type: 'instant',
        status: 'in-progress',
        duration: 30,
        reason: 'Instant consultation'
      };
      
      setCurrentCall(consultation);
      callStartTime.current = Date.now();
      setCallDuration(0);
      
      // Start call timer
      callTimer.current = setInterval(() => {
        if (callStartTime.current) {
          setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
        }
      }, 1000);

      // Send call request via notification system
      const roomId = sendCallRequest(doctor.id, patientInfo, 'video');

      // Initialize WebRTC call
      if (webRTCService.current && roomId) {
        webRTCService.current.initiateCall(
          patientInfo,
          doctor.id,
          'video'
        );
        
        // Start the call with video
        const localStream = await webRTCService.current.startCall(false);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        
        console.log('Call initiated with doctor in room:', roomId);
      }
      
      showSnackbar(`Starting video call with ${doctor.name}`, 'info');
    } catch (error) {
      console.error('Error starting call:', error);
      showSnackbar('Failed to start video call', 'error');
    }
  };

  // End call
  const endCall = async () => {
    try {
      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }
      
      // End WebRTC call
      if (webRTCService.current) {
        webRTCService.current.hangup();
      }
      
      // Clear video refs
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      
      setCurrentCall(null);
      setCallDuration(0);
      callStartTime.current = null;
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);
      setIsScreenSharing(false);
      setChatMessages([]);
      setNewMessage('');
      setShowChat(false);
      setIncomingCall(null);
      
      showSnackbar('Call ended', 'info');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  // Accept incoming call
  const acceptIncomingCall = async (callData) => {
    try {
      if (webRTCService.current) {
        const roomId = webRTCService.current.acceptCall(callData);
        const localStream = await webRTCService.current.startCall(false);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        
        // Find the doctor for this call
        const doctor = doctors.find(d => d.id === callData.caller.id) || {
          id: callData.caller.id,
          name: callData.caller.name,
          specialization: 'Doctor',
          avatar: callData.caller.avatar
        };
        
        const consultation = {
          doctor,
          patient: patientInfo,
          scheduledTime: new Date(),
          type: 'incoming',
          status: 'in-progress',
          duration: 30,
          reason: 'Incoming consultation'
        };
        
        setCurrentCall(consultation);
        callStartTime.current = Date.now();
        setCallDuration(0);
        
        // Start call timer
        callTimer.current = setInterval(() => {
          if (callStartTime.current) {
            setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
          }
        }, 1000);
        
        // Accept call via notification system
        acceptCallNotification(callData);
        
        setIncomingCall(null);
        showSnackbar(`Call accepted with ${callData.caller.name}`, 'success');
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      showSnackbar('Failed to accept call', 'error');
    }
  };

  // Reject incoming call
  const rejectIncomingCall = (callData) => {
    if (webRTCService.current) {
      webRTCService.current.rejectCall(callData);
    }
    
    // Reject call via notification system
    rejectCallNotification(callData);
    
    setIncomingCall(null);
    showSnackbar(`Call rejected from ${callData.caller.name}`, 'info');
  };

  // Toggle video/audio functions
  const toggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    
    if (webRTCService.current) {
      webRTCService.current.toggleVideo(newVideoState);
    }
  };

  const toggleAudio = () => {
    const newAudioState = !isAudioEnabled;
    setIsAudioEnabled(newAudioState);
    
    if (webRTCService.current) {
      webRTCService.current.toggleAudio(newAudioState);
    }
  };

  // Send chat message
  const sendChatMessage = () => {
    if (newMessage.trim() && webRTCService.current) {
      const message = {
        id: Date.now(),
        sender: 'patient',
        text: newMessage,
        timestamp: new Date(),
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, message]);
      webRTCService.current.sendMessage(newMessage);
      setNewMessage('');
    }
  };

  // Utility functions
  const formatCallDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in-progress': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const openDoctorDialog = (doctor) => {
    setDoctorDialog({ open: true, doctor });
  };

  const closeDoctorDialog = () => {
    setDoctorDialog({ open: false, doctor: null });
  };

  const openConsultationRequestDialog = (doctor) => {
    setConsultationRequestDialog({ open: true, doctor });
  };

  const closeConsultationRequestDialog = () => {
    setConsultationRequestDialog({ open: false, doctor: null });
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading consultations...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error && doctors.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchData} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Online Consultations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Connect with your doctors for video consultations
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
        >
          Refresh
        </Button>
      </Box>

      {/* Video Call Interface */}
      <AnimatePresence>
        {currentCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          >
            <Box
              sx={{
                position: 'fixed',
                inset: 0,
                bgcolor: '#000000',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 9999
              }}
            >
              {/* Video Area */}
              <Box sx={{ flex: 1, position: 'relative', display: 'flex' }}>
                {/* Remote Video */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    backgroundColor: '#1a1a1a'
                  }}
                />
                
                {/* Local Video - Picture in Picture */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    width: 200,
                    height: 150,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid white',
                    boxShadow: 3
                  }}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      backgroundColor: '#2a2a2a'
                    }}
                  />
                </Box>

                {/* Doctor Info Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    bgcolor: alpha('#000000', 0.7),
                    borderRadius: 2,
                    p: 2,
                    color: 'white'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {currentCall.doctor.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                    {currentCall.doctor.specialization}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {formatCallDuration(callDuration)}
                  </Typography>
                </Box>
              </Box>

              {/* Call Controls */}
              <Box
                sx={{
                  bgcolor: alpha('#000000', 0.9),
                  p: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Tooltip title={isAudioEnabled ? 'Mute' : 'Unmute'}>
                  <IconButton
                    onClick={toggleAudio}
                    sx={{
                      bgcolor: isAudioEnabled ? alpha('#ffffff', 0.1) : 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: isAudioEnabled ? alpha('#ffffff', 0.2) : 'error.dark'
                      }
                    }}
                  >
                    {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
                  <IconButton
                    onClick={toggleVideo}
                    sx={{
                      bgcolor: isVideoEnabled ? alpha('#ffffff', 0.1) : 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: isVideoEnabled ? alpha('#ffffff', 0.2) : 'error.dark'
                      }
                    }}
                  >
                    {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={showChat ? 'Hide chat' : 'Show chat'}>
                  <IconButton
                    onClick={() => setShowChat(!showChat)}
                    sx={{
                      bgcolor: showChat ? 'primary.main' : alpha('#ffffff', 0.1),
                      color: 'white',
                      '&:hover': {
                        bgcolor: showChat ? 'primary.dark' : alpha('#ffffff', 0.2)
                      }
                    }}
                  >
                    <ChatIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="End call">
                  <IconButton
                    onClick={endCall}
                    sx={{
                      bgcolor: 'error.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'error.dark'
                      }
                    }}
                  >
                    <CallEndIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Chat Sidebar */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ x: 300 }}
                    animate={{ x: 0 }}
                    exit={{ x: 300 }}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 300,
                      backgroundColor: alpha('#000000', 0.9),
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="h6" sx={{ color: 'white' }}>
                        Chat
                      </Typography>
                    </Box>
                    
                    <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                      {chatMessages.map((message) => (
                        <Box key={message.id} sx={{ mb: 1 }}>
                          <Paper
                            sx={{
                              p: 1,
                              bgcolor: message.sender === 'patient' ? 'primary.main' : alpha('#ffffff', 0.1),
                              color: 'white',
                              ml: message.sender === 'patient' ? 2 : 0,
                              mr: message.sender === 'patient' ? 0 : 2
                            }}
                          >
                            <Typography variant="body2">{message.text}</Typography>
                          </Paper>
                        </Box>
                      ))}
                    </Box>
                    
                    <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: alpha('#ffffff', 0.1),
                              color: 'white',
                              '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' }
                            }
                          }}
                        />
                        <IconButton onClick={sendChatMessage} sx={{ color: 'primary.main' }}>
                          <SendIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {!currentCall && (
        <Grid container spacing={3}>
          {/* Available Doctors */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <DoctorIcon sx={{ mr: 1 }} />
                Available Doctors
              </Typography>
              
              {doctors.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <DoctorIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No doctors available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All doctors are currently offline. Please try again later.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {doctors.map((doctor) => (
                    <Grid item xs={12} md={6} key={doctor.id}>
                      <Card 
                        sx={{ 
                          position: 'relative',
                          border: doctor.isOnline ? '2px solid' : '1px solid',
                          borderColor: doctor.isOnline ? 'success.main' : 'divider',
                          '&:hover': {
                            boxShadow: theme.shadows[4],
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Badge
                              variant="dot"
                              color={doctor.isOnline ? 'success' : 'error'}
                              sx={{
                                '& .MuiBadge-badge': {
                                  right: 8,
                                  top: 8
                                }
                              }}
                            >
                              <Avatar
                                src={doctor.avatar}
                                sx={{ width: 60, height: 60, mr: 2 }}
                              >
                                {doctor.name.charAt(0)}
                              </Avatar>
                            </Badge>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ mb: 0.5 }}>
                                {doctor.name}
                              </Typography>
                              <Typography variant="body2" color="primary" sx={{ mb: 0.5 }}>
                                {doctor.specialization}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {doctor.hospital}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                              label={`★ ${doctor.rating}`}
                              size="small"
                              color="warning"
                            />
                            <Chip 
                              label={doctor.experience}
                              size="small"
                              variant="outlined"
                            />
                            <Chip 
                              label={`$${doctor.consultationFee}`}
                              size="small"
                              color="primary"
                            />
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Next available: {format(doctor.nextAvailable, 'MMM dd, HH:mm')}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {doctor.isOnline ? (
                              <Button
                                variant="contained"
                                color="success"
                                startIcon={<VideoCallIcon />}
                                onClick={() => startCallWithDoctor(doctor)}
                                fullWidth
                              >
                                Call Now
                              </Button>
                            ) : (
                              <Button
                                variant="outlined"
                                startIcon={<ScheduleIcon />}
                                onClick={() => openConsultationRequestDialog(doctor)}
                                fullWidth
                              >
                                Schedule
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              onClick={() => openDoctorDialog(doctor)}
                            >
                              Details
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* Upcoming Consultations */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                Upcoming Consultations
              </Typography>
              
              {consultations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No upcoming consultations
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {consultations.map((consultation) => (
                    <Card key={consultation.id} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
                      <CardContent sx={{ pb: '16px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar
                            src={consultation.doctor.avatar}
                            sx={{ width: 40, height: 40, mr: 2 }}
                          >
                            {consultation.doctor.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {consultation.doctor.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {consultation.doctor.specialization}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {format(consultation.scheduledTime, 'MMM dd, yyyy - HH:mm')}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {consultation.reason}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip 
                            label={consultation.status}
                            color={getStatusColor(consultation.status)}
                            size="small"
                          />
                          <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                            ${consultation.consultationFee}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Doctor Details Dialog */}
      <Dialog 
        open={doctorDialog.open} 
        onClose={closeDoctorDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Doctor Details
        </DialogTitle>
        <DialogContent>
          {doctorDialog.doctor && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Badge
                  variant="dot"
                  color={doctorDialog.doctor.isOnline ? 'success' : 'error'}
                >
                  <Avatar
                    src={doctorDialog.doctor.avatar}
                    sx={{ width: 80, height: 80, mr: 3 }}
                  >
                    {doctorDialog.doctor.name.charAt(0)}
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {doctorDialog.doctor.name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mb: 0.5 }}>
                    {doctorDialog.doctor.specialization}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {doctorDialog.doctor.hospital}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Experience
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {doctorDialog.doctor.experience}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Rating
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ★ {doctorDialog.doctor.rating}/5.0
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Consultation Fee
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    ${doctorDialog.doctor.consultationFee}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={doctorDialog.doctor.isOnline ? 'Online' : 'Offline'}
                    color={doctorDialog.doctor.isOnline ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Contact Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{doctorDialog.doctor.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{doctorDialog.doctor.email}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDoctorDialog}>Close</Button>
          {doctorDialog.doctor?.isOnline && (
            <Button 
              variant="contained" 
              startIcon={<VideoCallIcon />}
              onClick={() => {
                closeDoctorDialog();
                startCallWithDoctor(doctorDialog.doctor);
              }}
            >
              Start Consultation
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Consultation Request Dialog */}
      <Dialog 
        open={consultationRequestDialog.open} 
        onClose={closeConsultationRequestDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Schedule Consultation
        </DialogTitle>
        <DialogContent>
          {consultationRequestDialog.doctor && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {consultationRequestDialog.doctor.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Schedule a consultation with this doctor. You will be notified when the doctor is available.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Describe your symptoms or reason for consultation..."
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConsultationRequestDialog}>Cancel</Button>
          <Button variant="contained" onClick={closeConsultationRequestDialog}>
            Schedule Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Incoming Call Dialog */}
      <Dialog 
        open={!!incomingCall} 
        onClose={() => {}} // Prevent closing without action
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: theme.shadows[24]
          }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {incomingCall && (
            <Box>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar
                  src={incomingCall.caller.avatar}
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    border: `4px solid ${theme.palette.primary.main}`,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%': {
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}`
                      },
                      '70%': {
                        boxShadow: `0 0 0 20px ${alpha(theme.palette.primary.main, 0)}`
                      },
                      '100%': {
                        boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`
                      }
                    }
                  }}
                >
                  {incomingCall.caller.name.charAt(0)}
                </Avatar>
              </motion.div>
              
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                Incoming Video Call
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                {incomingCall.caller.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {incomingCall.caller.role === 'doctor' ? 'Doctor' : 'Patient'}
              </Typography>
              
              <Chip
                icon={<VideoCallIcon />}
                label="Video Call"
                color="primary"
                sx={{ mb: 3 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<CallEndIcon />}
            onClick={() => rejectIncomingCall(incomingCall)}
            sx={{ minWidth: 120 }}
          >
            Decline
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<VideoCallIcon />}
            onClick={() => acceptIncomingCall(incomingCall)}
            sx={{ minWidth: 120 }}
          >
            Accept
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientOnlineConsultation;