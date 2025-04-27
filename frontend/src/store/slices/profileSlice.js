import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios'; // Use the configured axios instance
import { toast } from 'react-toastify';
import store from '../index';

// Helper function to check if user is authenticated
const isAuthenticated = () => {
  const state = store.getState();
  return !!(state.userAuth?.isAuthenticated || state.auth?.isAuthenticated);
};

// Async thunk for updating user profile
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.error('ProfileSlice: User not authenticated for profile update');
        return rejectWithValue({ message: 'Authentication required. Please log in again.' });
      }

      console.log('ProfileSlice: Updating profile');

      // The axios instance from axiosConfig will automatically add the token
      const response = await axios.put('/api/profile', profileData);
      console.log('ProfileSlice: Profile update successful, response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ProfileSlice: Error updating profile:', error);

      // Provide more detailed error information
      if (error.response) {
        console.error('ProfileSlice: Server response error:', {
          status: error.response.status,
          data: error.response.data
        });
        return rejectWithValue(error.response.data || { message: `Server error: ${error.response.status}` });
      } else if (error.request) {
        console.error('ProfileSlice: No response received from server');
        return rejectWithValue({ message: 'No response from server. Please check your connection.' });
      } else {
        console.error('ProfileSlice: Request setup error:', error.message);
        return rejectWithValue({ message: `Request error: ${error.message}` });
      }
    }
  }
);

// Async thunk for uploading profile picture
export const uploadProfilePicture = createAsyncThunk(
  'profile/uploadProfilePicture',
  async (formData, { rejectWithValue }) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.error('ProfileSlice: User not authenticated for avatar upload');
        return rejectWithValue({ message: 'Authentication required. Please log in again.' });
      }

      console.log('ProfileSlice: Uploading profile picture');

      // Verify formData contains the avatar file
      if (!formData.get('avatar')) {
        console.error('ProfileSlice: No avatar file found in formData');
        return rejectWithValue({ message: 'No avatar file provided' });
      }

      // Log file details for debugging
      const avatarFile = formData.get('avatar');
      console.log('ProfileSlice: Avatar file details:', {
        name: avatarFile.name,
        type: avatarFile.type,
        size: `${(avatarFile.size / 1024).toFixed(2)} KB`
      });

      // The axios instance from axiosConfig will automatically add the token
      // We only need to specify the content type for multipart/form-data
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      console.log('ProfileSlice: Sending avatar upload request to /api/profile/avatar');
      const response = await axios.post('/api/profile/avatar', formData, config);

      console.log('ProfileSlice: Avatar upload successful, response:', response.data);
      return response.data;
    } catch (error) {
      console.error('ProfileSlice: Error uploading profile picture:', error);

      // Provide more detailed error information
      if (error.response) {
        console.error('ProfileSlice: Server response error:', {
          status: error.response.status,
          data: error.response.data
        });
        return rejectWithValue(error.response.data || { message: `Server error: ${error.response.status}` });
      } else if (error.request) {
        console.error('ProfileSlice: No response received from server');
        return rejectWithValue({ message: 'No response from server. Please check your connection.' });
      } else {
        console.error('ProfileSlice: Request setup error:', error.message);
        return rejectWithValue({ message: `Request error: ${error.message}` });
      }
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    loading: false,
    error: null,
    success: false,
    message: '',
  },
  reducers: {
    resetProfileState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Profile updated successfully';
        toast.success(state.message);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
        toast.error(state.error);
      })

      // Upload profile picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || 'Profile picture updated successfully';
        toast.success(state.message);
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to upload profile picture';
        toast.error(state.error);
      });
  },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
