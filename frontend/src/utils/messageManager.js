/**
 * Message Manager Utility
 *
 * Provides utilities for managing chat messages, including:
 * - Marking messages as read
 * - Optimizing message loading
 * - Handling message caching
 */

import axios from './axiosConfig';
import { makeRequest } from './requestManager';

// Store pending mark-as-read operations to prevent duplicates
const pendingMarkAsReadOps = new Map();

/**
 * Mark messages in a chat as seen with optimized performance
 * @param {string} chatId - The ID of the chat
 * @param {string} userId - The ID of the current user
 * @returns {Promise<boolean>} - Whether the operation was successful
 */
export const markMessagesAsSeen = async (chatId, userId) => {
  if (!chatId || !userId) {
    console.error('Cannot mark messages as seen: Missing chatId or userId');
    return false;
  }

  // Skip for mock chat IDs
  if (chatId.startsWith('mock') || chatId.includes('mock-chat')) {
    console.log(`Skipping mark as read for mock chat: ${chatId}`);
    return true;
  }

  // Generate a unique key for this operation
  const opKey = `${chatId}:${userId}`;

  // Check if we already have a pending operation for this chat and user
  if (pendingMarkAsReadOps.has(opKey)) {
    console.log(`Already marking messages as seen for chat ${chatId}`);
    return pendingMarkAsReadOps.get(opKey);
  }

  // Create a promise for this operation
  const markAsReadPromise = new Promise(async (resolve) => {
    try {
      console.log(`Marking messages as read for chat ${chatId} by user ${userId}`);

      // Make the request with a short timeout
      const result = await makeRequest({
        url: `/api/chats/${chatId}/read`, // Use the correct endpoint
        method: 'PUT',
        useCache: false, // Don't cache this operation
        cacheExpiration: 0
      });

      console.log(`Successfully marked messages as read for chat ${chatId}`);

      // Remove from pending operations
      pendingMarkAsReadOps.delete(opKey);

      resolve(true);
    } catch (error) {
      console.error(`Error marking messages as read for chat ${chatId}:`, error);

      // If it's a connection error, we'll retry once when connection is restored
      if (error.code === 'ECONNABORTED' || !navigator.onLine) {
        console.log('Will retry marking as read when connection is restored');

        // Store the pending operation for later retry
        const pendingOp = { chatId, userId, timestamp: new Date().toISOString() };
        const pendingOps = JSON.parse(localStorage.getItem('pendingReadOps') || '[]');
        pendingOps.push(pendingOp);
        localStorage.setItem('pendingReadOps', JSON.stringify(pendingOps));
      }

      // Remove from pending operations
      pendingMarkAsReadOps.delete(opKey);

      resolve(false);
    }
  });

  // Store the promise
  pendingMarkAsReadOps.set(opKey, markAsReadPromise);

  return markAsReadPromise;
};

/**
 * Retry pending mark-as-read operations
 * @returns {Promise<void>}
 */
export const retryPendingMarkAsReadOps = async () => {
  try {
    // Get pending operations from localStorage
    const pendingOps = JSON.parse(localStorage.getItem('pendingReadOps') || '[]');

    if (pendingOps.length === 0) {
      return;
    }

    console.log(`Retrying ${pendingOps.length} pending mark-as-read operations`);

    // Process each operation
    const newPendingOps = [];

    for (const op of pendingOps) {
      try {
        // Skip if missing required data
        if (!op.chatId || !op.userId) {
          continue;
        }

        // Skip if operation is too old (more than 24 hours)
        const opTime = new Date(op.timestamp).getTime();
        const now = Date.now();
        if (now - opTime > 24 * 60 * 60 * 1000) {
          continue;
        }

        // Try to mark as read
        const success = await markMessagesAsSeen(op.chatId, op.userId);

        // If failed, keep in the list
        if (!success) {
          newPendingOps.push(op);
        }
      } catch (error) {
        console.error('Error retrying mark-as-read operation:', error);
        newPendingOps.push(op);
      }
    }

    // Update localStorage with remaining operations
    localStorage.setItem('pendingReadOps', JSON.stringify(newPendingOps));

    console.log(`${pendingOps.length - newPendingOps.length} operations completed, ${newPendingOps.length} still pending`);
  } catch (error) {
    console.error('Error retrying pending mark-as-read operations:', error);
  }
};

export default {
  markMessagesAsSeen,
  retryPendingMarkAsReadOps
};
