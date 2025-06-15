/**
 * Utility functions for handling images safely
 */

/**
 * Check if a URL is valid and accessible
 * @param {string} url - The URL to check
 * @returns {Promise<boolean>} - True if URL is accessible, false otherwise
 */
export const isUrlAccessible = async (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Check for blob URLs
  if (url.startsWith('blob:')) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.debug('Blob URL not accessible:', url);
      return false;
    }
  }

  // Check for data URLs
  if (url.startsWith('data:')) {
    return true; // Data URLs are self-contained
  }

  // Check for regular URLs
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // Avoid CORS issues for external images
    });
    return response.ok || response.type === 'opaque';
  } catch (error) {
    console.debug('URL not accessible:', url);
    return false;
  }
};

/**
 * Clean up blob URLs to prevent memory leaks
 * @param {string} url - The blob URL to clean up
 */
export const cleanupBlobUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
      console.debug('Cleaned up blob URL:', url);
    } catch (error) {
      console.debug('Failed to cleanup blob URL:', url, error);
    }
  }
};

/**
 * Create a safe image URL that won't cause 404 errors
 * @param {string} url - The original URL
 * @param {string} fallback - Fallback URL if original fails
 * @returns {Promise<string>} - Safe URL to use
 */
export const createSafeImageUrl = async (url, fallback = null) => {
  if (!url) {
    return fallback;
  }

  const isAccessible = await isUrlAccessible(url);
  if (isAccessible) {
    return url;
  }

  if (fallback) {
    const isFallbackAccessible = await isUrlAccessible(fallback);
    if (isFallbackAccessible) {
      return fallback;
    }
  }

  return null; // No valid URL found
};

/**
 * Preload an image to check if it's valid
 * @param {string} src - Image source URL
 * @returns {Promise<boolean>} - True if image loads successfully
 */
export const preloadImage = (src) => {
  return new Promise((resolve) => {
    if (!src) {
      resolve(false);
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      resolve(true);
    };
    
    img.onerror = () => {
      console.debug('Image failed to preload:', src);
      resolve(false);
    };
    
    // Set a timeout to avoid hanging
    setTimeout(() => {
      resolve(false);
    }, 5000);
    
    img.src = src;
  });
};

/**
 * Get a default avatar URL based on user info
 * @param {Object} user - User object
 * @returns {string} - Default avatar URL or null
 */
export const getDefaultAvatarUrl = (user) => {
  if (!user) return null;
  
  // You can implement logic to generate default avatars
  // For example, using initials or a service like Gravatar
  const name = user.name || user.email || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  // Return a data URL with initials (you could also use a service)
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#1976d2"/>
      <text x="20" y="25" font-family="Arial" font-size="14" fill="white" text-anchor="middle">${initials}</text>
    </svg>
  `)}`;
};