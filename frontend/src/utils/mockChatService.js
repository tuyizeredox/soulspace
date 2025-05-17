/**
 * Mock Chat Service
 *
 * This service provides mock data for the chat functionality when the backend is unavailable.
 * It simulates API responses and stores data in localStorage to persist across page refreshes.
 */

// Helper to generate unique IDs that look like MongoDB ObjectIds
const generateId = () => {
  // Generate a 24 character hex string similar to MongoDB ObjectId
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
  const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
  return timestamp + machineId + processId + counter;
};

// Get mock data from localStorage or initialize with defaults
const getMockData = () => {
  try {
    const mockData = localStorage.getItem('mockChatData');
    if (mockData) {
      return JSON.parse(mockData);
    }
  } catch (error) {
    console.error('Error parsing mock data:', error);
  }

  // Default mock data
  return {
    chats: [],
    messages: {}
  };
};

// Save mock data to localStorage
const saveMockData = (data) => {
  try {
    localStorage.setItem('mockChatData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving mock data:', error);
  }
};

// Create or get a chat between the current user and another user
export const createOrGetChat = (userId, currentUser) => {
  const mockData = getMockData();

  // Check if chat already exists
  let chat = mockData.chats.find(c =>
    (c.participants.includes(userId) && c.participants.includes(currentUser._id || currentUser.id))
  );

  if (!chat) {
    // Create new chat
    chat = {
      _id: generateId(),
      participants: [userId, currentUser._id || currentUser.id],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    mockData.chats.push(chat);
    mockData.messages[chat._id] = [];
    saveMockData(mockData);
  }

  return chat;
};

// Get messages for a chat
export const getMessages = (chatId) => {
  const mockData = getMockData();
  return mockData.messages[chatId] || [];
};

// Add a message to a chat
export const addMessage = (chatId, content, sender, attachments = []) => {
  const mockData = getMockData();

  if (!mockData.messages[chatId]) {
    mockData.messages[chatId] = [];
  }

  const message = {
    _id: generateId(),
    content,
    sender,
    chat: chatId,
    attachments,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  mockData.messages[chatId].push(message);

  // Update chat's updatedAt
  const chatIndex = mockData.chats.findIndex(c => c._id === chatId);
  if (chatIndex !== -1) {
    mockData.chats[chatIndex].updatedAt = new Date().toISOString();
  }

  saveMockData(mockData);
  return message;
};

// Mock API functions that simulate the backend API
export const mockApi = {
  // Create or get a chat
  createChat: (userId, currentUser) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const chat = createOrGetChat(userId, currentUser);
        resolve({ data: chat });
      }, 500);
    });
  },

  // Get messages for a chat
  getMessages: (chatId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = getMessages(chatId);
        resolve({ data: { messages } });
      }, 300);
    });
  },

  // Send a message
  sendMessage: (chatId, content, sender, attachments = []) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const message = addMessage(chatId, content, sender, attachments);
        resolve({ data: { message } });
      }, 400);
    });
  }
};

export default mockApi;
