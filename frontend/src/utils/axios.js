import axios from 'axios';

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

axios.defaults.headers.post['Content-Type'] = 'application/json';

// Add a request interceptor to include the token in all requests
axios.interceptors.request.use(
  (config) => {
    // Log request details for debugging
    console.log(`Request: ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });

    // Try to get token from both auth systems
    // First check userToken (new system)
    let token = localStorage.getItem('userToken');

    // If not found, fall back to token (old system)
    if (!token) {
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Using token for request:', config.url);
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
      
      // Implement automatic retry for GET requests on network errors
      if (error.config && error.config.method === 'get' && !error.config._retry) {
        error.config._retry = true;
        
        // Wait a bit before retrying
        return new Promise(resolve => {
          setTimeout(() => {
            console.log('Retrying request after network error:', error.config.url);
            resolve(axios(error.config));
          }, 2000);
        });
      }
      
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

    // Only handle 401 errors from actual server responses
    if (error.response && error.response.status === 401) {
      // If we get a 401 Unauthorized response, clear both token systems
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');

      console.log('Authentication error detected, cleared all tokens');

      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
