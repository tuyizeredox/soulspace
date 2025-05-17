import React, { useState, useEffect, useRef, Fragment, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
  Chip,
  Tooltip,
  useTheme,
  alpha,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Slider,
  DialogActions,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MedicalInformation as MedicalIcon,
  CalendarMonth as CalendarIcon,
  Mic as MicIcon,
  InsertPhoto as PhotoIcon,
  Description as FileIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as GenericFileIcon,
  Delete as DeleteIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  Mic as MicOnIcon,
  MicOff as MicOffIcon,
  Refresh as RefreshIcon,
  Stop as StopIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  GraphicEq as WaveformIcon,
  FiberManualRecord as RecordIcon,
  MoreVert,
  ArrowBack as ArrowBackIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import {
  startRecording,
  stopRecording,
  formatRecordingTime,
  formatAudioFileSize,
  createAudioFile,
  createAudioPreview,
  getAudioDuration
} from '../../utils/audioRecorder';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSelector } from 'react-redux';
import axios from '../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { saveChatHistory, loadChatHistory } from '../../utils/chatStorage';
import {
  addToMessageQueue,
  getMessageQueue,
  removeFromMessageQueue,
  incrementAttemptCount
} from '../../utils/messageQueue';
import WebRTCService from '../../services/WebRTCService';

