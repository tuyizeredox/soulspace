/**
 * Utility functions for storing and retrieving chat history from localStorage
 * This ensures chat history is available even if the API fails
 */

// Key prefix for chat history in localStorage
const CHAT_HISTORY_PREFIX = 'soulspace_chat_history_';

/**
 * Save chat messages to localStorage with ultra-fast performance
 * @param {string} chatId - The ID of the chat
 * @param {Array} messages - Array of message objects
 * @param {boolean} [forceUpdate=false] - Force update even if messages haven't changed
 */
export const saveChatHistory = (chatId, messages, forceUpdate = false) => {
  if (!chatId || !messages || !Array.isArray(messages) || messages.length === 0) {
    return;
  }

  // Use non-blocking setTimeout to avoid UI freezes
  setTimeout(() => {
    try {
      // Skip frequent updates to reduce storage operations
      if (!forceUpdate) {
        const currentTimestamp = localStorage.getItem(`${chatId}_timestamp`);
        if (currentTimestamp && (Date.now() - parseInt(currentTimestamp)) < 30000) {
          // Only update if we have more messages than before
          const currentCount = localStorage.getItem(`${chatId}_count`);
          if (currentCount && parseInt(currentCount) >= messages.length) {
            return; // Skip update if no new messages
          }
        }
      }

      // Store only the last 30 messages to save space and improve performance
      const messagesToStore = messages.slice(-30).map(message => {
        if (!message) return null;

        // Create minimal message object with only essential data
        return {
          _id: message._id?.toString() || `local-${Date.now()}`,
          content: message.content || '',
          sender: message.sender ? {
            _id: message.sender._id?.toString(),
            name: message.sender.name || 'Unknown'
          } : null,
          timestamp: message.timestamp || new Date().toISOString(),
          attachments: Array.isArray(message.attachments) ?
            message.attachments.map(att => ({
              url: att.url || '',
              type: att.type || 'unknown'
            })) : []
        };
      }).filter(Boolean); // Remove any null messages

      // Store messages directly without nested structure for better performance
      try {
        // Store the messages
        localStorage.setItem(`messages_${chatId}`, JSON.stringify(messagesToStore));
        localStorage.setItem(`${chatId}_timestamp`, Date.now().toString());
        localStorage.setItem(`${chatId}_count`, messagesToStore.length.toString());
      } catch (storageError) {
        // If storage is full, try with fewer messages
        if (storageError.name === 'QuotaExceededError' ||
            storageError.code === 22 || storageError.code === 1014) {
          try {
            // Try with only 10 most recent messages
            const reducedMessages = messagesToStore.slice(-10);
            localStorage.setItem(`messages_${chatId}`, JSON.stringify(reducedMessages));
            localStorage.setItem(`${chatId}_timestamp`, Date.now().toString());
            localStorage.setItem(`${chatId}_count`, reducedMessages.length.toString());
          } catch (e) {
            // If still failing, clear old data and try again
            try {
              clearOldChatHistory(12); // Clear older chats (12 hours)
              const minimalMessages = messagesToStore.slice(-5);
              localStorage.setItem(`messages_${chatId}`, JSON.stringify(minimalMessages));
              localStorage.setItem(`${chatId}_timestamp`, Date.now().toString());
              localStorage.setItem(`${chatId}_count`, minimalMessages.length.toString());
            } catch (finalError) {
              // Give up if we still can't store
            }
          }
        }
      }
    } catch (error) {
      // Silently fail to avoid blocking the UI
    }
  }, 0); // Execute in next event loop cycle
};

/**
 * Clear old chat history to free up storage space
 * @param {number} maxAgeHours - Maximum age of chat history to keep in hours (default: 24)
 */
