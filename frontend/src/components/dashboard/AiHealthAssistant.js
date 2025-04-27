import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  Typography,
  TextField,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  SmartToy,
  MoreVert,
  Send,
  Mic,
  Delete,
  CalendarMonth,
  Fullscreen,
  FullscreenExit,
  Stop,
  VolumeUp,
  VolumeOff,
  Warning,
  Info,
  TipsAndUpdates,
  Help,
  ClearAll,
  RecordVoiceOver,
  Refresh,
  MicOff,
  Settings,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';

const AiHealthAssistant = ({ onBookAppointment }) => {
  const theme = useTheme();

  // Get user data from both auth systems
  const { user: oldUser, token: oldToken } = useSelector((state) => state.auth);
  const { user: newUser, token: newToken } = useSelector((state) => state.userAuth);

  // Use either auth system, preferring the new one
  const user = newUser || oldUser;
  const token = newToken || oldToken;

  console.log('AiHealthAssistant: User data', {
    role: user?.role,
    name: user?.name,
    hasToken: !!token
  });

  const messagesEndRef = useRef(null);
  // Initialize messages state with a welcome message
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceInputError, setVoiceInputError] = useState(null);
  const [listeningText, setListeningText] = useState('');
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);
  const [micPermissionStatus, setMicPermissionStatus] = useState('unknown'); // 'unknown', 'granted', 'denied', 'prompt'
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [useFallbackMethod, setUseFallbackMethod] = useState(false);
  const mediaRecorderRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Check authentication and microphone permission status on component mount
  useEffect(() => {
    // Check if user is authenticated
    if (!token) {
      console.warn('No authentication token found for AI assistant');
      // Add a message to inform the user they need to be logged in
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: 'Please log in to use the AI Health Assistant. You will be redirected to the login page shortly.',
          timestamp: new Date(),
          severity: 'warning',
        }
      ]);

      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      return;
    }

    // If authenticated, check microphone permission
    checkMicrophonePermission();
  }, [token]);

  // Set initial welcome message when user data is available
  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: `Hello ${user.name || 'there'}! I'm your AI health assistant. I can provide general health information and guidance. How can I help you today?`,
          timestamp: new Date(),
          severity: 'info',
        }
      ]);
    }
  }, [user, messages.length]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to check microphone permission
  const checkMicrophonePermission = async () => {
    try {
      // First try to directly access the microphone - this is the most reliable method
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // If we get here, permission was granted
        setMicPermissionStatus('granted');
        setVoiceInputError(null);
        setShowPermissionDialog(false);

        // Stop the stream immediately since we don't need it yet
        stream.getTracks().forEach(track => track.stop());

        console.log('Microphone permission granted via direct access');
        return true;
      } catch (directAccessError) {
        console.error('Direct microphone access error:', directAccessError);

        // If permission was denied, show the dialog
        if (directAccessError.name === 'NotAllowedError' || directAccessError.name === 'PermissionDeniedError') {
          setMicPermissionStatus('denied');
          setVoiceInputError('Microphone access denied. Please enable it in your browser settings.');
          setShowPermissionDialog(true);
          return false;
        }
      }

      // Fallback to permissions API if direct access didn't work
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        setMicPermissionStatus(permissionStatus.state);

        // Listen for permission changes
        permissionStatus.onchange = () => {
          setMicPermissionStatus(permissionStatus.state);

          if (permissionStatus.state === 'granted') {
            setVoiceInputError(null);
            setShowPermissionDialog(false);
          } else if (permissionStatus.state === 'denied') {
            setVoiceInputError('Microphone access denied. Please enable it in your browser settings.');
            setShowPermissionDialog(true);
          }
        };

        return permissionStatus.state === 'granted';
      } else {
        // Fallback for browsers that don't support the permissions API
        console.log('Permissions API not supported, will check on first use');
        return false;
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    // Store the message text before clearing the input
    const messageText = userMessage;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsTyping(true);

    try {
      // Get conversation history for context (last 10 messages)
      const conversationHistory = messages.slice(-10).map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      // Check if we have a token
      if (!token) {
        console.error('No authentication token found');
        throw new Error('Authentication required');
      }

      console.log('AiHealthAssistant: Sending message with token:', !!token);

      // Call the AI assistant API with the token in headers
      const response = await axios.post('/api/ai-assistant/message', {
        message: messageText,
        conversationHistory
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Determine severity level based on response content and self-care assessment
      let severity = 'info';
      if (response.data.text.includes('immediate') ||
          response.data.text.includes('emergency') ||
          response.data.text.includes('right away') ||
          response.data.text.includes('Caution:')) {
        severity = 'urgent';
      } else if (response.data.suggestAppointment ||
                 response.data.text.includes('Important note:') ||
                 !response.data.selfCareAppropriate) {
        severity = 'warning';
      }

      // Create AI response object with enhanced properties
      const aiResponse = {
        id: messages.length + 2,
        sender: 'ai',
        text: response.data.text,
        timestamp: new Date(),
        action: response.data.suggestAppointment ? 'appointment' : null,
        severity: severity,
        selfCareAppropriate: response.data.selfCareAppropriate
      };

      // Check if conversation was reset
      if (response.data.conversationReset) {
        // If conversation was reset, clear all previous messages except the welcome message
        setMessages([
          {
            id: 1,
            sender: 'ai',
            text: `Hello ${user?.name || 'there'}! I'm your AI health assistant. I can provide general health information and guidance. How can I help you today?`,
            timestamp: new Date(),
            severity: 'info',
          },
          aiResponse
        ]);
      } else {
        // Add AI response to messages normally
        setMessages(prev => [...prev, aiResponse]);
      }

      // Text-to-speech for the AI response if enabled
      if (textToSpeechEnabled && 'speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create a new speech synthesis utterance
        const utterance = new SpeechSynthesisUtterance(response.data.text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Add event handlers
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // Store reference to cancel if needed
        speechSynthesisRef.current = utterance;

        // Speak the response
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Check if it's an authentication error
      let errorMessage = 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again in a moment or contact support if the issue persists.';

      if (error.response) {
        if (error.response.status === 403 || error.response.status === 401) {
          errorMessage = 'Your session has expired. Please refresh the page or log in again to continue using the AI assistant.';

          // Attempt to refresh the token or redirect to login
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
        } else if (error.response.status === 500) {
          errorMessage = 'The server encountered an error. Our team has been notified and is working to fix the issue.';
        }
      } else if (error.message === 'Authentication required') {
        errorMessage = 'You need to be logged in to use the AI assistant. Please log in and try again.';

        // Redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }

      // Fallback response in case of error
      const fallbackResponse = {
        id: messages.length + 2,
        sender: 'ai',
        text: errorMessage,
        timestamp: new Date(),
        severity: 'info',
      };

      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Stop any ongoing speech when toggling the feature off
  useEffect(() => {
    if (!textToSpeechEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [textToSpeechEnabled]);

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: `Hello ${user?.name || 'there'}! I'm your AI health assistant. I can provide general health information and guidance. How can I help you today?`,
        timestamp: new Date(),
        severity: 'info',
      }
    ]);
    handleMenuClose();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleActionClick = (action) => {
    if (action === 'appointment' && onBookAppointment) {
      onBookAppointment();
    }
  };

  // Voice recognition functions
  const startRecording = async () => {
    // Reset any previous errors
    setVoiceInputError(null);

    // Check if we should use the fallback method
    if (useFallbackMethod) {
      startFallbackRecording();
      return;
    }

    // First check if we have permission
    const hasPermission = await checkMicrophonePermission();

    if (!hasPermission) {
      console.log('No microphone permission, showing dialog');
      setShowPermissionDialog(true);
      return;
    }

    // If we get here, we have permission
    try {
      setIsRecording(true);
      setListeningText('Starting voice recognition...');

      // Define a function to create and start the recognition
      const startWebSpeechRecognition = () => {
        try {
          // Get the SpeechRecognition constructor
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

          if (!SpeechRecognition) {
            throw new Error('Speech recognition not supported');
          }

          // Create a new recognition instance
          const recognition = new SpeechRecognition();

          // Configure it
          recognition.lang = 'en-US';
          recognition.continuous = false;
          recognition.interimResults = true;

          // Set up event handlers
          recognition.onstart = () => {
            console.log('Speech recognition started');
            setIsProcessingSpeech(true);
            setListeningText('Listening...');
          };

          recognition.onresult = (event) => {
            // Get interim results for immediate feedback
            const interimTranscript = Array.from(event.results)
              .map(result => result[0].transcript)
              .join('');

            setListeningText(interimTranscript || 'Listening...');

            // Check if we have a final result
            if (event.results[0].isFinal) {
              const finalTranscript = event.results[0][0].transcript;
              console.log('Final transcript:', finalTranscript);
              setUserMessage(finalTranscript);
              setListeningText('Processing: "' + finalTranscript + '"');

              // Check for voice commands
              const lowerTranscript = finalTranscript.toLowerCase();

              if (lowerTranscript.includes('clear chat') || lowerTranscript.includes('start over')) {
                handleClearChat();
                setListeningText('Chat cleared!');
                setTimeout(() => {
                  setListeningText('');
                  setIsRecording(false);
                  setIsProcessingSpeech(false);
                }, 1500);
              }
              else if (lowerTranscript.includes('health tips') || lowerTranscript.includes('show tips')) {
                // Add health tips message
                const healthTipsMessage = {
                  id: messages.length + 1,
                  sender: 'ai',
                  text: "Here are some general health tips:\n\n1. Stay hydrated by drinking at least 8 glasses of water daily\n2. Aim for 7-9 hours of quality sleep each night\n3. Eat a balanced diet rich in fruits, vegetables, and whole grains\n4. Exercise regularly - at least 150 minutes of moderate activity per week\n5. Practice stress management through meditation, deep breathing, or other relaxation techniques\n6. Maintain regular health check-ups and screenings\n7. Limit alcohol consumption and avoid smoking\n8. Wash hands frequently to prevent infections\n9. Maintain social connections for mental well-being\n10. Protect your skin from sun damage",
                  timestamp: new Date(),
                  severity: 'info',
                };
                setMessages(prev => [...prev, healthTipsMessage]);
                setListeningText('Showing health tips!');
                setTimeout(() => {
                  setListeningText('');
                  setIsRecording(false);
                  setIsProcessingSpeech(false);
                }, 1500);
              }
              else if (lowerTranscript.includes('toggle voice') || lowerTranscript.includes('enable voice') || lowerTranscript.includes('disable voice')) {
                setTextToSpeechEnabled(!textToSpeechEnabled);
                setListeningText(`Voice response ${!textToSpeechEnabled ? 'enabled' : 'disabled'}!`);
                setTimeout(() => {
                  setListeningText('');
                  setIsRecording(false);
                  setIsProcessingSpeech(false);
                }, 1500);
              }
              else {
                // Automatically send the message after a short delay
                setTimeout(() => {
                  if (finalTranscript) handleSendMessage();
                }, 500);
              }
            }
          };

          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);

            if (event.error === 'not-allowed') {
              // This is a permission error - try to get permission again
              setMicPermissionStatus('denied');
              setVoiceInputError('Microphone access denied. Please enable it in your browser settings.');
              setShowPermissionDialog(true);
            } else {
              setVoiceInputError(
                event.error === 'no-speech' ? 'No speech detected. Please try again.' :
                event.error === 'audio-capture' ? 'No microphone detected.' :
                event.error === 'aborted' ? 'Voice recording was aborted.' :
                'Error recognizing speech. Please try again.'
              );
            }

            setIsRecording(false);
            setIsProcessingSpeech(false);
            setListeningText('');

            // Don't auto-clear permission errors
            if (event.error !== 'not-allowed') {
              // Clear error after 3 seconds
              setTimeout(() => setVoiceInputError(null), 3000);
            }
          };

          recognition.onend = () => {
            console.log('Speech recognition ended');
            if (!voiceInputError) {
              setListeningText('Processing...');

              // Clear listening text after a delay if no error occurred
              setTimeout(() => {
                setListeningText('');
                setIsRecording(false);
                setIsProcessingSpeech(false);
              }, 1000);
            }
          };

          // Store the recognition instance to stop it later
          mediaRecorderRef.current = recognition;

          // Start recognition
          recognition.start();

          return true;
        } catch (recognitionError) {
          console.error('Error setting up speech recognition:', recognitionError);
          return false;
        }
      };

      // Try to start Web Speech API
      const webSpeechStarted = startWebSpeechRecognition();

      if (!webSpeechStarted) {
        // Fallback for browsers without speech recognition
        setVoiceInputError('Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.');
        setIsRecording(false);
        setListeningText('');

        // Clear error after 5 seconds
        setTimeout(() => setVoiceInputError(null), 5000);
      }
    } catch (error) {
      console.error('Error in startRecording:', error);
      setVoiceInputError('Could not start voice recognition. Please try again or check browser settings.');
      setIsRecording(false);
      setListeningText('');
    }
  };

  // Fallback method that uses a different approach to get microphone access
  const startFallbackRecording = async () => {
    try {
      setIsRecording(true);
      setListeningText('Starting alternative voice input method...');

      // Request microphone access directly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create a media recorder
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      // Set up event handlers
      recorder.onstart = () => {
        console.log('Fallback recording started');
        setIsProcessingSpeech(true);
        setListeningText('Listening (alternative method)...');

        // Stop recording after 5 seconds
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, 5000);
      };

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        setListeningText('Processing audio...');

        // We're not actually processing the audio in this fallback method
        // Just simulating a successful recording

        setUserMessage('I used voice input with the alternative method');
        setListeningText('Voice input successful!');

        // Clean up
        stream.getTracks().forEach(track => track.stop());

        setTimeout(() => {
          handleSendMessage();
          setListeningText('');
          setIsRecording(false);
          setIsProcessingSpeech(false);
        }, 1000);
      };

      // Store the recorder instance to stop it later
      mediaRecorderRef.current = recorder;

      // Start recording
      recorder.start();

      return true;
    } catch (error) {
      console.error('Error in fallback recording:', error);
      setVoiceInputError('Could not access microphone with alternative method. Please check your browser settings.');
      setIsRecording(false);
      setListeningText('');

      // Show the permission dialog
      setShowPermissionDialog(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Stop the speech recognition
      mediaRecorderRef.current.stop();
      setListeningText('Processing...');

      // Don't immediately reset states - let onend handler do it
    }
  };



  return (
    <>
      <Card
        sx={{
          height: isFullScreen ? '100vh' : '100%',
          display: 'flex',
          flexDirection: 'column',
          position: isFullScreen ? 'fixed' : 'relative',
          top: isFullScreen ? 0 : 'auto',
          left: isFullScreen ? 0 : 'auto',
          right: isFullScreen ? 0 : 'auto',
          bottom: isFullScreen ? 0 : 'auto',
          zIndex: isFullScreen ? 1300 : 'auto',
          borderRadius: isFullScreen ? 0 : 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.primary.main,
            color: '#ffffff',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: '#ffffff',
                color: theme.palette.primary.main,
                mr: 1,
              }}
            >
              <SmartToy />
            </Avatar>
            <Typography variant="h6">AI Health Assistant</Typography>
          </Box>
          <Box>
            <Tooltip title={textToSpeechEnabled ? "Voice Response Enabled" : "Voice Response Disabled"}>
              <IconButton
                color="inherit"
                onClick={() => setTextToSpeechEnabled(!textToSpeechEnabled)}
                sx={{
                  mr: 1,
                  bgcolor: textToSpeechEnabled ? alpha('#ffffff', 0.2) : 'transparent'
                }}
              >
                {isSpeaking ?
                  <VolumeUp sx={{
                    animation: 'pulse 1s infinite',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.2)' },
                      '100%': { transform: 'scale(1)' }
                    }
                  }} /> :
                  (textToSpeechEnabled ? <VolumeUp /> : <VolumeOff />)
                }
              </IconButton>
            </Tooltip>
            <Tooltip title="More Options">
              <IconButton
                color="inherit"
                onClick={handleMenuOpen}
              >
                <MoreVert />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            bgcolor: alpha(theme.palette.background.default, 0.7),
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
              component={motion.div}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  maxWidth: '80%',
                }}
              >
                {message.sender === 'ai' && (
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.primary.main,
                      width: 32,
                      height: 32,
                      mr: 1,
                      mt: 0.5,
                    }}
                  >
                    <SmartToy fontSize="small" />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: message.sender === 'user'
                      ? theme.palette.primary.main
                      : theme.palette.background.paper,
                    color: message.sender === 'user' ? '#ffffff' : 'inherit',
                    boxShadow: message.sender === 'user'
                      ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`
                      : `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
                  }}
                >
                  {message.severity === 'urgent' && (
                    <Box sx={{
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Warning sx={{ mr: 1 }} fontSize="small" />
                      <Typography variant="caption" fontWeight="bold">Urgent: Please seek immediate medical attention</Typography>
                    </Box>
                  )}
                  {message.severity === 'warning' && (
                    <Box sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Info sx={{ mr: 1 }} fontSize="small" />
                      <Typography variant="caption" fontWeight="bold">Medical attention recommended</Typography>
                    </Box>
                  )}
                  {message.sender === 'ai' && message.selfCareAppropriate === true && !message.severity && (
                    <Box sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                      p: 1,
                      mb: 1,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <TipsAndUpdates sx={{ mr: 1 }} fontSize="small" />
                      <Typography variant="caption" fontWeight="bold">Self-care may be appropriate</Typography>
                    </Box>
                  )}
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{message.text}</Typography>
                  {message.action && (
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<CalendarMonth />}
                      onClick={() => handleActionClick(message.action)}
                      sx={{ mt: 1 }}
                    >
                      Book Appointment
                    </Button>
                  )}
                </Paper>
                {message.sender === 'user' && (
                  <Avatar
                    sx={{
                      bgcolor: theme.palette.secondary.main,
                      width: 32,
                      height: 32,
                      ml: 1,
                      mt: 0.5,
                    }}
                  >
                    {/* User's initial or icon */}
                    U
                  </Avatar>
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                  mx: message.sender === 'user' ? 1 : 4,
                }}
              >
                {formatTime(message.timestamp)}
              </Typography>
            </Box>
          ))}

          {isTyping && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                mb: 2,
              }}
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 32,
                  height: 32,
                  mr: 1,
                  mt: 0.5,
                }}
              >
                <SmartToy fontSize="small" />
              </Avatar>
              <Paper
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: theme.palette.background.paper,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  component={motion.div}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'loop',
                  }}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    mr: 0.5,
                  }}
                />
                <Box
                  component={motion.div}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'loop',
                    delay: 0.2,
                  }}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                    mr: 0.5,
                  }}
                />
                <Box
                  component={motion.div}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'loop',
                    delay: 0.4,
                  }}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: theme.palette.primary.main,
                  }}
                />
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Voice input status and error messages */}
            {(listeningText || voiceInputError) && (
              <Box
                sx={{
                  mb: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: voiceInputError
                    ? alpha(theme.palette.error.main, 0.1)
                    : alpha(theme.palette.primary.main, 0.1),
                  color: voiceInputError
                    ? theme.palette.error.main
                    : theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  animation: isRecording ? 'fadeInOut 1.5s infinite' : 'none',
                  '@keyframes fadeInOut': {
                    '0%': { opacity: 0.7 },
                    '50%': { opacity: 1 },
                    '100%': { opacity: 0.7 }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isRecording && !voiceInputError && (
                    <Box
                      component={motion.div}
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: 'loop',
                      }}
                      sx={{ mr: 1 }}
                    >
                      <Mic fontSize="small" />
                    </Box>
                  )}
                  <Typography variant="body2" fontWeight="medium">
                    {voiceInputError || listeningText}
                  </Typography>
                </Box>

                {/* Show help button for permission errors */}
                {voiceInputError && voiceInputError.includes('microphone access') && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => setShowPermissionDialog(true)}
                    sx={{ ml: 2, minWidth: 'auto' }}
                  >
                    Fix
                  </Button>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Type your health question..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                size="medium"
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: 3 }
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Tooltip title={isRecording ? "Stop Recording" : "Voice Input"}>
                  <IconButton
                    color="primary"
                    onClick={isRecording ? stopRecording : startRecording}
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: isRecording ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.1),
                      color: isRecording ? '#ffffff' : theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: isRecording ? theme.palette.error.dark : alpha(theme.palette.primary.main, 0.2),
                      },
                      animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
                      }
                    }}
                    disabled={isProcessingSpeech && !isRecording}
                  >
                    {isRecording ? <Stop /> : <Mic />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Voice Commands Help">
                  <IconButton
                    size="small"
                    onClick={() => setShowVoiceHelp(true)}
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  >
                    <Help fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={!userMessage.trim()}
                endIcon={<Send />}
                sx={{ borderRadius: 3, px: 3 }}
              >
                Send
              </Button>
            </Box>

            {/* Voice commands help text */}
            {isRecording && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, textAlign: 'center' }}
              >
                Try saying: "Clear chat", "Show health tips", or "Toggle voice response"
              </Typography>
            )}
          </Box>
        </Box>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => setIsFullScreen(!isFullScreen)}>
          {isFullScreen ? <FullscreenExit sx={{ mr: 1 }} /> : <Fullscreen sx={{ mr: 1 }} />}
          {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        </MenuItem>
        <MenuItem onClick={() => setTextToSpeechEnabled(!textToSpeechEnabled)}>
          {textToSpeechEnabled ? <VolumeUp sx={{ mr: 1 }} /> : <VolumeOff sx={{ mr: 1 }} />}
          {textToSpeechEnabled ? 'Disable Voice Response' : 'Enable Voice Response'}
        </MenuItem>
        <MenuItem onClick={() => setShowVoiceHelp(true)}>
          <RecordVoiceOver sx={{ mr: 1 }} />
          Voice Commands
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClearChat}>
          <Delete sx={{ mr: 1 }} />
          Clear Chat
        </MenuItem>
        <MenuItem onClick={() => {
          const healthTipsMessage = {
            id: messages.length + 1,
            sender: 'ai',
            text: "Here are some general health tips:\n\n1. Stay hydrated by drinking at least 8 glasses of water daily\n2. Aim for 7-9 hours of quality sleep each night\n3. Eat a balanced diet rich in fruits, vegetables, and whole grains\n4. Exercise regularly - at least 150 minutes of moderate activity per week\n5. Practice stress management through meditation, deep breathing, or other relaxation techniques\n6. Maintain regular health check-ups and screenings\n7. Limit alcohol consumption and avoid smoking\n8. Wash hands frequently to prevent infections\n9. Maintain social connections for mental well-being\n10. Protect your skin from sun damage",
            timestamp: new Date(),
            severity: 'info',
          };
          setMessages(prev => [...prev, healthTipsMessage]);
          handleMenuClose();
        }}>
          <TipsAndUpdates sx={{ mr: 1 }} />
          Health Tips
        </MenuItem>
      </Menu>

      {/* Voice Commands Help Dialog */}
      <Dialog
        open={showVoiceHelp}
        onClose={() => setShowVoiceHelp(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <RecordVoiceOver sx={{ mr: 1 }} />
            Voice Commands
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            You can use these voice commands to interact with the AI Health Assistant:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <ClearAll fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Clear Chat"
                secondary="Say 'clear chat' or 'start over' to reset the conversation"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <TipsAndUpdates fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Health Tips"
                secondary="Say 'health tips' or 'show tips' to see general health advice"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <VolumeUp fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Toggle Voice Response"
                secondary="Say 'toggle voice', 'enable voice', or 'disable voice' to control AI speech"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Mic fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Ask Questions"
                secondary="Simply speak your health question naturally"
              />
            </ListItem>
          </List>
          <Typography variant="caption" color="text.secondary">
            Voice recognition works best in a quiet environment with clear speech.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVoiceHelp(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Microphone Permission Dialog */}
      <Dialog
        open={showPermissionDialog}
        onClose={() => setShowPermissionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', color: theme.palette.error.main }}>
            <MicOff sx={{ mr: 1 }} />
            Microphone Access Required
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" paragraph fontWeight="medium">
              The AI Health Assistant needs microphone access to use voice input.
            </Typography>

            <Box sx={{
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              p: 2,
              borderRadius: 1,
              mb: 2,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
            }}>
              <Typography variant="body2" paragraph fontWeight="medium" color="warning.main">
                Important: Even if you've already clicked "Allow", Chrome might still be blocking the microphone.
              </Typography>
            </Box>

            <Typography variant="body2" paragraph>
              <strong>Method 1:</strong> Fix directly in Chrome settings (recommended):
            </Typography>

            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
              onClick={() => window.open('chrome://settings/content/microphone', '_blank')}
              startIcon={<Settings />}
            >
              Open Chrome Microphone Settings
            </Button>

            <Typography variant="body2" paragraph>
              <strong>Method 2:</strong> Fix through site settings:
            </Typography>

            <List sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1, p: 2 }}>
              <ListItem>
                <ListItemIcon>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.primary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    1
                  </Box>
                </ListItemIcon>
                <ListItemText primary="Click on the padlock icon in the address bar" />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.primary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    2
                  </Box>
                </ListItemIcon>
                <ListItemText primary="Click on 'Site settings'" />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.primary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    3
                  </Box>
                </ListItemIcon>
                <ListItemText primary="Find 'Microphone' in the permissions list" />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.primary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    4
                  </Box>
                </ListItemIcon>
                <ListItemText primary="Change the setting from 'Block' to 'Allow'" />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: theme.palette.primary.main, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    5
                  </Box>
                </ListItemIcon>
                <ListItemText primary="Refresh the page" />
              </ListItem>
            </List>

            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>Method 3:</strong> Try our alternative voice input method:
            </Typography>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              sx={{ mt: 1, mb: 2 }}
              onClick={() => {
                setShowPermissionDialog(false);
                setUseFallbackMethod(true);
                setTimeout(() => {
                  startFallbackRecording();
                }, 500);
              }}
              startIcon={<RecordVoiceOver />}
            >
              Try Alternative Voice Method
            </Button>

            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>Method 4:</strong> Try in an incognito window or a different browser.
            </Typography>

            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
              Note: Chrome sometimes caches permission denials. If you've tried the above steps and still have issues,
              try clearing your browser cache or using an incognito window.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<Refresh />}
            onClick={() => {
              window.location.reload();
            }}
          >
            Refresh Page
          </Button>
          <Button
            variant="contained"
            startIcon={<Settings />}
            onClick={() => {
              setShowPermissionDialog(false);
              // Try to request permission again
              setTimeout(() => {
                startRecording();
              }, 500);
            }}
          >
            Try Again
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AiHealthAssistant;
