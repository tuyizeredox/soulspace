/**
 * Token Management Utility
 * Handles permanent token storage and retrieval
 */

const TOKEN_KEYS = {
  PRIMARY: 'soulspace_auth_token',
  BACKUP: 'soulspace_token_backup',
  USER_DATA: 'soulspace_user_data',
  REFRESH: 'soulspace_refresh_token',
  EXPIRY: 'soulspace_token_expiry'
};

/**
 * Store authentication token permanently
 * @param {string} token - JWT token
 * @param {object} userData - User data object
 * @param {number} expiresIn - Token expiry in seconds (default 7 days)
 */
export const storeTokenPermanently = (token, userData, expiresIn = 7 * 24 * 60 * 60) => {
  try {

    
    // Calculate expiry timestamp
    const expiryTime = Date.now() + (expiresIn * 1000);
    
    // Store in multiple locations for redundancy
    localStorage.setItem(TOKEN_KEYS.PRIMARY, token);
    localStorage.setItem(TOKEN_KEYS.BACKUP, token);
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEYS.EXPIRY, expiryTime.toString());
    
    // Also store in legacy locations for backward compatibility
    localStorage.setItem('token', token);
    localStorage.setItem('userToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    

    return true;
  } catch (error) {
    console.error('Error storing token:', error);
    return false;
  }
};

/**
 * Retrieve the best available token
 * @returns {string|null} Token or null if not found
 */
export const getStoredToken = () => {
  // Try primary location first
  let token = localStorage.getItem(TOKEN_KEYS.PRIMARY);
  
  if (token && isTokenValid(token)) {
    return token;
  }
  
  // Try backup location
  token = localStorage.getItem(TOKEN_KEYS.BACKUP);
  if (token && isTokenValid(token)) {
    return token;
  }
  
  // Try legacy locations
  const legacyTokens = ['token', 'userToken', 'doctorToken', 'persistentToken'];
  for (const key of legacyTokens) {
    token = localStorage.getItem(key);
    if (token && isTokenValid(token)) {
      return token;
    }
  }
  
  return null;
};

/**
 * Get stored user data
 * @returns {object|null} User data or null if not found
 */
export const getStoredUserData = () => {
  try {
    // Try primary location first
    let userData = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Try legacy location
    userData = localStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    
    // Try another legacy location
    userData = localStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get stored user ID
 * @returns {string|null} User ID or null if not found
 */
export const getStoredUserId = () => {
  // Try direct userId storage first
  let userId = localStorage.getItem('userId');
  if (userId) {
    return userId;
  }
  
  // Try doctorId for backward compatibility
  userId = localStorage.getItem('doctorId');
  if (userId) {
    return userId;
  }
  
  // Try extracting from user data
  const userData = getStoredUserData();
  if (userData && (userData._id || userData.id)) {
    return userData._id || userData.id;
  }
  
  return null;
};

/**
 * Check if token is valid (basic format check)
 * @param {string} token - JWT token
 * @returns {boolean} True if token appears valid
 */
export const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Basic JWT format check (should have 3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Check if token is expired based on stored expiry
  const expiryTime = localStorage.getItem(TOKEN_KEYS.EXPIRY);
  if (expiryTime && Date.now() > parseInt(expiryTime)) {

    return false;
  }
  
  return true;
};

/**
 * Clear all authentication data
 * Call this only on explicit logout
 */
export const clearAllTokens = () => {

  
  // Clear primary storage
  Object.values(TOKEN_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear legacy storage
  const legacyKeys = [
    'token', 'userToken', 'doctorToken', 'persistentToken', 'reduxToken',
    'user', 'userData', 'currentUser', 'userInfo', 'authUser',
    'auth_error', 'auth_error_time'
  ];
  
  legacyKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear any cached data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('user_role_') || 
        key.startsWith('chat_endpoint_') || 
        key.startsWith('messages_') ||
        key.startsWith('pendingReadOps')) {
      localStorage.removeItem(key);
    }
  });
  

};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  const token = getStoredToken();
  const userData = getStoredUserData();
  
  return !!(token && userData);
};

/**
 * Get authentication headers for API requests
 * @returns {object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
  const token = getStoredToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Refresh token if needed
 * @returns {Promise<boolean>} True if token is valid or refreshed
 */
export const ensureValidToken = async () => {
  const token = getStoredToken();
  
  if (!token) {

    return false;
  }
  
  if (isTokenValid(token)) {

    return true;
  }
  

  clearAllTokens();
  return false;
};

export default {
  storeTokenPermanently,
  getStoredToken,
  getStoredUserData,
  getStoredUserId,
  isTokenValid,
  clearAllTokens,
  isAuthenticated,
  getAuthHeaders,
  ensureValidToken
};
