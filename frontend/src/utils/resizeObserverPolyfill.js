/**
 * ResizeObserver Polyfill
 * 
 * This file completely replaces the browser's ResizeObserver with a safer version
 * that prevents the "ResizeObserver loop completed with undelivered notifications" error.
 */

// Store the original ResizeObserver
const OriginalResizeObserver = window.ResizeObserver;

// Create a safer version of ResizeObserver
class SafeResizeObserver {
  constructor(callback) {
    this.callback = callback;
    this.observers = new Map();
    this.activeObservers = new Set();
    this.observing = false;
    this.rafId = null;
    this.timeoutId = null;
  }

  observe(target, options) {
    if (!target || !(target instanceof Element)) {
      console.warn('Invalid target for ResizeObserver:', target);
      return;
    }

    // Store the target and options
    this.observers.set(target, {
      target,
      options,
      size: {
        width: target.clientWidth,
        height: target.clientHeight
      }
    });

    // Start observing if not already
    if (!this.observing) {
      this.startObserving();
    }
  }

  unobserve(target) {
    this.observers.delete(target);
    
    // Stop observing if no more targets
    if (this.observers.size === 0) {
      this.stopObserving();
    }
  }

  disconnect() {
    this.observers.clear();
    this.stopObserving();
  }

  startObserving() {
    this.observing = true;
    this.checkSizes();
  }

  stopObserving() {
    this.observing = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  checkSizes() {
    if (!this.observing) return;

    // Clear any existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Use requestAnimationFrame for smoother performance
    this.rafId = requestAnimationFrame(() => {
      this.activeObservers.clear();
      
      // Check each observer
      this.observers.forEach((observer) => {
        const { target, size } = observer;
        
        // Skip if target is not in DOM
        if (!document.contains(target)) {
          return;
        }
        
        const newWidth = target.clientWidth;
        const newHeight = target.clientHeight;
        
        // Check if size changed
        if (newWidth !== size.width || newHeight !== size.height) {
          // Update size
          observer.size = {
            width: newWidth,
            height: newHeight
          };
          
          // Add to active observers
          this.activeObservers.add(observer);
        }
      });
      
      // Call callback with active observers
      if (this.activeObservers.size > 0) {
        try {
          const entries = Array.from(this.activeObservers).map(observer => ({
            target: observer.target,
            contentRect: {
              width: observer.size.width,
              height: observer.size.height,
              top: 0,
              left: 0,
              bottom: observer.size.height,
              right: observer.size.width
            },
            borderBoxSize: [{
              inlineSize: observer.size.width,
              blockSize: observer.size.height
            }],
            contentBoxSize: [{
              inlineSize: observer.size.width,
              blockSize: observer.size.height
            }],
            devicePixelContentBoxSize: [{
              inlineSize: observer.size.width,
              blockSize: observer.size.height
            }]
          }));
          
          this.callback(entries, this);
        } catch (error) {
          console.error('Error in ResizeObserver callback:', error);
        }
      }
      
      // Schedule next check with a delay to prevent loop
      if (this.observing) {
        this.timeoutId = setTimeout(() => {
          this.checkSizes();
        }, 100); // 100ms delay
      }
    });
  }
}

// Replace the browser's ResizeObserver with our safe version
window.ResizeObserver = SafeResizeObserver;

// Export the original ResizeObserver in case it's needed
export const OriginalResizeObserverClass = OriginalResizeObserver;

// Add a global error handler for any remaining ResizeObserver errors
const handleResizeObserverError = (event) => {
  if (
    (typeof event.message === 'string' && (
      event.message.includes('ResizeObserver') ||
      event.message.includes('ResizeObserver loop')
    )) ||
    (event.error && typeof event.error.message === 'string' && 
      event.error.message.includes('ResizeObserver')) ||
    (typeof event.reason === 'object' && event.reason && 
      typeof event.reason.message === 'string' && 
      event.reason.message.includes('ResizeObserver'))
  ) {
    // Prevent the error from being displayed
    if (event.preventDefault) event.preventDefault();
    if (event.stopPropagation) event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    return true;
  }
  return false;
};

// Add event listeners
window.addEventListener('error', handleResizeObserverError, true);
window.addEventListener('unhandledrejection', handleResizeObserverError, true);

// Export a function to apply the polyfill
export const applyResizeObserverPolyfill = () => {
  // This function is just a marker that the polyfill has been applied
  console.log('ResizeObserver polyfill applied');
};
