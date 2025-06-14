import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to manage sidebar minimization state with localStorage and event sync.
 * @param {string} storageKey - The key to use in localStorage.
 * @returns {[boolean, function]} - [minimized, toggleMinimized]
 */
export function useSidebarMinimization(storageKey = 'sidebarMinimized') {
  const [minimized, setMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(storageKey) === 'true';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, minimized);
      // Dispatch event for Layout sync
      window.dispatchEvent(
        new CustomEvent('sidebar-minimized', { detail: { minimized } })
      );
    }
  }, [minimized, storageKey]);

  // Listen for external minimization changes
  useEffect(() => {
    const handler = (e) => {
      if (e.detail && typeof e.detail.minimized === 'boolean') {
        setMinimized(e.detail.minimized);
      }
    };
    window.addEventListener('sidebar-minimized', handler);
    return () => window.removeEventListener('sidebar-minimized', handler);
  }, []);

  const toggleMinimized = useCallback(() => {
    setMinimized((prev) => !prev);
  }, []);

  return [minimized, toggleMinimized];
}
