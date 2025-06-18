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
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
  Paper,
  Badge,
  CircularProgress,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  Fade,
  Slide
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
  RecordVoiceOver as RecordIcon,
  Stop as StopIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  Add as AddIcon,
  AccessTime as TimeIcon,
  CameraAlt as CameraIcon,
  Assignment as NotesIcon,
  MedicalServices as MedicalIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns';
import axios from '../../utils/axiosConfig';
import { isAuthenticated, ensureValidToken, getStoredUserId } from '../../utils/tokenManager';
import WebRTCService from '../../services/WebRTCService';
import useCallNotifications from '../../hooks/useCallNotifications';

const OnlineConsultation = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [consultations, setConsultations] = useState([]);
  const [waitingPatients, setWaitingPatients] = useState([]);
  const [currentCall, setCurrentCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  
  // Video call states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  const [consultationDialog, setConsultationDialog] = useState({ open: false, patient: null });
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [notesDialog, setNotesDialog] = useState({ open: false, consultation: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [incomingCall, setIncomingCall] = useState(null);

  // Get current user info
  const doctorId = getStoredUserId();
  const doctorInfo = {
    id: doctorId,
    name: 'Dr. ' + (doctorId || 'Doctor'),
    role: 'doctor'
  };

  // Utility functions
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Handler functions defined before hook calls
  const handleIncomingCall = (callData) => {
    console.log('Incoming call from patient:', callData.caller);
    setIncomingCall(callData);
    showSnackbar(`Incoming call from ${callData.caller.name}`, 'info');
  };

  const handleCallStatusChange = (status, callData) => {
    switch (status) {
      case 'accepted':
        showSnackbar(`Call accepted by ${callData.receiver?.name || 'Patient'}`, 'success');
        break;
      case 'rejected':
        showSnackbar(`Call declined by ${callData.receiver?.name || 'Patient'}`, 'warning');
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
  const mockConsultations = [
    {
      id: 1,
      patient: {
        id: 'pat1',
        name: 'Sarah Johnson',
        age: 32,
        avatar: null,
        phone: '+1234567890',
        email: 'sarah.johnson@email.com'
      },
      scheduledTime: new Date(Date.now() + 30 * 60000), // 30 minutes from now
      type: 'follow-up',
      status: 'scheduled',
      duration: 30,
      reason: 'Follow-up on diabetes management',
      notes: 'Patient has been monitoring blood sugar levels',
      consultationNotes: ''
    },
    {
      id: 2,
      patient: {
        id: 'pat2',
        name: 'Michael Brown',
        age: 45,
        avatar: null,
        phone: '+1234567891',
        email: 'michael.brown@email.com'
      },
      scheduledTime: new Date(Date.now() + 60 * 60000), // 1 hour from now
      type: 'consultation',
      status: 'scheduled',
      duration: 45,
      reason: 'Chest pain consultation',
      notes: 'Patient experiencing intermittent chest discomfort',
      consultationNotes: ''
    },
    {
      id: 3,
      patient: {
        id: 'pat3',
        name: 'Emma Wilson',
        age: 28,
        avatar: null,
        phone: '+1234567892',
        email: 'emma.wilson@email.com'
      },
      scheduledTime: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      type: 'urgent',
      status: 'waiting',
      duration: 20,
      reason: 'Severe headache and nausea',
      notes: 'Urgent consultation requested',
      consultationNotes: ''
    },
    // Mock online patients available for virtual consultation
    {
      id: 'virtual_pat4',
      patient: {
        id: 'pat4',
        name: 'John Smith',
        age: 35,
        avatar: null,
        phone: '+1234567893',
        email: 'john.smith@email.com'
      },
      scheduledTime: new Date(), // Available now
      type: 'virtual',
      status: 'available',
      duration: 30,
      reason: 'Online consultation available',
      notes: 'Patient is online and available for consultation',
      consultationNotes: ''
    },
    {
      id: 'virtual_pat5',
      patient: {
        id: 'pat5',
        name: 'Lisa Anderson',
        age: 29,
        avatar: null,
        phone: '+1234567894',
        email: 'lisa.anderson@email.com'
      },
      scheduledTime: new Date(), // Available now
      type: 'virtual',
      status: 'available',
      duration: 30,
      reason: 'Online consultation available',
      notes: 'Patient is online and available for consultation',
      consultationNotes: ''
    }
  ];

  // Fetch consultations data
  const fetchConsultations = async () => {
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

      const doctorId = getStoredUserId();
      if (!doctorId) {
        throw new Error('Doctor ID not found');
      }

      // Fetch scheduled consultations and assigned patients
      console.log('Fetching online consultations for doctor:', doctorId);
      
      let consultationsData = [];
      let patientsData = [];
      
      try {
        console.log('🔍 Attempting to fetch real data from backend...');
        
        // Try to fetch consultations first
        console.log('📅 Fetching doctor appointments from:', `/api/appointments/doctor`);
        const consultationsResponse = await axios.get(`/api/appointments/doctor`);
        consultationsData = consultationsResponse.data || [];
        console.log('✅ Fetched appointments from backend:', consultationsData.length);

        // Fetch assigned patients for online consultation
        console.log('👥 Fetching assigned patients from:', `/api/doctors/my-patients`);
        const patientsResponse = await axios.get(`/api/doctors/my-patients`);
        patientsData = patientsResponse.data || [];
        console.log('✅ Fetched assigned patients from backend:', patientsData.length);

        // Log the actual patient data to see what we're getting
        console.log('📋 Patient data received:', patientsData);

        // Create virtual consultations for assigned patients who are online
        const virtualConsultations = patientsData
          .filter(patient => {
            const isOnline = patient.isOnline || patient.status === 'active' || patient.status === 'online';
            console.log(`👤 Patient ${patient.name || patient.firstName + ' ' + patient.lastName}: isOnline=${isOnline}, status=${patient.status}`);
            return isOnline;
          })
          .map(patient => {
            const patientName = patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
            console.log(`🔄 Creating virtual consultation for patient: ${patientName}`);
            return {
              id: `virtual_${patient.id}`,
              patient: {
                id: patient.id,
                name: patientName,
                age: patient.age || calculateAge(patient.dateOfBirth),
                avatar: patient.avatar || patient.profilePicture,
                phone: patient.phone,
                email: patient.email
              },
              scheduledTime: new Date(), // Available now
              type: 'virtual',
              status: 'available',
              duration: 30,
              reason: 'Online consultation available',
              notes: 'Patient is online and available for consultation',
              consultationNotes: ''
            };
          });

        console.log('🎯 Created virtual consultations:', virtualConsultations.length);

        // Combine scheduled consultations with virtual ones
        consultationsData = [...consultationsData, ...virtualConsultations];
        console.log('📊 Total consultations after combining:', consultationsData.length);

        // Show notification about data source
        setUsingMockData(false);
        showSnackbar(`✅ Loaded ${patientsData.length} patients from backend`, 'success');
        
      } catch (apiError) {
        console.error('❌ Backend API Error Details:', {
          message: apiError.message,
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          url: apiError.config?.url
        });
        
        // Show more specific error message
        const errorMsg = apiError.response?.status === 404 
          ? 'Backend API endpoints not found' 
          : apiError.response?.status === 401 
          ? 'Authentication failed' 
          : `Backend API error: ${apiError.message}`;
          
        console.warn('⚠️ Using mock data due to API error:', errorMsg);
        setUsingMockData(true);
        showSnackbar(`⚠️ ${errorMsg} - Using demo data`, 'warning');
        
        // Fallback to mock data
        consultationsData = mockConsultations;
      }
      
      // Separate waiting patients from scheduled consultations
      const waiting = consultationsData.filter(c => c.status === 'waiting' || c.status === 'available');
      const scheduled = consultationsData.filter(c => c.status !== 'waiting' && c.status !== 'available');
      
      setConsultations(scheduled);
      setWaitingPatients(waiting);
      
      console.log('Successfully loaded consultations:', scheduled.length, 'scheduled,', waiting.length, 'waiting');

    } catch (error) {
      console.error('Error fetching consultations:', error);
      setError(error.message || 'Failed to fetch consultations');
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        window.location.href = '/login?expired=true';
        return;
      }
      
      // Use mock data on error for development
      const consultationsData = mockConsultations;
      const waiting = consultationsData.filter(c => c.status === 'waiting');
      const scheduled = consultationsData.filter(c => c.status !== 'waiting');
      setConsultations(scheduled);
      setWaitingPatients(waiting);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeComponent = async () => {
      await fetchConsultations();
      initializeWebRTC();
    };
    
    initializeComponent();
    
    // Set up real-time updates (WebSocket or polling)
    const interval = setInterval(() => {
      fetchConsultations();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(interval);
      cleanupWebRTC();
    };
  }, []);

  // Initialize WebRTC service
  const initializeWebRTC = () => {
    if (!doctorId) return;

    webRTCService.current = new WebRTCService();
    
    // Set up callbacks
    webRTCService.current.onCallRequestCallback = handleIncomingCall;
    webRTCService.current.onRemoteStreamCallback = handleRemoteStream;
    webRTCService.current.onConnectionStateChangeCallback = handleConnectionStateChange;
    webRTCService.current.onMessageCallback = handleChatMessage;
    
    // Initialize the service
    webRTCService.current.initialize(doctorId, null, null);
    
    console.log('WebRTC service initialized for doctor:', doctorId);
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
      sender: data.userId === doctorId ? 'doctor' : 'patient',
      text: data.message,
      timestamp: new Date(),
      type: 'text'
    };
    
    setChatMessages(prev => [...prev, message]);
  };

  // Online status management
  const toggleOnlineStatus = async (status) => {
    try {
      setIsOnline(status);
      
      // Update online status via API
      try {
        await axios.patch('/api/doctors/online-status', { isOnline: status });
        console.log('Online status updated in backend');
      } catch (apiError) {
        console.warn('Failed to update online status in backend:', apiError.message);
      }
      
      // Update online status via socket
      updateOnlineStatus(status, 'doctor');
      
      showSnackbar(
        status ? 'You are now available for consultations' : 'You are now offline', 
        'success'
      );
    } catch (error) {
      console.error('Error updating online status:', error);
      showSnackbar('Failed to update online status', 'error');
    }
  };

  // Video call functions
  const startCall = async (consultation) => {
    try {
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
      const roomId = sendCallRequest(consultation.patient.id, doctorInfo, 'video');
      
      // Initialize WebRTC call
      if (webRTCService.current && roomId) {
        webRTCService.current.initiateCall(
          doctorInfo,
          consultation.patient.id,
          'video'
        );
        
        // Start the call with video
        const localStream = await webRTCService.current.startCall(false);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        
        console.log('Call initiated in room:', roomId);
      }
      
      showSnackbar(`Starting video call with ${consultation.patient.name}`, 'info');
    } catch (error) {
      console.error('Error starting call:', error);
      showSnackbar('Failed to start video call', 'error');
    }
  };

  const endCall = async () => {
    try {
      const callData = currentCall ? {
        caller: doctorInfo,
        receiver: { id: currentCall.patient.id, name: currentCall.patient.name },
        room: `call-${doctorId}-${currentCall.patient.id}`
      } : null;

      if (callTimer.current) {
        clearInterval(callTimer.current);
        callTimer.current = null;
      }
      
      // End WebRTC call
      if (webRTCService.current) {
        webRTCService.current.hangup();
      }
      
      // End call via notification system
      if (callData) {
        endCallNotification(callData);
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
      setIsRecording(false);
      setChatMessages([]);
      setNewMessage('');
      setShowChat(false);
      setIncomingCall(null);
      
      showSnackbar('Call ended', 'info');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const initializeVideoCall = async (patientId) => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Here you would integrate with WebRTC or video calling service
      // For demo purposes, we'll simulate a connection
      console.log('Video call initialized for patient:', patientId);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      showSnackbar('Failed to access camera/microphone', 'error');
    }
  };

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

  const toggleScreenShare = async () => {
    try {
      const newScreenShareState = !isScreenSharing;
      
      if (webRTCService.current) {
        const stream = await webRTCService.current.shareScreen(newScreenShareState);
        
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
        }
        
        setIsScreenSharing(newScreenShareState);
        showSnackbar(
          newScreenShareState ? 'Screen sharing started' : 'Screen sharing stopped', 
          newScreenShareState ? 'success' : 'info'
        );
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      showSnackbar('Failed to toggle screen sharing', 'error');
    }
  };

  const sendChatMessage = () => {
    if (newMessage.trim() && webRTCService.current) {
      const message = {
        id: Date.now(),
        sender: 'doctor',
        text: newMessage,
        timestamp: new Date(),
        type: 'text'
      };
      
      setChatMessages(prev => [...prev, message]);
      webRTCService.current.sendMessage(newMessage);
      setNewMessage('');
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
        
        // Find the consultation for this caller
        const consultation = [...consultations, ...waitingPatients].find(
          c => c.patient.id === callData.caller.id
        );
        
        if (consultation) {
          setCurrentCall(consultation);
          callStartTime.current = Date.now();
          setCallDuration(0);
          
          // Start call timer
          callTimer.current = setInterval(() => {
            if (callStartTime.current) {
              setCallDuration(Math.floor((Date.now() - callStartTime.current) / 1000));
            }
          }, 1000);
        }
        
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
      case 'waiting': return 'warning';
      case 'available': return 'success';
      case 'in-progress': return 'success';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgent': return 'error';
      case 'follow-up': return 'info';
      case 'consultation': return 'primary';
      case 'virtual': return 'success';
      default: return 'default';
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const openConsultationDialog = (patient) => {
    setConsultationDialog({ open: true, patient });
  };

  const closeConsultationDialog = () => {
    setConsultationDialog({ open: false, patient: null });
  };

  const openNotesDialog = (consultation) => {
    setNotesDialog({ open: true, consultation });
  };

  const closeNotesDialog = () => {
    setNotesDialog({ open: false, consultation: null });
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
  if (error && consultations.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchConsultations} startIcon={<RefreshIcon />}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h4" fontWeight={700}>
              Online Consultations
            </Typography>
            {usingMockData && (
              <Chip 
                label="DEMO MODE" 
                color="warning" 
                size="small"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {usingMockData 
              ? 'Showing demo data - Backend API not available' 
              : 'Manage your video consultations and connect with patients remotely'
            }
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Connection Status */}
          <Tooltip title={isConnected ? 'Connected to notification server' : 'Disconnected from notification server'}>
            <Chip
              icon={<Badge variant="dot" color={isConnected ? 'success' : 'error'} />}
              label={isConnected ? 'Connected' : 'Disconnected'}
              size="small"
              color={isConnected ? 'success' : 'error'}
              variant="outlined"
            />
          </Tooltip>

          {/* Notifications Badge */}
          {notifications.length > 0 && (
            <Tooltip title={`${notifications.length} unread notifications`}>
              <Badge badgeContent={notifications.length} color="error">
                <IconButton size="small">
                  <NotificationsIcon />
                </IconButton>
              </Badge>
            </Tooltip>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={isOnline}
                onChange={(e) => toggleOnlineStatus(e.target.checked)}
                color="success"
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge
                  variant="dot"
                  color={isOnline ? 'success' : 'error'}
                  sx={{
                    '& .MuiBadge-dot': {
                      animation: isOnline ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                        '70%': { boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                      }
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Typography>
                </Badge>
              </Box>
            }
          />
          
          <IconButton onClick={() => setSettingsDialog(true)}>
            <SettingsIcon />
          </IconButton>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchConsultations}
          >
            Refresh
          </Button>
        </Box>
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

                {/* Patient Info Overlay */}
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
                    {currentCall.patient.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {formatCallDuration(callDuration)}
                  </Typography>
                </Box>

                {/* Status Indicators */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1
                  }}
                >
                  {isRecording && (
                    <Chip
                      icon={<RecordIcon />}
                      label="Recording"
                      color="error"
                      size="small"
                      sx={{ color: '#ffffff' }}
                    />
                  )}
                  {isScreenSharing && (
                    <Chip
                      icon={<ScreenShareIcon />}
                      label="Sharing Screen"
                      color="primary"
                      size="small"
                      sx={{ color: '#ffffff' }}
                    />
                  )}
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
                      color: '#ffffff',
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
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: isVideoEnabled ? alpha('#ffffff', 0.2) : 'error.dark'
                      }
                    }}
                  >
                    {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
                  <IconButton
                    onClick={toggleScreenShare}
                    sx={{
                      bgcolor: isScreenSharing ? 'primary.main' : alpha('#ffffff', 0.1),
                      color: '#ffffff',
                      '&:hover': {
                        bgcolor: isScreenSharing ? 'primary.dark' : alpha('#ffffff', 0.2)
                      }
                    }}
                  >
                    {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                  </IconButton>
                </Tooltip>

                <Tooltip title={showChat ? 'Hide chat' : 'Show chat'}>
                  <IconButton
                    onClick={() => setShowChat(!showChat)}
                    sx={{
                      bgcolor: showChat ? 'primary.main' : alpha('#ffffff', 0.1),
                      color: '#ffffff',
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
                              bgcolor: message.sender === 'doctor' ? 'primary.main' : alpha('#ffffff', 0.1),
                              color: 'white',
                              ml: message.sender === 'doctor' ? 2 : 0,
                              mr: message.sender === 'doctor' ? 0 : 2
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
        <Box sx={{ height: 'calc(100vh - 180px)', overflow: 'hidden' }}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab 
                  icon={<Badge badgeContent={waitingPatients.length} color="error"><PersonIcon /></Badge>}
                  label="Available Patients" 
                  iconPosition="start"
                />
                <Tab 
                  icon={<ScheduleIcon />} 
                  label="Scheduled Consultations"
                  iconPosition="start"
                />
                <Tab 
                  icon={<CheckCircleIcon />} 
                  label="Consultation History"
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {/* Waiting Patients Tab */}
              {activeTab === 0 && (
                <Box>
                  {waitingPatients.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No patients available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Online patients and those waiting for consultation will appear here
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {waitingPatients.map((consultation) => (
                        <Grid item xs={12} md={6} lg={4} key={consultation.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card
                              sx={{
                                border: '2px solid',
                                borderColor: consultation.status === 'available' ? 'success.main' : 'warning.main',
                                position: 'relative',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: 4,
                                  bgcolor: consultation.status === 'available' ? 'success.main' : 'warning.main',
                                  animation: 'pulse 2s infinite',
                                  '@keyframes pulse': {
                                    '0%': { opacity: 1 },
                                    '50%': { opacity: 0.5 },
                                    '100%': { opacity: 1 }
                                  }
                                }
                              }}
                            >
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Avatar
                                    src={consultation.patient.avatar}
                                    sx={{ width: 50, height: 50, mr: 2 }}
                                  >
                                    {consultation.patient.name.charAt(0)}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ mb: 0.5 }}>
                                      {consultation.patient.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Age: {consultation.patient.age}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                    <Chip 
                                      label={consultation.status === 'available' ? 'Online' : consultation.type}
                                      color={consultation.status === 'available' ? 'success' : getTypeColor(consultation.type)}
                                      size="small"
                                      sx={{ textTransform: 'capitalize' }}
                                    />
                                    {consultation.status === 'available' && (
                                      <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                        Available Now
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                <Typography variant="body2" sx={{ mb: 2 }}>
                                  <strong>Reason:</strong> {consultation.reason}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <TimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {consultation.status === 'available' 
                                      ? 'Online and ready for consultation' 
                                      : consultation.scheduledTime && !isNaN(new Date(consultation.scheduledTime))
                                        ? `Waiting for ${formatDistanceToNow(new Date(consultation.scheduledTime))}`
                                        : 'Waiting for consultation'
                                    }
                                  </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    color={consultation.status === 'available' ? 'primary' : 'success'}
                                    startIcon={<VideoCallIcon />}
                                    fullWidth
                                    onClick={() => startCall(consultation)}
                                  >
                                    {consultation.status === 'available' ? 'Call Now' : 'Start Call'}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    onClick={() => openConsultationDialog(consultation.patient)}
                                  >
                                    Details
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* Scheduled Consultations Tab */}
              {activeTab === 1 && (
                <Box>
                  {consultations.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <ScheduleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No scheduled consultations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Your upcoming consultations will appear here
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {consultations.map((consultation) => (
                        <Grid item xs={12} lg={6} key={consultation.id}>
                          <Card>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                  src={consultation.patient.avatar}
                                  sx={{ width: 50, height: 50, mr: 2 }}
                                >
                                  {consultation.patient.name.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                                    {consultation.patient.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Age: {consultation.patient.age} • {consultation.duration} mins
                                  </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Chip 
                                    label={consultation.status}
                                    color={getStatusColor(consultation.status)}
                                    size="small"
                                    sx={{ mb: 1 }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    {consultation.scheduledTime && !isNaN(new Date(consultation.scheduledTime)) 
                                      ? format(new Date(consultation.scheduledTime), 'MMM dd, HH:mm')
                                      : 'Time not set'
                                    }
                                  </Typography>
                                </Box>
                              </Box>

                              <Typography variant="body2" sx={{ mb: 2 }}>
                                <strong>Reason:</strong> {consultation.reason}
                              </Typography>

                              {consultation.notes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  <strong>Notes:</strong> {consultation.notes}
                                </Typography>
                              )}

                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  variant="contained"
                                  startIcon={<VideoCallIcon />}
                                  onClick={() => startCall(consultation)}
                                  disabled={consultation.scheduledTime > new Date()}
                                >
                                  {consultation.scheduledTime > new Date() ? 'Not Ready' : 'Start Call'}
                                </Button>
                                <Button
                                  variant="outlined"
                                  startIcon={<NotesIcon />}
                                  onClick={() => openNotesDialog(consultation)}
                                >
                                  Notes
                                </Button>
                                <Button
                                  variant="outlined"
                                  onClick={() => openConsultationDialog(consultation.patient)}
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
                </Box>
              )}

              {/* Consultation History Tab */}
              {activeTab === 2 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Consultation History
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Past consultations will be displayed here
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Patient Details Dialog */}
      <Dialog 
        open={consultationDialog.open} 
        onClose={closeConsultationDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Patient Details
        </DialogTitle>
        <DialogContent>
          {consultationDialog.patient && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                  src={consultationDialog.patient.avatar}
                  sx={{ width: 80, height: 80, mr: 3 }}
                >
                  {consultationDialog.patient.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    {consultationDialog.patient.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                    Age: {consultationDialog.patient.age}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {consultationDialog.patient.id}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Phone Number
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {consultationDialog.patient.phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Email Address
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {consultationDialog.patient.email}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recent Activity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last consultation: 2 weeks ago
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConsultationDialog}>Close</Button>
          <Button variant="contained" startIcon={<VideoCallIcon />}>
            Start Consultation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Consultation Notes Dialog */}
      <Dialog 
        open={notesDialog.open} 
        onClose={closeNotesDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Consultation Notes
        </DialogTitle>
        <DialogContent>
          {notesDialog.consultation && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {notesDialog.consultation.patient.name}
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="Enter consultation notes..."
                value={notesDialog.consultation.consultationNotes}
                onChange={(e) => {
                  // Update notes in state
                  setConsultations(prev => 
                    prev.map(c => 
                      c.id === notesDialog.consultation.id 
                        ? { ...c, consultationNotes: e.target.value }
                        : c
                    )
                  );
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNotesDialog}>Cancel</Button>
          <Button variant="contained" onClick={closeNotesDialog}>
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog 
        open={settingsDialog} 
        onClose={() => setSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Video Call Settings
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Camera & Microphone Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure your video and audio preferences for consultations
            </Typography>

            <List>
              <ListItem>
                <ListItemText primary="Default Camera On" secondary="Start calls with camera enabled" />
                <Switch defaultChecked />
              </ListItem>
              <ListItem>
                <ListItemText primary="Default Microphone On" secondary="Start calls with microphone enabled" />
                <Switch defaultChecked />
              </ListItem>
              <ListItem>
                <ListItemText primary="Noise Cancellation" secondary="Reduce background noise during calls" />
                <Switch defaultChecked />
              </ListItem>
              <ListItem>
                <ListItemText primary="Auto Record Consultations" secondary="Automatically record all consultations" />
                <Switch />
              </ListItem>
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setSettingsDialog(false)}>
            Save Settings
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
                {incomingCall.caller.role === 'patient' ? 'Patient' : incomingCall.caller.role}
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

export default OnlineConsultation;