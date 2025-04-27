import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            console.log('Attempting login with:', credentials.email);

            // Validate credentials before sending to server
            if (!credentials.email || !credentials.password) {
                return rejectWithValue({
                    message: 'Email and password are required'
                });
            }

            // Try the new signin endpoint first
            try {
                console.log('Making login request to:', axios.defaults.baseURL + '/api/auth/signin');
                const response = await axios.post('/api/auth/signin', credentials);

                // Check if response contains the expected data
                if (!response.data || !response.data.token || !response.data.user) {
                    console.error('Invalid response format from signin endpoint:', response.data);
                    throw new Error('Invalid response format');
                }

                // Process successful response
                console.log('Login successful with /signin endpoint');

                // Set the token in axios headers for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                // Store token and user data in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                console.log('Login successful, user role:', response.data.user.role);

                return {
                    user: response.data.user,
                    token: response.data.token,
                    redirectUrl: response.data.redirectUrl || (response.data.user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard')
                };
            } catch (signinError) {
                console.log('Signin endpoint failed, trying login endpoint instead:', signinError);

                // If signin fails, try the original login endpoint
                console.log('Making login request to:', axios.defaults.baseURL + '/api/auth/login');
                const response = await axios.post('/api/auth/login', credentials);

                // Check if response contains the expected data
                if (!response.data || !response.data.token || !response.data.user) {
                    console.error('Invalid response format from login endpoint:', response.data);
                    return rejectWithValue({
                        message: 'Invalid server response. Please try again.'
                    });
                }

                // Set the token in axios headers for future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

                // Store token and user data in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                console.log('Login successful, user role:', response.data.user.role);

                return {
                    user: response.data.user,
                    token: response.data.token,
                    redirectUrl: response.data.redirectUrl || (response.data.user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard')
                };
            }
        } catch (error) {
            console.error('Login error:', error);

            // Handle different error formats
            if (error.response) {
                console.error('Server response error:', error.response.data);

                // Include the status code in the rejected value for better error handling
                const errorData = {
                    ...error.response.data,
                    status: error.response.status,
                    message: error.response.data.message || `Server error: ${error.response.status}`
                };

                // Log detailed error information for debugging
                console.error('Login error details:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    url: error.response.config.url
                });

                return rejectWithValue(errorData);
            } else if (error.request) {
                console.error('No response received:', error.request);
                return rejectWithValue({
                    message: 'No response from server. Please check your internet connection.',
                    status: 0
                });
            } else {
                console.error('Request error:', error.message);
                return rejectWithValue({
                    message: `Request error: ${error.message}`,
                    status: 500
                });
            }
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Remove all auth data from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // Remove auth header from axios
  delete axios.defaults.headers.common['Authorization'];

  return null;
});

// Add a function to check and refresh the token
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Checking auth status, token exists:', !!token);

      if (!token) {
        console.log('No token found in localStorage');
        return rejectWithValue('No token found');
      }

      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Get current user data
      console.log('Fetching current user data');
      const response = await axios.get('/api/auth/me');
      console.log('User data retrieved successfully:', response.data.user.role);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        user: response.data.user,
        token: token
      };
    } catch (error) {
      console.error('Auth check failed:', error.response?.data || error.message);
      // If token is invalid or expired, remove all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Also remove from axios headers
      delete axios.defaults.headers.common['Authorization'];
      return rejectWithValue(error.response?.data || { message: 'Authentication failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    errorDetails: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.errorDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;

        // Log successful login
        console.log('Login successful - User authenticated:', action.payload.user.name);

        // Don't show toast here as we're showing a success message in the Login component
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;

        // Handle different error formats with enhanced error details
        if (action.payload?.message) {
          state.error = action.payload.message;
          // Store additional error information for component-level handling
          state.errorDetails = {
            status: action.payload.status,
            message: action.payload.message,
            errors: action.payload.errors
          };
        } else if (action.payload?.errors && action.payload.errors.length > 0) {
          state.error = action.payload.errors[0].msg || 'Login failed';
          state.errorDetails = {
            status: action.payload.status,
            errors: action.payload.errors
          };
        } else if (action.error?.message) {
          state.error = action.error.message;
          state.errorDetails = {
            message: action.error.message
          };
        } else {
          state.error = 'Login failed. Please check your credentials and try again.';
          state.errorDetails = {
            message: 'Unknown error'
          };
        }

        console.error('Login rejected:', state.error, 'Details:', state.errorDetails);
        // Don't show toast here as we're showing an error message in the Login component
      })

      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        toast.info('Logged out successfully');
      })

      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
