import { useEffect } from 'react';

/**
 * Custom hook to handle ResizeObserver errors globally
 * This prevents the "ResizeObserver loop completed with undelivered notifications" error
 * from appearing in the console when components are resized or hidden
 */
const useResizeObserverErrorHandler = () => {
  useEffect(() => {
    // Create a more robust error handler for ResizeObserver errors
    const handleError = (event) => {
      // Check if the error is related to ResizeObserver
      if (
        event.message?.includes('ResizeObserver') ||
        event.message?.includes('ResizeObserver loop') ||
        event.message?.includes('ResizeObserver loop completed with undelivered notifications') ||
        event.error?.message?.includes('ResizeObserver') ||
        (typeof event.reason === 'object' && 
         event.reason?.message?.includes('ResizeObserver'))
      ) {
        // Prevent the error from being displayed in the console
        event.preventDefault();
        event.stopPropagation();
        
        // Optionally log a debug message
        // console.debug('ResizeObserver error suppressed');
        return true;
      }
      return false;
    };

    // Add event listeners for both error and unhandledrejection events
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleError, true);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleError, true);
    };
  }, []);
};

export default useResizeObserverErrorHandler;
