import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Fab,
  Tooltip,
  Zoom,
  useTheme,
  alpha,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import {
  SmartToy,
  Send,
  Close,
  Chat,
  ArrowForward,
  Info,
  Mic,
  MicOff,
  Stop
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../utils/axios';

const HomeChatBot = ({ onClose }) => {
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [listeningText, setListeningText] = useState('');
  const [voiceInputError, setVoiceInputError] = useState(null);
  const mediaRecorderRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm SoulSpace's AI assistant. I can help you learn about our services, answer health questions, or guide you through our platform. How can I help you today?",
      timestamp: new Date()
    }
  ]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const messageText = userMessage.trim();
    setUserMessage('');

    // Add user message to chat
    const newUserMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      // Get conversation history for context (last 5 messages)
      const conversationHistory = messages.slice(-5).map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      // Call the guest AI assistant API endpoint
      const response = await axios.post('/api/ai-assistant/guest-message', {
        message: messageText,
        conversationHistory
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Extract the AI response
      let responseText = '';

      if (response.data && response.data.text) {
        // Use the response from the AI service
        responseText = response.data.text;
      } else {
        // Fallback response if the API doesn't return expected format
        responseText = "I'm here to help you learn about SoulSpace. We offer comprehensive healthcare services including appointment booking, health monitoring, and AI-powered assistance. How can I assist you today?";
      }

      // Add AI response to chat
      const aiResponse = {
        id: messages.length + 2,
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);

      // If API call fails, use a fallback response system
      let fallbackResponse = '';

      if (messageText.toLowerCase().includes('hello') ||
          messageText.toLowerCase().includes('hi') ||
          messageText.toLowerCase().includes('hey')) {
        fallbackResponse = "Hello! I'm SoulSpace's AI assistant. How can I help you today?";
      }
      else if (messageText.toLowerCase().includes('appointment') ||
               messageText.toLowerCase().includes('book') ||
               messageText.toLowerCase().includes('schedule')) {
        fallbackResponse = "SoulSpace makes it easy to book appointments with healthcare providers. You can choose between in-person visits or virtual consultations based on your needs.";
      }
      else if (messageText.toLowerCase().includes('service') ||
               messageText.toLowerCase().includes('offer')) {
        fallbackResponse = "SoulSpace offers a comprehensive range of healthcare services including primary care, specialist consultations, mental health support, preventive health screenings, and real-time health monitoring through wearable device integration.";
      }
      else if (messageText.toLowerCase().includes('wearable') ||
               messageText.toLowerCase().includes('device') ||
               messageText.toLowerCase().includes('monitor')) {
        fallbackResponse = "Our platform integrates with popular wearable health devices to monitor vital signs like heart rate, blood pressure, and oxygen levels in real-time. This data helps our healthcare providers give you more personalized care.";
      }
      else if (messageText.toLowerCase().includes('health tip') ||
               messageText.toLowerCase().includes('advice')) {
        fallbackResponse = "Here are some evidence-based health tips: 1) Stay hydrated by drinking at least 8 glasses of water daily, 2) Aim for 7-9 hours of quality sleep, 3) Exercise regularly - at least 150 minutes per week, 4) Maintain a balanced diet rich in fruits and vegetables, 5) Practice stress management techniques like meditation.";
      }
      else {
        fallbackResponse = "I'm here to help you learn about SoulSpace's healthcare platform. We offer appointment booking, health monitoring, AI assistance, and more. What would you like to know about?";
      }

      // Add fallback response to chat
      const fallbackMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: fallbackResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setListeningText('');
      }
      return;
    }

    // Start recording
    setIsRecording(true);
    setVoiceInputError(null);

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
          setIsRecording(true);
          setListeningText('Listening...');
        };

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');

          setUserMessage(transcript);
          setListeningText(transcript);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setVoiceInputError(`Error: ${event.error}`);
          setIsRecording(false);
          setListeningText('');
        };

        recognition.onend = () => {
          setIsRecording(false);
          if (userMessage) {
            setTimeout(() => handleSendMessage(), 500);
          } else {
            setListeningText('');
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
  };

  // Handle key down (Enter to send)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Toggle chat window
  const toggleChat = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* Chat button */}
      <Zoom in={!open}>
        <Fab
          color="primary"
          aria-label="chat"
          onClick={toggleChat}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <Chat />
        </Fab>
      </Zoom>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              width: 350,
              maxWidth: 'calc(100vw - 48px)',
              height: 500,
              maxHeight: 'calc(100vh - 100px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Paper sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.9) : alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}>
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    sx={{
                      bgcolor: alpha('#ffffff', 0.2),
                      mr: 1,
                    }}
                  >
                    <SmartToy />
                  </Avatar>
                  <Typography variant="h6">SoulSpace Assistant</Typography>
                </Box>
                <IconButton
                  color="inherit"
                  onClick={toggleChat}
                  size="small"
                  sx={{
                    '&:hover': {
                      bgcolor: alpha('#ffffff', 0.1),
                    },
                  }}
                >
                  <Close />
                </IconButton>
              </Box>

              {/* Messages */}
              <Box
                sx={{
                  p: 2,
                  flexGrow: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      maxWidth: '80%',
                      alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {message.sender === 'ai' && (
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 32,
                          height: 32,
                          mr: 1,
                          ml: 0,
                        }}
                      >
                        <SmartToy sx={{ fontSize: 18 }} />
                      </Avatar>
                    )}
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: message.sender === 'user'
                          ? theme.palette.primary.main
                          : theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.1)
                            : alpha(theme.palette.primary.light, 0.1),
                        color: message.sender === 'user'
                          ? 'white'
                          : theme.palette.text.primary,
                        maxWidth: '100%',
                        position: 'relative',
                        '&::after': message.sender === 'user' ? {
                          content: '""',
                          position: 'absolute',
                          right: -8,
                          top: 10,
                          border: '8px solid transparent',
                          borderLeftColor: theme.palette.primary.main,
                          borderRight: 0,
                        } : message.sender === 'ai' ? {
                          content: '""',
                          position: 'absolute',
                          left: -8,
                          top: 10,
                          border: '8px solid transparent',
                          borderRightColor: theme.palette.mode === 'dark'
                            ? alpha(theme.palette.primary.main, 0.1)
                            : alpha(theme.palette.primary.light, 0.1),
                          borderLeft: 0,
                        } : {},
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.text}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
                {isTyping && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                        mr: 1,
                      }}
                    >
                      <SmartToy sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark'
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.light, 0.1),
                        minWidth: 60,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: theme.palette.text.secondary,
                            animation: 'pulse 1s infinite',
                            animationDelay: '0s',
                            '@keyframes pulse': {
                              '0%, 100%': {
                                transform: 'scale(0.5)',
                                opacity: 0.5,
                              },
                              '50%': {
                                transform: 'scale(1)',
                                opacity: 1,
                              },
                            },
                          }}
                        />
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: theme.palette.text.secondary,
                            animation: 'pulse 1s infinite',
                            animationDelay: '0.2s',
                          }}
                        />
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: theme.palette.text.secondary,
                            animation: 'pulse 1s infinite',
                            animationDelay: '0.4s',
                          }}
                        />
                      </Box>
                    </Paper>
                  </Box>
                )}
                {voiceInputError && (
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                      alignSelf: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Info fontSize="small" />
                    <Typography variant="body2">{voiceInputError}</Typography>
                  </Paper>
                )}
                {listeningText && (
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      alignSelf: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {listeningText}
                    </Typography>
                  </Paper>
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Divider />

              {/* Input */}
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Type your message..."
                  variant="outlined"
                  size="small"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isRecording}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    },
                  }}
                />
                <Tooltip title={isRecording ? "Stop recording" : "Voice input"}>
                  <IconButton
                    color={isRecording ? "error" : "primary"}
                    onClick={handleVoiceInput}
                    sx={{
                      bgcolor: isRecording
                        ? alpha(theme.palette.error.main, 0.1)
                        : alpha(theme.palette.primary.main, 0.1),
                      '&:hover': {
                        bgcolor: isRecording
                          ? alpha(theme.palette.error.main, 0.2)
                          : alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                  >
                    {isRecording ? <Stop /> : <Mic />}
                  </IconButton>
                </Tooltip>
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!userMessage.trim() || isRecording}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'transparent',
                    },
                  }}
                >
                  <Send />
                </IconButton>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomeChatBot;
