import { useState, useEffect } from 'react';

/**
 * Custom hook for managing sidebar minimization state
 * @param {string} storageKey - localStorage key for persisting state
 * @returns {[boolean, function]} - [isMinimized, toggleMinimized]
 */
const useSidebarMinimization = (storageKey = 'sidebarMinimized') => {
  const [isMinimized, setIsMinimized] = useState(() => {
    // Initialize from localStorage if available
    const saved = localStorage.getItem(storageKey);
    return saved === 'true';
  });

  // Toggle function
  const toggleMinimized = () => {
    setIsMinimized(prev => {
      const newValue = !prev;
      
      // Save to localStorage
      localStorage.setItem(storageKey, newValue.toString());
      
      // Dispatch custom event for layout to listen
      window.dispatchEvent(new CustomEvent('sidebar-minimized', {
        detail: { minimized: newValue }
      }));
      
      return newValue;
    });
  };

  // Listen for storage changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === storageKey) {
        setIsMinimized(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  return [isMinimized, toggleMinimized];
};

export default useSidebarMinimization;