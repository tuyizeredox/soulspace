import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  playNotificationSound,
  showBrowserNotification
} from '../../services/notificationService';

// Async thunks
export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchUserNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await fetchNotifications(params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notifications' });
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      return await getUnreadCount();
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch unread count' });
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await markAsRead(notificationId);
      return { id: notificationId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark notification as read' });
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      return await markAllAsRead();
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to mark all notifications as read' });
    }
  }
);

export const removeNotification = createAsyncThunk(
  'notifications/removeNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await deleteNotification(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete notification' });
    }
  }
);

// Initial state
const initialState = {
  notifications: [],
  totalPages: 0,
  currentPage: 1,
  totalNotifications: 0,
  unreadCount: 0,
  loading: false,
  error: null,
  notificationSettings: {
    sound: true,
    browser: true,
    email: true
  }
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotificationState: (state) => {
      state.error = null;
      state.loading = false;
    },
    updateNotificationSettings: (state, action) => {
      state.notificationSettings = {
        ...state.notificationSettings,
        ...action.payload
      };
    },
    receiveNewNotification: (state, action) => {
      // Add new notification to the beginning of the list
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
      state.totalNotifications += 1;
      
      // Play sound if enabled
      if (state.notificationSettings.sound) {
        playNotificationSound();
      }
      
      // Show browser notification if enabled
      if (state.notificationSettings.browser) {
        showBrowserNotification(
          action.payload.title, 
          { 
            body: action.payload.message,
            icon: '/logo192.png'
          }
        );
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalNotifications = action.payload.totalNotifications;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch notifications';
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload.id);
        if (index !== -1) {
          state.notifications[index].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })
      
      // Remove notification
      .addCase(removeNotification.fulfilled, (state, action) => {
        const index = state.notifications.findIndex(n => n._id === action.payload);
        if (index !== -1) {
          const wasUnread = !state.notifications[index].read;
          state.notifications.splice(index, 1);
          state.totalNotifications -= 1;
          if (wasUnread) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });
  }
});

export const { 
  resetNotificationState, 
  updateNotificationSettings,
  receiveNewNotification
} = notificationSlice.actions;

export default notificationSlice.reducer;
