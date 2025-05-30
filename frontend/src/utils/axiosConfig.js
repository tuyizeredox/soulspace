import axios from 'axios';
import { setupMockInterceptor } from './mockApiService';
import { setupRequestBlocker } from './requestBlocker';
import { getStoredToken, clearAllTokens } from './tokenManager';

// Helper functions to avoid circular dependencies
const getTokenFromStorage = () => {
  return getStoredToken();
};

const clearTokensFromStorage = () => {
  clearAllTokens();
};

// Configure axios defaults
// When running in development with the proxy setting in package.json,
// we don't need to set the baseURL as requests will be proxied automatically
// Only set baseURL in production or if explicitly provided in .env
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction || process.env.REACT_APP_API_URL) {
  // For production, use the deployed API URL
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://soulspacebackend.onrender.com';
  console.log('Axios baseURL set to:', axios.defaults.baseURL);
} else {
  // For development, use the local API
  axios.defaults.baseURL = 'http://localhost:5000';
  console.log('Using development API URL:', axios.defaults.baseURL);
}

// Set default headers
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Set auth header from localStorage if available
const token = getTokenFromStorage();
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Initial auth token set from localStorage:', token.substring(0, 10) + '...');

  // Store token in all locations for redundancy
  localStorage.setItem('token', token);
  localStorage.setItem('userToken', token);
  localStorage.setItem('doctorToken', token);
  localStorage.setItem('persistentToken', token);
}

// Add a request interceptor to include the token in all requests
axios.interceptors.request.use(
  (config) => {
    // Log request details for debugging
    console.log(`Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });

    // Always get the best available token for each request
    // This ensures we're using the most up-to-date token
    const token = getTokenFromStorage();

    if (token) {
      // Always set the token, even if it's already set
      // This ensures we're using the most recent token
      config.headers.Authorization = `Bearer ${token}`;

      // Only log for non-polling requests to reduce console noise
      if (!config.url.includes('/api/notifications') && !config.url.includes('/api/chats')) {
        console.log(`Request to ${config.url} with token: ${token.substring(0, 10)}...`);
      }
    } else {
      console.warn('No token found for request:', config.url);

      // For certain endpoints that require authentication, redirect to login
      const authRequiredEndpoints = [
        '/api/doctors',
        '/api/patients',
        '/api/appointments',
        '/api/hospital'
      ];

      // Check if this is an auth-required endpoint
      const isAuthRequired = authRequiredEndpoints.some(endpoint =>
        config.url.includes(endpoint)
      );

      if (isAuthRequired) {
        console.warn('Auth required for this endpoint but no token found');
        // We can't redirect here directly, but we can set a flag
        localStorage.setItem('auth_redirect_needed', 'true');
      }
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  (error) => {
    // Check if this is a network error (no response)
    if (!error.response) {
      console.error('Network error:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method
      });

      // For network errors, don't clear auth tokens or redirect
      // This allows the app to recover when network connection is restored
      return Promise.reject({
        ...error,
        message: 'Network error. Please check your connection and try again.',
        isNetworkError: true
      });
    }

    // Log error response for server errors
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    // Handle authentication errors (401 Unauthorized or 403 Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Authentication error detected, status:', error.response.status);

      // Check if we're already on the login page to avoid redirect loops
      const isLoginPage = window.location.pathname === '/login' ||
                         window.location.pathname === '/signin' ||
                         window.location.pathname === '/register';

      // Check if this is a polling request (notifications, chats, patient-doctor-chat)
      const isPollingRequest = error.config.url.includes('/api/notifications') ||
                              error.config.url.includes('/api/chats') ||
                              error.config.url.includes('/api/patient-doctor-chat') ||
                              error.config.url.includes('/refresh-token');

      // Check if this is a patient chat page
      const isPatientChatPage = window.location.pathname.includes('/patient/chat') ||
                               window.location.pathname.includes('/patient-chat');

      // Only clear tokens and redirect if:
      // 1. We're not already on a login page
      // 2. This is not a polling request (to avoid constant redirects)
      // 3. We're not on a patient chat page
      if (!isLoginPage && !isPollingRequest && !isPatientChatPage) {
        console.log('Auth error on non-polling request, clearing tokens and redirecting to login');

        // Clear all auth data using our local function
        clearTokensFromStorage();

        // Remove auth header from axios defaults
        delete axios.defaults.headers.common['Authorization'];

        // Set a flag to indicate auth error
        localStorage.setItem('auth_error', 'true');
        localStorage.setItem('auth_error_time', Date.now().toString());

        // Redirect to login page with a small delay to allow for any pending operations
        setTimeout(() => {
          window.location.href = '/login?expired=true';
        }, 100);
      } else if (isPollingRequest || isPatientChatPage) {
        console.log('Auth error on polling request or patient chat page, not redirecting');

        // Check if we've already had an auth error recently
        const lastAuthError = localStorage.getItem('auth_error_time');
        const now = Date.now();

        // If it's been more than 5 minutes since the last auth error, try to refresh the token
        if (!lastAuthError || (now - parseInt(lastAuthError)) > 5 * 60 * 1000) {
          console.log('Attempting to refresh token after polling auth error');

          // Try to get a fresh token
          const freshToken = getTokenFromStorage();

          if (freshToken) {
            console.log('Found token after auth error, updating axios headers');
            axios.defaults.headers.common['Authorization'] = `Bearer ${freshToken}`;
          } else {
            console.warn('No valid token found after auth error');
          }
        }
      } else {
        console.log('Already on login page, not redirecting');
      }
    }

    return Promise.reject(error);
  }
);

// Set up request blocker to prevent problematic API calls
setupRequestBlocker(axios);

// Set up mock API interceptor to handle failed requests
setupMockInterceptor(axios);

// Add a flag to indicate if we're using mock data
axios.isMockEnabled = true;

export default axios;
