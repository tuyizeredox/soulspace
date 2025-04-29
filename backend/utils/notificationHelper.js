const mongoose = require('mongoose');
const Notification = require('../models/Notification');

/**
 * Create a notification for a specific user
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - User ID to send notification to
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Notification type (info, warning, error, success)
 * @param {string} notificationData.priority - Notification priority (low, medium, high)
 * @param {string} notificationData.actionLink - Link to navigate to when notification is clicked
 * @param {Object} notificationData.metadata - Additional metadata for the notification
 * @returns {Promise<Object>} Created notification
 */
const createNotificationForUser = async (notificationData) => {
  try {
    const { userId, title, message, type = 'info', priority = 'medium', actionLink, metadata } = notificationData;
    
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    
    if (!title || !message) {
      throw new Error('Title and message are required');
    }
    
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      priority,
      actionLink,
      metadata,
      read: false,
      createdAt: new Date()
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create a notification for multiple users
 * @param {Object} notificationData - Notification data
 * @param {Array<string>} notificationData.userIds - User IDs to send notification to
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message
 * @param {string} notificationData.type - Notification type (info, warning, error, success)
 * @param {string} notificationData.priority - Notification priority (low, medium, high)
 * @param {string} notificationData.actionLink - Link to navigate to when notification is clicked
 * @param {Object} notificationData.metadata - Additional metadata for the notification
 * @returns {Promise<Array<Object>>} Created notifications
 */
const createNotificationForUsers = async (notificationData) => {
  try {
    const { userIds, title, message, type = 'info', priority = 'medium', actionLink, metadata } = notificationData;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new Error('User IDs must be a non-empty array');
    }
    
    if (!title || !message) {
      throw new Error('Title and message are required');
    }
    
    const notifications = userIds.map(userId => ({
      user: userId,
      title,
      message,
      type,
      priority,
      actionLink,
      metadata,
      read: false,
      createdAt: new Date()
    }));
    
    const createdNotifications = await Notification.insertMany(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Error creating notifications:', error);
    throw error;
  }
};

module.exports = {
  createNotificationForUser,
  createNotificationForUsers
};