const DoctorPatientChat = ({
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
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [messageStatus, setMessageStatus] = useState(''); // For showing status messages
  const [activeTab, setActiveTab] = useState(0);

  // Pagination states for loading older messages
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);

  // File handling states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Mobile menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [recorderState, setRecorderState] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioElement, setCurrentAudioElement] = useState(null);
  const [showVoicePreview, setShowVoicePreview] = useState(false);

  // Video call states
  const [showVideoCallDialog, setShowVideoCallDialog] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Socket.io connection
  const [socket, setSocket] = useState(null);

  // Get user from auth contexts
  const { user: authUser } = useAuth();
  const { user: userAuthUser } = useSelector((state) => state.userAuth);
  const { user: oldAuthUser } = useSelector((state) => state.auth);
  const user = authUser || userAuthUser || oldAuthUser;

  // Get token
  const { token: userToken } = useSelector((state) => state.userAuth);
  const { token: oldToken } = useSelector((state) => state.auth);
  const token = userToken || oldToken || localStorage.getItem('token') || localStorage.getItem('userToken');

  // Get chat context
  const {
    accessChat,
    sendMessage: contextSendMessage,
    fetchMessages: contextFetchMessages,
    messages: contextMessages,
    selectedChat,
    setSelectedChat,
    isTyping,
    handleTyping,
    markChatAsRead: contextMarkChatAsRead
  } = useChat();

  // Track last time we marked chat as read to prevent too frequent API calls
  const [lastMarkAsReadTime, setLastMarkAsReadTime] = useState(0);

  // Track last time we refreshed messages to prevent continuous refreshing
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // Mark chat as read - with debouncing to prevent excessive API calls
  const markChatAsRead = useCallback(async (chatId) => {
    if (!chatId || chatId.startsWith('mock')) return;

    // Implement debounce - don't mark as read if last mark was less than 10 seconds ago
    const now = Date.now();
    if (now - lastMarkAsReadTime < 10000) { // 10 seconds
      // console.log('Skipping mark as read - too soon since last mark');
      return;
    }

    // Update last mark as read time
    setLastMarkAsReadTime(now);

    try {
      // console.log('Marking chat as read:', chatId);

      // Use context function if available
      if (contextMarkChatAsRead) {
        await contextMarkChatAsRead(chatId);
      } else {
        // Fallback to direct API call
        const currentToken = localStorage.getItem('token') ||
                            localStorage.getItem('userToken') ||
                            localStorage.getItem('doctorToken');

        if (currentToken) {
          const config = {
            headers: { Authorization: `Bearer ${currentToken}` },
            timeout: 5000 // 5 second timeout to prevent long-hanging requests
          };

          try {
            await axios.put(`/api/chats/${chatId}/read`, {}, config);
            // console.log('Chat marked as read via direct API call');

            // Emit socket event to notify other users that messages have been read
            if (socket && socket.connected && user) {
              socket.emit('message-read', {
                chatId: chatId,
                userId: user._id || user.id
              });
              // console.log('Emitted message-read event for chat:', chatId);
            }
          } catch (apiError) {
            console.error('Error marking chat as read via direct API call:', apiError);

            // If it's a connection error or server error, store for later retry
            if (apiError.code === 'ECONNABORTED' || !navigator.onLine ||
                apiError.response?.status === 500 || apiError.response?.status === 503) {
              console.log('Will retry marking as read when connection is restored');

              // Store the pending operation for later retry
              const pendingOp = {
                chatId,
                timestamp: new Date().toISOString()
              };

              const pendingOps = JSON.parse(localStorage.getItem('pendingReadOps') || '[]');

              // Only add if not already in the list
              if (!pendingOps.some(op => op.chatId === chatId)) {
                pendingOps.push(pendingOp);
                localStorage.setItem('pendingReadOps', JSON.stringify(pendingOps));
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in markChatAsRead function:', error);
    }
  }, [socket, user, contextMarkChatAsRead, lastMarkAsReadTime]);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end'
        });
      } catch (error) {
        console.error('Error scrolling to bottom:', error);

        // Fallback method if scrollIntoView fails
        const messagesContainer = messagesEndRef.current.parentElement;
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }
    }
  }, [messagesEndRef]);

  // Force scroll to bottom without animation
  const forceScrollToBottom = useCallback(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Get mock messages for testing
  const getMockMessages = () => {
    const now = new Date();
    return [
      {
        _id: 'mock1',
        sender: { _id: patient._id || patient.id, name: patient.name },
        content: 'Hello doctor, I have been experiencing some pain in my lower back for the past few days.',
        timestamp: new Date(now.getTime() - 60 * 60000).toISOString()
      },
      {
        _id: 'mock2',
        sender: { _id: user._id || user.id, name: user.name },
        content: 'I\'m sorry to hear that. Can you describe the pain? Is it constant or does it come and go?',
        timestamp: new Date(now.getTime() - 55 * 60000).toISOString()
      },
      {
        _id: 'mock3',
        sender: { _id: patient._id || patient.id, name: patient.name },
        content: 'It\'s mostly when I bend over or sit for too long. It\'s a sharp pain.',
        timestamp: new Date(now.getTime() - 50 * 60000).toISOString()
      },
      {
        _id: 'mock4',
        sender: { _id: user._id || user.id, name: user.name },
        content: 'Have you tried any pain medication? Also, have you had any injuries recently?',
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString()
      },
      {
        _id: 'mock5',
        sender: { _id: patient._id || patient.id, name: patient.name },
        content: 'I took some ibuprofen but it only helps a little. No recent injuries that I can remember.',
        timestamp: new Date(now.getTime() - 40 * 60000).toISOString()
      }
    ];
  };

  // Check if backend is available with retry mechanism
  const checkBackendAvailability = async () => {
    // Use a cached result if we checked recently (within 30 seconds)
    const now = Date.now();
    const lastCheck = parseInt(localStorage.getItem('lastBackendCheck') || '0');
    const lastResult = localStorage.getItem('lastBackendResult') === 'true';

    if (now - lastCheck < 30000) { // 30 seconds
      console.log('Using cached backend availability result:', lastResult);
      return lastResult;
    }

    // Try up to 2 times with increasing timeouts
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`Checking backend availability (attempt ${attempt})...`);
        const timeout = attempt === 1 ? 3000 : 7000; // 3s for first attempt, 7s for second

        const response = await axios.get('/api/health', {
          timeout,
          // Add cache-busting parameter to prevent caching
          params: { _t: Date.now() }
        });

        const isAvailable = response.status === 200;

        // Cache the result
        localStorage.setItem('lastBackendCheck', now.toString());
        localStorage.setItem('lastBackendResult', isAvailable.toString());

        console.log('Backend is available:', isAvailable);
        return isAvailable;
      } catch (error) {
        console.error(`Backend health check failed (attempt ${attempt}):`, error);

        // If this is the last attempt, cache the negative result
        if (attempt === 2) {
          localStorage.setItem('lastBackendCheck', now.toString());
          localStorage.setItem('lastBackendResult', 'false');
          return false;
        }

        // Otherwise wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return false;
  };

  // Process pending read operations
  const processPendingReadOperations = useCallback(async () => {
    try {
      // Get pending operations from localStorage
      const pendingOps = JSON.parse(localStorage.getItem('pendingReadOps') || '[]');

      if (pendingOps.length === 0) {
        return;
      }

      console.log(`Processing ${pendingOps.length} pending read operations`);

      // Check if backend is available
      const isBackendAvailable = await checkBackendAvailability();
      if (!isBackendAvailable) {
        console.log('Backend not available, skipping read operations processing');
        return;
      }

      // Get token for the request
      const currentToken = localStorage.getItem('token') ||
                          localStorage.getItem('userToken') ||
                          localStorage.getItem('doctorToken');

      if (!currentToken) {
        console.log('No token available, skipping read operations processing');
        return;
      }

      // Create config with authorization header
      const config = {
        headers: { Authorization: `Bearer ${currentToken}` },
        timeout: 5000 // 5 second timeout
      };

      // Process each pending operation
      const newPendingOps = [];

      for (const op of pendingOps) {
        try {
          // Skip operations older than 24 hours
          const opTime = new Date(op.timestamp).getTime();
          const now = new Date().getTime();
          const hoursDiff = (now - opTime) / (1000 * 60 * 60);

          if (hoursDiff > 24) {
            console.log(`Skipping operation older than 24 hours: ${op.chatId}`);
            continue;
          }

          // Try to mark the chat as read
          await axios.put(`/api/chats/${op.chatId}/read`, {}, config);
          console.log(`Successfully processed pending read operation for chat ${op.chatId}`);

          // Emit socket event
          if (socket && socket.connected && user) {
            socket.emit('message-read', {
              chatId: op.chatId,
              userId: user._id || user.id
            });
          }
        } catch (error) {
          console.error(`Failed to process pending read operation for chat ${op.chatId}:`, error);

          // Keep in the list for next retry
          newPendingOps.push(op);
        }
      }

      // Update localStorage with remaining operations
      if (newPendingOps.length > 0) {
        localStorage.setItem('pendingReadOps', JSON.stringify(newPendingOps));
        console.log(`${newPendingOps.length} operations still pending`);
      } else {
        localStorage.removeItem('pendingReadOps');
        console.log('All pending operations processed');
      }
    } catch (error) {
      console.error('Error processing pending read operations:', error);
    }
  }, [socket, user, checkBackendAvailability]);

  // Process message queue
  const processMessageQueue = useCallback(async () => {
    // Check if backend is available
    const isBackendAvailable = await checkBackendAvailability();
    if (!isBackendAvailable) {
      console.log('Backend not available, skipping message queue processing');
      return;
    }

    // Get the message queue
    const queue = getMessageQueue();
    if (queue.length === 0) return;

    console.log(`Processing message queue: ${queue.length} messages`);

    // Process each message in the queue
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];

      // Skip messages for other chats
      if (item.chatId !== chatId) continue;

      // Skip messages that have been attempted too many times
      if (item.attempts >= 5) {
        console.log(`Message has been attempted ${item.attempts} times, removing from queue`);
        removeFromMessageQueue(i);
        i--; // Adjust index after removal
        continue;
      }

      try {
        console.log(`Attempting to send queued message: ${item.message.content}`);

        // Increment attempt count
        incrementAttemptCount(i);

        // Get token for the request
        const currentToken = localStorage.getItem('token') ||
                            localStorage.getItem('userToken') ||
                            localStorage.getItem('doctorToken');

        // Create config with authorization header
        const config = {
          headers: { Authorization: `Bearer ${currentToken}` }
        };

        // Send the message
        const response = await axios.post('/api/chats/message', {
          content: item.message.content,
          chatId: item.chatId,
          attachments: item.message.attachments || []
        }, config);

        console.log('Queued message sent successfully:', response.data);

        // Remove from queue if successful
        removeFromMessageQueue(i);
        i--; // Adjust index after removal

        // Update UI to show message was sent
        if (response.data && response.data.message) {
          // Replace any failed message with the same content
          const failedMessageIndex = messages.findIndex(m =>
            m.content === item.message.content && m.failed
          );

          if (failedMessageIndex >= 0) {
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[failedMessageIndex] = {
                ...response.data.message,
                read: false
              };
              return newMessages;
            });
          } else {
            // Add as a new message if not found
            setMessages(prev => [...prev, {
              ...response.data.message,
              read: false
            }]);
          }

          // Don't refresh messages automatically - this is causing continuous refreshing
          // Instead, just update the last refresh time to prevent auto-refresh
          setLastRefreshTime(Date.now());
        }
      } catch (error) {
        console.error('Error sending queued message:', error);
        // Keep in queue for next attempt
      }
    }
  }, [chatId, messages, contextFetchMessages, contextMessages]);

  // Initialize chat when patient changes with optimized performance
  useEffect(() => {
    // Track if the component is mounted to prevent state updates after unmount
    let isMounted = true;
    const startTime = performance.now();
    const requestId = `init-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const initializeChat = async () => {
      if (!patient || !user) return;

      try {
        if (isMounted) {
          setLoading(true);
          setMessageStatus('Connecting to chat...');
        }

        const patientId = patient._id || patient.id;
        console.log(`[${requestId}] Initializing chat with patient: ${patientId}`);

        // STEP 1: Check for cached chat ID and messages for immediate display
        const cachedChatId = localStorage.getItem(`chat_${patientId}`);
        if (cachedChatId && isMounted) {
          console.log(`[${requestId}] Found cached chat ID: ${cachedChatId}`);
          setChatId(cachedChatId);

          // Try to load cached messages for immediate display
          const cachedMessages = loadChatHistory(cachedChatId);
          if (cachedMessages && cachedMessages.length > 0 && isMounted) {
            console.log(`[${requestId}] Using ${cachedMessages.length} cached messages for immediate display`);
            setMessages(cachedMessages);
            // Removed automatic scroll to bottom
            setMessageStatus('Loading latest messages...');

            // Update last refresh time
            setLastRefreshTime(Date.now());
          }
        }

        // STEP 2: Check backend availability
        const isBackendAvailable = await checkBackendAvailability();

        // If backend is not available but we have cached data, use it
        if (!isBackendAvailable && cachedChatId) {
          console.log(`[${requestId}] Backend unavailable, using cached data`);
          if (isMounted) {
            setMessageStatus('Using cached conversation. Server is currently unavailable.');

            // If we haven't already loaded cached messages, do it now
            if (messages.length === 0) {
              const cachedMessages = loadChatHistory(cachedChatId);
              if (cachedMessages && cachedMessages.length > 0) {
                setMessages(cachedMessages);
                // Removed automatic scroll to bottom
              } else {
                // If no cached messages, use mock data
                setMessages(getMockMessages());
                // Removed automatic scroll to bottom
              }
            }

            setLoading(false);
          }
          return;
        }

        // STEP 3: Ensure authentication token is set
        const currentToken = localStorage.getItem('token') ||
                            localStorage.getItem('userToken') ||
                            localStorage.getItem('doctorToken') ||
                            localStorage.getItem('persistentToken');

        if (!currentToken) {
          console.error(`[${requestId}] No authentication token found`);
          setMessageStatus('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;

        // STEP 4: Access or create chat with the patient
        console.log(`[${requestId}] Accessing chat with patient: ${patientId}`);

        let chat;
        try {
          // Use the optimized accessChat function
          chat = await accessChat(patientId);

          if (chat && isMounted) {
            console.log(`[${requestId}] Chat accessed successfully: ${chat._id}`);

            // Save chat ID to localStorage for future use
            localStorage.setItem(`chat_${patientId}`, chat._id);
            setChatId(chat._id);

            // Join the chat room via socket
            if (socket && socket.connected) {
              socket.emit('join-chat', chat._id);
              console.log(`[${requestId}] Joined socket room for chat: ${chat._id}`);
            }

            // STEP 5: Fetch messages if needed
            // If we already have messages from cache, check if they're recent
            const cacheTimestamp = localStorage.getItem(`${chat._id}_timestamp`);
            const isCacheRecent = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 30000;

            if (messages.length > 0 && isCacheRecent) {
              console.log(`[${requestId}] Using recent cached messages, skipping fetch`);
              markChatAsRead(chat._id);
              setMessageStatus('');
            } else {
              // Fetch fresh messages
              console.log(`[${requestId}] Fetching fresh messages`);
              if (isMounted) {
                setMessageStatus('Loading conversation history...');
              }

              // Use the optimized fetchMessages function with a limit of 50 messages
              await contextFetchMessages(chat._id, 50);

              if (isMounted && contextMessages && contextMessages.length > 0) {
                setMessages(contextMessages);
                saveChatHistory(chat._id, contextMessages);
                // Removed automatic scroll to bottom

                // Update last refresh time
                setLastRefreshTime(Date.now());
              }

              // Mark messages as read in a non-blocking way
              setTimeout(() => markChatAsRead(chat._id), 0);

              if (isMounted) {
                setMessageStatus('');
              }
            }

            // Set up socket listeners
            if (socket) {
              socket.off('message-received');
              socket.off('messages-marked-read');

              socket.on('message-received', (newMessage) => {
                if (!isMounted) return;

                if (newMessage.chatId === chat._id || (newMessage.chat && newMessage.chat._id === chat._id)) {
                  // Check if this message is already in our list to avoid duplicates
                  const messageExists = messages.some(m => (m._id && newMessage._id && m._id === newMessage._id));

                  if (!messageExists) {
                    const messageWithReadStatus = {
                      ...newMessage,
                      read: false
                    };

                    setMessages(prev => [...prev, messageWithReadStatus]);

                    // Also update the cached messages
                    const updatedMessages = [...messages, messageWithReadStatus];
                    saveChatHistory(chat._id, updatedMessages);

                    // Mark as read without triggering a refresh
                    markChatAsRead(chat._id);

                    // Update last refresh time to prevent auto-refresh
                    setLastRefreshTime(Date.now());

                    // Removed automatic scroll to bottom
                  }
                }
              });

              socket.on('messages-marked-read', (data) => {
                if (!isMounted) return;

                if (data.chatId === chat._id) {
                  setMessages(prev => prev.map(msg => {
                    if (msg.sender?._id === (user?._id || user?.id) && data.readBy !== (user?._id || user?.id)) {
                      return { ...msg, read: true };
                    }
                    return msg;
                  }));
                }
              });
            }

            // Process any queued messages
            setTimeout(() => {
              if (isMounted) {
                processMessageQueue();
              }
            }, 1000);
          }
        } catch (error) {
          console.error(`[${requestId}] Error accessing chat:`, error);

          // If we have a cached chat ID, use it as fallback
          if (cachedChatId && isMounted) {
            console.log(`[${requestId}] Using cached chat ID as fallback: ${cachedChatId}`);
            setChatId(cachedChatId);
            setMessageStatus('Using cached conversation. Could not connect to server.');

            // If we haven't already loaded cached messages, do it now
            if (messages.length === 0) {
              const cachedMessages = loadChatHistory(cachedChatId);
              if (cachedMessages && cachedMessages.length > 0) {
                setMessages(cachedMessages);
                // Removed automatic scroll to bottom
              } else {
                // If no cached messages, use mock data
                setMessages(getMockMessages());
                // Removed automatic scroll to bottom
              }
            }

            setLoading(false);
          } else {
            // If no cached chat ID, use mock data
            if (isMounted) {
              setChatId(`mock_${patientId}`);
              setMessages(getMockMessages());
              setMessageStatus('Using demo mode - real-time messaging unavailable');
              // Removed automatic scroll to bottom
              setLoading(false);
            }
          }
        }

        // Log performance metrics
        console.log(`[${requestId}] Chat initialization completed in ${Math.round(performance.now() - startTime)}ms`);
      } catch (error) {
        console.error(`[${requestId}] Error in chat initialization:`, error);
        if (isMounted) {
          setMessageStatus('Connection error. Please try again later.');

          // Use mock data as fallback
          setChatId(`mock_${patient._id || patient.id}`);
          setMessages(getMockMessages());
          // Removed automatic scroll to bottom
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (patient && user) {
      initializeChat();
    }

    // Cleanup function to remove socket listeners when component unmounts
    return () => {
      isMounted = false;
      if (socket) {
        socket.off('message-received');
        socket.off('messages-marked-read');
      }
    };
  }, [
    patient,
    user,
    socket,
    markChatAsRead,
    contextFetchMessages,
    contextMessages,
    forceScrollToBottom,
    scrollToBottom,
    processMessageQueue,
    accessChat,
    checkBackendAvailability,
    messages
  ]);



  // Function to load older messages
  const loadOlderMessages = useCallback(async () => {
    if (!chatId || chatId.startsWith('mock') || loadingOlderMessages) {
      return;
    }

    try {
      setLoadingOlderMessages(true);
      setMessageStatus('Loading older messages...');

      // Check if backend is available
      const isBackendAvailable = await checkBackendAvailability();
      if (!isBackendAvailable) {
        setMessageStatus('Server is currently unavailable. Cannot load older messages.');
        return;
      }

      // Get token for the request
      const currentToken = localStorage.getItem('token') ||
                          localStorage.getItem('userToken') ||
                          localStorage.getItem('doctorToken');

      if (!currentToken) {
        setMessageStatus('Authentication error. Please log in again.');
        return;
      }

      // Create config with authorization header
      const config = {
        headers: { Authorization: `Bearer ${currentToken}` }
      };

      // Calculate the next page to load
      const nextPage = currentPage + 1;

      // Make API request to get older messages
      const response = await axios.get(`/api/chats/${chatId}/messages?page=${nextPage}&limit=20`, config);

      if (response.data && response.data.messages) {
        // Check if there are more messages to load
        setHasMoreMessages(response.data.hasMore || false);

        // Update current page
        setCurrentPage(nextPage);

        // Add older messages to the beginning of the messages array
        const olderMessages = response.data.messages;
        if (olderMessages.length > 0) {
          setMessages(prev => [...olderMessages, ...prev]);

          // Save updated messages to localStorage
          const allMessages = [...olderMessages, ...messages];
          saveChatHistory(chatId, allMessages);

          setMessageStatus('Older messages loaded successfully.');

          // Clear status message after a short delay
          setTimeout(() => {
            setMessageStatus('');
          }, 2000);
        } else {
          setHasMoreMessages(false);
          setMessageStatus('No more messages to load.');

          // Clear status message after a short delay
          setTimeout(() => {
            setMessageStatus('');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error loading older messages:', error);
      setMessageStatus('Failed to load older messages. Please try again.');

      // Clear status message after a short delay
      setTimeout(() => {
        setMessageStatus('');
      }, 3000);
    } finally {
      setLoadingOlderMessages(false);
    }
  }, [chatId, currentPage, messages, loadingOlderMessages]);

  // We already have lastRefreshTime defined above

  // Function to manually refresh chat history with debounce
  const refreshChatHistory = useCallback(async (force = false) => {
    if (!chatId || chatId.startsWith('mock')) {
      console.log('Cannot refresh mock chat');
      return;
    }

    // Implement stronger debounce - don't refresh if last refresh was less than 60 seconds ago
    // unless force=true is specified
    const now = Date.now();
    if (!force && now - lastRefreshTime < 60000) { // 60 seconds
      console.log('Skipping refresh - too soon since last refresh');
      return;
    }

    // Update last refresh time
    setLastRefreshTime(now);

    // Check if backend is available before attempting to refresh
    const isBackendAvailable = await checkBackendAvailability();
    if (!isBackendAvailable) {
      if (force) {
        setMessageStatus('Server is currently unavailable. Using cached conversation.');
      }

      // Try to load from cache
      const cachedMessages = loadChatHistory(chatId);
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
      }

      return;
    }

    // If we're already loading and this is not a forced refresh, skip it
    if (loading && !force) {
      console.log('Already loading messages, skipping refresh');
      return;
    }

    try {
      // Only show loading indicator for forced refreshes to avoid flickering
      if (force) {
        setLoading(true);
        setMessageStatus('Refreshing conversation...');
      }

      // Fetch messages for this chat
      await contextFetchMessages(chatId);

      // Save fetched messages to localStorage for offline access
      if (contextMessages && contextMessages.length > 0) {
        // Compare with current messages to see if there are any changes
        const currentMessageIds = messages.map(m => m._id || m.id || '').filter(Boolean).join(',');
        const newMessageIds = contextMessages.map(m => m._id || m.id || '').filter(Boolean).join(',');

        // Only update if there are changes or this is a forced refresh
        if (force || currentMessageIds !== newMessageIds) {
          saveChatHistory(chatId, contextMessages);

          // Only log for forced refreshes to reduce console noise
          if (force) {
            console.log('Saved refreshed messages to localStorage');
          }

          // Check if there might be more messages to load
          setHasMoreMessages(contextMessages.length >= 20);

          // Reset current page to 1 since we've loaded the most recent messages
          setCurrentPage(1);

          // Update messages state
          setMessages(contextMessages);

          // Removed automatic scroll to bottom after refresh
        } else {
          console.log('No new messages, skipping update');
        }
      } else {
        // If no messages were returned but this is a forced refresh,
        // clear the messages to show an empty conversation
        if (force) {
          setMessages([]);
          saveChatHistory(chatId, []);
        }
      }

      // Mark chat as read
      markChatAsRead(chatId);

      // Clear status message on success
      if (force) {
        setMessageStatus('');
      }
    } catch (error) {
      console.error('Error refreshing chat history:', error);

      // Try to load from cache if refresh fails
      const cachedMessages = loadChatHistory(chatId);
      if (cachedMessages && cachedMessages.length > 0) {
        setMessages(cachedMessages);
        if (force) {
          setMessageStatus('Could not refresh. Using cached conversation.');
        }
      } else {
        if (force) {
          setMessageStatus('Could not refresh conversation. Please try again.');
        }
      }
    } finally {
      if (force) {
        setLoading(false);
      }
    }
  }, [chatId, contextFetchMessages, contextMessages, markChatAsRead, forceScrollToBottom, loading, messages]);

  // Add a useEffect to log when messages change - helps with debugging
  useEffect(() => {
    if (messages && messages.length > 0) {
      console.log(`Messages updated: ${messages.length} messages in chat ${chatId}`);
    }
  }, [messages, chatId]);

  // Initialize socket connection - only once
  useEffect(() => {
    // Check if socket already exists to prevent multiple connections
    if (!socket) {
      // First check if backend is available
      checkBackendAvailability().then(isAvailable => {
        if (!isAvailable) {
          console.log('Backend not available, skipping socket connection');
          return;
        }

        try {
          // Connect to socket server with options to prevent frequent reconnects
          const newSocket = io('http://localhost:5000', {
            reconnectionAttempts: 3,
            reconnectionDelay: 5000,
            timeout: 10000,
            transports: ['websocket', 'polling'],
            // Add additional options to make connection more stable
            forceNew: false,
            multiplex: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            randomizationFactor: 0.5
          });

          setSocket(newSocket);

          // Setup event listeners
          newSocket.on('connect', () => {
            console.log('Socket connected with ID:', newSocket.id);

            // Process pending operations when socket connects
            processPendingReadOperations();
          });

          newSocket.on('connected', () => {
            console.log('Socket setup complete');
          });

          newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
          });

          newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
          });
        } catch (error) {
          console.error('Error initializing socket:', error);
        }
      });

      // Cleanup on unmount
      return () => {
        if (socket) {
          socket.disconnect();
        }
      };
    }
  }, [socket, processPendingReadOperations, checkBackendAvailability]);

  // Setup user in socket when user is available
  useEffect(() => {
    if (socket && user) {
      // Send user data to socket server
      socket.emit('setup', user);
      console.log('User setup sent to socket:', user._id || user.id);
    }
  }, [socket, user]);

  // Removed automatic scroll to bottom when messages change

  // Removed automatic scroll to bottom when tab becomes active
  // scrollToBottom is a stable function defined in the component

  // Mark messages as read when the user is viewing the chat
  useEffect(() => {
    // Set up an interval to periodically mark messages as read
    // This ensures messages are marked as read even if the user is just viewing the chat
    if (chatId && !chatId.startsWith('mock')) {
      // Mark as read immediately when chat is opened
      markChatAsRead(chatId);

      // Set up a much less frequent interval to mark messages as read
      // This drastically reduces backend load and prevents continuous refreshing
      const readInterval = setInterval(() => {
        markChatAsRead(chatId);
      }, 120000); // Check every 2 minutes instead of 30 seconds

      return () => clearInterval(readInterval);
    }
  }, [chatId, markChatAsRead]);





  // Add visibility change listener to process queues when tab becomes visible again
  // But we don't automatically refresh to prevent continuous reloading
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && chatId && !chatId.startsWith('mock')) {
        console.log('Tab became visible, processing queues');

        // Only process queues, don't refresh messages
        processMessageQueue();
        processPendingReadOperations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [chatId, processMessageQueue, processPendingReadOperations]);

  // Process message queue and read operations periodically
  useEffect(() => {
    if (!chatId || chatId.startsWith('mock')) return;

    // Process queues on initial load
    processMessageQueue();
    processPendingReadOperations();

    // Do NOT refresh on initial load - we already do this in the initializeChat function
    // This prevents double-loading

    // Set up interval to process queues periodically - but NO automatic refreshing
    const queueInterval = setInterval(() => {
      processMessageQueue();
      processPendingReadOperations();

      // We've completely disabled automatic refreshing to prevent continuous reloading
      // Users can manually refresh using the refresh button if needed
    }, 120000); // Check every 2 minutes

    return () => {
      clearInterval(queueInterval);
    };
  }, [chatId, processMessageQueue, processPendingReadOperations]);

  // Handle message input change
  const handleMessageChange = (e) => {
    setMessage(e.target.value);

    // Send typing indicator
    if (chatId && !chatId.startsWith('mock')) {
      handleTyping(chatId);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    setSending(true);
    setMessageStatus('Sending message...');

    // Create a copy of the message content before it gets cleared
    const messageContent = message;

    try {
      // Upload files if any
      let attachments = [];
      if (selectedFiles.length > 0) {
        attachments = await uploadFiles();
        setSelectedFiles([]);
        setShowFileDialog(false);
      }

      if (chatId && !chatId.startsWith('mock')) {
        console.log('Sending real message to chat:', chatId);

        // Check if backend is available before attempting to send
        const isBackendAvailable = await checkBackendAvailability();

        // Make sure we have the token in axios headers
        const currentToken = localStorage.getItem('token') ||
                            localStorage.getItem('userToken') ||
                            localStorage.getItem('doctorToken');

        if (currentToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
          console.log('Set Authorization header with token for message sending');
        }

        // If backend is not available, create a failed message
        if (!isBackendAvailable) {
          console.log('Backend is not available, creating failed message');

          const failedMessage = {
            _id: `failed-${Date.now()}`,
            sender: {
              _id: user._id || user.id,
              name: user.name,
              avatar: user.avatar
            },
            content: messageContent,
            timestamp: new Date().toISOString(),
            attachments: attachments,
            failed: true
          };

          setMessages(prev => [...prev, failedMessage]);
          setMessageStatus('Could not send message. Server is unavailable.');

          // Save to local storage for later retry
          saveChatHistory(chatId, [...messages, failedMessage]);

          // Add to message queue for automatic retry
          addToMessageQueue(failedMessage, chatId);

          // Clear message input
          setMessage('');
          setSending(false);
          return;
        }

        // Create a temporary message to show immediately in the UI
        const tempMessage = {
          _id: `temp-${Date.now()}`,
          sender: {
            _id: user._id || user.id,
            name: user.name,
            avatar: user.avatar
          },
          content: message,
          timestamp: new Date().toISOString(),
          attachments: attachments,
          isTemp: true, // Flag to identify temporary messages
          sending: true // Flag to show sending status
        };

        // Add temporary message to the UI
        setMessages(prev => [...prev, tempMessage]);

        // Removed automatic scroll to new message

        // Use chat context to send message with attachments
        const result = await contextSendMessage(message, chatId, attachments);
        console.log('Message sent result:', result);

        if (result) {
          // Replace the temporary message with the real one
          setMessages(prev => prev.map(msg =>
            msg._id === tempMessage._id ? { ...result.message, read: false } : msg
          ));

          // Save the updated messages to localStorage
          if (contextMessages && contextMessages.length > 0) {
            saveChatHistory(chatId, contextMessages);
          }

          setMessageStatus('');
        } else {
          // If the context method failed, try direct API call
          console.log('Trying direct API call to send message');

          const config = {
            headers: { Authorization: `Bearer ${currentToken}` }
          };

          try {
            const response = await axios.post('/api/chats/message', {
              content: message,
              chatId,
              attachments
            }, config);

            console.log('Message sent via direct API call:', response.data);

            // Replace the temporary message with the real one
            if (response.data && response.data.message) {
              setMessages(prev => prev.map(msg =>
                msg._id === tempMessage._id ? { ...response.data.message, read: false } : msg
              ));
            }

            // Refresh messages to ensure we have the latest
            contextFetchMessages(chatId).then(() => {
              // Save the updated messages to localStorage
              if (contextMessages && contextMessages.length > 0) {
                saveChatHistory(chatId, contextMessages);
              }
            });

            setMessageStatus('');
          } catch (apiError) {
            console.error('Direct API call failed:', apiError);

            // Convert the temporary message to a failed message
            const failedMessage = {
              ...tempMessage,
              sending: false,
              failed: true,
              _id: `failed-${Date.now()}`
            };

            // Update the UI
            setMessages(prev => prev.map(msg =>
              msg._id === tempMessage._id ? failedMessage : msg
            ));

            // Add to message queue for automatic retry
            addToMessageQueue(failedMessage, chatId);

            setMessageStatus('Failed to send message. Will retry automatically.');
          }
        }
      } else {
        console.log('Using mock messaging');

        // Create a temporary message to show immediately
        const tempMessage = {
          _id: `temp-mock-${Date.now()}`,
          sender: { _id: user._id || user.id, name: user.name },
          content: message,
          timestamp: new Date().toISOString(),
          attachments: attachments,
          isTemp: true,
          sending: true
        };

        // Add temporary message to the UI
        setMessages(prev => [...prev, tempMessage]);

        // Removed automatic scroll to new message

        // Simulate sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Replace temporary message with "sent" message
        const newMessage = {
          _id: `mock${Date.now()}`,
          sender: { _id: user._id || user.id, name: user.name },
          content: message,
          timestamp: new Date().toISOString(),
          attachments: attachments,
          read: false
        };

        setMessages(prev => prev.map(msg =>
          msg._id === tempMessage._id ? newMessage : msg
        ));

        // Save to local storage
        saveChatHistory(chatId, [...messages.filter(m => m._id !== tempMessage._id), newMessage]);

        // Clear status
        setMessageStatus('');

        // Simulate patient response after a delay
        setTimeout(() => {
          const responses = [
            "Thank you for the information, doctor.",
            "I understand, I'll follow your advice.",
            "When should I come in for a follow-up?",
            "Is there anything else I should be aware of?",
            "Should I continue taking my current medication?"
          ];

          const patientResponse = {
            _id: `mock${Date.now() + 1}`,
            sender: { _id: patient._id || patient.id, name: patient.name },
            content: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date().toISOString(),
            read: true
          };

          setMessages(prev => [...prev, patientResponse]);

          // Save updated conversation to local storage
          saveChatHistory(chatId, [...messages.filter(m => m._id !== tempMessage._id), newMessage, patientResponse]);

          // Removed automatic scroll to response
        }, 3000);
      }

      // Clear message input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageStatus('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle key down (Enter to send)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Retry sending a failed message
  const handleRetryMessage = (failedMessage) => {
    // Store the content and attachments from the failed message
    const messageContent = failedMessage.content;
    const messageAttachments = failedMessage.attachments || [];

    // Remove the failed message from the UI
    setMessages(prev => prev.filter(m => m._id !== failedMessage._id));

    // Set the message content in the input field
    setMessage(messageContent);

    // If there are attachments, set them
    if (messageAttachments.length > 0) {
      setSelectedFiles(messageAttachments);
    }

    // Send the message again
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    try {
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Start voice recording
  const handleStartRecording = async () => {
    try {
      // Request microphone access and start recording
      const recorder = await startRecording();
      setRecorderState(recorder);
      setIsRecording(true);
      setShowVoicePreview(false);
      setAudioData(null);

      // Start timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setRecordingInterval(interval);

      // Show status message
      setMessageStatus('Recording voice message...');
    } catch (error) {
      console.error('Error starting voice recording:', error);

      // Show error message
      setMessageStatus('Could not access microphone. Please check your browser settings.');

      // Clear error message after 3 seconds
      setTimeout(() => {
        setMessageStatus('');
      }, 3000);
    }
  };

  // Stop voice recording
  const handleStopRecording = async () => {
    if (!recorderState) return;

    try {
      // Stop the timer
      clearInterval(recordingInterval);

      // Stop recording and get audio data
      const audio = await stopRecording(recorderState);
      setAudioData(audio);

      // Reset recording state
      setIsRecording(false);
      setRecordingTime(0);
      setRecorderState(null);

      // Show voice preview
      setShowVoicePreview(true);

      // Update status message
      setMessageStatus('Voice message recorded. Click send to deliver it.');
    } catch (error) {
      console.error('Error stopping voice recording:', error);

      // Reset recording state
      setIsRecording(false);
      setRecordingTime(0);
      setRecorderState(null);

      // Show error message
      setMessageStatus('Error recording voice message. Please try again.');

      // Clear error message after 3 seconds
      setTimeout(() => {
        setMessageStatus('');
      }, 3000);
    }
  };

  // Cancel voice recording
  const handleCancelRecording = () => {
    // Stop the timer
    clearInterval(recordingInterval);

    // Stop all tracks in the stream if recorder state exists
    if (recorderState && recorderState.stream) {
      recorderState.stream.getTracks().forEach(track => track.stop());
    }

    // Reset recording state
    setIsRecording(false);
    setRecordingTime(0);
    setRecorderState(null);
    setShowVoicePreview(false);
    setAudioData(null);
    setMessageStatus('');
  };

  // Play/pause audio preview
  const toggleAudioPlayback = () => {
    if (!audioData) return;

    if (isPlayingAudio && currentAudioElement) {
      // Pause playback
      currentAudioElement.pause();
      setIsPlayingAudio(false);
    } else {
      // Create new audio element if needed
      const audioElement = currentAudioElement || new Audio(audioData.url);

      // Set up event listeners
      audioElement.onended = () => {
        setIsPlayingAudio(false);
      };

      audioElement.onpause = () => {
        setIsPlayingAudio(false);
      };

      // Start playback
      audioElement.play();
      setIsPlayingAudio(true);
      setCurrentAudioElement(audioElement);
    }
  };

  // Send voice message
  const handleSendVoiceMessage = async () => {
    if (!audioData) return;

    try {
      // Create a file from the audio blob
      const audioFile = createAudioFile(audioData);

      // Add to selected files
      setSelectedFiles([audioFile]);

      // Hide voice preview
      setShowVoicePreview(false);

      // Stop audio playback if playing
      if (isPlayingAudio && currentAudioElement) {
        currentAudioElement.pause();
        setIsPlayingAudio(false);
      }

      // Clear audio data
      setAudioData(null);

      // Show file dialog to send the voice message
      setShowFileDialog(true);

      // Update status message
      setMessageStatus('Voice message ready to send.');
    } catch (error) {
      console.error('Error preparing voice message:', error);

      // Show error message
      setMessageStatus('Error preparing voice message. Please try again.');

      // Clear error message after 3 seconds
      setTimeout(() => {
        setMessageStatus('');
      }, 3000);
    }
  };

  // Handle file selection
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Handle file change
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 5 files at a time
      const newFiles = files.slice(0, 5);
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles].slice(0, 10)); // Max 10 files total
      setShowFileDialog(true);
    }
  };

  // Remove a file from the selected files
  const handleRemoveFile = (index) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Get file icon based on file type
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon color="primary" />;
    } else if (file.type === 'application/pdf') {
      return <PdfIcon color="error" />;
    } else {
      return <GenericFileIcon color="info" />;
    }
  };

  // This formatFileSize function is already defined above

  // Upload files
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a FormData object
      const formData = new FormData();

      // Append each file to it
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Get token for the request
      const currentToken = localStorage.getItem('token') ||
                          localStorage.getItem('userToken') ||
                          localStorage.getItem('doctorToken');

      // Create config with authorization header
      const config = {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      // Send the files to the server
      const response = await axios.post('/api/uploads/chat-attachment', formData, config);

      if (!response.data || !response.data.success) {
        throw new Error('Failed to upload files');
      }

      // Get the file URLs from the response
      const attachments = response.data.files;

      console.log('Files uploaded successfully:', attachments);

      setIsUploading(false);
      setUploadProgress(100);

      return attachments;
    } catch (error) {
      console.error('Error uploading files:', error);
      setIsUploading(false);
      setMessageStatus('Failed to upload files. Please try again.');
      return [];
    }
  };

  // Start video call
  const handleStartVideoCall = () => {
    setShowVideoCallDialog(true);
  };

  // Join video call
  const handleJoinVideoCall = () => {
    if (!patient) return;

    try {
      // Initialize WebRTC service
      const patientId = patient._id || patient.id;
      const roomId = `call-${user._id || user.id}-${patientId}`;

      // Initialize WebRTC service
      WebRTCService.initialize(user._id || user.id, patientId, roomId);

      // Send call request to patient
      WebRTCService.initiateCall(
        {
          name: user.name || 'Doctor',
          role: 'doctor',
          avatar: user.avatar || user.profileImage
        },
        patientId,
        'video'
      );

      // Show notification that call is being initiated
      setMessageStatus('Calling patient...');

      // Set up callbacks for call acceptance/rejection
      WebRTCService.setCallbacks({
        onCallAccepted: (data) => {
          console.log('Call accepted:', data);
          setMessageStatus('Call accepted! Joining call...');

          // Navigate to video call page
          navigate(`/doctor/online-appointment/${patientId}`);
        },
        onCallRejected: (data) => {
          console.log('Call rejected:', data);
          setMessageStatus(`Call rejected: ${data.reason || 'Patient unavailable'}`);
          setShowVideoCallDialog(false);
        }
      });

    } catch (error) {
      console.error('Error initiating video call:', error);
      setMessageStatus('Failed to start video call. Please try again.');
    }
  };



  // Define the onBackToPatientList function if it's not passed as a prop
  const handleBackToPatientList = useCallback(() => {
    if (onBackToPatientList) {
      onBackToPatientList();
    } else if (isMobile) {
      // If no callback is provided, try to navigate back
      window.history.back();
    }
  }, [onBackToPatientList, isMobile]);

  return (
    <Paper
      elevation={2}
      sx={{
        borderRadius: { xs: 0, sm: 2, md: 3 },
        height: { xs: '100vh', sm: '750px' },
        width: { xs: '100vw', sm: 'auto' },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: {
          xs: 'none',
          sm: `0 5px 20px ${alpha(theme.palette.common.black, 0.08)}`
        },
        position: { xs: 'fixed', sm: 'relative' },
        top: { xs: 0, sm: 'auto' },
        left: { xs: 0, sm: 'auto' },
        right: { xs: 0, sm: 'auto' },
        bottom: { xs: 0, sm: 'auto' },
        zIndex: { xs: 1200, sm: 'auto' }
      }}
    >
      {/* Mobile back button to show patient list */}
      {isMobile && (
        <IconButton
          onClick={handleBackToPatientList}
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1300,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.2)
            }
          }}
          aria-label="back to patient list"
        >
          <ArrowBackIcon />
        </IconButton>
      )}
      {/* Chat Header */}
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: alpha(theme.palette.primary.main, 0.05)
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Mobile back button */}
          {isMobile && onBackToPatientList && (
            <IconButton
              onClick={onBackToPatientList}
              sx={{
                mr: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          )}

          <Avatar
            src={patient?.avatar || patient?.profileImage}
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              mr: { xs: 1.5, sm: 2 },
              bgcolor: theme.palette.primary.main
            }}
          >
            {patient?.name ? patient.name.charAt(0).toUpperCase() : 'P'}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {patient?.name || 'Patient'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {patient?.gender || 'Unknown'}, {patient?.age || '??'} years
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
          {/* On mobile, show a menu button that opens a popover with all actions */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Tooltip title="Actions">
              <IconButton
                color="primary"
                onClick={(e) => setActionMenuAnchor(e.currentTarget)}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <MoreVert />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={actionMenuAnchor}
              open={Boolean(actionMenuAnchor)}
              onClose={() => setActionMenuAnchor(null)}
            >
              <MenuItem onClick={() => {
                onScheduleAppointment();
                setActionMenuAnchor(null);
              }}>
                <ListItemIcon>
                  <CalendarIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Schedule Appointment</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                onViewMedicalRecords();
                setActionMenuAnchor(null);
              }}>
                <ListItemIcon>
                  <MedicalIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Medical Records</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                handleStartVideoCall();
                setActionMenuAnchor(null);
              }}>
                <ListItemIcon>
                  <VideoCallIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Start Video Call</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                if (!patient) return;
                try {
                  const patientId = patient._id || patient.id;
                  const roomId = `call-${user._id || user.id}-${patientId}`;
                  WebRTCService.initialize(user._id || user.id, patientId, roomId);
                  WebRTCService.initiateCall(
                    {
                      name: user.name || 'Doctor',
                      role: 'doctor',
                      avatar: user.avatar || user.profileImage
                    },
                    patientId,
                    'audio'
                  );
                  setMessageStatus('Voice calling patient...');
                  WebRTCService.setCallbacks({
                    onCallAccepted: (data) => {
                      console.log('Voice call accepted:', data);
                      setMessageStatus('Voice call accepted! Joining call...');
                      navigate(`/doctor/online-appointment/${patientId}?audioOnly=true`);
                    },
                    onCallRejected: (data) => {
                      console.log('Voice call rejected:', data);
                      setMessageStatus(`Voice call rejected: ${data.reason || 'Patient unavailable'}`);
                    }
                  });
                } catch (error) {
                  console.error('Error initiating voice call:', error);
                  setMessageStatus('Failed to start voice call. Please try again.');
                }
                setActionMenuAnchor(null);
              }}>
                <ListItemIcon>
                  <PhoneIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Start Voice Call</ListItemText>
              </MenuItem>
            </Menu>
          </Box>

          {/* On desktop, show all action buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Tooltip title="Schedule Appointment">
              <IconButton
                color="primary"
                onClick={onScheduleAppointment}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <CalendarIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="View Medical Records">
              <IconButton
                color="primary"
                onClick={onViewMedicalRecords}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <MedicalIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Start Video Call">
              <IconButton
                color="primary"
                onClick={handleStartVideoCall}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <VideoCallIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Start Voice Call">
              <IconButton
                color="primary"
                onClick={() => {
                  if (!patient) return;

                  try {
                    // Initialize WebRTC service
                    const patientId = patient._id || patient.id;
                    const roomId = `call-${user._id || user.id}-${patientId}`;

                    // Initialize WebRTC service
                    WebRTCService.initialize(user._id || user.id, patientId, roomId);

                    // Send call request to patient
                    WebRTCService.initiateCall(
                      {
                        name: user.name || 'Doctor',
                        role: 'doctor',
                        avatar: user.avatar || user.profileImage
                      },
                      patientId,
                      'audio'
                    );

                    // Show notification that call is being initiated
                    setMessageStatus('Voice calling patient...');

                    // Set up callbacks for call acceptance/rejection
                    WebRTCService.setCallbacks({
                      onCallAccepted: (data) => {
                        console.log('Voice call accepted:', data);
                        setMessageStatus('Voice call accepted! Joining call...');

                        // Navigate to video call page with audio only flag
                        navigate(`/doctor/online-appointment/${patientId}?audioOnly=true`);
                      },
                      onCallRejected: (data) => {
                        console.log('Voice call rejected:', data);
                        setMessageStatus(`Voice call rejected: ${data.reason || 'Patient unavailable'}`);
                      }
                    });
                  } catch (error) {
                    console.error('Error initiating voice call:', error);
                    setMessageStatus('Failed to start voice call. Please try again.');
                  }
                }}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <PhoneIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
              minHeight: { xs: '40px', sm: '48px' },
              py: { xs: 0.5, sm: 1 }
            }
          }}
        >
          <Tab label="Chat" />
          <Tab label="Patient Info" />
          <Tab label="Medical History" />
        </Tabs>
      </Box>

      {/* Chat Messages Tab */}
      {activeTab === 0 && (
        <>
          {/* Chat controls */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 1,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Tooltip title="Refresh conversation">
              <IconButton
                onClick={() => refreshChatHistory(true)}
                disabled={loading || !chatId || chatId.startsWith('mock')}
                color="primary"
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flexGrow: 1,
              p: { xs: 1, sm: 1.5, md: 2 },
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Load More Messages Button */}
            {hasMoreMessages && !loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={loadOlderMessages}
                  disabled={loadingOlderMessages}
                  startIcon={loadingOlderMessages ? <CircularProgress size={16} /> : null}
                  sx={{
                    borderRadius: 4,
                    px: 3,
                    py: 1,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  {loadingOlderMessages ? 'Loading...' : 'Load Older Messages'}
                </Button>
              </Box>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Loading conversation...
                </Typography>
              </Box>
            ) : messages.length > 0 ? (
              <>
                {/* Group messages by date */}
                {(() => {
                  // Create a map of dates to messages
                  const messagesByDate = {};
                  let lastSender = null;

                  // Process messages to group by date
                  messages.forEach((msg) => {
                    // Make sure timestamp is valid
                    const timestamp = msg.timestamp || msg.createdAt || new Date();
                    const msgDate = new Date(timestamp);
                    const dateStr = msgDate.toDateString();

                    if (!messagesByDate[dateStr]) {
                      messagesByDate[dateStr] = [];
                    }

                    // Make sure sender object exists
                    if (!msg.sender || typeof msg.sender !== 'object') {
                      // Create a default sender if missing
                      msg.sender = {
                        _id: msg.senderId || 'unknown',
                        name: msg.senderName || (msg.isOwn ? 'You' : 'Patient')
                      };
                    }

                    // Add sender info for consecutive messages
                    const senderId = msg.sender._id || msg.senderId || 'unknown';
                    msg.showSender = lastSender !== senderId;
                    lastSender = senderId;

                    // Add the message to its date group
                    messagesByDate[dateStr].push(msg);
                  });

                  // Render messages grouped by date
                  return Object.keys(messagesByDate).map((dateStr) => (
                    <React.Fragment key={dateStr}>
                      {/* Date separator */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          my: { xs: 2, sm: 3 },
                          position: 'relative'
                        }}
                      >
                        <Divider sx={{ width: '100%', position: 'absolute', top: '50%' }} />
                        <Box
                          sx={{
                            bgcolor: 'background.paper',
                            px: { xs: 1.5, sm: 2 },
                            py: { xs: 0.5, sm: 0.5 },
                            zIndex: 1,
                            borderRadius: 10,
                            border: `1px solid ${theme.palette.divider}`
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            {new Date(dateStr).toLocaleDateString([], {
                              weekday: isMobile ? 'short' : 'long',
                              year: 'numeric',
                              month: isMobile ? 'short' : 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Messages for this date */}
                      {messagesByDate[dateStr].map((msg, index) => {
                        // Safely determine if message is from current user
                        const senderId = msg.sender?._id || msg.senderId || 'unknown';
                        const userId = user?._id || user?.id || 'current-user';
                        const isOwn = senderId === userId;

                        // Safely check for consecutive messages
                        const prevSenderId = index > 0 ?
                          (messagesByDate[dateStr][index - 1].sender?._id ||
                           messagesByDate[dateStr][index - 1].senderId ||
                           'unknown') : null;
                        const isConsecutive = index > 0 && prevSenderId === senderId;

                        return (
                          <Box
                            key={msg._id}
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isOwn ? 'flex-end' : 'flex-start',
                              mb: isConsecutive ? 0.5 : 2,
                              mt: isConsecutive ? 0.5 : 2,
                              maxWidth: '100%'
                            }}
                          >
                            {/* Sender name - only show for first message in a sequence */}
                            {!isConsecutive && !isOwn && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 2, mb: 0.5 }}
                              >
                                {msg.sender?.name || patient?.name || 'Patient'}
                              </Typography>
                            )}

                            <Box
                              sx={{
                                alignSelf: isOwn ? 'flex-end' : 'flex-start',
                                maxWidth: { xs: '85%', sm: '75%', md: '70%' },
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  bgcolor: isOwn ? theme.palette.primary.main : alpha(theme.palette.grey[300], 0.7),
                                  color: isOwn ? 'white' : 'text.primary',
                                  borderRadius: 2,
                                  p: { xs: 1.25, sm: 1.5 },
                                  position: 'relative',
                                  // Different border radius for consecutive messages
                                  borderTopRightRadius: isOwn && isConsecutive ? 1 : 2,
                                  borderTopLeftRadius: !isOwn && isConsecutive ? 1 : 2,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {msg.content && (
                                  <Typography variant="body1">
                                    {msg.content}
                                  </Typography>
                                )}

                                {/* Display attachments if any */}
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <Box sx={{ mt: 1, mb: 1 }}>
                                    {msg.attachments.map((attachment, index) => (
                                      <Box
                                        key={index}
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          p: 1,
                                          mb: 0.5,
                                          borderRadius: 1,
                                          bgcolor: isOwn ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.background.paper, 0.7)
                                        }}
                                      >
                                        {/* Check if this is a voice message */}
                                        {(attachment.type?.startsWith('audio/') || attachment.name?.includes('voice-message')) ? (
                                          // Voice message player
                                          <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            width: '100%',
                                            maxWidth: '300px'
                                          }}>
                                            <IconButton
                                              size="small"
                                              onClick={() => {
                                                // Create audio element to play the voice message
                                                const audio = new Audio(attachment.url.startsWith('blob:') ?
                                                  attachment.url :
                                                  `http://localhost:5000${attachment.url}`);
                                                audio.play();
                                              }}
                                              sx={{
                                                color: isOwn ? 'white' : theme.palette.primary.main,
                                                mr: 1
                                              }}
                                            >
                                              <PlayIcon />
                                            </IconButton>

                                            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                              <Typography
                                                variant="body2"
                                                sx={{
                                                  color: isOwn ? alpha(theme.palette.common.white, 0.9) : 'text.primary',
                                                  fontWeight: 'medium'
                                                }}
                                              >
                                                Voice Message
                                              </Typography>

                                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <WaveformIcon
                                                  sx={{
                                                    fontSize: 16,
                                                    mr: 0.5,
                                                    color: isOwn ? alpha(theme.palette.common.white, 0.7) : theme.palette.primary.main
                                                  }}
                                                />
                                                <Box sx={{ flexGrow: 1 }}>
                                                  <LinearProgress
                                                    variant="determinate"
                                                    value={0}
                                                    sx={{
                                                      height: 4,
                                                      borderRadius: 2,
                                                      bgcolor: isOwn ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.primary.main, 0.1),
                                                      '& .MuiLinearProgress-bar': {
                                                        bgcolor: isOwn ? 'white' : theme.palette.primary.main
                                                      }
                                                    }}
                                                  />
                                                </Box>
                                              </Box>

                                              {attachment.size && (
                                                <Typography
                                                  variant="caption"
                                                  sx={{
                                                    color: isOwn ? alpha(theme.palette.common.white, 0.7) : 'text.secondary',
                                                    mt: 0.5
                                                  }}
                                                >
                                                  {formatFileSize(attachment.size)}
                                                </Typography>
                                              )}
                                            </Box>
                                          </Box>
                                        ) : attachment.type?.startsWith('image/') ? (
                                          <Box
                                            component="img"
                                            src={attachment.url.startsWith('blob:') ? attachment.url : `http://localhost:5000${attachment.url}`}
                                            alt={attachment.name}
                                            sx={{
                                              maxWidth: '100%',
                                              maxHeight: 150,
                                              borderRadius: 1,
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => window.open(attachment.url.startsWith('blob:') ?
                                              attachment.url :
                                              `http://localhost:5000${attachment.url}`, '_blank')}
                                            onError={(e) => {
                                              console.error('Image failed to load:', attachment.url);
                                              e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Available';
                                            }}
                                          />
                                        ) : (
                                          <>
                                            {attachment.type === 'application/pdf' ? (
                                              <PdfIcon color="error" sx={{ mr: 1 }} />
                                            ) : attachment.type?.startsWith('image/') ? (
                                              <ImageIcon color="primary" sx={{ mr: 1 }} />
                                            ) : (
                                              <GenericFileIcon color="info" sx={{ mr: 1 }} />
                                            )}
                                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                                              <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{
                                                  color: isOwn ? alpha(theme.palette.common.white, 0.9) : 'text.primary',
                                                  textDecoration: 'underline',
                                                  cursor: 'pointer'
                                                }}
                                                onClick={() => window.open(attachment.url.startsWith('blob:') ?
                                                  attachment.url :
                                                  `http://localhost:5000${attachment.url}`, '_blank')}
                                              >
                                                {attachment.name}
                                              </Typography>
                                              <Typography
                                                variant="caption"
                                                sx={{ color: isOwn ? alpha(theme.palette.common.white, 0.7) : 'text.secondary' }}
                                              >
                                                {attachment.size && formatFileSize(attachment.size)}
                                              </Typography>
                                            </Box>
                                          </>
                                        )}
                                      </Box>
                                    ))}
                                  </Box>
                                )}

                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  mt: 0.5
                                }}>
                                  {/* Message status indicators */}
                                  {isOwn && (
                                    <>
                                      {/* Sending indicator */}
                                      {msg.sending && (
                                        <Tooltip title="Sending...">
                                          <CircularProgress size={10} thickness={8} sx={{ mr: 0.5, color: alpha(theme.palette.common.white, 0.7) }} />
                                        </Tooltip>
                                      )}

                                      {/* Failed indicator with retry button */}
                                      {msg.failed && (
                                        <Tooltip title="Failed to send. Click to retry.">
                                          <IconButton
                                            size="small"
                                            sx={{
                                              p: 0,
                                              mr: 0.5,
                                              color: theme.palette.error.light,
                                              '&:hover': { color: theme.palette.error.main }
                                            }}
                                            onClick={() => handleRetryMessage(msg)}
                                          >
                                            <RefreshIcon fontSize="inherit" />
                                          </IconButton>
                                        </Tooltip>
                                      )}

                                      {/* Read/delivered indicator */}
                                      {!msg.sending && !msg.failed && !msg.isTemp && (
                                        <Tooltip title={msg.read ? "Read" : "Delivered"}>
                                          <Box
                                            component="span"
                                            sx={{
                                              width: 8,
                                              height: 8,
                                              borderRadius: '50%',
                                              bgcolor: msg.read ? theme.palette.success.main : alpha(theme.palette.common.white, 0.5),
                                              mr: 0.5,
                                              display: 'inline-block'
                                            }}
                                          />
                                        </Tooltip>
                                      )}
                                    </>
                                  )}

                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: isOwn ? alpha(theme.palette.common.white, 0.7) : 'text.secondary'
                                    }}
                                  >
                                    {formatTime(msg.timestamp)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </React.Fragment>
                  ));
                })()}
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
              </Box>
            )}

            {/* Status message */}
            {messageStatus && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                my: 2,
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.info.main, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
              }}>
                <Typography variant="body2" color="info.main" sx={{ fontStyle: 'italic' }}>
                  {messageStatus}
                </Typography>
              </Box>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <Box sx={{ alignSelf: 'flex-start', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {patient?.name || 'Patient'} is typing...
                </Typography>
              </Box>
            )}

            {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />

            {/* Manual scroll to bottom button */}
            <Box
              sx={{
                position: 'sticky',
                bottom: 16,
                alignSelf: 'center',
                zIndex: 10,
                mb: 1
              }}
            >
              <Tooltip title="Scroll to bottom">
                <IconButton
                  onClick={() => forceScrollToBottom()}
                  color="primary"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: 2,
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.1)'
                    }
                  }}
                >
                  <ArrowDownwardIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Message Input */}
          <Box
            sx={{
              p: { xs: 1, sm: 1.5, md: 2 },
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.paper, 0.9)
            }}
          >
            {isRecording ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 2 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      component={RecordIcon}
                      color="error"
                      sx={{
                        mr: 1,
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { opacity: 0.5 },
                          '50%': { opacity: 1 },
                          '100%': { opacity: 0.5 }
                        }
                      }}
                    />
                    <Typography variant="body2" color="error.main" fontWeight="medium">
                      Recording voice message: {formatRecordingTime(recordingTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleCancelRecording}
                      startIcon={<CloseIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={handleStopRecording}
                      startIcon={<StopIcon />}
                    >
                      Stop
                    </Button>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Recording will automatically stop after 2 minutes
                </Typography>
              </Box>
            ) : showVoicePreview && audioData ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 2 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 2 }}>
                    <IconButton
                      color="primary"
                      onClick={toggleAudioPlayback}
                      sx={{ mr: 1 }}
                    >
                      {isPlayingAudio ? <PauseIcon /> : <PlayIcon />}
                    </IconButton>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Voice Message {formatAudioFileSize(audioData.size)}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WaveformIcon color="primary" sx={{ fontSize: 16, mr: 0.5 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={isPlayingAudio ? 50 : 0}
                            color="primary"
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={handleCancelRecording}
                      startIcon={<CloseIcon />}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleSendVoiceMessage}
                      startIcon={<SendIcon />}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Type your message here..."
                    variant="outlined"
                    value={message}
                    onChange={handleMessageChange}
                    onKeyDown={handleKeyDown}
                    multiline
                    maxRows={4}
                    disabled={sending}
                    InputProps={{
                      sx: {
                        borderRadius: 3,
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }
                    }}
                    sx={{ flexGrow: 1 }}
                  />

                  {/* Mobile-friendly controls */}
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 1 } }}>
                    <Tooltip title="Attach File">
                      <IconButton
                        color="primary"
                        onClick={handleFileSelect}
                        size="medium"
                        sx={{
                          padding: { xs: '6px', sm: '8px' },
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                        }}
                      >
                        <AttachFileIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      multiple
                      accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,audio/*"
                    />

                    <Tooltip title="Voice Message">
                      <IconButton
                        color="primary"
                        onClick={handleStartRecording}
                        size="medium"
                        sx={{
                          padding: { xs: '6px', sm: '8px' },
                          bgcolor: alpha(theme.palette.primary.main, 0.05),
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                        }}
                      >
                        <MicIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Button
                      variant="contained"
                      color="primary"
                      endIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                      onClick={handleSendMessage}
                      disabled={(selectedFiles.length === 0 && !message.trim()) || sending}
                      sx={{
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 0.5, sm: 1 },
                        minWidth: { xs: '40px', sm: '80px' },
                        display: { xs: 'flex', sm: 'inline-flex' }
                      }}
                    >
                      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Send</Box>
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

            {/* Quick Responses */}
            <Box sx={{
              display: 'flex',
              gap: { xs: 0.5, sm: 1 },
              mt: { xs: 1, sm: 2 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <Chip
                label="How are you feeling today?"
                onClick={() => setMessage("How are you feeling today?")}
                sx={{
                  cursor: 'pointer',
                  fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                  height: { xs: '28px', sm: '32px' }
                }}
                size="small"
              />
              <Chip
                label="Have you taken your medication?"
                onClick={() => setMessage("Have you taken your medication as prescribed?")}
                sx={{
                  cursor: 'pointer',
                  fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                  height: { xs: '28px', sm: '32px' }
                }}
                size="small"
              />
              <Chip
                label="Any side effects?"
                onClick={() => setMessage("Have you experienced any side effects from the medication?")}
                sx={{
                  cursor: 'pointer',
                  fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                  height: { xs: '28px', sm: '32px' }
                }}
                size="small"
              />
              <Chip
                label="Schedule follow-up"
                onClick={() => setMessage("Would you like to schedule a follow-up appointment?")}
                sx={{
                  cursor: 'pointer',
                  fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                  height: { xs: '28px', sm: '32px' }
                }}
                size="small"
              />
            </Box>
          </Box>
        </>
      )}

      {/* Patient Info Tab */}
      {activeTab === 1 && (
        <Box sx={{ p: 3, overflowY: 'auto' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Patient Information
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Personal Details
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Full Name:</Typography>
                      <Typography variant="body2">{patient?.name || 'N/A'}</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Age:</Typography>
                      <Typography variant="body2">{patient?.age || 'N/A'} years</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Gender:</Typography>
                      <Typography variant="body2">{patient?.gender || 'N/A'}</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Blood Type:</Typography>
                      <Typography variant="body2">{patientDetails?.bloodType || 'N/A'}</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Height:</Typography>
                      <Typography variant="body2">{patientDetails?.height || 'N/A'}</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Weight:</Typography>
                      <Typography variant="body2">{patientDetails?.weight || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Contact Information
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Email:</Typography>
                      <Typography variant="body2">{patient?.email || 'N/A'}</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Phone:</Typography>
                      <Typography variant="body2">{patient?.phone || patientDetails?.phone || 'N/A'}</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Emergency Contact:</Typography>
                      <Typography variant="body2">{patientDetails?.emergencyContact || 'N/A'}</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Address:</Typography>
                      <Typography variant="body2">{patientDetails?.address || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Insurance Information
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Insurance Provider:</Typography>
                      <Typography variant="body2">{patientDetails?.insuranceProvider || 'N/A'}</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Policy Number:</Typography>
                      <Typography variant="body2">{patientDetails?.policyNumber || 'N/A'}</Typography>
                    </Box>
                    <Divider />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Coverage Type:</Typography>
                      <Typography variant="body2">{patientDetails?.coverageType || 'N/A'}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Medical History Tab */}
      {activeTab === 2 && (
        <Box sx={{ p: 3, overflowY: 'auto' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Medical History
          </Typography>

          {/* Upcoming Appointments */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
            Upcoming Appointments
          </Typography>

          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment._id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon color="primary" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2">{appointment.reason || 'Appointment'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(appointment.date)} at {appointment.time || '00:00'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={appointment.status || 'Scheduled'}
                      color={appointment.status === 'confirmed' ? 'success' : 'primary'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No upcoming appointments.
            </Typography>
          )}

          {/* Recent Appointments */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
            Recent Appointments
          </Typography>

          {recentAppointments && recentAppointments.length > 0 ? (
            recentAppointments.map((appointment) => (
              <Card key={appointment._id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2">{appointment.reason || 'Appointment'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(appointment.date)} at {appointment.time || '00:00'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={appointment.status || 'Completed'}
                      color={appointment.status === 'completed' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No recent appointments.
            </Typography>
          )}

          {/* Medical Records */}
          <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 3, mb: 2 }}>
            Medical Records
          </Typography>

          {medicalRecords && medicalRecords.length > 0 ? (
            medicalRecords.map((record) => (
              <Card key={record.id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MedicalIcon color="error" sx={{ mr: 1 }} />
                      <Box>
                        <Typography variant="subtitle2">{record.diagnosis}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(record.date)}
                        </Typography>
                      </Box>
                    </Box>
                    <Button size="small" variant="outlined">View</Button>
                  </Box>
                  {record.notes && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {record.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No medical records available.
            </Typography>
          )}
        </Box>
      )}

      {/* File Upload Dialog */}
      <Dialog
        open={showFileDialog}
        onClose={() => setShowFileDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Send Files</Typography>
            <IconButton onClick={() => setShowFileDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {isUploading ? (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Uploading files... {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected files ({selectedFiles.length}) -
                Total size: {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))}
                {selectedFiles.reduce((total, file) => total + file.size, 0) > 10 * 1024 * 1024 &&
                  <Typography component="span" color="error.main"> (Max 10MB)</Typography>
                }
              </Typography>
              <List>
                {selectedFiles.map((file, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveFile(index)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      {getFileIcon(file)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={formatFileSize(file.size)}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  onClick={handleFileSelect}
                >
                  Add More Files
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFileDialog(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={
              selectedFiles.length === 0 ||
              isUploading ||
              selectedFiles.reduce((total, file) => total + file.size, 0) > 10 * 1024 * 1024
            }
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : 'Send Files'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Video Call Dialog */}
      <Dialog
        open={showVideoCallDialog}
        onClose={() => setShowVideoCallDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Start Video Call</Typography>
            <IconButton onClick={() => setShowVideoCallDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Avatar
              src={patient?.avatar || patient?.profileImage}
              sx={{
                width: 100,
                height: 100,
                mx: 'auto',
                mb: 2,
                bgcolor: theme.palette.primary.main,
                fontSize: '2.5rem'
              }}
            >
              {patient?.name ? patient.name.charAt(0).toUpperCase() : 'P'}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {patient?.name || 'Patient'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {patient?.gender || 'Unknown'}, {patient?.age || '??'} years
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <Tooltip title={videoEnabled ? "Turn Camera Off" : "Turn Camera On"}>
                <IconButton
                  color={videoEnabled ? "primary" : "default"}
                  onClick={() => setVideoEnabled(!videoEnabled)}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  {videoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}>
                <IconButton
                  color={audioEnabled ? "primary" : "default"}
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  {audioEnabled ? <MicOnIcon /> : <MicOffIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowVideoCallDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleJoinVideoCall}
            startIcon={<VideoCallIcon />}
          >
            Join Call
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DoctorPatientChat;
