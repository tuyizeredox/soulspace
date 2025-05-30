/**
 * Socket connection manager for chat functionality
 * Provides consistent socket handling across doctor and patient interfaces
 */

import io from 'socket.io-client';

// Socket server endpoint
const SOCKET_ENDPOINT = 'https://soulspacebackend.onrender.com/';

// Global socket instance for reuse
let globalSocket = null;

/**
 * Initialize or reuse a socket connection
 * @param {Object} options - Socket connection options
 * @param {Object} options.user - Current user object
 * @param {string} options.chatId - Current chat ID
 * @param {Function} options.onConnect - Callback when socket connects
 * @param {Function} options.onDisconnect - Callback when socket disconnects
 * @param {Function} options.onError - Callback when socket encounters an error
 * @param {Function} options.onNewMessage - Callback when new message is received
 * @param {Function} options.onTyping - Callback when typing indicator is received
 * @param {Function} options.onStopTyping - Callback when stop typing indicator is received
 * @param {Function} options.onMessageRead - Callback when message read receipt is received
 * @returns {Object} - Socket instance and cleanup function
 */
export const setupSocket = ({
  user,
  chatId,
  onConnect,
  onDisconnect,
  onError,
  onNewMessage,
  onTyping,
  onStopTyping,
  onMessageRead
}) => {
  if (!user) {
    console.error('Cannot setup socket: No user provided');
    return { socket: null, cleanup: () => {} };
  }

  // Skip for mock chat IDs
  if (chatId && (chatId.startsWith('mock') || chatId.includes('mock-chat'))) {
    console.log(`SocketManager: Skipping real socket setup for mock chat: ${chatId}`);
    // Return a mock socket that doesn't actually connect
    return {
      socket: {
        connected: false,
        emit: () => console.log('Mock socket emit (no-op)'),
        on: () => console.log('Mock socket on (no-op)'),
        connect: () => console.log('Mock socket connect (no-op)'),
        disconnect: () => console.log('Mock socket disconnect (no-op)')
      },
      cleanup: () => {}
    };
  }

  console.log('SocketManager: Setting up socket connection');

  // Initialize socket connection or reuse existing one
  let socket;

  if (globalSocket && globalSocket.connected) {
    socket = globalSocket;
    console.log('SocketManager: Reusing existing socket connection');
  } else {
    // Clean up any existing socket
    if (globalSocket) {
      try {
        globalSocket.disconnect();
      } catch (error) {
        console.error('SocketManager: Error disconnecting existing socket:', error);
      }
    }

    // Create new socket with improved options
    socket = io(SOCKET_ENDPOINT, {
      reconnectionAttempts: 10, // Increased from 5
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000, // Cap at 10 seconds
      timeout: 8000, // Increased from 5000
      transports: ['websocket', 'polling'],
      query: {
        userId: user._id || user.id,
        userRole: user.role || 'unknown',
        _t: Date.now() // Add cache-busting parameter
      }
    });

    // Store the socket for reuse
    globalSocket = socket;
    console.log('SocketManager: Created new socket connection');
  }

  // Set up connection event handlers
  if (onConnect) {
    socket.on('connect', () => {
      console.log('SocketManager: Socket connected');

      // Setup user
      socket.emit('setup', user);

      // Join the chat room if provided
      if (chatId) {
        socket.emit('join-chat', chatId);
      }

      // Call the connect callback
      onConnect();
    });
  }

  if (onDisconnect) {
    socket.on('disconnect', (reason) => {
      console.log(`SocketManager: Socket disconnected due to ${reason}`);
      onDisconnect(reason);
    });
  }

  if (onError) {
    socket.on('connect_error', (error) => {
      console.error('SocketManager: Socket connection error:', error);
      onError(error);
    });
  }

  // Set up message event handlers
  if (onNewMessage) {
    socket.on('new-message', (newMessage) => {
      if (!chatId || (newMessage.chat && newMessage.chat._id === chatId)) {
        console.log('SocketManager: New message received via socket');
        onNewMessage(newMessage);
      }
    });
  }

  if (onTyping) {
    socket.on('typing', (data) => {
      if (!chatId || data.chatId === chatId) {
        console.log('SocketManager: User is typing');
        onTyping(data);
      }
    });
  }

  if (onStopTyping) {
    socket.on('stop-typing', (data) => {
      if (!chatId || data.chatId === chatId) {
        console.log('SocketManager: User stopped typing');
        onStopTyping(data);
      }
    });
  }

  if (onMessageRead) {
    socket.on('message-read', (data) => {
      if (!chatId || data.chatId === chatId) {
        console.log('SocketManager: Messages marked as read');
        onMessageRead(data);
      }
    });
  }

  // Create cleanup function
  const cleanup = () => {
    console.log('SocketManager: Cleaning up socket listeners');

    if (socket) {
      if (onConnect) socket.off('connect');
      if (onDisconnect) socket.off('disconnect');
      if (onError) socket.off('connect_error');
      if (onNewMessage) socket.off('new-message');
      if (onTyping) socket.off('typing');
      if (onStopTyping) socket.off('stop-typing');
      if (onMessageRead) socket.off('message-read');
    }
  };

  return { socket, cleanup };
};

/**
 * Send a typing indicator
 * @param {Object} socket - Socket instance
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 */
export const sendTypingIndicator = (socket, chatId, userId) => {
  if (!socket || !chatId || !userId) return;

  socket.emit('typing', { chatId, userId });
};

/**
 * Send a stop typing indicator
 * @param {Object} socket - Socket instance
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 */
export const sendStopTypingIndicator = (socket, chatId, userId) => {
  if (!socket || !chatId || !userId) return;

  socket.emit('stop-typing', { chatId, userId });
};

/**
 * Disconnect the socket completely
 */
export const disconnectSocket = () => {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
    console.log('SocketManager: Disconnected socket completely');
  }
};

export default {
  setupSocket,
  sendTypingIndicator,
  sendStopTypingIndicator,
  disconnectSocket
};
