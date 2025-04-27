/**
 * Fix for ResizeObserver loop limit exceeded error
 * This is a known issue with ResizeObserver in some browsers
 * https://github.com/WICG/resize-observer/issues/38
 */

// Add a global error handler for ResizeObserver errors
export const fixResizeObserverErrors = () => {
  // Create a more robust error handler for ResizeObserver errors
  const handleError = (event) => {
    // Check if the error is related to ResizeObserver
    if (
      (typeof event.message === 'string' && (
        event.message.includes('ResizeObserver') ||
        event.message.includes('ResizeObserver loop') ||
        event.message.includes('ResizeObserver loop completed with undelivered notifications')
      )) ||
      (event.error && typeof event.error.message === 'string' &&
        event.error.message.includes('ResizeObserver')) ||
      (typeof event.reason === 'object' && event.reason &&
        typeof event.reason.message === 'string' &&
        event.reason.message.includes('ResizeObserver'))
    ) {
      // Prevent the error from being displayed in the console
      if (event.preventDefault) event.preventDefault();
      if (event.stopPropagation) event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();

      // Return true to indicate the error was handled
      return true;
    }
    return false;
  };

  // Add event listeners for both error and unhandledrejection events
  window.addEventListener('error', handleError, true);
  window.addEventListener('unhandledrejection', handleError, true);

  // Return a cleanup function
  return () => {
    window.removeEventListener('error', handleError, true);
    window.removeEventListener('unhandledrejection', handleError, true);
  };
};

// Debounced resize observer to prevent loop errors
export class DebouncedResizeObserver extends ResizeObserver {
  constructor(callback, delay = 100) {
    let timeout;
    let rafId;

    super((entries, observer) => {
      // Clear any existing timeouts and animation frames
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);

      // Use setTimeout to debounce the callback
      timeout = setTimeout(() => {
        // Use requestAnimationFrame to ensure we're in the right frame
        rafId = requestAnimationFrame(() => {
          try {
            callback(entries, observer);
          } catch (error) {
            console.error('Error in ResizeObserver callback:', error);
          }
        });
      }, delay);
    });

    // Store the timeout and rafId for cleanup
    this.timeout = timeout;
    this.rafId = rafId;
  }

  // Override disconnect to clean up timeouts
  disconnect() {
    clearTimeout(this.timeout);
    cancelAnimationFrame(this.rafId);
    super.disconnect();
  }
}
