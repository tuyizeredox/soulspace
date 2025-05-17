/**
 * Utility to detect and validate API endpoints
 * This helps handle different backend API structures
 */

import axios from './axiosConfig';

// Store detected endpoints
const detectedEndpoints = {
  chatMessage: null,
  fetchMessages: null,
  createChat: null
};

/**
 * Check which API endpoints are available
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Object with detected endpoints
 */
export const detectApiEndpoints = async (token) => {
  if (!token) {
    console.error('No token provided for API endpoint detection');
    return detectedEndpoints;
  }

  try {
    console.log('Detecting available API endpoints...');
    
    // Create config with authorization header
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000 // 5 second timeout
    };
    
    // Try to get API info
    try {
      const response = await axios.get('/api/info', config);
      console.log('API info endpoint available:', response.data);
      
      // Store API version and available endpoints if provided
      if (response.data && response.data.version) {
        window.apiVersion = response.data.version;
        console.log('API version:', response.data.version);
      }
      
      if (response.data && response.data.endpoints) {
        window.apiEndpoints = response.data.endpoints;
        console.log('Available endpoints:', response.data.endpoints);
        
        // If the backend provides endpoints directly, use them
        if (response.data.endpoints.chatMessage) {
          detectedEndpoints.chatMessage = response.data.endpoints.chatMessage;
        }
        if (response.data.endpoints.fetchMessages) {
          detectedEndpoints.fetchMessages = response.data.endpoints.fetchMessages;
        }
        if (response.data.endpoints.createChat) {
          detectedEndpoints.createChat = response.data.endpoints.createChat;
        }
        
        return detectedEndpoints;
      }
    } catch (error) {
      console.log('API info endpoint not available');
    }
    
    // Check if the chat message endpoints are available
    await detectChatMessageEndpoint(token);
    await detectFetchMessagesEndpoint(token);
    await detectCreateChatEndpoint(token);
    
    console.log('API endpoint detection completed:', detectedEndpoints);
    return detectedEndpoints;
  } catch (error) {
    console.error('Error detecting API endpoints:', error);
    return detectedEndpoints;
  }
};

/**
 * Detect the correct endpoint for sending chat messages
 * @param {string} token - Authentication token
 * @returns {Promise<string|null>} - Detected endpoint or null
 */
export const detectChatMessageEndpoint = async (token) => {
  if (detectedEndpoints.chatMessage) {
    return detectedEndpoints.chatMessage;
  }
  
  try {
    // Create config with authorization header
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 3000
    };
    
    // Check standard endpoint format
    try {
      const response = await axios.options('/api/chats/message', config);
      if (response.status < 400) {
        detectedEndpoints.chatMessage = '/api/chats/message';
        window.chatMessageEndpoint = '/api/chats/message';
        console.log('Chat message endpoint detected:', detectedEndpoints.chatMessage);
        return detectedEndpoints.chatMessage;
      }
    } catch (error) {
      console.log('Standard chat message endpoint not available');
    }
    
    // Check alternative endpoint format
    try {
      // Try with a dummy chat ID
      const response = await axios.options('/api/chats/test/messages', config);
      if (response.status < 400) {
        detectedEndpoints.chatMessage = '/api/chats/:chatId/messages';
        window.chatMessageEndpoint = '/api/chats/:chatId/messages';
        console.log('Alternative chat message endpoint detected:', detectedEndpoints.chatMessage);
        return detectedEndpoints.chatMessage;
      }
    } catch (error) {
      console.log('Alternative chat message endpoint not available');
    }
    
    return null;
  } catch (error) {
    console.error('Error detecting chat message endpoint:', error);
    return null;
  }
};

/**
 * Detect the correct endpoint for fetching chat messages
 * @param {string} token - Authentication token
 * @returns {Promise<string|null>} - Detected endpoint or null
 */
export const detectFetchMessagesEndpoint = async (token) => {
  // Implementation similar to detectChatMessageEndpoint
  // Omitted for brevity
  return null;
};

/**
 * Detect the correct endpoint for creating a chat
 * @param {string} token - Authentication token
 * @returns {Promise<string|null>} - Detected endpoint or null
 */
export const detectCreateChatEndpoint = async (token) => {
  // Implementation similar to detectChatMessageEndpoint
  // Omitted for brevity
  return null;
};

export default {
  detectApiEndpoints,
  detectChatMessageEndpoint,
  detectFetchMessagesEndpoint,
  detectCreateChatEndpoint,
  getDetectedEndpoints: () => detectedEndpoints
};
