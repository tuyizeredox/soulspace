import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  alpha,
  IconButton,
  Drawer,
  useMediaQuery,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Info as InfoIcon,
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axiosConfig';
import { io } from 'socket.io-client';
import { saveChatHistory, loadChatHistory } from '../../utils/chatStorage';
import { addToMessageQueue } from '../../utils/messageQueue';
import WebRTCService from '../../services/WebRTCService';
import ChatMessageList from './chat/ChatMessageList';
import ChatInputArea from './chat/ChatInputArea';
import PatientInfoSidebar from './chat/PatientInfoSidebar';

const EnhancedDoctorPatientChat = ({
  patient,
  patientDetails,
  recentAppointments,
  upcomingAppointments,
  medicalRecords,
  onScheduleAppointment,
  onViewMedicalRecords,
  isMobile,
  onBackToPatientList
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const messagesEndRef = useRef(null);

  // State variables
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messageStatus, setMessageStatus] = useState('');
  const [isInfoSidebarOpen, setIsInfoSidebarOpen] = useState(!isSmallScreen);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [webRTCService, setWebRTCService] = useState(null);

  // Get user and chat context
  const { user } = useAuth();
  const {
    sendMessage: contextSendMessage,
    fetchMessages: contextFetchMessages,
    accessChat,
    markChatAsRead
  } = useChat();

  // Initialize chat
  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      if (!patient || !patient._id) return;

      try {
        if (isMounted) {
          setLoading(true);
          setMessageStatus('Connecting to chat...');
        }

        const patientId = patient._id || patient.id;
        console.log('Initializing enhanced chat with patient:', patientId);

        // Make sure we have the token in axios headers from all possible sources
        const currentToken = localStorage.getItem('token') ||
                            localStorage.getItem('userToken') ||
                            localStorage.getItem('doctorToken') ||
                            localStorage.getItem('persistentToken');

        if (!currentToken) {
          console.error('No authentication token found');
          setMessageStatus('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        // Store token in all locations for redundancy
        localStorage.setItem('token', currentToken);
        localStorage.setItem('userToken', currentToken);
        localStorage.setItem('doctorToken', currentToken);
        localStorage.setItem('persistentToken', currentToken);

        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

        // Check if we have a cached chat ID for this patient
        const cachedChatId = localStorage.getItem(`chat_${patientId}`);
        if (cachedChatId) {
          console.log('Found cached chat ID:', cachedChatId);
          setChatId(cachedChatId);

          // Try to load messages from local storage first for immediate display
          const cachedMessages = loadChatHistory(cachedChatId);
          if (cachedMessages && cachedMessages.length > 0 && isMounted) {
            console.log(`Loaded ${cachedMessages.length} cached messages`);
            setMessages(cachedMessages);
            setTimeout(scrollToBottom, 100);
            setMessageStatus('Loading conversation...');
          }
        }

        // Try to access or create chat with the patient
        try {
          console.log('Accessing chat with patient:', patientId);
          const chat = await accessChat(patientId);

          if (chat && isMounted) {
            console.log('Chat accessed successfully:', chat._id);

            // Save chat ID to localStorage for future use
            localStorage.setItem(`chat_${patientId}`, chat._id);
            setChatId(chat._id);

            // Join the chat room via socket
            if (socket && socket.connected) {
              socket.emit('join-chat', chat._id);
              console.log('Joined socket room for chat:', chat._id);
            } else {
              console.warn('Socket not connected, cannot join chat room');
            }

            // Fetch messages from the server
            console.log('Fetching messages for chat:', chat._id);
            const fetchedMessages = await contextFetchMessages(chat._id);

            if (fetchedMessages && fetchedMessages.length > 0 && isMounted) {
              console.log(`Fetched ${fetchedMessages.length} messages from server`);
              setMessages(fetchedMessages);
              setTimeout(scrollToBottom, 100);
              setMessageStatus('');

              // Mark messages as read
              await markChatAsRead(chat._id);

              // Save to local storage for offline access
              saveChatHistory(chat._id, fetchedMessages);
            } else {
              console.log('No messages fetched from server');
              setMessageStatus('No messages in this conversation yet.');
            }
          } else {
            console.warn('Failed to access chat, no chat data returned');
            setMessageStatus('Could not connect to chat. Please try again later.');
          }
        } catch (error) {
          console.error('Error accessing chat:', error);

          // Log detailed error information
          if (error.response) {
            console.log('Error response data:', error.response.data);
            console.log('Error response status:', error.response.status);
          } else if (error.request) {
            console.log('Error request (no response received):', error.request);
          } else {
            console.log('Error message:', error.message);
          }

          setMessageStatus('Could not connect to chat. Using cached messages if available.');

          // If we have a cached chat ID, try to use cached messages as fallback
          if (cachedChatId) {
            const cachedMessages = loadChatHistory(cachedChatId);
            if (cachedMessages && cachedMessages.length > 0 && isMounted) {
              console.log(`Using ${cachedMessages.length} cached messages as fallback`);
              setMessages(cachedMessages);
              setTimeout(scrollToBottom, 100);
              setMessageStatus('Using cached messages. Some messages may not be up to date.');
            }
          }
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        if (isMounted) {
          setMessageStatus('An error occurred. Please try again later.');
          setLoading(false);
        }
      }
    };

    initializeChat();

    // Initialize socket connection
    const initSocket = () => {
      try {
        // Check if we already have a socket connection
        if (socket && socket.connected) {
          console.log('Socket already connected, reusing existing connection');
          return socket;
        }

        console.log('Initializing new socket connection');
        const newSocket = io('http://localhost:5000', {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
          console.log('Socket connected with ID:', newSocket.id);

          // Setup user
          if (user) {
            console.log('Setting up socket with user:', user._id || user.id);
            newSocket.emit('setup', user);
          }

          // Join chat room if we already have a chat ID
          if (chatId) {
            console.log('Joining chat room:', chatId);
            newSocket.emit('join-chat', chatId);
          }
        });

        newSocket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        newSocket.on('connect_timeout', () => {
          console.error('Socket connection timeout');
        });

        newSocket.on('new-message', (newMessage) => {
          console.log('New message received:', newMessage);
          if (newMessage.chat && newMessage.chat._id === chatId) {
            console.log('Adding new message to chat:', chatId);
            setMessages(prev => [...prev, newMessage]);
            scrollToBottom();

            // Mark message as read
            markChatAsRead(chatId);

            // Save updated messages to local storage
            saveChatHistory(chatId, [...messages, newMessage]);
          }
        });

        newSocket.on('typing', (chatRoomId) => {
          if (chatRoomId === chatId) {
            console.log('User is typing in chat:', chatId);
            setIsTyping(true);
          }
        });

        newSocket.on('stop-typing', (chatRoomId) => {
          if (chatRoomId === chatId) {
            console.log('User stopped typing in chat:', chatId);
            setIsTyping(false);
          }
        });

        setSocket(newSocket);
        return newSocket;
      } catch (error) {
        console.error('Error initializing socket:', error);
        return null;
      }
    };

    const newSocket = initSocket();

    // Initialize WebRTC service for video calls
    const initWebRTC = () => {
      if (user && patient) {
        const service = new WebRTCService();
        if (service.initialize) {
          service.initialize(user._id, patient._id);
          setWebRTCService(service);
          return service;
        } else {
          console.error('WebRTCService.initialize is not a function');
          return null;
        }
      }
      return null;
    };

    // Only initialize WebRTC if both user and patient exist
    if (user && patient && user._id && (patient._id || patient.id)) {
      try {
        initWebRTC();
      } catch (error) {
        console.error('Error initializing WebRTC:', error);
      }
    }

    return () => {
      isMounted = false;
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [patient, user, accessChat, contextFetchMessages, markChatAsRead]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending a message
  const handleSendMessage = async (messageText, attachments = []) => {
    if ((!messageText || !messageText.trim()) && attachments.length === 0) return;

    setSending(true);
    setMessageStatus('Sending message...');

    try {
      // Add temporary message to UI
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        sender: { _id: user._id, name: user.name, avatar: user.avatar },
        content: messageText,
        timestamp: new Date().toISOString(),
        attachments: attachments,
        read: false,
        isTemp: true
      };

      setMessages(prev => [...prev, tempMessage]);
      scrollToBottom();

      // Send message to server
      if (chatId) {
        try {
          const result = await contextSendMessage(messageText, chatId, attachments);

          if (result && result.message) {
            // Replace temp message with real one
            setMessages(prev => prev.map(msg =>
              msg._id === tempId ? { ...result.message, read: false } : msg
            ));

            // Save to local storage
            saveChatHistory(chatId, messages.filter(m => m._id !== tempId).concat(result.message));
          }
        } catch (error) {
          console.error('Error sending message:', error);

          // Add to offline queue
          addToMessageQueue({
            content: messageText,
            attachments,
            tempId
          }, chatId);

          setMessageStatus('Message will be sent when connection is restored');
        }
      }
    } catch (error) {
      console.error('Error in send message flow:', error);
      setMessageStatus('Failed to send message. Please try again.');
    } finally {
      setSending(false);
      setTimeout(() => setMessageStatus(''), 3000);
    }
  };

  // Handle typing indicator
  const handleTypingIndicator = (isTyping) => {
    if (!chatId || !socket) {
      console.warn('Cannot send typing indicator: No chat ID or socket connection');
      return;
    }

    try {
      if (!socket.connected) {
        console.warn('Socket not connected, attempting to reconnect');
        socket.connect();
      }

      if (isTyping) {
        console.log('Sending typing indicator for chat:', chatId);
        socket.emit('typing', chatId);
      } else {
        console.log('Sending stop typing indicator for chat:', chatId);
        socket.emit('stop-typing', chatId);
      }
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  };

  // Handle starting a video call
  const handleStartVideoCall = () => {
    if (!webRTCService || !patient) return;

    try {
      // Generate a unique room ID
      const roomId = `call-${user._id}-${patient._id}-${Date.now()}`;

      // Initialize the call
      webRTCService.startCall(true, roomId);

      // Send a message to notify the patient
      handleSendMessage('I started a video call. Please join.', []);

      // TODO: Open video call interface
    } catch (error) {
      console.error('Error starting video call:', error);
      setMessageStatus('Failed to start video call. Please try again.');
    }
  };

  // Toggle info sidebar
  const toggleInfoSidebar = () => {
    setIsInfoSidebarOpen(prev => !prev);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      bgcolor: 'background.default',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: theme.shadows[3]
    }}>
      {/* Chat Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: theme.palette.background.paper
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isMobile && (
            <IconButton onClick={onBackToPatientList} edge="start">
              <ArrowBackIcon />
            </IconButton>
          )}

          <Avatar
            src={patient?.avatar}
            alt={patient?.name}
            sx={{ width: 40, height: 40 }}
          >
            {patient?.name?.charAt(0)}
          </Avatar>

          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {patient?.name || 'Patient'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isTyping ? 'Typing...' : 'Patient'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Video Call">
            <IconButton
              color="primary"
              onClick={handleStartVideoCall}
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
            >
              <VideoCallIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title={isInfoSidebarOpen ? "Hide Patient Info" : "Show Patient Info"}>
            <IconButton
              onClick={toggleInfoSidebar}
              color={isInfoSidebarOpen ? "primary" : "default"}
              sx={{
                bgcolor: isInfoSidebarOpen
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent'
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{
        display: 'flex',
        flexGrow: 1,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Chat Messages Area */}
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Messages List */}
          <ChatMessageList
            messages={messages}
            currentUser={user}
            loading={loading}
            messageStatus={messageStatus}
            messagesEndRef={messagesEndRef}
          />

          {/* Input Area */}
          <ChatInputArea
            onSendMessage={handleSendMessage}
            onTyping={handleTypingIndicator}
            sending={sending}
          />
        </Box>

        {/* Patient Info Sidebar - Drawer on mobile, permanent on desktop */}
        {isSmallScreen ? (
          <Drawer
            anchor="right"
            open={isInfoSidebarOpen}
            onClose={() => setIsInfoSidebarOpen(false)}
            sx={{
              width: 320,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: 320,
                boxSizing: 'border-box',
              },
            }}
          >
            <PatientInfoSidebar
              patient={patient}
              patientDetails={patientDetails}
              recentAppointments={recentAppointments}
              upcomingAppointments={upcomingAppointments}
              medicalRecords={medicalRecords}
              onScheduleAppointment={onScheduleAppointment}
              onViewMedicalRecords={onViewMedicalRecords}
              onClose={() => setIsInfoSidebarOpen(false)}
            />
          </Drawer>
        ) : (
          isInfoSidebarOpen && (
            <Box sx={{
              width: 320,
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'auto'
            }}>
              <PatientInfoSidebar
                patient={patient}
                patientDetails={patientDetails}
                recentAppointments={recentAppointments}
                upcomingAppointments={upcomingAppointments}
                medicalRecords={medicalRecords}
                onScheduleAppointment={onScheduleAppointment}
                onViewMedicalRecords={onViewMedicalRecords}
              />
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

export default EnhancedDoctorPatientChat;
