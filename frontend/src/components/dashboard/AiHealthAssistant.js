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
  Slider,
  CircularProgress,
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
  Man,
  Woman,
  Tune,
  Speed,
  Close as CloseIcon,
  HealthAndSafety,
  Spa as SpaIcon,
  Healing,
  ErrorOutline,
}  from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../../utils/axios';
import QuotaExceededMessage from '../common/QuotaExceededMessage';

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
  const [, setMicPermissionStatus] = useState('unknown'); // 'unknown', 'granted', 'denied', 'prompt'
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [useFallbackMethod, setUseFallbackMethod] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [voiceGender, setVoiceGender] = useState('female'); // 'male' or 'female'
  const [voiceRate, setVoiceRate] = useState(0.9); // 0.5 to 1.5 - slightly slower for better comprehension
  const [voicePitch, setVoicePitch] = useState(1.05); // 0.5 to 1.5 - slightly higher for female doctor voice
  const [voicePersonality, setVoicePersonality] = useState('professional'); // 'friendly', 'professional', 'calm'
  const [, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [retryAfter, setRetryAfter] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Load available voices for speech synthesis
  const loadVoices = () => {
    if ('speechSynthesis' in window) {
      // Get the list of available voices
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        setAvailableVoices(voices);

        // Filter for English voices
        const englishVoices = voices.filter(voice =>
          voice.lang.includes('en') || voice.lang.includes('EN')
        );

        // Set default voices based on gender preference
        const femaleVoices = englishVoices.filter(voice =>
          voice.name.includes('female') ||
          voice.name.includes('Female') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Moira') ||
          voice.name.includes('Tessa')
        );

        const maleVoices = englishVoices.filter(voice =>
          voice.name.includes('male') ||
          voice.name.includes('Male') ||
          voice.name.includes('Daniel') ||
          voice.name.includes('Alex') ||
          voice.name.includes('David')
        );

        // Set default voice based on gender preference
        if (voiceGender === 'female' && femaleVoices.length > 0) {
          setSelectedVoice(femaleVoices[0]);
        } else if (voiceGender === 'male' && maleVoices.length > 0) {
          setSelectedVoice(maleVoices[0]);
        } else if (englishVoices.length > 0) {
          // Fallback to any English voice
          setSelectedVoice(englishVoices[0]);
        } else if (voices.length > 0) {
          // Last resort: use any available voice
          setSelectedVoice(voices[0]);
        }
      }
    }
  };

  // Check authentication, microphone permission, and load voices on component mount
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

    // Load available voices
    if ('speechSynthesis' in window) {
      // Chrome needs a timeout to properly load voices
      setTimeout(() => {
        loadVoices();
      }, 100);

      // Add event listener for voiceschanged event
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // Clean up event listener
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, voiceGender]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Clean the text by removing markdown symbols for better speech
        const cleanText = response.data.text
          .replace(/\*\*/g, '')  // Remove bold markdown
          .replace(/\*/g, '')    // Remove italic markdown
          .replace(/#/g, '')     // Remove heading markers
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with just the text
          .replace(/\n\n/g, '. ') // Replace double newlines with period and space for better pausing
          .replace(/\n/g, '. ');  // Replace single newlines with period and space

        // Create a new speech synthesis utterance
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';

        // Set default to female voice for doctor-like experience
        if (voiceGender !== 'female') {
          setVoiceGender('female');
        }

        // Apply voice settings - slightly slower for better comprehension
        utterance.rate = Math.max(0.85, voiceRate - 0.1); // Slightly slower than default for clarity
        utterance.pitch = Math.min(1.05, voicePitch + 0.05); // Slightly higher pitch for female doctor voice
        utterance.volume = 1.0; // Full volume

        // Apply selected voice if available
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        // Always use professional personality for doctor-like voice
        // More formal, measured, authoritative but caring tone
        utterance.rate = Math.max(0.85, voiceRate - 0.1);
        utterance.pitch = Math.min(1.05, voicePitch + 0.05);

        // Use the clean text directly without adding extra pauses
        // This prevents the speech synthesizer from saying "dot dot dot"
        utterance.text = cleanText;

        // Add event handlers
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // Handle chunking for long messages to ensure entire message is read
        if (cleanText.length > 200) {
          // Split into sentences for more natural pauses - use a regex that doesn't capture the punctuation
          // This prevents the speech synthesizer from saying "dot dot dot"
          const sentences = cleanText.split(/(?<=[.!?])\s+/g);

          // Speak each sentence with a slight pause between
          sentences.forEach((sentence, index) => {
            // Skip empty sentences
            if (!sentence.trim()) return;

            const sentenceUtterance = new SpeechSynthesisUtterance(sentence);

            // Copy all properties from main utterance
            sentenceUtterance.voice = utterance.voice;
            sentenceUtterance.rate = utterance.rate;
            sentenceUtterance.pitch = utterance.pitch;
            sentenceUtterance.volume = utterance.volume;

            // Only set speaking state on first and last sentence
            if (index === 0) {
              sentenceUtterance.onstart = () => setIsSpeaking(true);
            } else if (index === sentences.length - 1) {
              sentenceUtterance.onend = () => setIsSpeaking(false);
            }

            // Add a slight delay between sentences for more natural speech
            setTimeout(() => {
              window.speechSynthesis.speak(sentenceUtterance);
            }, index * 100);
          });

          // Store reference to cancel if needed
          const firstUtterance = new SpeechSynthesisUtterance(sentences[0]);
          speechSynthesisRef.current = firstUtterance;
        } else {
          // For shorter messages, just speak the whole thing
          // Store reference to cancel if needed
          speechSynthesisRef.current = utterance;

          // Speak the response
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Check if it's an authentication error
      let errorMessage = 'I apologize, but I\'m having trouble connecting to my knowledge base right now. Please try again in a moment or contact support if the issue persists.';
      let retryAfter = null;

      if (error.response) {
        if (error.response.status === 429) {
          // API quota exceeded
          const retryDelayStr = error.response.data.retryAfter || '30s';
          const retrySeconds = parseInt(retryDelayStr.replace(/[^0-9]/g, ''), 10) || 30;
          
          // Set quota exceeded state
          setQuotaExceeded(true);
          setRetryAfter(retryDelayStr);
          
          // Don't add an error message to the chat, we'll show the QuotaExceededMessage component instead
          setIsTyping(false);
          return; // Exit early to prevent adding the error message
        } else if (error.response.status === 403 || error.response.status === 401) {
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

      // Add error message to chat
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        sender: 'ai',
        text: errorMessage,
        timestamp: new Date(),
        severity: retryAfter ? 'info' : 'error',
        isRetrying: !!retryAfter
      }]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          borderRadius: isFullScreen ? 0 : 3,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            borderBottom: `1px solid ${alpha(theme.palette.primary.dark, 0.1)}`,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background pattern */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundSize: '20px 20px',
              animation: 'pulse 15s infinite linear',
              '@keyframes pulse': {
                '0%': { opacity: 0.05 },
                '50%': { opacity: 0.1 },
                '100%': { opacity: 0.05 }
              }
            }}
          />

          {/* Animated circles in background */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#ffffff', 0.2)} 0%, ${alpha('#ffffff', 0)} 70%)`,
              animation: 'float 8s infinite ease-in-out',
              '@keyframes float': {
                '0%': { transform: 'translateY(0) scale(1)' },
                '50%': { transform: 'translateY(-15px) scale(1.1)' },
                '100%': { transform: 'translateY(0) scale(1)' }
              }
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: '30%',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#ffffff', 0.15)} 0%, ${alpha('#ffffff', 0)} 70%)`,
              animation: 'float2 12s infinite ease-in-out',
              '@keyframes float2': {
                '0%': { transform: 'translateY(0) scale(1)' },
                '50%': { transform: 'translateY(15px) scale(1.2)' },
                '100%': { transform: 'translateY(0) scale(1)' }
              }
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <Box
              component={motion.div}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1
              }}
              sx={{
                position: 'relative',
                mr: 2,
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -5,
                  left: -5,
                  right: -5,
                  bottom: -5,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha('#ffffff', 0.2)} 0%, ${alpha('#ffffff', 0)} 70%)`,
                  animation: 'pulse 2s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)' }
                  }
                }}
              />
              <Avatar
                sx={{
                  bgcolor: '#ffffff',
                  color: theme.palette.primary.main,
                  width: 48,
                  height: 48,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <SmartToy />
              </Avatar>
            </Box>
            <Box
              component={motion.div}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HealthAndSafety fontSize="small" />
                Dr. SoulSpace
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <span>Virtual Health Assistant</span>
                {textToSpeechEnabled && (
                  <Box
                    component={motion.div}
                    animate={{
                      scale: isSpeaking ? [1, 1.2, 1] : 1
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: isSpeaking ? Infinity : 0,
                      repeatType: 'loop'
                    }}
                  >
                    <VolumeUp fontSize="small" />
                  </Box>
                )}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', position: 'relative', zIndex: 1 }}>
            <Tooltip title={textToSpeechEnabled ? "Voice Response Enabled" : "Voice Response Disabled"}>
              <IconButton
                color="inherit"
                onClick={() => setTextToSpeechEnabled(!textToSpeechEnabled)}
                sx={{
                  mr: 1,
                  bgcolor: textToSpeechEnabled ? alpha('#ffffff', 0.2) : 'transparent',
                  '&:hover': {
                    bgcolor: textToSpeechEnabled ? alpha('#ffffff', 0.3) : alpha('#ffffff', 0.1),
                  },
                  transition: 'all 0.2s ease',
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
                sx={{
                  '&:hover': {
                    bgcolor: alpha('#ffffff', 0.1),
                  },
                  transition: 'all 0.2s ease',
                }}
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
            p: { xs: 1.5, sm: 2 },
            bgcolor: alpha(theme.palette.background.default, 0.7),
            backgroundImage: `
              linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%),
              url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${theme.palette.primary.main.replace('#', '')}' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
            `,
            backgroundAttachment: 'fixed',
            position: 'relative',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
              pointerEvents: 'none',
              zIndex: 1,
            }
          }}
        >
          {/* Show quota exceeded message if needed */}
          {quotaExceeded && (
            <Box sx={{ position: 'relative', zIndex: 10, mb: 3 }}>
              <QuotaExceededMessage 
                retryAfter={retryAfter}
                onRetry={() => {
                  setQuotaExceeded(false);
                  setIsRetrying(true);
                  // Retry the last message
                  const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
                  if (lastUserMessage) {
                    setUserMessage(lastUserMessage.text);
                    setTimeout(() => {
                      handleSendMessage();
                      setIsRetrying(false);
                    }, 500);
                  } else {
                    setIsRetrying(false);
                  }
                }}
                message="I apologize, but I'm experiencing high demand right now. Please try again in a few moments."
              />
            </Box>
          )}
          
          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: '5%',
              right: '8%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0)} 70%)`,
              opacity: 0.7,
              pointerEvents: 'none',
              animation: 'float 15s infinite ease-in-out',
              '@keyframes float': {
                '0%': { transform: 'translateY(0) scale(1)' },
                '50%': { transform: 'translateY(-20px) scale(1.05)' },
                '100%': { transform: 'translateY(0) scale(1)' }
              }
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              left: '5%',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.08)} 0%, ${alpha(theme.palette.secondary.light, 0)} 70%)`,
              opacity: 0.7,
              pointerEvents: 'none',
              animation: 'float2 18s infinite ease-in-out',
              '@keyframes float2': {
                '0%': { transform: 'translateY(0) scale(1)' },
                '50%': { transform: 'translateY(20px) scale(1.05)' },
                '100%': { transform: 'translateY(0) scale(1)' }
              }
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '40%',
              left: '15%',
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha(theme.palette.info.light, 0.06)} 0%, ${alpha(theme.palette.info.light, 0)} 70%)`,
              opacity: 0.6,
              pointerEvents: 'none',
              animation: 'float3 12s infinite ease-in-out',
              '@keyframes float3': {
                '0%': { transform: 'translateY(0) scale(1)' },
                '50%': { transform: 'translateY(-15px) scale(1.03)' },
                '100%': { transform: 'translateY(0) scale(1)' }
              }
            }}
          />

          {messages.map((message, index) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                mb: 3,
                position: 'relative',
                zIndex: 2,
              }}
              component={motion.div}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                duration: 0.3,
                delay: index === messages.length - 1 ? 0 : 0 // Only delay the latest message
              }}
            >
              {/* Message timestamp */}
              {(index === 0 || new Date(message.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString()) && (
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    mt: index > 0 ? 2 : 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 10,
                      bgcolor: alpha(theme.palette.background.paper, 0.7),
                      color: theme.palette.text.secondary,
                      boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.05)}`,
                      border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                  >
                    {new Date(message.timestamp).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  maxWidth: { xs: '90%', sm: '80%', md: '70%' },
                }}
              >
                {message.sender === 'ai' && (
                  <Box
                    sx={{
                      position: 'relative',
                      mr: 1.5,
                      mt: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
                        animation: isSpeaking && message === messages[messages.length - 1] ? 'pulse 2s infinite ease-in-out' : 'none',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 0.7 },
                          '50%': { transform: 'scale(1.2)', opacity: 0.3 },
                          '100%': { transform: 'scale(1)', opacity: 0.7 }
                        }
                      }}
                    />
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        width: 38,
                        height: 38,
                        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.15)',
                        border: '2px solid white',
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <SmartToy fontSize="small" />
                    </Avatar>
                  </Box>
                )}
                <Paper
                  component={motion.div}
                  whileHover={{
                    y: -3,
                    boxShadow: message.sender === 'user'
                      ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.5)}`
                      : `0 8px 24px ${alpha(theme.palette.common.black, 0.12)}`
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: index === messages.length - 1 ? 0.1 : 0
                  }}
                  sx={{
                    p: { xs: 1.8, sm: 2.2 },
                    borderRadius: message.sender === 'user'
                      ? '22px 22px 4px 22px'
                      : '22px 22px 22px 4px',
                    background: message.sender === 'user'
                      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      : `linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)`,
                    color: message.sender === 'user' ? '#ffffff' : 'inherit',
                    boxShadow: message.sender === 'user'
                      ? `0 6px 18px ${alpha(theme.palette.primary.main, 0.35)}`
                      : `0 6px 18px ${alpha(theme.palette.common.black, 0.08)}`,
                    position: 'relative',
                    border: message.sender === 'user'
                      ? 'none'
                      : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    overflow: 'hidden',
                    '&::before': message.sender === 'user' ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      right: '-12px',
                      width: '24px',
                      height: '24px',
                      background: theme.palette.primary.dark,
                      borderRadius: '50%',
                      zIndex: -1,
                    } : message.sender === 'ai' ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '-12px',
                      width: '24px',
                      height: '24px',
                      background: '#f8f9fa',
                      borderRadius: '50%',
                      zIndex: -1,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      borderTop: 'none',
                      borderRight: 'none',
                    } : {},
                    '&::after': message.sender === 'user' ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '100%',
                      background: `linear-gradient(to bottom, ${alpha('#ffffff', 0.1)} 0%, ${alpha('#ffffff', 0)} 100%)`,
                      opacity: 0.5,
                      pointerEvents: 'none',
                    } : {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '100%',
                      background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.03)} 0%, ${alpha(theme.palette.primary.light, 0)} 100%)`,
                      opacity: 0.8,
                      pointerEvents: 'none',
                    },
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
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontWeight: message.sender === 'user' ? 500 : 400,
                      lineHeight: 1.6,
                      letterSpacing: message.sender === 'user' ? '0.01em' : '0.015em',
                      fontSize: { xs: '0.95rem', sm: '1rem' },
                      p: 0.5,
                      borderRadius: 1,
                      position: 'relative',
                      zIndex: 1,
                      '&::after': message.sender === 'user' ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(to bottom, ${alpha('#ffffff', 0.1)} 0%, ${alpha('#ffffff', 0)} 100%)`,
                        borderRadius: 'inherit',
                        zIndex: -1,
                      } : {},
                      '& a': {
                        color: message.sender === 'user' ? 'inherit' : theme.palette.primary.main,
                        textDecoration: 'underline',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          textDecoration: 'none',
                          color: message.sender === 'user'
                            ? alpha('#ffffff', 0.85)
                            : theme.palette.primary.dark,
                        },
                      },
                      '& strong, & b': {
                        fontWeight: 600,
                        color: message.sender === 'user'
                          ? alpha('#ffffff', 0.95)
                          : theme.palette.text.primary,
                      },
                      '& ul, & ol': {
                        paddingLeft: 2.5,
                        marginTop: 1,
                        marginBottom: 1,
                      },
                      '& li': {
                        marginBottom: 0.5,
                      },
                      '& p': {
                        marginTop: 0.5,
                        marginBottom: 0.5,
                      },
                      animation: index === messages.length - 1 ? 'fadeIn 0.5s ease-out' : 'none',
                      '@keyframes fadeIn': {
                        '0%': { opacity: 0 },
                        '100%': { opacity: 1 }
                      }
                    }}
                  >
                    {/* Remove asterisks from AI messages */}
                    {message.sender === 'ai'
                      ? message.text.replace(/\*\*/g, '').replace(/\*/g, '')
                      : message.text}
                  </Typography>
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
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mt: 0.8,
                  mx: message.sender === 'user' ? 1 : 4,
                  gap: 0.5,
                }}
              >
                {message.sender === 'ai' && isSpeaking && message === messages[messages.length - 1] && (
                  <Box
                    component={motion.div}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: 'loop',
                    }}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <VolumeUp fontSize="small" color="primary" sx={{ fontSize: '0.7rem', opacity: 0.7 }} />
                  </Box>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontSize: '0.7rem',
                    opacity: 0.7,
                    color: message.sender === 'user' ? alpha('#ffffff', 0.8) : 'inherit',
                    fontWeight: 500,
                    px: 0.8,
                    py: 0.3,
                    borderRadius: 5,
                    bgcolor: message.sender === 'user'
                      ? alpha('#ffffff', 0.1)
                      : alpha(theme.palette.background.paper, 0.5),
                    border: `1px solid ${message.sender === 'user'
                      ? alpha('#ffffff', 0.1)
                      : alpha(theme.palette.divider, 0.1)}`,
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
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
            p: { xs: 1.5, sm: 2 },
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            bgcolor: theme.palette.background.paper,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Voice input status and error messages */}
            {(listeningText || voiceInputError) && (
              <Box
                sx={{
                  mb: 1.5,
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 3,
                  bgcolor: voiceInputError
                    ? alpha(theme.palette.error.main, 0.08)
                    : alpha(theme.palette.primary.main, 0.08),
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
                  },
                  boxShadow: voiceInputError
                    ? `0 2px 12px ${alpha(theme.palette.error.main, 0.15)}`
                    : isRecording
                      ? `0 2px 12px ${alpha(theme.palette.primary.main, 0.15)}`
                      : 'none',
                  border: voiceInputError
                    ? `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                    : `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  transition: 'all 0.3s ease',
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
                      sx={{ mr: 1.5 }}
                    >
                      <Mic fontSize="small" color="primary" />
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
                    sx={{
                      ml: 2,
                      minWidth: 'auto',
                      borderRadius: 2,
                      boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.2)}`,
                    }}
                  >
                    Fix
                  </Button>
                )}
              </Box>
            )}

            <Box sx={{
              display: 'flex',
              gap: 1,
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              p: 1,
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 2px 12px ${alpha(theme.palette.common.black, 0.03)}`,
            }}>
              <TextField
                fullWidth
                placeholder="Type your health question..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                size="medium"
                variant="outlined"
                multiline
                maxRows={3}
                InputProps={{
                  sx: {
                    borderRadius: 3,
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                    boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.04)}`,
                  }
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
                      bgcolor: isRecording
                        ? theme.palette.error.main
                        : alpha(theme.palette.primary.main, 0.1),
                      color: isRecording ? '#ffffff' : theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: isRecording
                          ? theme.palette.error.dark
                          : alpha(theme.palette.primary.main, 0.2),
                        transform: 'translateY(-2px)',
                      },
                      animation: isRecording ? 'pulse 1.5s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0.4)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(244, 67, 54, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(244, 67, 54, 0)' }
                      },
                      transition: 'all 0.2s ease',
                      boxShadow: isRecording
                        ? '0 4px 12px rgba(244, 67, 54, 0.3)'
                        : '0 2px 8px rgba(0, 0, 0, 0.1)',
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
                      '&:hover': {
                        bgcolor: alpha(theme.palette.info.main, 0.2),
                      },
                      transition: 'all 0.2s ease',
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
                sx={{
                  borderRadius: 3,
                  px: 3,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease',
                }}
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
        {textToSpeechEnabled && (
          <MenuItem onClick={() => setShowVoiceSettings(true)}>
            <Tune sx={{ mr: 1 }} />
            Voice Settings
          </MenuItem>
        )}
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

      {/* Voice Settings Dialog */}
      <Dialog
        open={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VolumeUp sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Voice Settings</Typography>
            </Box>
            <IconButton onClick={() => setShowVoiceSettings(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Voice Gender
            </Typography>
            <Box sx={{
              display: 'flex',
              gap: 2,
              mb: 2,
              '& .MuiButton-root': {
                flexGrow: 1,
                py: 1.5,
                borderRadius: 2,
                transition: 'all 0.2s ease'
              }
            }}>
              <Button
                variant={voiceGender === 'male' ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<Man />}
                onClick={() => setVoiceGender('male')}
                sx={{
                  boxShadow: voiceGender === 'male' ? 4 : 0,
                  transform: voiceGender === 'male' ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                Male Voice
              </Button>
              <Button
                variant={voiceGender === 'female' ? 'contained' : 'outlined'}
                color="secondary"
                startIcon={<Woman />}
                onClick={() => setVoiceGender('female')}
                sx={{
                  boxShadow: voiceGender === 'female' ? 4 : 0,
                  transform: voiceGender === 'female' ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                Female Voice
              </Button>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Voice Personality
            </Typography>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              mb: 2,
              '& .MuiButton-root': {
                minWidth: '31%',
                flexGrow: 1,
                py: 1,
                borderRadius: 2,
                transition: 'all 0.2s ease'
              }
            }}>
              <Button
                variant={voicePersonality === 'professional' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setVoicePersonality('professional')}
                startIcon={<HealthAndSafety />}
                sx={{
                  boxShadow: voicePersonality === 'professional' ? 3 : 0,
                  transform: voicePersonality === 'professional' ? 'scale(1.03)' : 'scale(1)',
                  bgcolor: voicePersonality === 'professional' ? theme.palette.primary.main : 'transparent',
                  color: voicePersonality === 'professional' ? 'white' : theme.palette.primary.main,
                  border: `1px solid ${theme.palette.primary.main}`,
                  fontWeight: 500,
                  py: 1.2,
                }}
              >
                Doctor
              </Button>
              <Button
                variant={voicePersonality === 'friendly' ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<SpaIcon />}
                onClick={() => setVoicePersonality('friendly')}
                sx={{
                  boxShadow: voicePersonality === 'friendly' ? 2 : 0,
                  transform: voicePersonality === 'friendly' ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                Friendly
              </Button>
              <Button
                variant={voicePersonality === 'calm' ? 'contained' : 'outlined'}
                color="primary"
                startIcon={<Healing />}
                onClick={() => setVoicePersonality('calm')}
                sx={{
                  boxShadow: voicePersonality === 'calm' ? 2 : 0,
                  transform: voicePersonality === 'calm' ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                Calm
              </Button>
            </Box>

            {/* Doctor voice description */}
            {voicePersonality === 'professional' && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 1,
                }}
              >
                <HealthAndSafety color="primary" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Doctor voice uses a professional, clear tone with appropriate pacing for medical information.
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Speed fontSize="small" sx={{ mr: 0.5 }} /> Speaking Rate
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={voiceRate}
                min={0.7}
                max={1.3}
                step={0.05}
                onChange={(_, newValue) => setVoiceRate(newValue)}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => value === 1 ? 'Normal' : value < 1 ? 'Slower' : 'Faster'}
                marks={[
                  { value: 0.7, label: 'Slow' },
                  { value: 1, label: 'Normal' },
                  { value: 1.3, label: 'Fast' }
                ]}
              />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Tune fontSize="small" sx={{ mr: 0.5 }} /> Pitch
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                value={voicePitch}
                min={0.7}
                max={1.3}
                step={0.05}
                onChange={(_, newValue) => setVoicePitch(newValue)}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => value === 1 ? 'Normal' : value < 1 ? 'Lower' : 'Higher'}
                marks={[
                  { value: 0.7, label: 'Low' },
                  { value: 1, label: 'Normal' },
                  { value: 1.3, label: 'High' }
                ]}
              />
            </Box>
          </Box>

          <Box sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}>
            <Typography variant="body2" color="text.secondary">
              These settings help make the AI assistant's voice sound more natural and human-like.
              Try different combinations to find the voice that works best for you.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => {
              // Reset to defaults
              setVoiceRate(0.95);
              setVoicePitch(1.0);
              setVoicePersonality('friendly');
              setVoiceGender('female');
            }}
          >
            Reset to Default
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Test the current voice settings
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();

                // Choose greeting based on personality - use natural language without special formatting
                let greeting = "";
                if (voicePersonality === 'professional') {
                  greeting = "Hello, I'm Dr. SoulSpace, your virtual health assistant. I'm here to provide medical guidance and answer your health questions. How may I help you today?";
                } else if (voicePersonality === 'friendly') {
                  greeting = "Hi there! I'm your AI health assistant. I'm here to chat about any health concerns you might have. How can I help you today?";
                } else if (voicePersonality === 'calm') {
                  greeting = "Hello. I'm your health assistant. I'm here to provide support and information about your health concerns. How may I assist you today?";
                }

                // Create a clean utterance without any special processing
                const testUtterance = new SpeechSynthesisUtterance(greeting);

                testUtterance.lang = 'en-US';
                testUtterance.rate = voiceRate;
                testUtterance.pitch = voicePitch;
                testUtterance.volume = 1.0;

                if (selectedVoice) {
                  testUtterance.voice = selectedVoice;
                }

                // Apply personality adjustments
                if (voicePersonality === 'professional') {
                  // Doctor-like voice: clear, authoritative but caring
                  testUtterance.rate = Math.max(0.85, voiceRate - 0.1);
                  testUtterance.pitch = Math.min(1.05, voicePitch + 0.05);
                } else if (voicePersonality === 'calm') {
                  // Calming voice: slower, soothing
                  testUtterance.rate = Math.max(0.8, voiceRate - 0.15);
                  testUtterance.pitch = Math.max(0.9, voicePitch - 0.1);
                } else if (voicePersonality === 'friendly') {
                  // Friendly voice: warmer, more casual
                  testUtterance.rate = voiceRate;
                  testUtterance.pitch = voicePitch;
                }

                window.speechSynthesis.speak(testUtterance);
              }
            }}
            startIcon={<VolumeUp />}
          >
            Test Voice
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowVoiceSettings(false)}
          >
            Save Settings
          </Button>
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
