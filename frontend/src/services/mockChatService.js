/**
 * Mock Chat Service
 * 
 * This service provides mock implementations of chat-related API endpoints
 * to be used when the real API is unavailable or experiencing CORS issues.
 */

// Try to import uuid, but provide a fallback if it's not available
let uuidv4;
try {
  const uuid = require('uuid');
  uuidv4 = uuid.v4;
} catch (error) {
  // Simple fallback implementation if uuid package is not available
  uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// In-memory storage for mock data
const mockChats = [];
const mockMessages = [];

/**
 * Generate a mock chat ID
 * @returns {string} A mock chat ID
 */
const generateMockChatId = () => {
  return `mock_chat_${uuidv4()}`;
};

/**
 * Generate a mock message ID
 * @returns {string} A mock message ID
 */
const generateMockMessageId = () => {
  return `mock_msg_${uuidv4()}`;
};

/**
 * Create a mock chat
 * @param {string} userId - The ID of the user to chat with
 * @param {object} currentUser - The current user object
 * @returns {Promise<object>} A promise that resolves to the created chat
 */
export const createChat = async (userId, currentUser) => {
  // Check if a chat already exists between these users
  const existingChat = mockChats.find(chat => 
    chat.participants.includes(userId) && 
    chat.participants.includes(currentUser._id || currentUser.id)
  );

  if (existingChat) {
    return {
      data: existingChat
    };
  }

  // Create a new mock chat
  const newChat = {
    _id: generateMockChatId(),
    participants: [userId, currentUser._id || currentUser.id],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastMessage: null,
    unreadCount: 0
  };

  mockChats.push(newChat);

  return {
    data: newChat
  };
};

/**
 * Get a chat by ID
 * @param {string} chatId - The ID of the chat to get
 * @returns {Promise<object>} A promise that resolves to the chat
 */
export const getChatById = async (chatId) => {
  const chat = mockChats.find(c => c._id === chatId);
  
  if (!chat) {
    throw new Error('Chat not found');
  }

  return {
    data: chat
  };
};

/**
 * Get chats for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<object>} A promise that resolves to the user's chats
 */
export const getUserChats = async (userId) => {
  const userChats = mockChats.filter(chat => 
    chat.participants.includes(userId)
  );

  return {
    data: userChats
  };
};

/**
 * Send a message in a chat
 * @param {string} chatId - The ID of the chat
 * @param {string} content - The message content
 * @param {object} sender - The sender object
 * @returns {Promise<object>} A promise that resolves to the sent message
 */
export const sendMessage = async (chatId, content, sender) => {
  // Find the chat
  const chat = mockChats.find(c => c._id === chatId);
  
  if (!chat) {
    throw new Error('Chat not found');
  }

  // Create a new message
  const newMessage = {
    _id: generateMockMessageId(),
    chat: chatId,
    content,
    sender: {
      _id: sender._id || sender.id,
      name: sender.name
    },
    timestamp: new Date().toISOString(),
    read: false
  };

  mockMessages.push(newMessage);

  // Update the chat's last message
  chat.lastMessage = newMessage;
  chat.updatedAt = new Date().toISOString();

  // Increment unread count for other participants
  chat.unreadCount += 1;

  return {
    data: {
      message: newMessage
    }
  };
};

/**
 * Get messages for a chat
 * @param {string} chatId - The ID of the chat
 * @param {object} options - Options for pagination
 * @returns {Promise<object>} A promise that resolves to the chat messages
 */
export const getChatMessages = async (chatId, options = {}) => {
  const { limit = 50, before } = options;
  
  let chatMessages = mockMessages.filter(msg => msg.chat === chatId);
  
  // Sort by timestamp (newest first)
  chatMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Apply 'before' filter if provided
  if (before) {
    chatMessages = chatMessages.filter(msg => 
      new Date(msg.timestamp) < new Date(before)
    );
  }
  
  // Apply limit
  chatMessages = chatMessages.slice(0, limit);
  
  return {
    data: chatMessages
  };
};

/**
 * Mark messages as read
 * @param {string} chatId - The ID of the chat
 * @param {string} userId - The ID of the user marking messages as read
 * @returns {Promise<object>} A promise that resolves to the updated chat
 */
export const markMessagesAsRead = async (chatId, userId) => {
  const chat = mockChats.find(c => c._id === chatId);
  
  if (!chat) {
    throw new Error('Chat not found');
  }
  
  // Mark all messages as read for this user
  mockMessages.forEach(msg => {
    if (msg.chat === chatId && msg.sender._id !== userId) {
      msg.read = true;
    }
  });
  
  // Reset unread count
  chat.unreadCount = 0;
  
  return {
    data: {
      success: true,
      chat
    }
  };
};

/**
 * Get unread message count for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<object>} A promise that resolves to the unread count
 */
export const getUnreadCount = async (userId) => {
  let totalUnread = 0;
  
  // Sum up unread counts from all chats for this user
  mockChats.forEach(chat => {
    if (chat.participants.includes(userId)) {
      totalUnread += chat.unreadCount;
    }
  });
  
  return {
    data: {
      count: totalUnread
    }
  };
};

export default {
  createChat,
  getChatById,
  getUserChats,
  sendMessage,
  getChatMessages,
  markMessagesAsRead,
  getUnreadCount
};