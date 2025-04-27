import React, { useState, useRef, useEffect } from 'react';
import axios from '../../utils/axios'; // Use the configured axios instance
import {
  Avatar,
  Box,
  IconButton,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress
} from '@mui/material';
import { PhotoCamera, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import { getAvatarUrl, getInitials } from '../../utils/avatarUtils';

/**
 * Standalone component for avatar upload functionality
 * Uses direct axios calls instead of Redux to ensure upload completes
 */
const AvatarUpload = ({ user, size = 120, onUploadSuccess }) => {
  const theme = useTheme();
  const fileInputRef = useRef(null);

  // Local state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({
    success: false,
    error: false,
    message: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Create a hidden file input element and listen for avatar updates
  useEffect(() => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/gif,image/webp';
    input.style.display = 'none';
    input.addEventListener('change', handleFileSelect);

    // Store the reference
    fileInputRef.current = input;

    // Listen for avatar updates from other components
    const handleAvatarUpdated = (event) => {
      console.log('AvatarUpload: Received avatar-updated event:', event.detail);
      if (event.detail && event.detail.avatarUrl) {
        // Force a refresh of the avatar with the new URL
        const timestamp = new Date().getTime();
        const urlWithTimestamp = event.detail.avatarUrl.includes('?')
          ? `${event.detail.avatarUrl}&t=${timestamp}`
          : `${event.detail.avatarUrl}?t=${timestamp}`;

        setPreview(urlWithTimestamp);
      }
    };

    // Add event listener
    window.addEventListener('user-avatar-updated', handleAvatarUpdated);

    // Clean up on unmount
    return () => {
      input.removeEventListener('change', handleFileSelect);
      if (document.body.contains(input)) {
        document.body.removeChild(input);
      }
      window.removeEventListener('user-avatar-updated', handleAvatarUpdated);
    };
  }, []);

  // Handle file selection and upload
  const handleFileSelect = (event) => {
    // Get the file from the event
    const file = event.target.files[0];
    if (!file) {
      console.log('AvatarUpload: No file selected');
      return;
    }

    console.log('AvatarUpload: File selected:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    // Check if user is authenticated
    if (!user || !user.id) {
      console.error('AvatarUpload: User not authenticated');
      setSnackbar({
        open: true,
        message: 'You must be logged in to upload a profile picture',
        severity: 'error',
      });
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      console.warn('AvatarUpload: Invalid file type:', file.type);
      setSnackbar({
        open: true,
        message: 'Please upload a valid image file (JPEG, PNG, GIF, WEBP)',
        severity: 'error',
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.warn('AvatarUpload: File too large:', `${(file.size / 1024 / 1024).toFixed(2)} MB`);
      setSnackbar({
        open: true,
        message: 'File size should not exceed 5MB',
        severity: 'error',
      });
      return;
    }

    // Open the upload dialog
    setDialogOpen(true);
    setUploadProgress(0);
    setUploadStatus({
      success: false,
      error: false,
      message: ''
    });

    // Create a preview for immediate feedback
    const reader = new FileReader();
    reader.onload = (e) => {
      // Create a temporary preview URL
      const previewUrl = e.target.result;
      console.log('AvatarUpload: Created preview URL');

      // Set the preview for immediate visual feedback
      setPreview(previewUrl);

      // Create a unique filename with user ID and timestamp
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const uniqueFilename = `avatar_${user.id}_${Date.now()}.${fileExtension}`;

      // Create a new File object with the unique name
      const renamedFile = new File([file], uniqueFilename, { type: file.type });

      console.log('AvatarUpload: Renamed file:', {
        originalName: file.name,
        newName: uniqueFilename,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });

      // Create form data
      const formData = new FormData();
      formData.append('avatar', renamedFile);

      // Add user ID to ensure the backend knows which user this avatar belongs to
      formData.append('userId', user.id);

      // Upload avatar using direct axios call
      uploadAvatar(formData);
    };

    // Read the file to create the preview
    reader.readAsDataURL(file);
  };

  // Helper function to update the user avatar in localStorage
  const updateUserAvatarInLocalStorage = (avatarUrl) => {
    try {
      // Make sure the avatar URL is absolute if it's a relative path
      let fullAvatarUrl = avatarUrl;

      // Ensure the URL has a leading slash if it's a relative path
      if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
        fullAvatarUrl = `/${avatarUrl}`;
        console.log('AvatarUpload: Added leading slash to avatar URL:', fullAvatarUrl);
      }

      // For API server URLs, use the REACT_APP_API_URL from .env
      if (avatarUrl && avatarUrl.startsWith('/')) {
        const baseUrl = process.env.REACT_APP_API_URL || window.location.origin;
        fullAvatarUrl = `${baseUrl}${avatarUrl}`;
        console.log('AvatarUpload: Converted relative URL to absolute URL using API base:', fullAvatarUrl);
      }

      // Update in both auth systems

      // First try the new auth system (userData)
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        userData.avatar = avatarUrl; // Store the original URL format in localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('AvatarUpload: Updated avatar in userData localStorage:', avatarUrl);
      }

      // Then try the old auth system (user)
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.avatar = avatarUrl; // Store the original URL format in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        console.log('AvatarUpload: Updated avatar in user localStorage:', avatarUrl);
      }

      // Also update the current user object in memory
      if (user) {
        user.avatar = avatarUrl;
      }

      return fullAvatarUrl; // Return the full URL for display purposes
    } catch (error) {
      console.error('AvatarUpload: Error updating avatar in localStorage:', error);
      return avatarUrl;
    }
  };

  // Upload avatar using direct axios call
  const uploadAvatar = async (formData) => {
    setUploading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('userToken') || localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Configure the request
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      };

      // Try both possible API endpoints for avatar upload
      let response;
      let avatarUrl;

      try {
        console.log('AvatarUpload: Trying upload to /api/user/avatar');
        response = await axios.post('/api/user/avatar', formData, config);
        console.log('AvatarUpload: Upload successful to /api/user/avatar, response:', response.data);
      } catch (error) {
        console.log('AvatarUpload: Failed to upload to /api/user/avatar, trying fallback endpoint');

        // Try fallback endpoint
        response = await axios.post('/api/profile/avatar', formData, config);
        console.log('AvatarUpload: Upload successful to /api/profile/avatar, response:', response.data);
      }

      // Extract the avatar URL from the response
      avatarUrl = response.data.avatarUrl || response.data.user?.avatar || response.data.avatar;
      console.log('AvatarUpload: Avatar URL from response:', avatarUrl);

      // If no avatar URL in response, construct it based on the filename
      if (!avatarUrl && response.data.filename) {
        avatarUrl = `/uploads/avatars/${response.data.filename}`;
        console.log('AvatarUpload: Constructed avatar URL from filename:', avatarUrl);
      }

      // Ensure the avatar URL is properly formatted
      if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
        avatarUrl = `/${avatarUrl}`;
        console.log('AvatarUpload: Added leading slash to avatar URL:', avatarUrl);
      }

      let updatedAvatarUrl = avatarUrl;

      if (updatedAvatarUrl) {
        // Update the user object in localStorage with the new avatar URL
        updatedAvatarUrl = updateUserAvatarInLocalStorage(updatedAvatarUrl);

        // Dispatch a custom event to notify other components about the avatar update
        const event = new CustomEvent('user-avatar-updated', {
          detail: { avatarUrl: updatedAvatarUrl }
        });
        window.dispatchEvent(event);
        console.log('AvatarUpload: Dispatched user-avatar-updated event with URL:', updatedAvatarUrl);
      } else {
        console.warn('AvatarUpload: No avatar URL found in response');
      }

      // Set success status
      setUploadStatus({
        success: true,
        error: false,
        message: response.data.message || 'Profile picture updated successfully'
      });

      // Show success message
      setSnackbar({
        open: true,
        message: response.data.message || 'Profile picture updated successfully',
        severity: 'success',
      });

      // Call the success callback if provided
      if (onUploadSuccess && typeof onUploadSuccess === 'function') {
        onUploadSuccess({
          ...response.data,
          avatarUrl: updatedAvatarUrl
        });
      }

      // If we have a valid avatar URL, update the preview with the actual server URL
      // This ensures we're showing the processed image from the server
      if (updatedAvatarUrl) {
        // Add a timestamp to force a refresh of the image
        const timestamp = new Date().getTime();
        const urlWithTimestamp = updatedAvatarUrl.includes('?')
          ? `${updatedAvatarUrl}&t=${timestamp}`
          : `${updatedAvatarUrl}?t=${timestamp}`;

        console.log('AvatarUpload: Setting preview with timestamped URL:', urlWithTimestamp);
        setPreview(urlWithTimestamp);

        // Force a re-render of the avatar component
        setTimeout(() => {
          setPreview(urlWithTimestamp + '&refresh=1');
        }, 500);
      }

      // Refresh the page after a delay to show the new avatar
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('AvatarUpload: Upload error:', error);

      // Set error status
      setUploadStatus({
        success: false,
        error: true,
        message: error.response?.data?.message || error.message || 'Failed to upload profile picture'
      });

      // Show error message
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to upload profile picture',
        severity: 'error',
      });

      // Clear the preview on error
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  // Trigger file selection dialog
  const triggerFileInput = (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('AvatarUpload: Triggering file selection');

    if (fileInputRef.current) {
      // Reset the value to ensure change event fires even if same file is selected
      fileInputRef.current.value = '';

      // Ensure the input is in the DOM
      if (!document.body.contains(fileInputRef.current)) {
        document.body.appendChild(fileInputRef.current);
      }

      // Trigger click
      fileInputRef.current.click();
    } else {
      console.error('AvatarUpload: File input ref is null');
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    // Only allow closing if upload is complete or failed
    if (!uploading) {
      setDialogOpen(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        {/* Avatar with current image or preview */}
        <Avatar
          src={preview || (user?.avatar ? getAvatarUrl(user, true) : null)}
          alt={user?.name || 'User'}
          sx={{
            width: size,
            height: size,
            border: '4px solid white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            bgcolor: theme.palette.primary.main,
            fontSize: `${size / 3}px`,
            objectFit: 'cover'
          }}
          slotProps={{
            img: {
              onError: (e) => {
                console.error('AvatarUpload: Error loading avatar image:', e.target.src);
                // Hide the image and show initials instead
                e.target.style.display = 'none';
              }
            }
          }}
        >
          {getInitials(user?.name)}
        </Avatar>

        {/* Upload button */}
        <Tooltip title="Change profile picture" arrow placement="top">
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: theme.palette.primary.dark,
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease-in-out',
              zIndex: 2,
              width: 36,
              height: 36
            }}
            aria-label="upload picture"
            onClick={triggerFileInput}
            disabled={uploading}
            type="button"
          >
            {uploading ? <CircularProgress size={20} color="inherit" /> : <PhotoCamera fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Upload Progress Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={uploading}
      >
        <DialogTitle>
          {uploadStatus.success ? 'Upload Complete' :
           uploadStatus.error ? 'Upload Failed' :
           'Uploading Profile Picture'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            {/* Preview */}
            {preview && (
              <Avatar
                src={`${preview}${preview.includes('?') ? '&' : '?'}t=${Date.now()}`}
                alt="Preview"
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  mb: 2,
                  border: '4px solid white',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  bgcolor: theme.palette.primary.main,
                  fontSize: '3rem',
                }}
                slotProps={{
                  img: {
                    onError: (e) => {
                      console.error('AvatarUpload: Error loading preview image:', e.target.src);
                      // Hide the image and show initials instead
                      e.target.style.display = 'none';
                    }
                  }
                }}
              >
                {getInitials(user?.name)}
              </Avatar>
            )}

            {/* Status Icon */}
            {uploadStatus.success && (
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            )}
            {uploadStatus.error && (
              <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            )}

            {/* Status Message */}
            <Typography variant="body1" gutterBottom>
              {uploadStatus.message || (uploading ? 'Uploading your profile picture...' : 'Preparing to upload...')}
            </Typography>

            {/* Progress Bar */}
            {uploading && (
              <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                  {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            disabled={uploading}
            color={uploadStatus.error ? "error" : "primary"}
          >
            {uploadStatus.success ? 'Done' :
             uploadStatus.error ? 'Close' :
             'Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AvatarUpload;
