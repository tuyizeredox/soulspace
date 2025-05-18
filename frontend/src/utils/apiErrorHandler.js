/**
 * Utility functions for handling API errors gracefully
 */

/**
 * Handles API errors and provides detailed logging
 * @param {Error} error - The error object from axios or fetch
 * @param {string} context - Context where the error occurred (e.g., 'fetchPatients')
 * @param {Function} setError - Optional state setter for error message
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, context, setError = null) => {
  // Generate a unique error ID for tracking
  const errorId = `${context}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Extract error details
  const status = error.response?.status;
  const statusText = error.response?.statusText;
  const data = error.response?.data;
  const message = error.message || 'Unknown error';

  // Log detailed error information
  console.error(`[${errorId}] API Error in ${context}:`, {
    message,
    status,
    statusText,
    data,
    stack: error.stack
  });

  // Determine user-friendly message based on status code
  let userMessage = 'An error occurred. Please try again later.';

  if (status === 401) {
    userMessage = 'Your session has expired. Please log in again.';
  } else if (status === 403) {
    userMessage = 'You do not have permission to access this resource.';
  } else if (status === 404) {
    userMessage = 'The requested resource was not found.';
  } else if (status === 500) {
    userMessage = 'A server error occurred. Please try again later.';
  } else if (error.code === 'ECONNABORTED') {
    userMessage = 'The request timed out. Please check your connection and try again.';
  } else if (!navigator.onLine) {
    userMessage = 'You are offline. Please check your internet connection.';
  } else if (data?.message) {
    // Use server-provided message if available
    userMessage = data.message;
  }

  // Update error state if provided
  if (setError) {
    setError(userMessage);
  }

  // Return the user-friendly message
  return userMessage;
};

/**
 * Creates a mock response for when an API call fails
 * @param {string} endpoint - The API endpoint that failed
 * @param {Object} mockData - The mock data to return
 * @param {Error} error - The original error
 * @returns {Object} A mock response object
 */
export const createMockResponse = (endpoint, mockData, error) => {
  console.warn(`API call to ${endpoint} failed. Using mock data.`, error);
  return {
    data: mockData,
    status: 200,
    statusText: 'OK (Mock)',
    headers: {},
    config: {},
    isMock: true
  };
};

/**
 * Attempts to call an API endpoint with fallbacks
 * @param {Function} apiCall - The API call function to execute
 * @param {Object} mockData - Mock data to return if the API call fails
 * @param {number} retries - Number of retries before using mock data
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise<Object>} The API response or mock data
 */
export const callWithFallback = async (apiCall, mockData, retries = 1, delay = 1000) => {
  try {
    return await apiCall();
  } catch (error) {
    if (retries > 0) {
      console.log(`API call failed. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithFallback(apiCall, mockData, retries - 1, delay);
    }

    // If all retries fail, return mock data
    return createMockResponse(apiCall.name || 'unknown-endpoint', mockData, error);
  }
};

/**
 * Generates mock messages for chat interfaces
 * @param {number} count - Number of messages to generate
 * @param {string} senderId - ID of the sender
 * @param {string} receiverId - ID of the receiver
 * @returns {Array} Array of mock messages
 */
export const generateMockMessages = (count = 5, senderId = 'doctor-123', receiverId = 'patient-456') => {
  const messages = [];
  const now = new Date();

  const sampleMessages = [
    "Hello, how are you feeling today?",
    "Have you been taking your medication as prescribed?",
    "Your latest test results look good.",
    "Please remember to stay hydrated and get plenty of rest.",
    "Do you have any questions about your treatment plan?",
    "I'd like to schedule a follow-up appointment next week.",
    "Your blood pressure readings have improved since our last visit.",
    "Make sure to monitor your symptoms and let me know if anything changes.",
    "The new medication might cause some mild side effects initially.",
    "It's important to complete the full course of antibiotics."
  ];

  for (let i = 0; i < count; i++) {
    const isFromSender = i % 2 === 0;
    const messageTime = new Date(now.getTime() - (count - i) * 3600000);

    messages.push({
      _id: `mock-msg-${Date.now()}-${i}`,
      sender: {
        _id: isFromSender ? senderId : receiverId,
        name: isFromSender ? 'Doctor' : 'You'
      },
      content: sampleMessages[i % sampleMessages.length],
      timestamp: messageTime.toISOString(),
      read: true
    });
  }

  return messages;
};

/**
 * Handles WebSocket connection errors
 * @param {Object} socket - The socket.io instance
 * @param {Function} onError - Callback function when error occurs
 * @returns {Object} The socket instance with error handling
 */
export const handleSocketErrors = (socket, onError) => {
  if (!socket) return null;

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    if (onError) onError(error);
  });

  socket.on('connect_timeout', (timeout) => {
    console.error('Socket connection timeout:', timeout);
    if (onError) onError(new Error('Connection timeout'));
  });

  return socket;
};
