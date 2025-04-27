import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axiosConfig';
import { toast } from 'react-toastify';

// Login user
export const loginUser = createAsyncThunk(
  'userAuth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', credentials.email);

      // Validate credentials
      if (!credentials.email || !credentials.password) {
        return rejectWithValue({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Make API request
      console.log('Making login request to:', '/api/user/login');
      const response = await axios.post('/api/user/login', credentials);

      // Validate response
      if (!response.data || !response.data.token || !response.data.user) {
        console.error('Invalid response format:', response.data);
        return rejectWithValue({
          success: false,
          message: 'Invalid server response'
        });
      }

      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // Store token and user in localStorage
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      console.log('Login successful, user role:', response.data.user.role);

      return {
        user: response.data.user,
        token: response.data.token,
        redirectUrl: response.data.redirectUrl ||
          (response.data.user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard')
      };
    } catch (error) {
      console.error('Login error:', error);

      // Handle different error types
      if (error.response) {
        // Server responded with error
        console.error('Server error response:', error.response.data);
        return rejectWithValue({
          success: false,
          message: error.response.data.message || `Error: ${error.response.status}`,
          status: error.response.status
        });
      } else if (error.request) {
        // No response received
        console.error('No response received:', error.request);
        return rejectWithValue({
          success: false,
          message: 'No response from server. Please check your internet connection.',
          status: 0
        });
      } else {
        // Request setup error
        console.error('Request error:', error.message);
        return rejectWithValue({
          success: false,
          message: `Request error: ${error.message}`,
          status: 500
        });
      }
    }
  }
);

// Register user
export const registerUser = createAsyncThunk(
  'userAuth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('Attempting to register user:', userData.email);

      // Make API request
      const response = await axios.post('/api/user/register', userData);

      // Validate response
      if (!response.data || !response.data.success) {
        console.error('Invalid response format:', response.data);
        return rejectWithValue({
          success: false,
          message: 'Invalid server response'
        });
      }

      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

      // Store token and user in localStorage
      localStorage.setItem('userToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      console.log('Registration successful, user role:', response.data.user.role);

      return {
        user: response.data.user,
        token: response.data.token,
        redirectUrl: response.data.redirectUrl || '/dashboard'
      };
    } catch (error) {
      console.error('Registration error:', error);

      if (error.response) {
        return rejectWithValue({
          success: false,
          message: error.response.data.message || `Error: ${error.response.status}`,
          status: error.response.status
        });
      } else if (error.request) {
        return rejectWithValue({
          success: false,
          message: 'No response from server. Please check your internet connection.',
          status: 0
        });
      } else {
        return rejectWithValue({
          success: false,
          message: `Request error: ${error.message}`,
          status: 500
        });
      }
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  'userAuth/getCurrentUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get token from state or localStorage
      const state = getState();
      let token = state.userAuth.token;

      // If no token in state, try localStorage
      if (!token) {
        token = localStorage.getItem('userToken');
      }

      if (!token) {
        console.log('No token found in state or localStorage');
        return rejectWithValue({
          success: false,
          message: 'No token found'
        });
      }

      // Set token in headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Get current user data
      console.log('Fetching current user data');
      const response = await axios.get('/api/user/me');

      if (!response.data || !response.data.user) {
        console.error('Invalid user data received:', response.data);
        return rejectWithValue({
          success: false,
          message: 'Invalid user data received'
        });
      }

      // Store updated user data
      localStorage.setItem('userData', JSON.stringify(response.data.user));

      console.log('User data fetched successfully:', response.data.user.name);

      return {
        user: response.data.user,
        token
      };
    } catch (error) {
      console.error('Get current user error:', error);

      // Only clear auth data for specific error cases
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('Authentication error, clearing tokens');
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        delete axios.defaults.headers.common['Authorization'];
      } else {
        console.log('Network or server error, keeping tokens');
        // For network errors, don't clear the token - it might be a temporary issue
      }

      return rejectWithValue({
        success: false,
        message: error.response?.data?.message || 'Authentication failed',
        status: error.response?.status
      });
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  'userAuth/logout',
  async () => {
    // Remove auth data from localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');

    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];

    return null;
  }
);

// Create the slice
const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState: {
    user: JSON.parse(localStorage.getItem('userData')) || null,
    token: localStorage.getItem('userToken') || null,
    isAuthenticated: !!localStorage.getItem('userToken'),
    loading: false,
    authCheckLoading: false,
    error: null,
    errorDetails: null,
    success: null,
    lastAuthCheck: 0
  },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
      state.errorDetails = null;
    },
    clearAuthSuccess: (state) => {
      state.success = null;
    },
    setAuthState: (state, action) => {
      // This reducer allows manually setting the auth state
      // Useful for persisting auth state across page refreshes
      if (action.payload.isAuthenticated !== undefined) {
        state.isAuthenticated = action.payload.isAuthenticated;
      }
      if (action.payload.user !== undefined) {
        state.user = action.payload.user;
      }
      if (action.payload.token !== undefined) {
        state.token = action.payload.token;
      }
      // Update the lastAuthCheck timestamp
      state.lastAuthCheck = Date.now();
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.success = 'Login successful';

        console.log('Login successful - User authenticated:', action.payload.user.name);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;

        if (action.payload) {
          state.error = action.payload.message;
          state.errorDetails = {
            status: action.payload.status,
            message: action.payload.message
          };
        } else {
          state.error = action.error.message;
          state.errorDetails = {
            message: action.error.message
          };
        }

        console.error('Login rejected:', state.error);
      })

      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.success = 'Registration successful';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;

        if (action.payload) {
          state.error = action.payload.message;
          state.errorDetails = {
            status: action.payload.status,
            message: action.payload.message
          };
        } else {
          state.error = action.error.message;
          state.errorDetails = {
            message: action.error.message
          };
        }
      })

      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        // Don't set the main loading state to true to avoid UI blocking
        // Instead, use a separate loading state for auth checks
        state.authCheckLoading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.authCheckLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        state.lastAuthCheck = Date.now();
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.authCheckLoading = false;

        // Only clear auth state for specific error cases
        if (action.payload?.status === 401 || action.payload?.status === 403) {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        } else {
          // For network errors, keep the current auth state
          console.log('Keeping current auth state due to non-auth error');
        }

        state.lastAuthCheck = Date.now();
      })

      // Logout case
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.errorDetails = null;
        state.success = 'Logged out successfully';

        toast.info('Logged out successfully');
      });
  }
});

export const { clearAuthError, clearAuthSuccess, setAuthState } = userAuthSlice.actions;
export default userAuthSlice.reducer;
