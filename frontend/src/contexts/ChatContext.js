import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import axios from '../utils/axiosConfig'; // Use the configured axios instance
import { makeRequest } from '../utils/requestManager'; // Import the request manager
import { useAuth } from './AuthContext';
import { loadChatHistory } from '../utils/chatStorage';
import { handleSocketErrors } from '../utils/apiErrorHandler';

const ChatContext = createContext();

const ENDPOINT = 'http://localhost:5000'; // Your backend server URL
let socket;

export const ChatProvider = ({ children }) => {
  const { user: authUser } = useAuth();
  const { user: userAuthUser } = useSelector((state) => state.userAuth);
  const { user: oldAuthUser } = useSelector((state) => state.auth);

  // Use the user from any available auth source, prioritizing the AuthContext
  const user = authUser || userAuthUser || oldAuthUser;

  // Get token from all possible sources
  const getToken = useCallback(() => {
    // Try to get token from all possible sources
    const authToken = authUser?.token;
    const userAuthToken = userAuthUser?.token || localStorage.getItem('userToken');
    const oldAuthToken = oldAuthUser?.token || localStorage.getItem('token');

    // Return the first available token
    return authToken || userAuthToken || oldAuthToken;
  }, [authUser, userAuthUser, oldAuthUser]);

  // Determine user role helper function - simplified to avoid session expiration
  const determineUserRole = async (userId) => {
    try {
      // First, check if we have the role in localStorage cache
      const cachedRoleKey = `user_role_${userId}`;
      const cachedRole = localStorage.getItem(cachedRoleKey);

      if (cachedRole) {
        console.log(`Using cached role for user ${userId}: ${cachedRole}`);
        return cachedRole;
      }

      // If we have the current user's role and the target user ID matches current user, use that
      if (user && (user.id === userId || user._id === userId) && user.role) {
        console.log(`Using current user's role for ${userId}: ${user.role}`);
        // Cache the role for future use
        localStorage.setItem(cachedRoleKey, user.role);
        return user.role;
      }

      // If we have the target user in our chats, try to get role from there
      const chatWithUser = chats.find(chat =>
        chat.participants && chat.participants.some(p =>
          p._id === userId || p._id?.toString() === userId.toString()
        )
      );

      if (chatWithUser) {
        const participant = chatWithUser.participants.find(p =>
          p._id === userId || p._id?.toString() === userId.toString()
        );

        if (participant && participant.role) {
          console.log(`Found role in chat participants for ${userId}: ${participant.role}`);
          // Cache the role for future use
          localStorage.setItem(cachedRoleKey, participant.role);
          return participant.role;
        }
      }

      // Get token for the request
      const token = getToken();
      if (!token) {
        console.error('No authentication token found for determineUserRole');
        return 'unknown'; // Return unknown instead of null to avoid errors
      }

      // Create config with authorization header and validateStatus to prevent 401/403 from triggering axios interceptor
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000, // 5 second timeout
        validateStatus: function (status) {
          // Consider any status as valid to prevent axios from throwing errors
          // We'll handle the response manually
          return true;
        }
      };

      // Try doctor endpoint first - this is a public endpoint in your routes
      try {
        const response = await axios.get(`/api/doctors/${userId}`, config);
        if (response.status === 200 && response.data && response.data._id) {
          // Cache the role for future use
          localStorage.setItem(cachedRoleKey, 'doctor');
          return 'doctor';
        }
      } catch (error) {
        // Ignore errors and continue
      }

      // For simplicity and to avoid multiple API calls that might trigger auth errors,
      // let's make an educated guess based on the user ID format or other heuristics

      // If the user ID starts with "doc_" or contains "doctor", assume it's a doctor
      if (userId.toString().startsWith('doc_') || userId.toString().includes('doctor')) {
        localStorage.setItem(cachedRoleKey, 'doctor');
        return 'doctor';
      }

      // If the user ID starts with "pat_" or contains "patient", assume it's a patient
      if (userId.toString().startsWith('pat_') || userId.toString().includes('patient')) {
        localStorage.setItem(cachedRoleKey, 'patient');
        return 'patient';
      }

      // Default to unknown if we couldn't determine the role
      // This is safer than making more API calls that might trigger auth errors
      return 'unknown';
    } catch (error) {
      console.error('Error determining user role:', error);
      return 'unknown';
    }
  };

  // Log the user ID for debugging
  useEffect(() => {
    if (user) {
      console.log('ChatProvider: Using user ID:', user._id || user.id, 'from source:',
        authUser ? 'AuthContext' : userAuthUser ? 'userAuth Redux' : 'auth Redux');

      // Log detailed user information
      console.log('User details:', {
        id: user.id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });

      // Convert ID to string for consistent comparison
      const userId = user.id || user._id;
      if (userId) {
        console.log('User ID as string:', userId.toString());
      }
    } else {
      console.warn('ChatProvider: No user found in any auth source');
    }
  }, [authUser, userAuthUser, oldAuthUser, user]);

  const navigate = useNavigate();

  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [notification, setNotification] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());

  // Process any pending read operations
  const processPendingReadOperations = async () => {
    try {
      // Get pending operations from localStorage
      const pendingOps = JSON.parse(localStorage.getItem('pendingReadOps') || '[]');

      if (pendingOps.length === 0) {
        return;
      }

      console.log(`Processing ${pendingOps.length} pending read operations`);

      // Get token for the request
      const token = getToken();

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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
  };

  // Function to check which API endpoints are available
  const checkApiEndpoints = useCallback(async () => {
    try {
      console.log('Checking available API endpoints...');

      // Get token for the request
      const token = getToken();
      if (!token) {
        console.error('No token available for API endpoint check');
        return;
      }

      // Create config with authorization header
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // 5 second timeout
      };

      // Set default endpoints - these are the known working endpoints
      window.chatMessageEndpoint = '/api/chats/:chatId/messages';
      window.patientDoctorChatEndpoint = '/api/patient-doctor-chat';

      // Check if the main chats endpoint is available
      try {
        await axios.get('/api/chats', {
          ...config,
          params: { limit: 1, _t: Date.now() } // Only request 1 chat to minimize data transfer
        });
        console.log('Main chats endpoint is available');
      } catch (error) {
        console.warn('Main chats endpoint check failed:', error.message);
      }

      // Check if the patient-doctor chat endpoint is available
      try {
        // Try to access the patient-doctor chat endpoint
        // The endpoint will return 401 if not authenticated, but that's still a valid endpoint
        await axios.get('/api/patient-doctor-chat/patient', {
          ...config,
          validateStatus: (status) => status === 200 || status === 401 || status === 403
        });
        console.log('Patient-doctor chat endpoint is available');
        window.patientDoctorChatEndpoint = '/api/patient-doctor-chat';
      } catch (error) {
        console.warn('Patient-doctor chat endpoint check failed:', error.message);
        // Fallback to standard chat endpoint
        window.patientDoctorChatEndpoint = null;
      }

      console.log('API endpoint check completed. Using endpoints:', {
        chatMessageEndpoint: window.chatMessageEndpoint,
        patientDoctorChatEndpoint: window.patientDoctorChatEndpoint
      });
    } catch (error) {
      console.error('Error checking API endpoints:', error);
    }
  }, [getToken]);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      // Check API endpoints when user is available
      checkApiEndpoints();

      try {
        // Create socket with error handling
        socket = io(ENDPOINT, {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          transports: ['websocket', 'polling'],
          autoConnect: true
        });

        // Add enhanced error handling
        socket = handleSocketErrors(socket, (error) => {
          console.warn('Socket error handled gracefully:', error?.message || 'Unknown error');
          // Don't show error to user, just handle it silently
          setSocketConnected(false);
        });

        // Handle successful connection
        socket.on('connect', () => {
          console.log('Socket connected successfully');
          socket.emit('setup', user);
        });

        socket.on('connected', () => {
          console.log('Socket setup completed');
          setSocketConnected(true);

          // Process any pending read operations when connection is established
          processPendingReadOperations();
        });

        // Listen for typing indicators
        socket.on('typing', (chatId) => {
          if (selectedChat && selectedChat._id === chatId) {
            setIsTyping(true);
          }
        });

        socket.on('stop-typing', (chatId) => {
          if (selectedChat && selectedChat._id === chatId) {
            setIsTyping(false);
          }
        });

        // Listen for online status updates
        socket.on('user-online', (data) => {
          if (data && data.userId) {
            setOnlineUsers(prev => {
              const newMap = new Map(prev);
              newMap.set(data.userId, data.online);
              return newMap;
            });
          }
        });

        // Clean up on unmount
        return () => {
          if (socket) {
            socket.disconnect();
          }
        };
      } catch (error) {
        console.error('Error initializing socket connection:', error);
        // Continue without socket functionality
        setSocketConnected(false);
      }
    }
  }, [user, selectedChat]);

  // Fetch all chats for the user
  const fetchChats = useCallback(async (forceRefresh = false) => {
    if (!user) {
      console.log('No user found, skipping fetchChats');
      return [];
    }

    try {
      const userId = user?.id || user?._id;
      console.log('Fetching chats for user ID:', userId);
      setLoading(true);

      // Get token for the request
      const token = getToken();

      // Ensure axios has the token in its default headers
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Use the request manager to make a deduplicated request
      const data = await makeRequest({
        url: '/api/chats',
        method: 'GET',
        useCache: true,
        cacheExpiration: 30000, // 30 seconds cache
        forceRefresh: forceRefresh // Allow forcing a refresh
      });

      // Log success
      console.log('Chats fetched successfully, received:', data ? data.length : 0);

      // Ensure we have a valid array of chats
      const validChats = Array.isArray(data) ? data : [];

      // Filter out any invalid chats (those without _id)
      const filteredChats = validChats.filter(chat => chat && chat._id);

      // Process each chat to ensure IDs are strings
      const processedChats = filteredChats.map(chat => {
        // Process participants to ensure IDs are strings
        const processedParticipants = Array.isArray(chat.participants)
          ? chat.participants.map(participant => ({
              ...participant,
              _id: participant._id ? participant._id.toString() : null
            }))
          : [];

        return {
          ...chat,
          _id: chat._id.toString(),
          participants: processedParticipants
        };
      });

      console.log('Processed chats:', processedChats.length);

      setChats(processedChats);
      setLoading(false);

      // All chats loaded successfully
      return processedChats;
    } catch (error) {
      console.error('Error in fetchChats:', error);

      // Show error and return empty array
      setChats([]);
      setLoading(false);

      // Show a user-friendly error
      setError('Unable to load conversations. Please check your connection and try again.');

      return [];
    }
  }, [user, getToken]);

  // Mark chat as read - with handling for temporary chat IDs
  const markChatAsRead = async (chatId) => {
    if (!chatId) {
      console.error('Cannot mark chat as read: No chat ID provided');
      return;
    }

    if (!user) {
      console.error('Cannot mark chat as read: No user found');
      return;
    }

    // Check if this is a temporary chat ID (starts with temp_chat)
    const isTemporaryChat = chatId.startsWith('temp_chat');

    // For temporary chats, we'll only update the local state and not make API calls
    if (isTemporaryChat) {
      console.log(`Using temporary chat ID: ${chatId}, skipping API call for marking as read`);

      // Update the unread count in the chats list
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat._id === chatId) {
            // Create a copy of unreadCounts or initialize a new object
            let updatedUnreadCounts = {};

            if (chat.unreadCounts) {
              // If it's a Map, convert to object
              if (typeof chat.unreadCounts.get === 'function') {
                const countsMap = chat.unreadCounts;
                for (const [key, value] of countsMap.entries()) {
                  updatedUnreadCounts[key] = value;
                }
              } else {
                // It's already an object
                updatedUnreadCounts = { ...chat.unreadCounts };
              }
            }

            // Set the current user's unread count to 0
            const userId = user._id || user.id;
            if (userId) {
              updatedUnreadCounts[userId] = 0;
            }

            return { ...chat, unreadCounts: updatedUnreadCounts };
          }
          return chat;
        })
      );

      return;
    }

    try {
      console.log('Marking chat as read:', chatId);

      // Get token for the request
      const token = getToken();

      // Update the unread count in the chats list immediately for better UX
      // This provides instant feedback even if the API call fails
      setChats(prevChats =>
        prevChats.map(chat => {
          if (chat._id === chatId) {
            // Create a copy of unreadCounts or initialize a new object
            let updatedUnreadCounts = {};

            if (chat.unreadCounts) {
              // If it's a Map, convert to object
              if (typeof chat.unreadCounts.get === 'function') {
                const countsMap = chat.unreadCounts;
                for (const [key, value] of countsMap.entries()) {
                  updatedUnreadCounts[key] = value;
                }
              } else {
                // It's already an object
                updatedUnreadCounts = { ...chat.unreadCounts };
              }
            }

            // Set the current user's unread count to 0
            const userId = user._id || user.id;
            if (userId) {
              updatedUnreadCounts[userId] = 0;
            }

            return { ...chat, unreadCounts: updatedUnreadCounts };
          }
          return chat;
        })
      );

      // Only make API call if we have a token
      if (token) {
        // Create config with authorization header
        const config = {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 // 5 second timeout to prevent long-hanging requests
        };

        // Make the API call to persist the change
        try {
          await axios.put(`/api/chats/${chatId}/read`, {}, config);

          // Emit socket event to notify other users
          if (socket && socket.connected) {
            socket.emit('message-read', {
              chatId,
              userId: user._id || user.id
            });
          }
        } catch (apiError) {
          // Log the error but don't revert the UI change
          // This keeps the UX smooth even if the server call fails
          console.error('Error marking chat as read on server:', apiError);

          // If it's a connection error, we'll retry once when connection is restored
          if (apiError.code === 'ECONNABORTED' || !navigator.onLine) {
            console.log('Will retry marking as read when connection is restored');

            // Store the pending operation for later retry
            const pendingOp = { chatId, timestamp: new Date().toISOString() };
            const pendingOps = JSON.parse(localStorage.getItem('pendingReadOps') || '[]');
            pendingOps.push(pendingOp);
            localStorage.setItem('pendingReadOps', JSON.stringify(pendingOps));
          }
        }
      }
    } catch (error) {
      console.error('Error in markChatAsRead function:', error);
    }
  };

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessageReceived) => {
      try {
        // If the chat is not selected or is different from the current chat
        if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
          // Add notification
          if (!notification.includes(newMessageReceived)) {
            setNotification(prev => [newMessageReceived, ...prev]);
            // Update chats list to show latest message
            setChats(prevChats => {
              const updatedChats = prevChats.map(chat => {
                if (chat._id === newMessageReceived.chat._id) {
                  return {
                    ...chat,
                    lastMessage: {
                      content: newMessageReceived.content,
                      sender: newMessageReceived.sender,
                      timestamp: newMessageReceived.timestamp
                    }
                  };
                }
                return chat;
              });
              return updatedChats;
            });
          }
        } else {
          // If chat is selected, add message to current chat
          setMessages(prevMessages => [...prevMessages, newMessageReceived]);

          // Mark as read
          markChatAsRead(selectedChat._id);
        }
      } catch (error) {
        console.error('Error handling new message:', error);
      }
    };

    // Add event listener with error handling
    socket.on('message-received', handleNewMessage);

    // Add error handling for socket
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      // Clean up event listeners
      socket.off('message-received', handleNewMessage);
      socket.off('error');
      socket.off('connect_error');
    };
  }, [selectedChat, notification, markChatAsRead]);

  // Access or create a one-on-one chat with optimized performance
  const accessChat = async (userId) => {
    // Track operation start time for performance monitoring
    const startTime = performance.now();
    const requestId = `access-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      if (!userId) {
        console.error(`[${requestId}] Invalid user ID provided to accessChat`);
        setError('Failed to access chat: Invalid user ID');
        return null;
      }

      // Make sure we're sending a string ID to the backend
      const userIdString = userId.toString();

      // Get current user ID
      const currentUserId = user?.id || user?._id;

      console.log(`[${requestId}] Accessing chat between current user ${currentUserId} and target user ${userIdString}`);

      // STEP 1: Check local cache first for fastest response
      // Check if we already have this chat in our list (memory cache)
      const existingChat = chats.find(c =>
        c.participants.some(p =>
          p._id === userIdString ||
          p._id?.toString() === userIdString
        )
      );

      if (existingChat) {
        console.log(`[${requestId}] Found existing chat in memory cache: ${existingChat._id}`);

        // Set as selected chat immediately for better UX
        setSelectedChat(existingChat);

        // Check if we have a recent timestamp for this chat
        const cacheTimestamp = localStorage.getItem(`${existingChat._id}_timestamp`);
        const isCacheRecent = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 30000;

        if (isCacheRecent) {
          console.log(`[${requestId}] Chat data is recent, using cached version`);

          // Load cached messages in background
          setTimeout(() => {
            fetchMessages(existingChat._id, 50, false);
          }, 0);

          return existingChat;
        }

        // Fetch fresh messages in background
        fetchMessages(existingChat._id, 50, false);
        return existingChat;
      }

      // STEP 2: Check localStorage cache
      const cachedChatId = localStorage.getItem(`chat_${userIdString}`);
      if (cachedChatId) {
        console.log(`[${requestId}] Found cached chat ID in localStorage: ${cachedChatId}`);

        // Try to load cached messages
        const cachedMessages = loadChatHistory(cachedChatId);
        if (cachedMessages && cachedMessages.length > 0) {
          console.log(`[${requestId}] Found ${cachedMessages.length} cached messages`);

          // Create a temporary chat object from cache
          const tempChat = {
            _id: cachedChatId,
            participants: [
              { _id: currentUserId?.toString(), name: user?.name || 'Current User' },
              { _id: userIdString, name: 'Other User' }
            ],
            messages: cachedMessages,
            isGroup: false,
            lastMessage: cachedMessages[cachedMessages.length - 1]
          };

          // Set as selected chat immediately for better UX
          setSelectedChat(tempChat);
          setMessages(cachedMessages);

          // We'll still fetch from server in background, but user can see messages immediately
          setLoading(true);
        } else {
          // No cached messages, show loading state
          setLoading(true);
        }
      } else {
        // No cached chat ID, show loading state
        setLoading(true);
      }

      // STEP 3: Get authentication token
      const token = getToken() ||
                   localStorage.getItem('token') ||
                   localStorage.getItem('userToken') ||
                   localStorage.getItem('doctorToken') ||
                   localStorage.getItem('persistentToken');

      if (!token) {
        console.error(`[${requestId}] No authentication token found`);
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return null;
      }

      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // STEP 4: Make API call to create or access the chat
      console.log(`[${requestId}] Making API call to access chat with userId: ${userIdString}`);

      // Determine if this is a patient-doctor chat - use a safer approach
      const currentUserRole = user?.role;

      // First check if we have a cached endpoint for this user
      const cachedEndpointKey = `chat_endpoint_${userIdString}`;
      const cachedEndpoint = localStorage.getItem(cachedEndpointKey);

      let endpoint = '/api/chats'; // Default endpoint

      if (cachedEndpoint) {
        // Use cached endpoint if available
        endpoint = cachedEndpoint;
        console.log(`[${requestId}] Using cached endpoint for user ${userIdString}: ${endpoint}`);
      } else {
        // Try to determine the endpoint based on roles
        try {
          const targetUserRole = await determineUserRole(userIdString);

          // Check if this is a patient-doctor interaction
          if ((currentUserRole === 'patient' && targetUserRole === 'doctor') ||
              (currentUserRole === 'doctor' && targetUserRole === 'patient')) {
            // Use the patient-doctor chat endpoint for patient-doctor interactions
            endpoint = '/api/patient-doctor-chat';
            // Cache this endpoint for future use
            localStorage.setItem(cachedEndpointKey, endpoint);
          } else {
            // Cache the standard endpoint for future use
            localStorage.setItem(cachedEndpointKey, endpoint);
          }

          console.log(`[${requestId}] Determined endpoint based on roles: ${endpoint}, currentUserRole: ${currentUserRole}, targetUserRole: ${targetUserRole}`);
        } catch (roleError) {
          // If there's any error determining roles, use the default endpoint
          console.error(`[${requestId}] Error determining roles, using default endpoint:`, roleError);
          // Still cache the default endpoint
          localStorage.setItem(cachedEndpointKey, endpoint);
        }
      }

      console.log(`[${requestId}] Making API call to ${endpoint} with userId: ${userIdString}`);

      // Use the request manager to make a deduplicated request
      const data = await makeRequest({
        url: endpoint,
        method: 'POST',
        data: { userId: userIdString },
        useCache: false // Don't cache POST requests
      });

      if (!data || !data._id) {
        console.error(`[${requestId}] Invalid chat data received`);

        // If we have a cached chat, return it as fallback
        if (cachedChatId) {
          const cachedMessages = loadChatHistory(cachedChatId);
          if (cachedMessages && cachedMessages.length > 0) {
            const fallbackChat = {
              _id: cachedChatId,
              participants: [
                { _id: currentUserId?.toString(), name: user?.name || 'Current User' },
                { _id: userIdString, name: 'Other User' }
              ],
              messages: cachedMessages,
              isGroup: false
            };

            setSelectedChat(fallbackChat);
            setMessages(cachedMessages);
            setLoading(false);
            return fallbackChat;
          }
        }

        setError('Failed to access chat: Invalid response');
        setLoading(false);
        return null;
      }

      // STEP 5: Process the chat data
      console.log(`[${requestId}] Chat data received with ID: ${data._id}`);

      // Process the chat data to ensure consistent format
      const processedChat = {
        ...data,
        _id: data._id.toString(),
        participants: data.participants.map(p => ({
          ...p,
          _id: p._id.toString()
        })),
        messages: Array.isArray(data.messages) ? data.messages.map(m => ({
          ...m,
          _id: m._id.toString(),
          sender: m.sender ? { ...m.sender, _id: m.sender._id.toString() } : null
        })) : []
      };

      // STEP 6: Update local state and cache
      // Update chats list
      setChats(prevChats => {
        // Check if chat already exists in list
        const chatExists = prevChats.some(c => c._id === processedChat._id);

        if (chatExists) {
          // Update existing chat
          return prevChats.map(c => c._id === processedChat._id ? processedChat : c);
        } else {
          // Add new chat to beginning of list
          return [processedChat, ...prevChats];
        }
      });

      // Set as selected chat
      setSelectedChat(processedChat);

      // Save chat ID to localStorage for future use
      localStorage.setItem(`chat_${userIdString}`, processedChat._id);

      // STEP 7: Fetch messages in background
      // First set loading to false to show the chat UI
      setLoading(false);

      // Then fetch messages in background
      setTimeout(() => {
        fetchMessages(processedChat._id, 50, false)
          .then(messages => {
            console.log(`[${requestId}] Fetched ${messages.length} messages for chat ${processedChat._id}`);
          })
          .catch(error => {
            console.error(`[${requestId}] Error fetching messages:`, error);
            // Show error message to user
            window.dispatchEvent(new CustomEvent('show-toast', {
              detail: {
                message: 'Could not fetch latest messages. Please try refreshing.',
                severity: 'warning'
              }
            }));
          });
      }, 100);

      // Log performance metrics
      console.log(`[${requestId}] Total operation completed in ${Math.round(performance.now() - startTime)}ms`);

      return processedChat;
    } catch (error) {
      console.error(`[${requestId}] Error accessing chat:`, error);

      // Try to find existing chat in localStorage as fallback
      try {
        const userIdString = userId.toString();
        const cachedChatId = localStorage.getItem(`chat_${userIdString}`);

        if (cachedChatId) {
          console.log(`[${requestId}] Using cached chat ID as fallback: ${cachedChatId}`);

          // Try to load cached messages
          const cachedMessages = loadChatHistory(cachedChatId);
          if (cachedMessages && cachedMessages.length > 0) {
            console.log(`[${requestId}] Using ${cachedMessages.length} cached messages as fallback`);

            // Create a minimal chat object
            const fallbackChat = {
              _id: cachedChatId,
              participants: [
                { _id: user?.id || user?._id, name: user?.name || 'Current User' },
                { _id: userIdString, name: 'Other User' }
              ],
              messages: cachedMessages,
              isGroup: false
            };

            setSelectedChat(fallbackChat);
            setMessages(cachedMessages);
            setLoading(false);
            return fallbackChat;
          }
        }
      } catch (fallbackError) {
        console.error(`[${requestId}] Error using fallback chat:`, fallbackError);
      }

      setError('Failed to access chat');
      setLoading(false);
      return null;
    }
  };

  // Create a group chat
  const createGroupChat = async (name, users) => {
    try {
      setLoading(true);

      // Get token for the request
      const token = getToken();
      console.log('Using token for createGroupChat:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const { data } = await axios.post('/api/chats/group', {
        name,
        participants: JSON.stringify(users)
      }, config);

      setChats([data, ...chats]);
      setSelectedChat(data);
      setSuccess('Group chat created successfully');
      setLoading(false);
    } catch (error) {
      setError('Failed to create group chat');
      console.error('Error creating group chat:', error);
      setLoading(false);
    }
  };

  // Create a super admin group with all hospital admins
  const createSuperAdminGroup = async (name) => {
    try {
      setLoading(true);

      // Get token for the request
      const token = getToken();
      console.log('Using token for createSuperAdminGroup:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const { data } = await axios.post('/api/chats/superadmin/group', { name }, config);

      setChats([data, ...chats]);
      setSelectedChat(data);
      setSuccess('Super admin group created successfully');
      setLoading(false);
    } catch (error) {
      setError('Failed to create super admin group');
      console.error('Error creating super admin group:', error);
      setLoading(false);
    }
  };

  // Rename a group chat
  const renameGroupChat = async (chatId, name) => {
    try {
      setLoading(true);

      // Get token for the request
      const token = getToken();
      console.log('Using token for renameGroupChat:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const { data } = await axios.put('/api/chats/group/rename', {
        chatId,
        name
      }, config);

      // Update the chats list
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === chatId ? data : chat
        )
      );

      // Update selected chat if it's the renamed one
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(data);
      }

      setSuccess('Group renamed successfully');
      setLoading(false);
    } catch (error) {
      setError('Failed to rename group');
      console.error('Error renaming group:', error);
      setLoading(false);
    }
  };

  // Add user to a group chat
  const addUserToGroup = async (chatId, userId) => {
    try {
      setLoading(true);

      // Get token for the request
      const token = getToken();
      console.log('Using token for addUserToGroup:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const { data } = await axios.put('/api/chats/group/add', {
        chatId,
        userId
      }, config);

      // Update the chats list
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === chatId ? data : chat
        )
      );

      // Update selected chat if it's the modified one
      if (selectedChat && selectedChat._id === chatId) {
        setSelectedChat(data);
      }

      setSuccess('User added to group successfully');
      setLoading(false);
    } catch (error) {
      setError('Failed to add user to group');
      console.error('Error adding user to group:', error);
      setLoading(false);
    }
  };

  // Remove user from a group chat
  const removeUserFromGroup = async (chatId, userId) => {
    try {
      setLoading(true);

      // Get token for the request
      const token = getToken();
      console.log('Using token for removeUserFromGroup:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const { data } = await axios.put('/api/chats/group/remove', {
        chatId,
        userId
      }, config);

      // If the removed user is the current user, unselect the chat
      const currentUserId = user?._id || user?.id;
      if (userId === currentUserId) {
        setSelectedChat(null);
      } else {
        // Update the chats list
        setChats(prevChats =>
          prevChats.map(chat =>
            chat._id === chatId ? data : chat
          )
        );

        // Update selected chat if it's the modified one
        if (selectedChat && selectedChat._id === chatId) {
          setSelectedChat(data);
        }
      }

      setSuccess('User removed from group successfully');
      setLoading(false);
    } catch (error) {
      setError('Failed to remove user from group');
      console.error('Error removing user from group:', error);
      setLoading(false);
    }
  };

  // Send a message - simplified for better performance and handling temporary chats
  const sendMessage = async (content, chatId, attachments = []) => {
    // Stop typing indicator if socket is connected
    if (socket && socket.connected) {
      try {
        socket.emit('stop-typing', chatId);
      } catch (e) {
        // Ignore socket errors
      }
    }

    // Check if this is a temporary chat ID (starts with temp_chat)
    const isTemporaryChat = chatId.startsWith('temp_chat');

    // For temporary chats, we'll only store messages locally
    if (isTemporaryChat) {
      console.log(`Using temporary chat ID: ${chatId}, storing message locally only`);

      // Create a temporary message
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        content: content || '',
        sender: {
          _id: user._id || user.id,
          name: user.name,
          role: user.role
        },
        chat: { _id: chatId },
        timestamp: new Date().toISOString(),
        attachments: attachments || []
      };

      // Update messages state
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, tempMessage];

        // Save to local storage
        try {
          localStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
        } catch (e) {
          console.error('Error saving messages to localStorage:', e);
        }

        return updatedMessages;
      });

      // Update chats list
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => {
          if (chat._id === chatId) {
            return {
              ...chat,
              lastMessage: {
                content: content || (attachments.length > 0 ? 'Attachment' : ''),
                sender: {
                  _id: user._id || user.id,
                  name: user.name,
                  role: user.role
                },
                timestamp: new Date(),
                hasAttachments: attachments.length > 0
              }
            };
          }
          return chat;
        });

        return updatedChats;
      });

      return tempMessage;
    }

    try {
      // Get token for the request
      const token = getToken();
      if (!token) {
        setError('Authentication required. Please log in again.');
        return null;
      }

      // Create config with authorization header and timeout
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 8000 // 8 second timeout
      };

      // Add abort controller for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second hard timeout
      config.signal = controller.signal;

      // Process attachments if needed
      const processedAttachments = attachments.map(attachment => {
        if (attachment.url && attachment.url.startsWith('blob:')) {
          return {
            name: attachment.name,
            type: attachment.type,
            size: attachment.size,
            url: attachment.url
          };
        }
        return attachment;
      });

      // Determine which endpoint to use - simplified logic
      let endpoint = '';
      const currentUserRole = user?.role;

      // Use patient-doctor endpoint for patients and doctors
      if (currentUserRole === 'patient' || currentUserRole === 'doctor') {
        endpoint = `/api/patient-doctor-chat/${chatId}/messages`;
      } else {
        endpoint = `/api/chats/${chatId}/messages`;
      }

      // Make the API request
      const response = await axios.post(endpoint, {
        content: content || '',
        attachments: processedAttachments
      }, config).finally(() => {
        clearTimeout(timeoutId);
      });

      // Process the response
      if (!response.data) {
        setError('Failed to send message: Invalid response');
        return null;
      }

      // Handle different response formats
      let messageData;
      if (response.data.message) {
        messageData = response.data.message;
      } else if (response.data._id) {
        messageData = response.data;
      } else {
        setError('Failed to send message: Unrecognized response format');
        return response.data;
      }

      // Update state in a non-blocking way
      setTimeout(() => {
        // Add message to the messages list
        setMessages(prevMessages => [...prevMessages, messageData]);

        // Emit the message to the socket server if connected
        if (socket && socket.connected) {
          try {
            socket.emit('new-message', messageData);
          } catch (e) {
            // Ignore socket errors
          }
        }

        // Update the chats list
        setChats(prevChats => {
          const updatedChats = prevChats.map(chat => {
            if (chat._id === chatId) {
              return {
                ...chat,
                lastMessage: {
                  content: content || (attachments.length > 0 ? 'Attachment' : ''),
                  sender: {
                    _id: user._id || user.id,
                    name: user.name,
                    role: user.role
                  },
                  timestamp: new Date(),
                  hasAttachments: attachments.length > 0
                }
              };
            }
            return chat;
          });

          return updatedChats;
        });

        // Save to local storage for offline access
        try {
          const updatedMessages = [...messages, messageData];
          localStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
        } catch (e) {
          console.error('Error saving messages to localStorage:', e);
        }
      }, 0);

      return response.data;
    } catch (error) {
      // Handle errors
      if (error.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(`Failed to send message: ${error.message || 'Unknown error'}`);
      }
      return null;
    }
  };

  // Fetch messages for a chat - optimized to show real messages and handle temporary chats
  const fetchMessages = async (chatId, limit = 100, skipCache = false) => {
    if (!chatId) {
      console.error('Cannot fetch messages: No chat ID provided');
      return [];
    }

    // Check if this is a temporary chat ID (starts with temp_chat)
    const isTemporaryChat = chatId.startsWith('temp_chat');

    // For temporary chats, we'll only use cached messages and not make API calls
    if (isTemporaryChat) {
      console.log(`Using temporary chat ID: ${chatId}, skipping API call`);

      // Try to get cached messages for temporary chat
      try {
        const cachedData = localStorage.getItem(`messages_${chatId}`);
        if (cachedData) {
          const cachedMessages = JSON.parse(cachedData);
          if (Array.isArray(cachedMessages) && cachedMessages.length > 0) {
            // Filter out any non-object messages (like strings)
            const validMessages = cachedMessages.filter(msg => msg && typeof msg === 'object');
            // Set messages from cache
            setMessages(validMessages);
            setLoading(false);
            return validMessages;
          }
        }
      } catch (e) {
        console.warn('Error reading cached messages for temporary chat:', e);
      }

      // If no cached messages, return empty array
      setLoading(false);
      return [];
    }

    // STEP 1: Use cached messages for immediate display if available
    if (!skipCache) {
      try {
        const cachedData = localStorage.getItem(`messages_${chatId}`);
        if (cachedData) {
          const cachedMessages = JSON.parse(cachedData);
          if (Array.isArray(cachedMessages) && cachedMessages.length > 0) {
            // Filter out any non-object messages (like strings)
            const validMessages = cachedMessages.filter(msg => msg && typeof msg === 'object');
            // Set messages from cache for immediate display
            setMessages(validMessages);
          }
        }
      } catch (e) {
        // Continue if cache reading fails
      }
    }

    // Set loading state if we don't have messages yet
    if (messages.length === 0) {
      setLoading(true);
    }

    // STEP 2: Fetch real messages from the API
    try {
      // Get token for authentication
      const token = getToken();
      if (!token) {
        setLoading(false);
        return messages.length > 0 ? messages.filter(msg => msg && typeof msg === 'object') : [];
      }

      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Determine which endpoint to use
      const currentUserRole = user?.role;
      const url = (currentUserRole === 'patient' || currentUserRole === 'doctor')
        ? `/api/patient-doctor-chat/${chatId}/messages`
        : `/api/chats/${chatId}/messages`;

      console.log(`Fetching messages from ${url}`);

      // Make direct API call to get real messages
      const response = await axios.get(url, {
        params: { limit },
        timeout: 10000 // 10 second timeout
      });

      // Process the response
      let processedMessages = [];

      // Handle string response (error message)
      if (typeof response.data === 'string') {
        console.warn(`Received string response from API: ${response.data}`);
        // Return current messages or empty array
        setLoading(false);
        return messages.length > 0 ? messages.filter(msg => msg && typeof msg === 'object') : [];
      }

      if (response.data && response.data.messages && Array.isArray(response.data.messages)) {
        // Handle response with messages property
        processedMessages = response.data.messages
          .filter(msg => msg && typeof msg === 'object') // Filter out any non-object messages
          .map(message => ({
            ...message,
            _id: message._id?.toString() || `temp-${Date.now()}`,
            content: message.content || '',
            sender: message.sender ? {
              ...message.sender,
              _id: message.sender._id?.toString() || 'unknown',
              name: message.sender.name || 'Unknown'
            } : { _id: 'unknown', name: 'Unknown' },
            timestamp: message.timestamp || new Date().toISOString()
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      } else if (Array.isArray(response.data)) {
        // Handle response that is directly an array of messages
        processedMessages = response.data
          .filter(msg => msg && typeof msg === 'object') // Filter out any non-object messages
          .map(message => ({
            ...message,
            _id: message._id?.toString() || `temp-${Date.now()}`,
            content: message.content || '',
            sender: message.sender ? {
              ...message.sender,
              _id: message.sender._id?.toString() || 'unknown',
              name: message.sender.name || 'Unknown'
            } : { _id: 'unknown', name: 'Unknown' },
            timestamp: message.timestamp || new Date().toISOString()
          }))
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }

      // Update state with the processed messages
      if (processedMessages.length > 0) {
        setMessages(processedMessages);

        // Save to local storage for offline access
        try {
          localStorage.setItem(`messages_${chatId}`, JSON.stringify(processedMessages));
          localStorage.setItem(`${chatId}_timestamp`, Date.now().toString());
        } catch (e) {}

        // Mark chat as read in background
        setTimeout(() => {
          try {
            markChatAsRead(chatId);
          } catch (e) {}
        }, 0);
      }

      setLoading(false);
      return processedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);

      // If API call fails, try to use cached messages
      try {
        const cachedData = localStorage.getItem(`messages_${chatId}`);
        if (cachedData) {
          const cachedMessages = JSON.parse(cachedData);
          if (Array.isArray(cachedMessages) && cachedMessages.length > 0) {
            return cachedMessages;
          }
        }
      } catch (e) {}

      // Return empty array if no messages are available
      return [];
    }
  };

  // Get hospital admins (for super admin)
  const getHospitalAdmins = async () => {
    try {
      setLoading(true);
      console.log('Fetching hospital admins...');

      // Get token for the request
      const token = getToken();
      console.log('Using token for getHospitalAdmins:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const { data } = await axios.get('/api/chats/admins/hospital', config);

      if (!data || !Array.isArray(data)) {
        console.error('Invalid response format for hospital admins:', data);
        setError('Failed to load hospital admins: Invalid response format');
        setLoading(false);
        return [];
      }

      console.log('Hospital admins fetched successfully:', data.length, 'admins found');
      console.log('Raw hospital admin data:', data);

      // Process admin data to ensure it's consistent
      const adminsWithHospital = data.map(admin => {
        // Log the raw admin data for debugging
        console.log('Processing admin:', {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          hospitalId: admin.hospitalId,
          hospital: admin.hospital
        });

        // Ensure admin has a valid _id
        if (!admin._id) {
          console.warn('Admin missing _id:', admin);
        }

        // Handle hospital data properly
        let hospitalData = null;

        if (admin.hospitalId && typeof admin.hospitalId === 'object') {
          // If hospitalId is already an object with hospital data
          hospitalData = admin.hospitalId;
          console.log('Using hospitalId object:', hospitalData);
        } else if (admin.hospital && typeof admin.hospital === 'object') {
          // If hospital is already an object
          hospitalData = admin.hospital;
          console.log('Using hospital object:', hospitalData);
        } else if (admin.hospitalId) {
          // If hospitalId is just an ID, create a minimal hospital object
          hospitalData = {
            _id: admin.hospitalId,
            name: admin.hospitalName || 'Unknown Hospital'
          };
          console.log('Created hospital object from ID:', hospitalData);
        }

        // Create a processed admin object with consistent data
        const processedAdmin = {
          ...admin,
          _id: admin._id ? admin._id.toString() : null, // Ensure ID is a string
          hospital: hospitalData,
          // Ensure these fields exist for UI display
          name: admin.name || 'Unknown Admin',
          email: admin.email || 'No email provided',
          role: admin.role || 'hospital_admin'
        };

        console.log('Processed admin:', {
          id: processedAdmin._id,
          name: processedAdmin.name,
          hospital: processedAdmin.hospital ? processedAdmin.hospital.name : 'None'
        });

        return processedAdmin;
      });

      // Filter out admins without valid IDs
      const validAdmins = adminsWithHospital.filter(admin => admin._id);

      console.log('Processed hospital admins:', validAdmins.length, 'valid admins');
      console.log('First 3 admins:', validAdmins.slice(0, 3).map(a => ({
        id: a._id,
        name: a.name,
        hospital: a.hospital ? a.hospital.name : 'None'
      })));

      setLoading(false);
      return validAdmins;
    } catch (error) {
      setError('Failed to load hospital admins');
      console.error('Error fetching hospital admins:', error);
      setLoading(false);
      return [];
    }
  };

  // Handle typing indicator
  const handleTyping = (chatId, isTyping) => {
    if (!socket || !chatId) return;

    if (isTyping) {
      socket.emit('typing', chatId);
    } else {
      socket.emit('stop-typing', chatId);
    }
  };

  // Clear error and success messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Get total unread messages count
  const getTotalUnreadCount = () => {
    if (!user || !chats || !chats.length) return 0;

    try {
      const userId = user.id || user._id;
      if (!userId) return 0;

      return chats.reduce((total, chat) => {
        if (!chat || !chat.unreadCounts) return total;

        let unreadCount = 0;

        // Handle both Map and object implementations
        if (typeof chat.unreadCounts.get === 'function') {
          unreadCount = chat.unreadCounts.get(userId) || 0;
        } else {
          unreadCount = chat.unreadCounts[userId] || 0;
        }

        return total + unreadCount;
      }, 0);
    } catch (error) {
      console.error('Error getting total unread count:', error);
      return 0;
    }
  };

  // Check if a user is online
  const isUserOnline = (userId) => {
    if (!onlineUsers || !userId) return false;

    try {
      // Handle both string and object IDs
      const stringId = userId.toString ? userId.toString() : userId;

      // Try to get from Map
      if (typeof onlineUsers.get === 'function') {
        return onlineUsers.get(stringId) || false;
      }

      // Fallback to object access if it's not a Map
      return onlineUsers[stringId] || false;
    } catch (error) {
      console.error('Error checking if user is online:', error);
      return false;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        messages,
        setMessages,
        loading,
        error,
        success,
        notification,
        setNotification,
        socketConnected,
        typing,
        isTyping,
        onlineUsers,
        accessChat,
        createGroupChat,
        createSuperAdminGroup,
        renameGroupChat,
        addUserToGroup,
        removeUserFromGroup,
        sendMessage,
        fetchMessages,
        fetchChats,
        markChatAsRead,
        getHospitalAdmins,
        handleTyping,
        clearMessages,
        getTotalUnreadCount,
        isUserOnline
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

export default ChatContext;
