/**
 * Centralized socket configuration for consistent socket handling
 * across all chat components
 */

import { io } from 'socket.io-client';

// Get socket URL from environment or use production URL
const getSocketUrl = () => {
  // Use environment variable if available
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }

  // In production, use the backend URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://soulspacebackend.onrender.com';
  }

  // In development, use localhost
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

// Global socket instance to prevent multiple connections
let globalSocket = null;
let connectionPromise = null;

/**
 * Get or create a socket connection
 * @param {Object} user - User object with _id and role
 * @returns {Promise<Object>} Socket instance
 */
export const getSocket = async (user) => {
  // If we already have a connected socket, return it
  if (globalSocket && globalSocket.connected) {
    return globalSocket;
  }

  // If we're already connecting, wait for that connection
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create new connection
  connectionPromise = new Promise((resolve, reject) => {
    try {
      // Clean up any existing socket
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
      }

      console.log('Creating new socket connection to:', SOCKET_URL);

      const socket = io(SOCKET_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        transports: ['websocket', 'polling'],
        forceNew: false,
        autoConnect: true,
        query: {
          userId: user?._id || user?.id,
          userRole: user?.role || 'unknown',
          timestamp: Date.now()
        }
      });

      socket.on('connect', () => {
        console.log('Socket connected successfully:', socket.id);
        globalSocket = socket;
        connectionPromise = null;
        
        // Setup user
        if (user) {
          socket.emit('setup', user);
        }
        
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        connectionPromise = null;
        reject(error);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          socket.connect();
        }
      });

    } catch (error) {
      console.error('Error creating socket:', error);
      connectionPromise = null;
      reject(error);
    }
  });

  return connectionPromise;
};

/**
 * Join a chat room
 * @param {string} chatId - Chat ID to join
 */
export const joinChat = async (chatId, user) => {
  try {
    const socket = await getSocket(user);
    if (socket && socket.connected && chatId) {
      socket.emit('join-chat', chatId);
      console.log('Joined chat room:', chatId);
    }
  } catch (error) {
    console.error('Error joining chat:', error);
  }
};

/**
 * Leave a chat room
 * @param {string} chatId - Chat ID to leave
 */
export const leaveChat = async (chatId, user) => {
  try {
    const socket = await getSocket(user);
    if (socket && socket.connected && chatId) {
      socket.emit('leave-chat', chatId);
      console.log('Left chat room:', chatId);
    }
  } catch (error) {
    console.error('Error leaving chat:', error);
  }
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
  connectionPromise = null;
};

/**
 * Check if socket is connected
 */
export const isSocketConnected = () => {
  return globalSocket && globalSocket.connected;
};

export default {
  getSocket,
  joinChat,
  leaveChat,
  disconnectSocket,
  isSocketConnected,
  SOCKET_URL
};
