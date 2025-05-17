/**
 * Request Blocker - Intercepts and blocks problematic API calls
 * This file contains utilities to prevent excessive API calls to endpoints that don't exist
 */

// List of problematic endpoints that should be blocked
const BLOCKED_ENDPOINTS = [
  '/api/doctors',
  '/api/patient-doctor-chat/patient',
  '/api/chats/find/force-doctor-id',
  '/api/chats/mock-chat-1/messages/unread',
  '/api/info'
];

// List of endpoints that should NEVER be blocked (allow real messages)
const ALLOWED_ENDPOINTS = [
  '/api/patient-doctor-chat/',
  '/api/chats/'
];

// Mock data to return for blocked endpoints
const MOCK_RESPONSES = {
  '/api/doctors': [
    {
      _id: 'mock-doctor-id',
      name: 'Dr. John Smith',
      specialization: 'General Medicine',
      hospital: { _id: 'mock-hospital-id', name: 'General Hospital' }
    },
    {
      _id: 'mock-doctor-id-2',
      name: 'Dr. Jane Doe',
      specialization: 'Cardiology',
      hospital: { _id: 'mock-hospital-id', name: 'General Hospital' }
    }
  ],
  '/api/patient-doctor-chat/patient': {
    _id: 'mock-chat-id',
    participants: [
      { _id: 'mock-user-id', name: 'Current User' },
      { _id: 'mock-doctor-id', name: 'Doctor' }
    ],
    messages: []
  },
  '/api/chats/find/force-doctor-id': {
    _id: 'mock-chat-id',
    participants: [
      { _id: 'mock-user-id', name: 'Current User' },
      { _id: 'mock-doctor-id', name: 'Doctor' }
    ],
    isGroup: false
  },
  '/api/chats/mock-chat-1/messages/unread': { count: 0 },
  '/api/info': { version: '1.0.0', endpoints: {} }
};

// Cache for storing mock responses
const mockResponseCache = new Map();

/**
 * Check if a URL matches any of the blocked endpoints
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL should be blocked
 */
export const shouldBlockRequest = (url) => {
  if (!url) return false;

  // First check if the URL is in the allowed list (these should never be blocked)
  // This ensures real message endpoints are never blocked
  const isAllowed = ALLOWED_ENDPOINTS.some(endpoint => {
    // Check if it's a message endpoint
    if (url.includes(endpoint) && url.includes('/messages')) {
      return true;
    }
    return false;
  });

  // If it's in the allowed list, don't block it
  if (isAllowed) {
    return false;
  }

  // Otherwise, check if it matches any blocked endpoint
  return BLOCKED_ENDPOINTS.some(endpoint =>
    url === endpoint ||
    url.startsWith(`${endpoint}/`) ||
    url.includes(endpoint)
  );
};

/**
 * Get mock response for a blocked endpoint
 * @param {string} url - The URL to get a mock response for
 * @returns {Object} - The mock response
 */
export const getMockResponse = (url) => {
  // Check if we have a cached response
  if (mockResponseCache.has(url)) {
    return mockResponseCache.get(url);
  }

  // Find the matching endpoint
  const matchingEndpoint = BLOCKED_ENDPOINTS.find(endpoint =>
    url === endpoint ||
    url.startsWith(`${endpoint}/`) ||
    url.includes(endpoint)
  );

  // Get the mock response for the matching endpoint
  const mockResponse = matchingEndpoint ? MOCK_RESPONSES[matchingEndpoint] : [];

  // Cache the response
  mockResponseCache.set(url, mockResponse);

  return mockResponse;
};

/**
 * Create an axios request interceptor to block problematic requests
 * @param {Object} axios - The axios instance
 */
export const setupRequestBlocker = (axios) => {
  // Add a request interceptor
  axios.interceptors.request.use(
    (config) => {
      // Check if this request should be blocked
      if (shouldBlockRequest(config.url)) {
        // Cancel the request
        const source = axios.CancelToken.source();
        config.cancelToken = source.token;
        source.cancel(`Request to ${config.url} was blocked by requestBlocker`);

        // Add a flag to indicate this request was blocked
        config.blockedRequest = true;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add a response interceptor to handle blocked requests
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      // Check if this error was caused by a blocked request
      if (error.config && error.config.blockedRequest) {
        // Return a mock response
        return Promise.resolve({
          data: getMockResponse(error.config.url),
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
          blockedRequest: true
        });
      }
      return Promise.reject(error);
    }
  );
};

export default {
  shouldBlockRequest,
  getMockResponse,
  setupRequestBlocker
};
