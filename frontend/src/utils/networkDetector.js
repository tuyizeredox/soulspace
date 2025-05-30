/**
 * Network Detector Utility
 * 
 * This utility helps detect network connectivity issues and provides
 * functions to handle offline/online status changes.
 */

// Store network status
let isOnline = navigator.onLine;
const listeners = [];

/**
 * Initialize network detection
 * Sets up event listeners for online/offline events
 */
export const initNetworkDetection = () => {
  // Set up event listeners for online/offline events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Initial check
  checkConnection();
  
  return () => {
    // Cleanup
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Handle online event
 */
const handleOnline = () => {
  console.log('🌐 Network connection restored');
  isOnline = true;
  notifyListeners();
  
  // Try to send any pending messages
  tryProcessPendingOperations();
};

/**
 * Handle offline event
 */
const handleOffline = () => {
  console.log('🔌 Network connection lost');
  isOnline = false;
  notifyListeners();
};

/**
 * Check connection by making a small request
 * More reliable than just using navigator.onLine
 */
export const checkConnection = async () => {
  try {
    // Try to fetch a small resource to check connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/favicon.ico', { 
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    
    const wasOffline = !isOnline;
    isOnline = true;
    
    if (wasOffline) {
      console.log('🌐 Network connection verified');
      notifyListeners();
      tryProcessPendingOperations();
    }
    
    return true;
  } catch (error) {
    const wasOnline = isOnline;
    isOnline = false;
    
    if (wasOnline) {
      console.log('🔌 Network connection check failed');
      notifyListeners();
    }
    
    return false;
  }
};

/**
 * Try to process any pending operations (messages, etc.)
 */
const tryProcessPendingOperations = () => {
  // This will be called when connection is restored
  // Implement specific retry logic in components that need it
  
  // Dispatch a custom event that components can listen for
  window.dispatchEvent(new CustomEvent('network-restored'));
};

/**
 * Add a listener for network status changes
 * @param {Function} listener - Function to call when network status changes
 */
export const addNetworkListener = (listener) => {
  listeners.push(listener);
  // Call immediately with current status
  listener(isOnline);
  return () => removeNetworkListener(listener);
};

/**
 * Remove a network status listener
 * @param {Function} listener - The listener to remove
 */
export const removeNetworkListener = (listener) => {
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
};

/**
 * Notify all listeners of network status change
 */
const notifyListeners = () => {
  listeners.forEach(listener => {
    try {
      listener(isOnline);
    } catch (error) {
      console.error('Error in network listener:', error);
    }
  });
};

/**
 * Get current network status
 * @returns {boolean} - Whether the device is online
 */
export const isNetworkOnline = () => isOnline;

export default {
  initNetworkDetection,
  checkConnection,
  addNetworkListener,
  removeNetworkListener,
  isNetworkOnline
};