import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Grid,
  Avatar,
  Divider,
  TextField,
  CircularProgress,
  Tooltip,
  useTheme,
  alpha,
  Card,
  CardContent,
  Badge,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  CallEnd as CallEndIcon,
  MedicalInformation as MedicalIcon
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axiosConfig';
import { motion } from 'framer-motion';
import WebRTCService from '../../services/WebRTCService';

const PatientCallPage = () => {
  const theme = useTheme();
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Check if this is audio-only mode
  const audioOnly = new URLSearchParams(location.search).get('audioOnly') === 'true';

  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // State for doctor data
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for video call
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(!audioOnly);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [screenShareEnabled, setScreenShareEnabled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connecting, setConnecting] = useState(true);

  // WebRTC state
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, connected, ended

  // Notification state
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Fetch doctor data
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);

        // Get token for the request
        const token = localStorage.getItem('token') ||
                      localStorage.getItem('userToken') ||
                      localStorage.getItem('patientToken');

        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        const { data } = await axios.get(`/api/doctors/${doctorId}`);
        setDoctor(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('Failed to load doctor data');
        setLoading(false);

        // Use mock data as fallback
        setDoctor({
          _id: doctorId,
          name: 'Doctor',
          specialization: 'General Medicine',
          email: 'doctor@example.com',
          phone: '123-456-7890'
        });
      }
    };

    fetchDoctor();
  }, [doctorId]);

  // Initialize WebRTC
  useEffect(() => {
    const initializeWebRTC = async () => {
      try {
        if (!user || !doctor) {
          console.error('User or doctor not available');
          return;
        }

        // Show connecting notification
        setNotification({
          open: true,
          message: `Connecting to ${doctor.name || 'doctor'}...`,
          severity: 'info'
        });

        // Initialize WebRTC service
        const roomId = `call-${doctorId}-${user._id || user.id}`;
        WebRTCService.initialize(user._id || user.id, doctorId, roomId);

        // Set callbacks
        WebRTCService.setCallbacks({
          onRemoteStream: (stream) => {
            console.log('Remote stream received:', stream);
            setRemoteStream(stream);

            if (remoteVideoRef.current && !audioOnly) {
              remoteVideoRef.current.srcObject = stream;
            }

            setConnecting(false);
            setCallStatus('connected');

            // Show connected notification
            setNotification({
              open: true,
              message: `Connected to ${doctor.name || 'doctor'}`,
              severity: 'success'
            });

            // Add a message to the chat
            setMessages(prev => [
              ...prev,
              {
                id: Date.now(),
                sender: 'system',
                content: `${audioOnly ? 'Voice' : 'Video'} call connected. You can now communicate with the doctor.`,
                timestamp: new Date()
              }
            ]);
          },
          onConnectionStateChange: (state) => {
            console.log('Connection state changed:', state);

            if (state === 'connected') {
              setCallStatus('connected');
              setConnecting(false);
            } else if (state === 'disconnected' || state === 'failed' || state === 'closed' || state === 'ended') {
              setCallStatus('ended');

              // Show disconnected notification
              setNotification({
                open: true,
                message: 'Call disconnected',
                severity: 'error'
              });

              // Add a message to the chat
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now(),
                  sender: 'system',
                  content: 'Call disconnected.',
                  timestamp: new Date()
                }
              ]);

              // Navigate back after a delay
              setTimeout(() => {
                navigate('/patient/dashboard');
              }, 3000);
            }
          },
          onMessage: (data) => {
            console.log('Message received:', data);

            // Add the message to the chat
            if (data.message) {
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now(),
                  sender: 'doctor',
                  content: data.message,
                  timestamp: new Date()
                }
              ]);
            }
          }
        });

        // Start the call
        const stream = await WebRTCService.startCall(audioOnly);
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Set initial states
        setVideoEnabled(!audioOnly);
        setAudioEnabled(true);

      } catch (err) {
        console.error('Error initializing WebRTC:', err);
        setError('Failed to access camera and microphone');
        setCallStatus('ended');

        // Show error notification
        setNotification({
          open: true,
          message: 'Failed to start call: ' + (err.message || 'Unknown error'),
          severity: 'error'
        });
      }
    };

    if (doctor && user) {
      initializeWebRTC();
    }

    // Cleanup function
    return () => {
      WebRTCService.cleanup();
    };
  }, [doctor, user, audioOnly, navigate, doctorId]);

  // Toggle video
  const toggleVideo = () => {
    try {
      WebRTCService.toggleVideo(!videoEnabled);
      setVideoEnabled(!videoEnabled);

      // Show notification
      setNotification({
        open: true,
        message: videoEnabled ? 'Camera turned off' : 'Camera turned on',
        severity: 'info'
      });
    } catch (err) {
      console.error('Error toggling video:', err);

      // Show error notification
      setNotification({
        open: true,
        message: 'Failed to toggle camera: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    try {
      WebRTCService.toggleAudio(!audioEnabled);
      setAudioEnabled(!audioEnabled);

      // Show notification
      setNotification({
        open: true,
        message: audioEnabled ? 'Microphone muted' : 'Microphone unmuted',
        severity: 'info'
      });
    } catch (err) {
      console.error('Error toggling audio:', err);

      // Show error notification
      setNotification({
        open: true,
        message: 'Failed to toggle microphone: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    try {
      const stream = await WebRTCService.shareScreen(!screenShareEnabled);

      if (stream && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setScreenShareEnabled(!screenShareEnabled);

      // Show notification
      setNotification({
        open: true,
        message: screenShareEnabled ? 'Screen sharing stopped' : 'Screen sharing started',
        severity: 'info'
      });
    } catch (err) {
      console.error('Error toggling screen share:', err);

      // Show error notification
      setNotification({
        open: true,
        message: 'Failed to toggle screen sharing: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // End call
  const endCall = () => {
    try {
      WebRTCService.hangup();
      setCallStatus('ended');

      // Add a message to the chat
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'system',
          content: 'Call ended.',
          timestamp: new Date()
        }
      ]);

      // Show notification
      setNotification({
        open: true,
        message: 'Call ended',
        severity: 'info'
      });

      // Navigate back after a delay
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error ending call:', err);

      // Show error notification
      setNotification({
        open: true,
        message: 'Failed to end call properly: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });

      // Force navigation back
      setTimeout(() => {
        navigate('/patient/dashboard');
      }, 3000);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!message.trim()) return;

    try {
      // Create message object
      const newMessage = {
        id: Date.now(),
        sender: 'patient',
        content: message,
        timestamp: new Date()
      };

      // Add to local messages
      setMessages(prev => [...prev, newMessage]);

      // Send via WebRTC
      WebRTCService.sendMessage(message);

      // Clear input
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);

      // Show error notification
      setNotification({
        open: true,
        message: 'Failed to send message: ' + (err.message || 'Unknown error'),
        severity: 'error'
      });
    }
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box
        sx={{
          p: 2,
          bgcolor: theme.palette.primary.main,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">
          {audioOnly ? 'Voice Call' : 'Video Call'} with {doctor?.name || 'Doctor'}
        </Typography>
        <Typography variant="body2">
          {callStatus === 'connecting' ? 'Connecting...' :
           callStatus === 'connected' ? 'Connected' : 'Call Ended'}
        </Typography>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Video area */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: 'black',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
          }}
        >
          {connecting ? (
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <CircularProgress color="inherit" sx={{ mb: 2 }} />
              <Typography>Connecting to {doctor?.name || 'Doctor'}...</Typography>
            </Box>
          ) : callStatus === 'ended' ? (
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <Typography variant="h5" gutterBottom>Call Ended</Typography>
              <Typography>Returning to dashboard...</Typography>
            </Box>
          ) : (
            <>
              {/* Remote video (doctor) - full screen */}
              {!audioOnly && (
                <Box
                  component="video"
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: remoteStream ? 'block' : 'none'
                  }}
                />
              )}

              {/* Audio-only mode display */}
              {audioOnly && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <Avatar
                    src={doctor?.avatar || doctor?.profileImage}
                    sx={{
                      width: 150,
                      height: 150,
                      fontSize: '4rem',
                      mb: 3,
                      bgcolor: theme.palette.secondary.main
                    }}
                  >
                    {doctor?.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
                  </Avatar>
                  <Typography variant="h4" gutterBottom>
                    {doctor?.name || 'Doctor'}
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.7)">
                    Voice Call in Progress
                  </Typography>
                  <Box
                    component={motion.div}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    sx={{ mt: 4, opacity: 0.7 }}
                  >
                    <MicIcon sx={{ fontSize: 40 }} />
                  </Box>
                </Box>
              )}

              {/* Local video (patient) - small overlay */}
              {!audioOnly && (
                <Box
                  sx={{
                    position: 'absolute',
                    width: 200,
                    height: 150,
                    bottom: 20,
                    right: 20,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid white'
                  }}
                >
                  <Box
                    component="video"
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)' // Mirror effect
                    }}
                  />
                  {!videoEnabled && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Typography color="white">Camera Off</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Chat sidebar */}
        {chatOpen && (
          <Box
            sx={{
              width: 300,
              bgcolor: theme.palette.background.paper,
              borderLeft: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Chat</Typography>
              <IconButton onClick={() => setChatOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider />

            {/* Messages */}
            <Box
              sx={{
                flexGrow: 1,
                p: 2,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {messages.map(msg => (
                <Box
                  key={msg.id}
                  sx={{
                    alignSelf: msg.sender === 'patient' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: msg.sender === 'patient' ? theme.palette.primary.main :
                              msg.sender === 'system' ? alpha(theme.palette.info.main, 0.1) :
                              theme.palette.grey[100],
                      color: msg.sender === 'patient' ? 'white' :
                             msg.sender === 'system' ? theme.palette.info.main :
                             'inherit'
                    }}
                  >
                    <Typography variant="body2">{msg.content}</Typography>
                  </Paper>
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {formatTime(msg.timestamp)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Message input */}
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <IconButton color="primary" onClick={sendMessage}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}

        {/* Doctor info card */}
        <Card
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            width: 300,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            borderRadius: 2
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={doctor?.avatar || doctor?.profileImage}
                sx={{ width: 50, height: 50, mr: 2, bgcolor: theme.palette.secondary.main }}
              >
                {doctor?.name ? doctor.name.charAt(0).toUpperCase() : 'D'}
              </Avatar>
              <Box>
                <Typography variant="h6">{doctor?.name || 'Doctor'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctor?.specialization || 'Specialist'}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body2">{doctor?.email || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body2">{doctor?.phone || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Controls */}
      <Box
        sx={{
          p: 2,
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        {!audioOnly && (
          <Tooltip title={videoEnabled ? "Turn Camera Off" : "Turn Camera On"}>
            <IconButton
              onClick={toggleVideo}
              sx={{
                bgcolor: videoEnabled ? alpha(theme.palette.primary.main, 0.1) : theme.palette.grey[200],
                p: 2
              }}
            >
              {videoEnabled ? <VideocamIcon color="primary" /> : <VideocamOffIcon />}
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}>
          <IconButton
            onClick={toggleAudio}
            sx={{
              bgcolor: audioEnabled ? alpha(theme.palette.primary.main, 0.1) : theme.palette.grey[200],
              p: 2
            }}
          >
            {audioEnabled ? <MicIcon color="primary" /> : <MicOffIcon />}
          </IconButton>
        </Tooltip>

        {!audioOnly && (
          <Tooltip title={screenShareEnabled ? "Stop Sharing Screen" : "Share Screen"}>
            <IconButton
              onClick={toggleScreenShare}
              sx={{
                bgcolor: screenShareEnabled ? alpha(theme.palette.primary.main, 0.1) : theme.palette.grey[200],
                p: 2
              }}
            >
              {screenShareEnabled ? <StopScreenShareIcon color="primary" /> : <ScreenShareIcon />}
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Open Chat">
          <IconButton
            onClick={() => setChatOpen(!chatOpen)}
            sx={{
              bgcolor: chatOpen ? alpha(theme.palette.primary.main, 0.1) : theme.palette.grey[200],
              p: 2
            }}
          >
            <Badge color="error" badgeContent={chatOpen ? 0 : messages.filter(m => m.sender === 'doctor').length}>
              <ChatIcon color={chatOpen ? "primary" : "inherit"} />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="End Call">
          <IconButton
            onClick={endCall}
            sx={{
              bgcolor: theme.palette.error.main,
              color: 'white',
              p: 2,
              '&:hover': {
                bgcolor: theme.palette.error.dark
              }
            }}
          >
            <CallEndIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default PatientCallPage;
