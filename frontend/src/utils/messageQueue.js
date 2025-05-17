/**
 * Utility for managing a queue of failed messages that need to be resent
 * This ensures messages are not lost when the server is unavailable
 */

// Key for storing the message queue in localStorage
const MESSAGE_QUEUE_KEY = 'soulspace_message_queue';

/**
 * Add a failed message to the queue
 * @param {Object} message - The message object that failed to send
 * @param {string} chatId - The ID of the chat the message belongs to
 */
export const addToMessageQueue = (message, chatId) => {
  try {
    // Get existing queue or initialize a new one
    const queue = getMessageQueue();
    
    // Add the message to the queue with timestamp and chat ID
    queue.push({
      message,
      chatId,
      timestamp: new Date().toISOString(),
      attempts: 0
    });
    
    // Save the updated queue
    localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(queue));
    console.log(`Added message to queue. Queue size: ${queue.length}`);
    
    return queue.length;
  } catch (error) {
    console.error('Error adding message to queue:', error);
    return 0;
  }
};

/**
 * Get all messages in the queue
 * @returns {Array} - Array of queued message objects
 */
export const getMessageQueue = () => {
  try {
    const queueData = localStorage.getItem(MESSAGE_QUEUE_KEY);
    return queueData ? JSON.parse(queueData) : [];
  } catch (error) {
    console.error('Error getting message queue:', error);
    return [];
  }
};

/**
 * Remove a message from the queue
 * @param {number} index - The index of the message to remove
 */
export const removeFromMessageQueue = (index) => {
  try {
    const queue = getMessageQueue();
    
    if (index >= 0 && index < queue.length) {
      queue.splice(index, 1);
      localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(queue));
      console.log(`Removed message from queue. New queue size: ${queue.length}`);
    }
    
    return queue.length;
  } catch (error) {
    console.error('Error removing message from queue:', error);
    return -1;
  }
};

/**
 * Update a message in the queue
 * @param {number} index - The index of the message to update
 * @param {Object} updates - The properties to update
 */
export const updateMessageInQueue = (index, updates) => {
  try {
    const queue = getMessageQueue();
    
    if (index >= 0 && index < queue.length) {
      queue[index] = { ...queue[index], ...updates };
      localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(queue));
      console.log(`Updated message in queue at index ${index}`);
    }
    
    return queue.length;
  } catch (error) {
    console.error('Error updating message in queue:', error);
    return -1;
  }
};

/**
 * Clear the entire message queue
 */
export const clearMessageQueue = () => {
  try {
    localStorage.removeItem(MESSAGE_QUEUE_KEY);
    console.log('Message queue cleared');
    return true;
  } catch (error) {
    console.error('Error clearing message queue:', error);
    return false;
  }
};

/**
 * Get the number of messages in the queue
 * @returns {number} - Number of queued messages
 */
export const getMessageQueueSize = () => {
  try {
    const queue = getMessageQueue();
    return queue.length;
  } catch (error) {
    console.error('Error getting message queue size:', error);
    return 0;
  }
};

/**
 * Increment the attempt count for a message
 * @param {number} index - The index of the message
 * @returns {number} - The new attempt count
 */
export const incrementAttemptCount = (index) => {
  try {
    const queue = getMessageQueue();
    
    if (index >= 0 && index < queue.length) {
      queue[index].attempts = (queue[index].attempts || 0) + 1;
      localStorage.setItem(MESSAGE_QUEUE_KEY, JSON.stringify(queue));
      return queue[index].attempts;
    }
    
    return -1;
  } catch (error) {
    console.error('Error incrementing attempt count:', error);
    return -1;
  }
};