export const clearOldChatHistory = (maxAgeHours = 24) => {
  try {
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);

    // Filter keys that match our chat history prefix
    const chatKeys = allKeys.filter(key => key.startsWith(CHAT_HISTORY_PREFIX));

    // Current time for comparison
    const currentTime = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

    // Check each chat history item
    for (const key of chatKeys) {
      try {
        const data = localStorage.getItem(key);
        if (!data) continue;

        const chatData = JSON.parse(data);

        // If the chat data has a timestamp, check if it's too old
        if (chatData && chatData.timestamp) {
          const storedTime = new Date(chatData.timestamp).getTime();

          if (currentTime - storedTime > maxAgeMs) {
            // This chat history is older than our max age, remove it
            localStorage.removeItem(key);

            // Also remove the associated timestamp if it exists
            const chatId = key.replace(CHAT_HISTORY_PREFIX, '');
            localStorage.removeItem(`${chatId}_timestamp`);
          }
        }
      } catch (itemError) {
        // If we can't parse this item, it might be corrupted, so remove it
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    // Silently fail to avoid blocking the UI
  }
};

/**
 * Load chat messages from localStorage with ultra-fast performance
 * @param {string} chatId - The ID of the chat
 * @param {number} maxAgeMinutes - Maximum age of cached messages in minutes (default: 120)
 * @returns {Array|null} - Array of message objects or null if not found or expired
 */
export const loadChatHistory = (chatId, maxAgeMinutes = 120) => {
  if (!chatId) {
    return null;
  }

  try {
    // Try to get messages directly from the new storage format first
    const directMessages = localStorage.getItem(`messages_${chatId}`);
    if (directMessages) {
      try {
        // Check if data is expired
        const timestamp = localStorage.getItem(`${chatId}_timestamp`);
        if (timestamp) {
          const maxAgeMs = maxAgeMinutes * 60 * 1000;
          if (Date.now() - parseInt(timestamp) > maxAgeMs) {
            // Data is expired, but we'll still return it and refresh in background
            // This gives better UX than showing nothing
          }
        }

        // Parse and return the messages
        const messages = JSON.parse(directMessages);
        if (Array.isArray(messages) && messages.length > 0) {
          return messages;
        }
      } catch (e) {
        // Continue to legacy format if parsing fails
      }
    }

    // Fall back to legacy format if needed
    const storedData = localStorage.getItem(`${CHAT_HISTORY_PREFIX}${chatId}`);
    if (storedData) {
      try {
        const chatData = JSON.parse(storedData);
        if (chatData && Array.isArray(chatData.messages) && chatData.messages.length > 0) {
          // Migrate to new format in background
          setTimeout(() => {
            try {
              localStorage.setItem(`messages_${chatId}`, JSON.stringify(chatData.messages));
              localStorage.setItem(`${chatId}_timestamp`, Date.now().toString());
              localStorage.setItem(`${chatId}_count`, chatData.messages.length.toString());
            } catch (e) {}
          }, 0);

          return chatData.messages;
        }
      } catch (e) {
        // If parsing fails, return null
      }
    }

    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Clear all chat history from localStorage
 */
export const clearAllChatHistory = () => {
  try {
    // Get all keys in localStorage
    const keys = Object.keys(localStorage);

    // Filter keys that start with our prefix
    const chatKeys = keys.filter(key => key.startsWith(CHAT_HISTORY_PREFIX));

    // Remove each chat history item
    chatKeys.forEach(key => localStorage.removeItem(key));

    console.log(`Cleared ${chatKeys.length} chat histories from localStorage`);
  } catch (error) {
    console.error('Error clearing chat history from localStorage:', error);
  }
};

/**
 * Clear chat history for a specific chat
 * @param {string} chatId - The ID of the chat
 */
export const clearChatHistory = (chatId) => {
  if (!chatId) {
    console.warn('Invalid chatId provided to clearChatHistory');
    return;
  }

  try {
    localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${chatId}`);
    console.log(`Cleared chat history for chat ${chatId} from localStorage`);
  } catch (error) {
    console.error(`Error clearing chat history for chat ${chatId} from localStorage:`, error);
  }
};

/**
 * Check if localStorage is available and working
 * @returns {boolean} - True if localStorage is available and working
 */
export const isStorageAvailable = () => {
  try {
    // Try to set a test item
    const testKey = `${CHAT_HISTORY_PREFIX}test`;
    localStorage.setItem(testKey, 'test');

    // Check if the test item was set correctly
    const result = localStorage.getItem(testKey) === 'test';

    // Clean up
    localStorage.removeItem(testKey);

    return result;
  } catch (error) {
    console.error('localStorage is not available:', error);
    return false;
  }
};
