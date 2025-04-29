/**
 * Utility functions for authentication management
 */

/**
 * Get the best available authentication token
 * Tries both auth systems, preferring the new one (userToken)
 * @returns {string|null} The authentication token or null if none found
 */
export const getBestToken = () => {
  // Try userToken (new system) first
  const userToken = localStorage.getItem('userToken');
  if (userToken) {
    return userToken;
  }
  
  // Fall back to token (old system)
  const token = localStorage.getItem('token');
  return token || null;
};

/**
 * Get the best available user data
 * Tries both auth systems, preferring the new one (userData)
 * @returns {Object|null} The user data object or null if none found
 */
export const getBestUser = () => {
  // Try userData (new system) first
  const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    try {
      return JSON.parse(userDataStr);
    } catch (e) {
      console.error('Error parsing userData:', e);
    }
  }
  
  // Fall back to user (old system)
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Error parsing user:', e);
    }
  }
  
  return null;
};

/**
 * Check if the user is authenticated in either auth system
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!getBestToken();
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};

/**
 * Set authentication headers for axios
 * @param {Object} axiosInstance - The axios instance to configure
 * @param {string} token - The token to use
 */
export const setAuthHeader = (axiosInstance, token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

export default {
  getBestToken,
  getBestUser,
  isAuthenticated,
  clearAuthData,
  setAuthHeader
};
