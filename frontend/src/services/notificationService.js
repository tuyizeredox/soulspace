import axios from '../utils/axiosConfig';
import store from '../store';

// Helper function to get the auth token from Redux store
const getAuthToken = () => {
  const state = store.getState();
  // Try to get token from both auth systems, preferring the new one
  const newToken = state.userAuth?.token;
  const oldToken = state.auth?.token;
  return newToken || oldToken;
};

// Fetch user notifications with optional filters
export const fetchNotifications = async (params = {}) => {
  try {
    const { page, limit, read, type } = params;
    let url = '/api/notifications';

    // Add query parameters if provided
    const queryParams = [];
    if (page) queryParams.push(`page=${page}`);
    if (limit) queryParams.push(`limit=${limit}`);
    if (read !== undefined) queryParams.push(`read=${read}`);
    if (type) queryParams.push(`type=${type}`);

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    // Get the token from Redux store
    const token = getAuthToken();
    console.log('NotificationService: Fetching notifications with token:', !!token);

    // Create config with auth header if token exists
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get(url, config);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    // Get the token from Redux store
    const token = getAuthToken();

    // Create config with auth header if token exists
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get('/api/notifications/unread-count', config);
    return response.data.count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Mark a notification as read
export const markAsRead = async (notificationId) => {
  try {
    // Get the token from Redux store
    const token = getAuthToken();

    // Create config with auth header if token exists
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.put(`/api/notifications/${notificationId}/read`, {}, config);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    // Get the token from Redux store
    const token = getAuthToken();

    // Create config with auth header if token exists
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.put('/api/notifications/mark-all-read', {}, config);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    // Get the token from Redux store
    const token = getAuthToken();

    // Create config with auth header if token exists
    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.delete(`/api/notifications/${notificationId}`, config);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Play notification sound
export const playNotificationSound = () => {
  const audio = new Audio('/sounds/notification.mp3');
  audio.play().catch(error => {
    console.error('Error playing notification sound:', error);
  });
};

// Show browser notification
export const showBrowserNotification = (title, options = {}) => {
  // Check if browser notifications are supported
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return;
  }

  // Check if permission is already granted
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  }
  // Otherwise, ask for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
};
