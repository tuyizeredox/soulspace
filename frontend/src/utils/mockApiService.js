/**
 * Mock API Service
 * 
 * This service intercepts failed API requests and returns mock data.
 * It's used as a fallback when the backend is unavailable or returns errors.
 */

// Mock data for different API endpoints
const mockData = {
  // Chat endpoints
  '/api/chats': [
    {
      _id: 'mock-chat-1',
      participants: [
        { _id: 'current-user', name: 'You' },
        { _id: 'mock-doctor-1', name: 'Dr. John Smith', role: 'doctor' }
      ],
      lastMessage: {
        content: 'Hello, how are you feeling today?',
        sender: { _id: 'mock-doctor-1', name: 'Dr. John Smith' },
        timestamp: new Date().toISOString()
      },
      unreadCounts: { 'current-user': 0 },
      isGroup: false
    },
    {
      _id: 'mock-chat-2',
      participants: [
        { _id: 'current-user', name: 'You' },
        { _id: 'mock-doctor-2', name: 'Dr. Sarah Johnson', role: 'doctor' }
      ],
      lastMessage: {
        content: 'Your test results look good.',
        sender: { _id: 'mock-doctor-2', name: 'Dr. Sarah Johnson' },
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      unreadCounts: { 'current-user': 0 },
      isGroup: false
    }
  ],
  
  // Chat messages
  '/api/chats/:chatId': {
    _id: 'mock-chat-1',
    participants: [
      { _id: 'current-user', name: 'You' },
      { _id: 'mock-doctor-1', name: 'Dr. John Smith', role: 'doctor' }
    ],
    messages: [
      {
        _id: 'mock-msg-1',
        sender: { _id: 'mock-doctor-1', name: 'Dr. John Smith' },
        content: 'Hello, how are you feeling today?',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true
      },
      {
        _id: 'mock-msg-2',
        sender: { _id: 'current-user', name: 'You' },
        content: 'I\'m feeling much better, thank you.',
        timestamp: new Date(Date.now() - 86000000).toISOString(),
        read: true
      },
      {
        _id: 'mock-msg-3',
        sender: { _id: 'mock-doctor-1', name: 'Dr. John Smith' },
        content: 'That\'s great to hear! Have you been taking your medication regularly?',
        timestamp: new Date(Date.now() - 85000000).toISOString(),
        read: true
      }
    ]
  },
  
  // Find chat by user ID
  '/api/chats/find/:userId': {
    _id: 'mock-chat-1',
    participants: [
      { _id: 'current-user', name: 'You' },
      { _id: 'mock-doctor-1', name: 'Dr. John Smith', role: 'doctor' }
    ],
    lastMessage: {
      content: 'Hello, how are you feeling today?',
      sender: { _id: 'mock-doctor-1', name: 'Dr. John Smith' },
      timestamp: new Date().toISOString()
    }
  },
  
  // Appointments
  '/api/appointments/my-appointments': [
    {
      _id: 'mock-appointment-1',
      patient: { _id: 'current-user', name: 'You' },
      doctor: { _id: 'mock-doctor-1', name: 'Dr. John Smith' },
      hospital: { _id: 'mock-hospital-1', name: 'General Hospital' },
      date: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
      time: '10:00 AM',
      status: 'confirmed',
      type: 'in-person',
      reason: 'Follow-up appointment'
    },
    {
      _id: 'mock-appointment-2',
      patient: { _id: 'current-user', name: 'You' },
      doctor: { _id: 'mock-doctor-2', name: 'Dr. Sarah Johnson' },
      hospital: { _id: 'mock-hospital-1', name: 'General Hospital' },
      date: new Date(Date.now() + 604800000).toISOString(), // 7 days from now
      time: '2:30 PM',
      status: 'pending',
      type: 'virtual',
      reason: 'Consultation'
    }
  ],
  
  // Medical records
  '/api/medical-records/my-records': [
    {
      _id: 'mock-record-1',
      patient: { _id: 'current-user', name: 'You' },
      doctor: { _id: 'mock-doctor-1', name: 'Dr. John Smith' },
      hospital: { _id: 'mock-hospital-1', name: 'General Hospital' },
      date: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
      diagnosis: 'Common Cold',
      treatment: 'Rest, fluids, and over-the-counter medication',
      notes: 'Patient should recover within a week.'
    },
    {
      _id: 'mock-record-2',
      patient: { _id: 'current-user', name: 'You' },
      doctor: { _id: 'mock-doctor-2', name: 'Dr. Sarah Johnson' },
      hospital: { _id: 'mock-hospital-1', name: 'General Hospital' },
      date: new Date(Date.now() - 7776000000).toISOString(), // 90 days ago
      diagnosis: 'Annual Check-up',
      treatment: 'No treatment required',
      notes: 'All vitals normal. Recommended to maintain current diet and exercise.'
    }
  ],
  
  // Health endpoint
  '/api/health': { status: 'ok' }
};

/**
 * Get mock data for a specific endpoint
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Additional options
 * @returns {Object} Mock data for the endpoint
 */
export const getMockData = (url, options = {}) => {
  // Extract the base endpoint without query parameters
  const baseUrl = url.split('?')[0];
  
  // Handle dynamic endpoints with IDs
  if (baseUrl.includes('/api/chats/') && !baseUrl.includes('/find/')) {
    const chatId = baseUrl.split('/api/chats/')[1];
    if (chatId) {
      return mockData['/api/chats/:chatId'];
    }
  }
  
  if (baseUrl.includes('/api/chats/find/')) {
    return mockData['/api/chats/find/:userId'];
  }
  
  // Return mock data for the endpoint or an empty object
  return mockData[baseUrl] || { message: 'No mock data available for this endpoint' };
};

/**
 * Intercept axios requests and return mock data for failed requests
 * @param {Object} axiosInstance - The axios instance to intercept
 */
export const setupMockInterceptor = (axiosInstance) => {
  // Response interceptor
  axiosInstance.interceptors.response.use(
    (response) => response, // Return successful responses as-is
    (error) => {
      // Only intercept if there's a response (i.e., the server responded with an error)
      if (error.response) {
        console.warn(`API Error: ${error.config.url} returned ${error.response.status}`);
        
        // Get mock data for the endpoint
        const mockResponse = getMockData(error.config.url);
        
        // Return a mock successful response
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK (Mock)',
          headers: {},
          config: error.config,
          isMock: true
        });
      }
      
      // For network errors (no response), also return mock data
      if (error.request) {
        console.warn(`Network Error: ${error.config.url} - No response received`);
        
        // Get mock data for the endpoint
        const mockResponse = getMockData(error.config.url);
        
        // Return a mock successful response
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK (Mock - Network Error)',
          headers: {},
          config: error.config,
          isMock: true
        });
      }
      
      // For other errors, reject the promise
      return Promise.reject(error);
    }
  );
};
