import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import axios from '../utils/axiosConfig'; // Use the configured axios instance
import { useAuth } from './AuthContext';

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

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      try {
        socket = io(ENDPOINT, {
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
          transports: ['websocket', 'polling']
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });

        socket.on('connect_timeout', () => {
          console.error('Socket connection timeout');
        });

        socket.emit('setup', user);
        socket.on('connected', () => setSocketConnected(true));

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
      }
    }
  }, [user, selectedChat]);

  // Fetch all chats for the user
  const fetchChats = useCallback(async () => {
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
      console.log('Using token for fetchChats:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const response = await axios.get('/api/chats', config);

      if (!response || !response.data) {
        console.error('Invalid response from server when fetching chats');
        setError('Failed to load chats: Invalid response');
        setLoading(false);
        return [];
      }

      console.log('Chats fetched successfully:', response.data.length, 'chats');

      // Ensure we have a valid array of chats
      const validChats = Array.isArray(response.data) ? response.data : [];

      // Log the first chat's participants for debugging
      if (validChats.length > 0 && validChats[0].participants) {
        console.log('First chat participants:', JSON.stringify(validChats[0].participants, null, 2));

        // Check if the current user is in the participants
        const userIdStr = userId ? userId.toString() : '';
        const isUserInChat = validChats[0].participants.some(p =>
          p._id && p._id.toString() === userIdStr
        );
        console.log('Is current user in first chat:', isUserInChat);

        // Log the other participant
        const otherParticipant = validChats[0].participants.find(p =>
          p._id && p._id.toString() !== userIdStr
        );
        console.log('Other participant in first chat:', otherParticipant ?
          JSON.stringify({
            id: otherParticipant._id,
            name: otherParticipant.name,
            role: otherParticipant.role
          }, null, 2) : 'Not found'
        );
      }

      // Filter out any invalid chats (those without _id)
      const filteredChats = validChats.filter(chat => chat && chat._id);

      // Process each chat to ensure IDs are strings
      const processedChats = filteredChats.map(chat => {
        // Process participants to ensure IDs are strings
        const processedParticipants = chat.participants.map(participant => ({
          ...participant,
          _id: participant._id ? participant._id.toString() : null
        }));

        return {
          ...chat,
          _id: chat._id.toString(),
          participants: processedParticipants
        };
      });

      console.log('Processed chats:', processedChats.length);

      setChats(processedChats);
      setLoading(false);
      return processedChats;
    } catch (error) {
      setError('Failed to load chats');
      console.error('Error fetching chats:', error);
      setLoading(false);
      return [];
    }
  }, [user]);

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    socket.on('message-received', (newMessageReceived) => {
      // If the chat is not selected or is different from the current chat
      if (!selectedChat || selectedChat._id !== newMessageReceived.chat._id) {
        // Add notification
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
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
    });

    return () => {
      socket.off('message-received');
    };
  }, [selectedChat, notification]);

  // Access or create a one-on-one chat
  const accessChat = async (userId) => {
    try {
      if (!userId) {
        console.error('Invalid user ID provided to accessChat:', userId);
        setError('Failed to access chat: Invalid user ID');
        return null;
      }

      setLoading(true);
      console.log('Accessing chat with user ID:', userId);

      // Make sure we're sending a string ID to the backend
      const userIdString = userId.toString();
      console.log('Converted user ID to string:', userIdString);

      // Log the current user for debugging
      const currentUserId = user?.id || user?._id;
      console.log('Current user ID:', currentUserId);

      // Get token for the request
      const token = getToken();
      console.log('Using token for accessChat:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      // Make the API call to create or access the chat
      console.log('Making API call to /api/chats with userId:', userIdString);
      const { data } = await axios.post('/api/chats', { userId: userIdString }, config);

      if (!data || !data._id) {
        console.error('Invalid chat data received:', data);
        setError('Failed to access chat: Invalid response');
        setLoading(false);
        return null;
      }

      console.log('Chat data received:', data);
      console.log('Chat participants:', data.participants.map(p => ({ id: p._id, name: p.name })));

      // Verify that the chat contains both the current user and the target user
      const currentUserIdStr = currentUserId ? currentUserId.toString() : '';
      const hasCurrentUser = data.participants.some(p => p._id && p._id.toString() === currentUserIdStr);
      const hasTargetUser = data.participants.some(p => p._id && p._id.toString() === userIdString);

      console.log('Chat participant verification:', {
        hasCurrentUser,
        hasTargetUser,
        currentUserIdStr,
        targetUserIdStr: userIdString
      });

      if (!hasCurrentUser || !hasTargetUser) {
        console.warn('Chat does not contain expected participants');
      }

      // If the chat is not already in the list, add it
      if (!chats.find(c => c._id === data._id)) {
        console.log('Adding new chat to list');
        setChats(prevChats => [data, ...prevChats]);
      } else {
        console.log('Chat already exists in list');
        // Update the chat in the list to ensure it has the latest data
        setChats(prevChats =>
          prevChats.map(c => c._id === data._id ? data : c)
        );
      }

      console.log('Setting selected chat:', data);
      setSelectedChat(data);

      // Fetch messages for this chat
      fetchMessages(data._id);

      setLoading(false);

      // Return the chat data for further processing if needed
      return data;
    } catch (error) {
      setError('Failed to access chat');
      console.error('Error accessing chat:', error);
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

  // Send a message
  const sendMessage = async (content, chatId, attachments = []) => {
    // Stop typing indicator
    socket.emit('stop-typing', chatId);

    try {
      console.log('Sending message with attachments:', attachments);

      // Get token for the request
      const token = getToken();
      console.log('Using token for sendMessage:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const { data } = await axios.post('/api/chats/message', {
        content: content || '',
        chatId,
        attachments
      }, config);

      // Add message to the messages list
      setMessages(prevMessages => [...prevMessages, data.message]);

      // Emit the message to the socket server
      socket.emit('new-message', data.message);

      // Update the chats list to show the latest message
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

        // Sort chats to bring the most recent to the top
        return updatedChats.sort((a, b) => {
          const aTime = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp) : new Date(0);
          const bTime = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp) : new Date(0);
          return bTime - aTime;
        });
      });

      return data;
    } catch (error) {
      setError('Failed to send message');
      console.error('Error sending message:', error);
      return null;
    }
  };

  // Fetch messages for a chat
  const fetchMessages = async (chatId) => {
    if (!chatId) {
      console.error('Cannot fetch messages: No chat ID provided');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching messages for chat ID:', chatId);

      // Get token for the request
      const token = getToken();
      console.log('Using token for fetchMessages:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const { data } = await axios.get(`/api/chats/${chatId}`, config);

      if (!data) {
        console.error('Invalid response when fetching messages');
        setError('Failed to load messages: Invalid response');
        setLoading(false);
        return;
      }

      console.log('Messages fetched successfully:', data.messages ? data.messages.length : 0, 'messages');

      // Ensure messages is always an array
      const messagesArray = Array.isArray(data.messages) ? data.messages : [];

      // Sort messages by timestamp if they have timestamps
      const sortedMessages = messagesArray.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeA - timeB;
      });

      setMessages(sortedMessages);

      // Mark chat as read
      markChatAsRead(chatId);

      // Join the chat room
      if (socket && socket.connected) {
        socket.emit('join-chat', chatId);
      } else {
        console.warn('Socket not connected, cannot join chat room');
      }

      setLoading(false);
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  // Mark chat as read
  const markChatAsRead = async (chatId) => {
    if (!chatId) {
      console.error('Cannot mark chat as read: No chat ID provided');
      return;
    }

    if (!user) {
      console.error('Cannot mark chat as read: No user found');
      return;
    }

    try {
      console.log('Marking chat as read:', chatId);

      // Get token for the request
      const token = getToken();
      console.log('Using token for markChatAsRead:', !!token);

      // Create config with authorization header
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      await axios.put(`/api/chats/${chatId}/read`, {}, config);

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

      console.log('Chat marked as read successfully');
    } catch (error) {
      console.error('Error marking chat as read:', error);
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
