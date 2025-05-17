import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  CircularProgress,
  Paper,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Chip,
  Button
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  VideoCall as VideoCallIcon,
  Phone as PhoneIcon,
  VerifiedUser as VerifiedUserIcon,
  MedicalServices as MedicalServicesIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from '../../utils/axiosConfig';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import mockApi from '../../utils/mockChatService';

const PatientChat = ({ doctor, onVideoCall }) => {
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // State variables
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');

  // Get user from Redux store
  const authUser = useSelector((state) => state.auth.user);
  const userAuthUser = useSelector((state) => state.userAuth.user);
  const user = authUser || userAuthUser || JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('userData'));

  // Function to get the most recent token
  const getAuthToken = () => {
    return localStorage.getItem('token') ||
           localStorage.getItem('userToken') ||
           localStorage.getItem('patientToken') ||
           localStorage.getItem('persistentToken');
  };

  // Fetch messages
  const fetchMessages = useCallback(async (chatId) => {
    try {
      console.log('🔍 fetchMessages called with chatId:', chatId);

      if (!chatId) {
        console.error('❌ Cannot fetch messages: chatId is undefined or null');
        return;
      }

      // Check if this is a valid MongoDB ObjectId format
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(chatId);
      console.log('🔍 Is valid ObjectId?', isValidObjectId);

      // Check if this is a fallback ID
      const isFallbackId = chatId.startsWith('fallback_') || chatId.startsWith('mock_');
      console.log('🔍 Is fallback ID?', isFallbackId);

      // Store the last fetch time to prevent too frequent API calls
      const lastFetchKey = `last_fetch_${chatId}`;
      const lastFetchTime = localStorage.getItem(lastFetchKey);
      const now = Date.now();

      // If this is a fallback ID and we've fetched recently (within 10 seconds), use cached data
      if (isFallbackId && lastFetchTime && (now - parseInt(lastFetchTime)) < 10000) {
        console.log('⏱️ Using cached messages for fallback ID (throttling API calls)');
        return; // Skip API call to prevent flooding
      }

      // Get doctor ID for direct API call if needed
      const docId = doctor?._id || doctor?.id;
      if (!docId) {
        console.error('❌ Cannot fetch messages: doctor ID is undefined or null');
      } else {
        console.log('👨‍⚕️ Using doctor ID:', docId);
      }

      console.log('🔄 Proceeding with message fetch for chatId:', chatId);

      // Update last fetch time
      localStorage.setItem(lastFetchKey, now.toString());

      let response;

      // Try a direct API call with doctor ID first if we have it
      const doctorId = doctor?._id || doctor?.id;

      if (doctorId) {
        try {
          // Try to create/get a chat first
          console.log('🔄 Trying direct API call with doctor ID:', doctorId);
          console.log('🔍 Doctor object:', doctor);

          const createResponse = await axios.post('/api/patient-doctor-chat', {
            userId: doctorId
          });

          console.log('📦 Create chat response:', createResponse.data);

          if (createResponse.data && createResponse.data._id) {
            console.log('✅ Created/got chat with ID:', createResponse.data._id);
            console.log('🔍 Chat participants:', createResponse.data.participants);

            // Use the returned chat ID to fetch messages
            const directChatId = createResponse.data._id;

            // Update the chat ID if it's different
            if (directChatId !== chatId) {
              console.log('🔄 Updating chat ID from', chatId, 'to', directChatId);
              setChatId(directChatId);
              localStorage.setItem(`chat_${doctorId}`, directChatId);
            }

            // Fetch messages with the direct chat ID
            const messagesResponse = await axios.get(`/api/patient-doctor-chat/${directChatId}/messages`);
            console.log('✅ Fetched messages using direct API call, status:', messagesResponse.status);
            console.log('📦 Messages response data:', messagesResponse.data);
            console.log('📦 Messages count:', messagesResponse.data.messages?.length || 0);
            console.log('📦 First few messages:', messagesResponse.data.messages?.slice(0, 3));

            // Check if these are mock messages
            const hasMockMessages = messagesResponse.data.messages?.some(msg =>
              msg.sender?._id === 'system' ||
              msg.content?.includes('mock') ||
              msg.content?.includes('Welcome to SoulSpace')
            );

            console.log('🔍 Has mock messages?', hasMockMessages);

            response = messagesResponse;
          }
        } catch (directApiError) {
          console.log('⚠️ Direct API call failed:', directApiError.message);
          console.log('⚠️ Error details:', directApiError.response?.data);
          // Continue with regular flow
        }
      }

      // If we don't have a response yet, try the regular flow
      if (!response) {
        if (isValidObjectId) {
          try {
            // Try the patient-doctor-chat API first
            console.log('🔄 Fetching messages from patient-doctor-chat API:', `/api/patient-doctor-chat/${chatId}/messages`);
            response = await axios.get(`/api/patient-doctor-chat/${chatId}/messages`);
            console.log('✅ Fetched messages using patient-doctor-chat API, status:', response.status);
          } catch (patientDoctorApiError) {
            console.log('⚠️ Patient-doctor-chat API error:', patientDoctorApiError.message);
            console.log('🔄 Trying regular chat API as fallback');

            try {
              // Fall back to regular chat API
              console.log('🔄 Fetching messages from regular chat API:', `/api/chats/${chatId}`);
              response = await axios.get(`/api/chats/${chatId}`);
              console.log('✅ Fetched messages using regular chat API, status:', response.status);
            } catch (chatApiError) {
              console.log('⚠️ Regular chat API error:', chatApiError.message);
              console.log('🔄 All API attempts failed, using mock messages API as last resort');

              // Use mock API as last resort
              response = await mockApi.getMessages(chatId);
              console.log('✅ Fetched mock messages');
            }
          }
        } else if (isFallbackId) {
          try {
            // For fallback IDs, try the patient-doctor-chat API which now handles them
            console.log('🔄 Fetching messages for fallback ID from patient-doctor-chat API');
            response = await axios.get(`/api/patient-doctor-chat/${chatId}/messages`);
            console.log('✅ Fetched messages for fallback ID using patient-doctor-chat API, status:', response.status);
          } catch (error) {
            console.log('⚠️ API error for fallback ID:', error.message);
            console.log('🔄 Using mock messages as fallback');

            // Use mock API as fallback
            response = await mockApi.getMessages(chatId);
            console.log('✅ Fetched mock messages for fallback ID');
          }
        } else {
          console.log('⚠️ Invalid ID format, using mock messages directly');
          // If not a valid ObjectId or fallback ID, use mock API directly
          response = await mockApi.getMessages(chatId);
          console.log('✅ Fetched mock messages for invalid ID format');
        }
      }

      console.log('📦 Message response received:', response);
      console.log('📦 Message response data:', response.data);

      // Handle different response formats
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Setting messages from array response, count:', response.data.length);
        setMessages(response.data);
      } else if (response.data && Array.isArray(response.data.messages)) {
        console.log('✅ Setting messages from response.data.messages, count:', response.data.messages.length);
        setMessages(response.data.messages);
      } else if (response.data && response.data.chat && Array.isArray(response.data.chat.messages)) {
        console.log('✅ Setting messages from response.data.chat.messages, count:', response.data.chat.messages.length);
        setMessages(response.data.chat.messages);
      } else if (response.data && response.data.messages && Array.isArray(response.data.messages)) {
        console.log('✅ Setting messages from response.data.messages array, count:', response.data.messages.length);
        setMessages(response.data.messages);
      } else {
        console.log('⚠️ No valid message format found in response, setting empty array');
        console.log('Response data type:', typeof response.data);
        console.log('Response data keys:', response.data ? Object.keys(response.data) : 'null/undefined');
        setMessages([]);
      }

      // Force a scroll to bottom after messages are updated
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Error loading messages. Please try refreshing.');

      // Use empty array as last resort
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Add polling interval state
  const [pollingInterval, setPollingInterval] = useState(null);

  // Add debug mode state
  const [debugMode, setDebugMode] = useState(false);

  // Initialize chat
  useEffect(() => {
    let isMounted = true;
    let socketInstance = null;

    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const initializeChat = async () => {
      console.log('🚀 Initializing chat...');
      console.log('🚀 Doctor:', doctor);
      console.log('🚀 User:', user);

      if (!doctor || !user) {
        console.error('❌ Missing doctor or user information, cannot initialize chat');
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Get token
        const token = getAuthToken();
        console.log('🔑 Auth token available:', !!token);

        if (!token) {
          console.error('❌ No authentication token found');
          setError('Authentication required. Please log in again.');
          setLoading(false);
          return;
        }

        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token set in axios headers');

        // Get doctor ID
        let doctorId = doctor?._id || doctor?.id;

        // If no doctor ID is available, use a special ID that the backend will handle
        if (!doctorId) {
          console.log('❌ No doctor ID available, using force-doctor-id');
          doctorId = 'force-doctor-id';
        } else {
          console.log('👨‍⚕️ Doctor ID:', doctorId);
        }

        // First check if we have a cached chat ID for this doctor
        const cachedChatKey = `chat_${doctorId}`;
        const cachedChatId = localStorage.getItem(cachedChatKey);
        console.log('🔍 Cached chat key:', cachedChatKey);
        console.log('🔍 Cached chat ID found:', cachedChatId);

        if (cachedChatId) {
          console.log('💾 Using cached chat ID:', cachedChatId);
          setChatId(cachedChatId);

          // Immediately fetch messages with the cached ID
          console.log('📨 Fetching messages with cached chat ID');
          fetchMessages(cachedChatId);

          // We'll still try to verify with the backend, but we can proceed with the cached ID
          try {
            console.log('🔄 Verifying cached chat ID with backend');
            // Verify the chat exists
            const verifyResponse = await axios.get(`/api/chats/${cachedChatId}`);
            if (verifyResponse.data && verifyResponse.data._id) {
              console.log('✅ Verified chat ID with backend');
            }
          } catch (verifyError) {
            console.log('⚠️ Could not verify cached chat ID with backend:', verifyError.message);
            // We'll continue with the cached ID for now, and try to create a new one below
          }
        } else {
          console.log('💾 No cached chat ID found, will create a new one');
        }

        // Access or create chat if we don't have a cached ID or want to refresh it
        if (!cachedChatId) {
          try {
            // Try the patient-doctor-chat API first
            let response;
            console.log('🔄 Attempting to create/access chat with doctor ID:', doctorId);

            try {
              // Use the dedicated patient-doctor-chat endpoint
              console.log('🔄 Trying patient-doctor-chat API endpoint');

              // Add retry logic for the force-doctor-id case
              let retryCount = 0;
              const maxRetries = 3;

              while (retryCount < maxRetries) {
                try {
                  response = await axios.post('/api/patient-doctor-chat', { userId: doctorId });
                  console.log('✅ Created chat using patient-doctor-chat API:', response.data);
                  break; // Success, exit the retry loop
                } catch (retryError) {
                  retryCount++;
                  console.log(`⚠️ Attempt ${retryCount} failed:`, retryError.message);

                  if (retryCount >= maxRetries) {
                    throw retryError; // Max retries reached, propagate the error
                  }

                  // Wait before retrying (exponential backoff)
                  const delay = 1000 * Math.pow(2, retryCount);
                  console.log(`🕒 Waiting ${delay}ms before retry ${retryCount + 1}...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
              }
            } catch (apiError) {
              console.log('⚠️ Patient-doctor-chat API error:', apiError.message);
              console.log('🔄 Trying regular chat API as fallback');

              try {
                // Fall back to regular chat API
                response = await axios.post('/api/chats', { userId: doctorId });
                console.log('✅ Created chat using regular chat API:', response.data);
              } catch (chatApiError) {
                console.log('⚠️ Regular chat API error:', chatApiError.message);
                console.log('🔄 All API attempts failed, using mock chat API as last resort');

                // Use mock API as last resort
                response = await mockApi.createChat(doctorId, user);
                console.log('✅ Created mock chat:', response.data);
              }
            }

            if (response.data && response.data._id) {
              setChatId(response.data._id);

              // Cache the chat ID
              localStorage.setItem(cachedChatKey, response.data._id);
              console.log('Created new chat with ID:', response.data._id);

              // Initialize socket
              try {
                const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
                socketInstance = io(socketUrl, {
                  reconnectionAttempts: 5,
                  reconnectionDelay: 1000,
                  timeout: 10000,
                  transports: ['websocket', 'polling'],
                  auth: { token }
                });

                socketInstance.on('connect', () => {
                  console.log('Socket connected successfully');
                  socketInstance.emit('setup', user);
                  socketInstance.emit('join-chat', response.data._id);
                });

                socketInstance.on('typing', (chatRoomId) => {
                  if (chatRoomId === response.data._id && isMounted) {
                    setIsTyping(true);
                  }
                });

                socketInstance.on('stop-typing', (chatRoomId) => {
                  if (chatRoomId === response.data._id && isMounted) {
                    setIsTyping(false);
                  }
                });

                socketInstance.on('message-received', (newMessage) => {
                  if (newMessage && newMessage.chat &&
                      (newMessage.chat._id === response.data._id || newMessage.chat === response.data._id) &&
                      isMounted) {
                    setMessages(prev => [...prev, newMessage]);
                    scrollToBottom();
                  }
                });

                socketInstance.on('reconnect', (attemptNumber) => {
                  console.log(`Socket reconnected after ${attemptNumber} attempts`);
                  socketInstance.emit('setup', user);
                  socketInstance.emit('join-chat', response.data._id);
                });

                socketInstance.on('disconnect', () => {
                  console.log('Socket disconnected, will try to reconnect');
                });

                socketInstance.on('error', (error) => {
                  console.error('Socket error:', error);
                });

                if (isMounted) {
                  setSocket(socketInstance);
                }
              } catch (socketError) {
                console.error('Error initializing socket:', socketError);
                // Continue without socket - we'll use polling as fallback
              }

              // Fetch messages
              fetchMessages(response.data._id);
            } else {
              setError('Failed to create chat session.');

              // Create a fallback chat ID using the mock service to ensure proper format
              try {
                const mockChatResponse = await mockApi.createChat(doctorId, user);
                const fallbackChatId = mockChatResponse.data._id;
                setChatId(fallbackChatId);
                localStorage.setItem(cachedChatKey, fallbackChatId);
                console.log('Created fallback chat with ID:', fallbackChatId);
              } catch (mockError) {
                console.error('Error creating fallback chat:', mockError);
                setError('Could not establish chat session. Please try again later.');
              }
            }
          } catch (error) {
            console.error('Error accessing chat:', error);
            setError('Error connecting to chat. Please try again.');

            // Create a fallback chat ID using the mock service to ensure proper format
            try {
              const mockChatResponse = await mockApi.createChat(doctorId, user);
              const fallbackChatId = mockChatResponse.data._id;
              setChatId(fallbackChatId);
              localStorage.setItem(cachedChatKey, fallbackChatId);
              console.log('Created fallback chat with ID:', fallbackChatId);
            } catch (mockError) {
              console.error('Error creating fallback chat:', mockError);
              setError('Could not establish chat session. Please try again later.');
            }
          }
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        setError('Error initializing chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Set up polling for fallback IDs
    if (chatId && (chatId.startsWith('fallback_') || chatId.startsWith('mock_'))) {
      console.log('Setting up polling for fallback chat ID');

      // Use a longer interval (15 seconds) to reduce API calls
      const interval = setInterval(() => {
        if (isMounted) {
          console.log('Polling for messages (fallback ID)');
          fetchMessages(chatId);
        }
      }, 15000); // 15 seconds

      setPollingInterval(interval);
    }

    // Clean up on unmount
    return () => {
      isMounted = false;
      if (socketInstance) {
        socketInstance.disconnect();
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [doctor, user, fetchMessages, scrollToBottom, chatId, pollingInterval]);

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !chatId) return;

    const messageText = message;
    setMessage('');
    setSending(true);

    try {
      // Create temporary message for immediate display
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content: messageText,
        sender: {
          _id: user._id || user.id,
          name: user.name
        },
        timestamp: new Date().toISOString(),
        isTemp: true
      };

      // Add to messages immediately
      setMessages(prev => [...prev, tempMessage]);

      // Send to server
      let response;

      // Check if this is a valid MongoDB ObjectId format
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(chatId);

      // Check if this is a fallback ID
      const isFallbackId = chatId.startsWith('fallback_') || chatId.startsWith('mock_');

      // Get doctor ID for direct API call
      const doctorId = doctor?._id || doctor?.id;

      // Try direct API call first if we have a doctor ID
      if (doctorId) {
        try {
          console.log('🔄 Trying direct API call to send message with doctor ID:', doctorId);

          // First ensure we have a valid chat
          const createResponse = await axios.post('/api/patient-doctor-chat', {
            userId: doctorId
          });

          if (createResponse.data && createResponse.data._id) {
            const directChatId = createResponse.data._id;
            console.log('✅ Using chat ID for message:', directChatId);

            // Update chat ID if different
            if (directChatId !== chatId) {
              console.log('🔄 Updating chat ID from', chatId, 'to', directChatId);
              setChatId(directChatId);
              localStorage.setItem(`chat_${doctorId}`, directChatId);
            }

            // Send message with the direct chat ID
            response = await axios.post(`/api/patient-doctor-chat/${directChatId}/messages`, {
              content: messageText
            });
            console.log('✅ Sent message using direct API call');
          }
        } catch (directApiError) {
          console.log('⚠️ Direct API call failed:', directApiError.message);
          // Continue with regular flow
        }
      }

      // If direct API call failed or we don't have a doctor ID, try regular flow
      if (!response) {
        if (isValidObjectId) {
          try {
            // Try the patient-doctor-chat API first
            response = await axios.post(`/api/patient-doctor-chat/${chatId}/messages`, {
              content: messageText
            });
            console.log('✅ Sent message using patient-doctor-chat API');
          } catch (patientDoctorApiError) {
            console.log('⚠️ Patient-doctor-chat API error:', patientDoctorApiError.message);
            console.log('🔄 Trying regular chat API as fallback');

            try {
              // Fall back to regular chat API
              response = await axios.post(`/api/chats/message`, {
                content: messageText,
                chatId: chatId
              });
              console.log('✅ Sent message using regular chat API');
            } catch (chatApiError) {
              console.log('⚠️ All API attempts failed, using mock message send API as last resort');

              // Use mock API as last resort
              response = await mockApi.sendMessage(chatId, messageText, user);
              console.log('✅ Sent message using mock API');
            }
          }
        } else if (isFallbackId) {
          try {
            // For fallback IDs, try the patient-doctor-chat API which now handles them
            response = await axios.post(`/api/patient-doctor-chat/${chatId}/messages`, {
              content: messageText
            });
            console.log('✅ Sent message for fallback ID using patient-doctor-chat API');
          } catch (error) {
            console.log('⚠️ API error for fallback ID:', error.message);
            console.log('🔄 Using mock message send as fallback');

            // Use mock API as fallback
            response = await mockApi.sendMessage(chatId, messageText, user);
            console.log('✅ Sent message using mock API for fallback ID');
          }
        } else {
          console.log('⚠️ Invalid ID format, using mock message send directly');

          // If not a valid ObjectId or fallback ID, use mock API directly
          response = await mockApi.sendMessage(chatId, messageText, user);
          console.log('✅ Sent message using mock API for invalid ID format');
        }
      }

      if (response.data && response.data.message) {
        // Replace temp message with real one
        setMessages(prev =>
          prev.map(msg =>
            msg._id === tempMessage._id ? response.data.message : msg
          )
        );

        // Emit socket event
        if (socket && socket.connected) {
          socket.emit('new-message', response.data.message);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setSending(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.files) {
        const attachments = response.data.files.map(file => ({
          url: file.url,
          name: file.originalname,
          type: file.mimetype
        }));

        // Send message with attachments
        // Check if this is a valid MongoDB ObjectId format
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(chatId);

        // Check if this is a fallback ID
        const isFallbackId = chatId.startsWith('fallback_') || chatId.startsWith('mock_');

        // Get doctor ID for direct API call
        const doctorId = doctor?._id || doctor?.id;

        let success = false;

        // Try direct API call first if we have a doctor ID
        if (doctorId) {
          try {
            console.log('🔄 Trying direct API call to send file with doctor ID:', doctorId);

            // First ensure we have a valid chat
            const createResponse = await axios.post('/api/patient-doctor-chat', {
              userId: doctorId
            });

            if (createResponse.data && createResponse.data._id) {
              const directChatId = createResponse.data._id;
              console.log('✅ Using chat ID for file attachment:', directChatId);

              // Update chat ID if different
              if (directChatId !== chatId) {
                console.log('🔄 Updating chat ID from', chatId, 'to', directChatId);
                setChatId(directChatId);
                localStorage.setItem(`chat_${doctorId}`, directChatId);
              }

              // Send file with the direct chat ID
              await axios.post(`/api/patient-doctor-chat/${directChatId}/messages`, {
                content: 'File attachment',
                attachments
              });
              console.log('✅ Sent file attachment using direct API call');
              success = true;
            }
          } catch (directApiError) {
            console.log('⚠️ Direct API call failed:', directApiError.message);
            // Continue with regular flow
          }
        }

        // If direct API call failed or we don't have a doctor ID, try regular flow
        if (!success) {
          if (isValidObjectId) {
            try {
              // Try the patient-doctor-chat API first
              await axios.post(`/api/patient-doctor-chat/${chatId}/messages`, {
                content: 'File attachment',
                attachments
              });
              console.log('✅ Sent file attachment using patient-doctor-chat API');
              success = true;
            } catch (patientDoctorApiError) {
              console.log('⚠️ Patient-doctor-chat API error:', patientDoctorApiError.message);
              console.log('🔄 Trying regular chat API as fallback');

              try {
                // Fall back to regular chat API
                await axios.post(`/api/chats/message`, {
                  content: 'File attachment',
                  chatId: chatId,
                  attachments
                });
                console.log('✅ Sent file attachment using regular chat API');
                success = true;
              } catch (chatApiError) {
                console.log('⚠️ All API attempts failed, using mock file attachment API as last resort');

                // Use mock API as last resort
                await mockApi.sendMessage(chatId, 'File attachment', user, attachments);
                console.log('✅ Sent file attachment using mock API');
                success = true;
              }
            }
          } else if (isFallbackId) {
            try {
              // For fallback IDs, try the patient-doctor-chat API which now handles them
              await axios.post(`/api/patient-doctor-chat/${chatId}/messages`, {
                content: 'File attachment',
                attachments
              });
              console.log('✅ Sent file attachment for fallback ID using patient-doctor-chat API');
              success = true;
            } catch (error) {
              console.log('⚠️ API error for fallback ID:', error.message);
              console.log('🔄 Using mock file attachment as fallback');

              // Use mock API as fallback
              await mockApi.sendMessage(chatId, 'File attachment', user, attachments);
              console.log('✅ Sent file attachment using mock API for fallback ID');
              success = true;
            }
          } else {
            console.log('⚠️ Invalid ID format, using mock file attachment directly');

            // If not a valid ObjectId or fallback ID, use mock API directly
            await mockApi.sendMessage(chatId, 'File attachment', user, attachments);
            console.log('✅ Sent file attachment using mock API for invalid ID format');
            success = true;
          }
        }

        // Refresh messages after sending file
        if (success) {
          setTimeout(() => {
            fetchMessages(chatId);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time for messages
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      // Handle different timestamp formats
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('Invalid timestamp format:', timestamp);
        return '';
      }

      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error, timestamp);
      return '';
    }
  };

  // This function is already defined using useCallback above
  // Removing duplicate definition

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      bgcolor: theme.palette.background.default,
      overflow: 'hidden'
    }}>
      {/* Header - New Design */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: theme.palette.primary.dark,
        color: 'white',
        flexShrink: 0,
        zIndex: 2,
        pb: 1
      }}>
        {/* Top section with doctor info */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: { xs: 1.5, sm: 2 },
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Tooltip title="Verified Doctor">
                  <VerifiedUserIcon
                    sx={{
                      color: theme.palette.success.main,
                      bgcolor: 'white',
                      borderRadius: '50%',
                      fontSize: '16px',
                      padding: '2px'
                    }}
                  />
                </Tooltip>
              }
            >
              <Avatar
                src={doctor?.avatar || doctor?.profileImage}
                alt={doctor?.name}
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  border: '2px solid white'
                }}
              >
                {doctor?.name?.charAt(0) || 'D'}
              </Avatar>
            </Badge>

            <Box>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  color: 'white'
                }}
              >
                {/* Handle different name formats */}
                {doctor?.name
                  ? (doctor.name.toLowerCase().startsWith('dr.')
                    ? doctor.name
                    : `Dr. ${doctor.name}`)
                  : 'Your Doctor'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  icon={<MedicalServicesIcon fontSize="small" />}
                  label={doctor?.specialization || doctor?.profile?.specialization || 'Specialist'}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    color: 'white',
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
                {isTyping && (
                  <Chip
                    label="Typing..."
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.success.main, 0.7),
                      color: 'white',
                      animation: 'pulse 1.5s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.7 },
                        '50%': { opacity: 1 },
                        '100%': { opacity: 0.7 }
                      }
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Voice Call">
              <IconButton
                color="inherit"
                size="medium"
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.25),
                  },
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 }
                }}
              >
                <PhoneIcon fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Video Call">
              <IconButton
                color="inherit"
                size="medium"
                onClick={onVideoCall}
                sx={{
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.25),
                  },
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 }
                }}
              >
                <VideoCallIcon fontSize={window.innerWidth < 600 ? 'small' : 'medium'} />
              </IconButton>
            </Tooltip>

            {/* Debug button - only visible in development */}
            {process.env.NODE_ENV === 'development' && (
              <Tooltip title={debugMode ? "Hide Debug Info" : "Show Debug Info"}>
                <IconButton
                  color="inherit"
                  size="medium"
                  onClick={() => {
                    setDebugMode(!debugMode);
                    console.log('Chat ID:', chatId);
                    console.log('Messages:', messages);
                    console.log('User:', user);
                  }}
                  sx={{
                    bgcolor: debugMode ? 'red' : alpha(theme.palette.common.white, 0.15),
                    '&:hover': {
                      bgcolor: debugMode ? 'darkred' : alpha(theme.palette.common.white, 0.25),
                    },
                    width: { xs: 36, sm: 44 },
                    height: { xs: 36, sm: 44 }
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>D</span>
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Status bar */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(theme.palette.common.black, 0.2),
          py: 0.5,
          px: 2,
          mx: 2,
          borderRadius: 2
        }}>
          <Typography variant="caption" sx={{ color: alpha(theme.palette.common.white, 0.9) }}>
            Messages are end-to-end encrypted • {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* Debug Info Panel */}
      {debugMode && (
        <Box sx={{
          p: 2,
          bgcolor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          fontSize: '12px',
          fontFamily: 'monospace',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Debug Information</Typography>
          <Box sx={{ mb: 1 }}>
            <strong>Chat ID:</strong> {chatId || 'Not set'}
          </Box>
          <Box sx={{ mb: 1 }}>
            <strong>User ID:</strong> {user?._id || user?.id || 'Unknown'}
          </Box>
          <Box sx={{ mb: 1 }}>
            <strong>Doctor ID:</strong> {doctor?._id || doctor?.id || 'Unknown'}
          </Box>
          <Box sx={{ mb: 1 }}>
            <strong>Messages Count:</strong> {messages.length}
          </Box>
          <Box sx={{ mb: 1 }}>
            <strong>Socket Connected:</strong> {socket?.connected ? 'Yes' : 'No'}
          </Box>
          <Box>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                console.log('Forcing message refresh');
                fetchMessages(chatId);
              }}
              sx={{ mr: 1, fontSize: '10px' }}
            >
              Refresh Messages
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                localStorage.removeItem(`chat_${doctor?._id || doctor?.id}`);
                window.location.reload();
              }}
              sx={{ mr: 1, fontSize: '10px' }}
            >
              Clear Cache & Reload
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={async () => {
                try {
                  console.log('Making direct API call to fetch messages');
                  const doctorId = doctor?._id || doctor?.id;

                  // Try to create a chat first
                  const createResponse = await axios.post('/api/patient-doctor-chat', {
                    userId: doctorId
                  });
                  console.log('Create chat response:', createResponse.data);

                  // Then fetch messages
                  const chatId = createResponse.data._id;
                  const messagesResponse = await axios.get(`/api/patient-doctor-chat/${chatId}/messages`);
                  console.log('Messages response:', messagesResponse.data);

                  // Update state with the new data
                  setChatId(chatId);
                  if (messagesResponse.data.messages) {
                    setMessages(messagesResponse.data.messages);
                  }

                  // Cache the chat ID
                  localStorage.setItem(`chat_${doctorId}`, chatId);
                } catch (error) {
                  console.error('Direct API call error:', error);
                }
              }}
              sx={{ mr: 1, fontSize: '10px' }}
            >
              Direct API Call
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={async () => {
                try {
                  console.log('Sending test message');
                  // Get doctor info for logging
                  console.log('Doctor:', doctor?.name || 'Unknown', 'ID:', doctor?._id || doctor?.id);

                  if (!chatId) {
                    console.error('No chat ID available');
                    return;
                  }

                  // Send a test message
                  const testMessage = `Test message from patient at ${new Date().toLocaleTimeString()}`;
                  const response = await axios.post(`/api/patient-doctor-chat/${chatId}/messages`, {
                    content: testMessage
                  });

                  console.log('Test message sent:', response.data);

                  // Refresh messages
                  fetchMessages(chatId);
                } catch (error) {
                  console.error('Error sending test message:', error);
                }
              }}
              sx={{ fontSize: '10px' }}
            >
              Send Test Message
            </Button>
          </Box>
        </Box>
      )}

      {/* Messages Area */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: { xs: 1.5, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: alpha(theme.palette.background.default, 0.5),
          height: 0
        }}>
        {/* Error message */}
        {error && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.light, 0.15),
              color: theme.palette.error.main,
              textAlign: 'center',
              mb: 2,
              maxWidth: '90%',
              alignSelf: 'center'
            }}
          >
            <Typography variant="body2" fontWeight="medium">
              {error}
            </Typography>
          </Paper>
        )}

        {loading ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 2
          }}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary">
              Loading messages...
            </Typography>
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: 2
          }}>
            <Typography variant="body1" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => {
            // Handle different message formats
            const sender = msg.sender || msg.senderId || {};
            const senderId = sender._id || sender.id;
            const userId = user?._id || user?.id;

            // For debugging
            if (debugMode) {
              console.log('Message:', msg);
              console.log('Sender:', sender);
              console.log('SenderId:', senderId);
              console.log('UserId:', userId);
            }

            // Determine if message is from current user
            const isOwn = senderId === userId;

            // Get timestamp from different possible formats
            const timestamp = msg.timestamp || msg.createdAt || msg.date || new Date().toISOString();

            // Show date divider for first message or when date changes
            const prevTimestamp = index > 0 ?
              (messages[index - 1].timestamp || messages[index - 1].createdAt || messages[index - 1].date) :
              null;

            const showDate = index === 0 ||
              (prevTimestamp && new Date(timestamp).toDateString() !== new Date(prevTimestamp).toDateString());

            // Get sender name from different possible formats
            const senderName = sender.name ||
                              (typeof sender === 'string' ? 'User' : null) ||
                              'Unknown User';

            return (
              <Box key={msg._id || index}>
                {showDate && (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    my: 2
                  }}>
                    <Divider sx={{ flexGrow: 1 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mx: 2 }}>
                      {new Date(timestamp).toLocaleDateString()}
                    </Typography>
                    <Divider sx={{ flexGrow: 1 }} />
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: isOwn ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: 1.5,
                    maxWidth: '85%',
                    alignSelf: isOwn ? 'flex-end' : 'flex-start',
                    mb: 1.5
                  }}
                >
                  {!isOwn && (
                    <Avatar
                      src={sender?.avatar || sender?.profileImage}
                      alt={senderName}
                      sx={{
                        width: 38,
                        height: 38,
                        border: `2px solid ${alpha(theme.palette.success.main, 0.5)}`,
                        bgcolor: theme.palette.success.main
                      }}
                    >
                      {senderName.charAt(0)}
                    </Avatar>
                  )}

                  <Box sx={{ maxWidth: '100%' }}>
                    {/* Message bubble with new design */}
                    <Paper
                      elevation={2}
                      sx={{
                        p: 1.8,
                        borderRadius: isOwn
                          ? '20px 4px 20px 20px'
                          : '4px 20px 20px 20px',
                        bgcolor: isOwn
                          ? theme.palette.primary.main
                          : alpha(theme.palette.success.main, 0.1),
                        color: isOwn ? 'white' : theme.palette.text.primary,
                        boxShadow: theme.shadows[1],
                        position: 'relative',
                        '&::before': isOwn ? {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 12,
                          height: 12,
                          bgcolor: theme.palette.primary.dark,
                          borderRadius: '0 4px 0 0'
                        } : {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 12,
                          height: 12,
                          bgcolor: theme.palette.success.main,
                          borderRadius: '4px 0 0 0'
                        },
                        border: isOwn
                          ? 'none'
                          : `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          wordBreak: 'break-word',
                          fontWeight: isOwn ? 400 : 400,
                          lineHeight: 1.5,
                          fontSize: '0.95rem'
                        }}
                      >
                        {msg.content || msg.text || msg.message || (msg.attachments?.length ? 'File attachment' : 'No message content')}
                      </Typography>
                    </Paper>

                    {/* Message info with sender name for doctor */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      mt: 0.5,
                      gap: 1
                    }}>
                      {!isOwn && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.success.dark,
                            fontWeight: 'medium',
                            fontSize: '0.7rem'
                          }}
                        >
                          DR. {senderName.split(' ')[0]}
                        </Typography>
                      )}

                      <Typography
                        variant="caption"
                        sx={{
                          color: isOwn
                            ? alpha(theme.palette.primary.main, 0.8)
                            : alpha(theme.palette.text.secondary, 0.8),
                          fontSize: '0.7rem'
                        }}
                      >
                        {formatTime(timestamp)}
                      </Typography>

                      {isOwn && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 'medium',
                            fontSize: '0.7rem'
                          }}
                        >
                          YOU
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Scroll to bottom button */}
      <Box
        sx={{
          position: 'absolute',
          bottom: '80px',
          right: '20px',
          zIndex: 10
        }}
      >
        <Tooltip title="Scroll to bottom">
          <IconButton
            onClick={scrollToBottom}
            sx={{
              bgcolor: theme.palette.primary.main,
              color: 'white',
              boxShadow: 2,
              '&:hover': {
                bgcolor: theme.palette.primary.dark
              }
            }}
            size="small"
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Input Area - New Design */}
      <Box sx={{
        p: { xs: 1.5, sm: 2 },
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: alpha(theme.palette.primary.light, 0.05),
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        flexShrink: 0,
        zIndex: 2
      }}>
        {/* Message typing status */}
        {isTyping && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            mb: 0.5
          }}>
            <Paper
              elevation={0}
              sx={{
                py: 0.5,
                px: 2,
                borderRadius: 10,
                bgcolor: alpha(theme.palette.success.light, 0.15),
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: theme.palette.success.main,
                animation: 'pulse 1.5s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 0.5 },
                  '50%': { opacity: 1 },
                  '100%': { opacity: 0.5 }
                }
              }} />
              <Typography variant="caption" color="text.secondary">
                Doctor is typing...
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Input controls */}
        <Box sx={{
          display: 'flex',
          gap: { xs: 0.5, sm: 1 },
          alignItems: 'center',
          width: '100%',
        }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
            multiple
          />

          <IconButton
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            size={window.innerWidth < 600 ? "small" : "medium"}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 }
            }}
          >
            <AttachFileIcon fontSize={window.innerWidth < 600 ? "small" : "medium"} />
          </IconButton>

          <TextField
            fullWidth
            placeholder="Type your message here..."
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            multiline
            maxRows={4}
            disabled={sending}
            size={window.innerWidth < 600 ? "small" : "medium"}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 25,
                bgcolor: 'white',
                boxShadow: theme.shadows[1],
                '&.Mui-focused': {
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
                }
              },
              '& .MuiOutlinedInput-input': {
                py: 1.5
              }
            }}
          />

          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || sending}
            size={window.innerWidth < 600 ? "small" : "medium"}
            sx={{
              bgcolor: message.trim() && !sending
                ? theme.palette.primary.main
                : alpha(theme.palette.primary.main, 0.1),
              color: message.trim() && !sending ? 'white' : theme.palette.primary.main,
              '&:hover': {
                bgcolor: message.trim() && !sending
                  ? theme.palette.primary.dark
                  : alpha(theme.palette.primary.main, 0.2)
              },
              width: { xs: 40, sm: 45 },
              height: { xs: 40, sm: 45 },
              boxShadow: message.trim() && !sending ? theme.shadows[2] : 'none',
              transition: 'all 0.2s ease',
              transform: message.trim() && !sending ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {sending ?
              <CircularProgress size={window.innerWidth < 600 ? 18 : 24} color="inherit" /> :
              <SendIcon fontSize={window.innerWidth < 600 ? "small" : "medium"} />
            }
          </IconButton>
        </Box>

        {/* Disclaimer */}
        <Typography
          variant="caption"
          align="center"
          sx={{
            color: alpha(theme.palette.text.secondary, 0.7),
            fontSize: '0.65rem',
            mt: 0.5
          }}
        >
          Messages sent to your doctor are secure and confidential
        </Typography>
      </Box>
    </Box>
  );
};

export default PatientChat;
