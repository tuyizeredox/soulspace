import axios from 'axios';
import { getBestToken, clearAuthData } from './authUtils';

// Configure axios defaults
// When running in development with the proxy setting in package.json,
// we don't need to set the baseURL as requests will be proxied automatically
// Only set baseURL in production or if explicitly provided in .env
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction || process.env.REACT_APP_API_URL) {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  console.log('Axios baseURL set to:', axios.defaults.baseURL);
} else {
  console.log('Using proxy configuration for API requests');
}

// Set default headers
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Set auth header from localStorage if available
const token = getBestToken();
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('Initial auth token set from localStorage');
}

// Add a request interceptor to include the token in all requests
axios.interceptors.request.use(
  (config) => {
    // Log request details for debugging
    console.log(`Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });

    // Check if Authorization header is already set
    if (config.headers.Authorization) {
      console.log('Authorization header already set:', config.headers.Authorization.substring(0, 20) + '...');
      return config;
    }

    // Get the best available token using our utility function
    const token = getBestToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added token to request:', config.url);
    } else {
      console.warn('No token found for request:', config.url);
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

      // Only clear tokens and redirect if we're not already on a login page
      if (!isLoginPage) {
        console.log('Clearing auth tokens and redirecting to login');

        // Clear all auth data using our utility function
        clearAuthData();

        // Remove auth header from axios defaults
        delete axios.defaults.headers.common['Authorization'];

        // Redirect to login page with a small delay to allow for any pending operations
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      } else {
        console.log('Already on login page, not redirecting');
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
