/**
 * Utility functions for handling common errors in the application
 */
import React from 'react';
import { applyResizeObserverPolyfill } from './resizeObserverPolyfill';

/**
 * Suppresses ResizeObserver loop errors that occur in React applications
 * This is a common issue with Material-UI and other libraries that use ResizeObserver
 */
export const suppressResizeObserverErrors = () => {
  // Apply our custom ResizeObserver polyfill
  applyResizeObserverPolyfill();

  // Override console.error to filter out ResizeObserver errors
  const originalConsoleError = console.error;
  console.error = function(message, ...args) {
    if (typeof message === 'string' &&
        (message.includes('ResizeObserver') ||
         message.includes('ResizeObserver loop') ||
         message.includes('ResizeObserver loop completed with undelivered notifications'))) {
      // Suppress ResizeObserver errors
      return;
    }
    originalConsoleError.apply(console, [message, ...args]);
  };

  // Add global error event handler - more comprehensive check
  const errorHandler = (event) => {
    if ((typeof event.message === 'string' && (
          event.message.includes('ResizeObserver') ||
          event.message.includes('ResizeObserver loop') ||
          event.message.includes('ResizeObserver loop completed with undelivered notifications')
        )) ||
        (event.error && typeof event.error.message === 'string' &&
          event.error.message.includes('ResizeObserver'))) {

      // Prevent the error from being displayed
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      return false;
    }
  };

  // Add global unhandled rejection handler - more comprehensive check
  const rejectionHandler = (event) => {
    if (event.reason &&
        typeof event.reason === 'object' &&
        typeof event.reason.message === 'string' &&
        (event.reason.message.includes('ResizeObserver') ||
         event.reason.message.includes('ResizeObserver loop') ||
         event.reason.message.includes('ResizeObserver loop completed with undelivered notifications'))) {

      // Prevent the error from being displayed
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      return false;
    }
  };

  // Add event listeners
  window.addEventListener('error', errorHandler, true);
  window.addEventListener('unhandledrejection', rejectionHandler, true);

  // Return a cleanup function to remove the event listeners
  return () => {
    window.removeEventListener('error', errorHandler, true);
    window.removeEventListener('unhandledrejection', rejectionHandler, true);
    console.error = originalConsoleError;
  };
};

/**
 * Custom hook to suppress ResizeObserver errors in React components
 * Usage: useEffect(suppressResizeObserverErrors, []);
 */
export const useResizeObserverErrorSuppression = () => {
  React.useEffect(() => {
    return suppressResizeObserverErrors();
  }, []);
};
