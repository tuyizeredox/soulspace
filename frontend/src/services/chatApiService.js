/**
 * Centralized chat API service for consistent API calls
 * across all chat components
 */

import axios from '../utils/axiosConfig';

// Cache for chat IDs to reduce API calls
const chatIdCache = new Map();

/**
 * Get authentication token
 */
const getAuthToken = () => {
  return localStorage.getItem('token') ||
         localStorage.getItem('userToken') ||
         localStorage.getItem('patientToken') ||
         localStorage.getItem('doctorToken') ||
         localStorage.getItem('persistentToken');
};

/**
 * Set authentication header
 */
const setAuthHeader = () => {
  const token = getAuthToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return !!token;
};

/**
 * Create or access a chat between patient and doctor
 * @param {string} doctorId - Doctor's ID
 * @param {Object} user - Current user object
 * @returns {Promise<Object>} Chat object
 */
export const createOrAccessChat = async (doctorId, user) => {
  if (!setAuthHeader()) {
    throw new Error('Authentication required');
  }

  // Check cache first
  const cacheKey = `chat_${doctorId}_${user?._id || user?.id}`;
  const cachedChatId = chatIdCache.get(cacheKey) || localStorage.getItem(cacheKey);
  
  if (cachedChatId) {
    try {
      // Verify cached chat still exists
      const response = await axios.get(`/api/patient-doctor-chat/${cachedChatId}/messages`);
      if (response.data) {
        console.log('Using cached chat ID:', cachedChatId);
        return { _id: cachedChatId, ...response.data.chat };
      }
    } catch (error) {
      console.log('Cached chat ID invalid, creating new chat');
      chatIdCache.delete(cacheKey);
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    console.log('Creating/accessing chat with doctor:', doctorId);
    
    const response = await axios.post('/api/patient-doctor-chat', {
      userId: doctorId
    }, {
      timeout: 10000
    });

    if (response.data && response.data._id) {
      // Cache the chat ID
      chatIdCache.set(cacheKey, response.data._id);
      localStorage.setItem(cacheKey, response.data._id);
      
      console.log('Chat created/accessed successfully:', response.data._id);
      return response.data;
    }

    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Error creating/accessing chat:', error);
    throw error;
  }
};

/**
 * Fetch messages for a chat
 * @param {string} chatId - Chat ID
 * @param {number} limit - Number of messages to fetch
 * @returns {Promise<Array>} Array of messages
 */
export const fetchMessages = async (chatId, limit = 50) => {
  if (!chatId) {
    throw new Error('Chat ID is required');
  }

  if (!setAuthHeader()) {
    throw new Error('Authentication required');
  }

  try {
    console.log('Fetching messages for chat:', chatId);
    
    const response = await axios.get(`/api/patient-doctor-chat/${chatId}/messages`, {
      params: { limit },
      timeout: 10000
    });

    let messages = [];
    
    // Extract messages from various response formats
    if (response.data && Array.isArray(response.data.messages)) {
      messages = response.data.messages;
    } else if (response.data && Array.isArray(response.data)) {
      messages = response.data;
    } else if (response.data && response.data.chat && Array.isArray(response.data.chat.messages)) {
      messages = response.data.chat.messages;
    }

    console.log(`Fetched ${messages.length} messages for chat ${chatId}`);
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    
    // If it's a 404 or chat not found, return empty array
    if (error.response && (error.response.status === 404 || error.response.status === 400)) {
      console.log('Chat not found, returning empty messages');
      return [];
    }
    
    throw error;
  }
};

/**
 * Send a message to a chat
 * @param {string} chatId - Chat ID
 * @param {string} content - Message content
 * @param {Array} attachments - Optional attachments
 * @returns {Promise<Object>} Sent message object
 */
export const sendMessage = async (chatId, content, attachments = []) => {
  if (!chatId || !content.trim()) {
    throw new Error('Chat ID and message content are required');
  }

  if (!setAuthHeader()) {
    throw new Error('Authentication required');
  }

  try {
    console.log('Sending message to chat:', chatId);
    
    const response = await axios.post(`/api/patient-doctor-chat/${chatId}/messages`, {
      content: content.trim(),
      attachments
    }, {
      timeout: 10000
    });

    if (response.data && response.data.message) {
      console.log('Message sent successfully');
      return response.data.message;
    }

    throw new Error('Invalid response from server');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Upload files for chat
 * @param {FileList|Array} files - Files to upload
 * @param {string} chatId - Chat ID
 * @returns {Promise<Array>} Array of uploaded file objects
 */
export const uploadFiles = async (files, chatId) => {
  if (!files || files.length === 0) {
    throw new Error('Files are required');
  }

  if (!setAuthHeader()) {
    throw new Error('Authentication required');
  }

  try {
    const formData = new FormData();

    // Add all files to form data
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    if (chatId) {
      formData.append('chatId', chatId);
    }

    console.log('Uploading files for chat:', chatId);

    const response = await axios.post('/api/uploads/chat-attachment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // Longer timeout for file uploads
    });

    if (response.data && response.data.success && response.data.files) {
      console.log('Files uploaded successfully:', response.data.files.length);
      return response.data.files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url
      }));
    }

    throw new Error('Invalid upload response');
  } catch (error) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

/**
 * Upload single file for chat (legacy support)
 * @param {File} file - File to upload
 * @param {string} chatId - Chat ID
 * @returns {Promise<Object>} Upload response
 */
export const uploadFile = async (file, chatId) => {
  const files = await uploadFiles([file], chatId);
  return files[0];
};

/**
 * Check if backend is available
 * @returns {Promise<boolean>} True if backend is available
 */
export const checkBackendAvailability = async () => {
  try {
    const response = await axios.get('/api/health', {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    console.warn('Backend health check failed:', error.message);
    // In development, if health check fails, assume backend might not be running
    // In production, this could indicate a real issue
    return false;
  }
};

/**
 * Clear chat cache
 */
export const clearChatCache = () => {
  chatIdCache.clear();
  // Clear localStorage cache entries
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('chat_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('Chat cache cleared');
};

export default {
  createOrAccessChat,
  fetchMessages,
  sendMessage,
  uploadFile,
  uploadFiles,
  checkBackendAvailability,
  clearChatCache
};
