/**
 * Utility functions for authentication management
 */

/**
 * Clear all authentication tokens and user data from storage
 * This is useful when fixing authentication issues
 */
export const clearAllAuthData = () => {
  console.log('Clearing all authentication data...');

  // Clear all possible token storage locations
  const tokenKeys = [
    'token',
    'userToken',
    'doctorToken',
    'persistentToken',
    'reduxToken',
    'authToken',
    'accessToken',
    'jwt',
    'jwtToken'
  ];

  tokenKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Removing ${key} from localStorage`);
      localStorage.removeItem(key);
    }
  });

  // Clear user data
  const userDataKeys = [
    'user',
    'userData',
    'currentUser',
    'userInfo',
    'authUser',
    'userProfile'
  ];

  userDataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Removing ${key} from localStorage`);
      localStorage.removeItem(key);
    }
  });

  // Clear auth error flags
  localStorage.removeItem('auth_error');
  localStorage.removeItem('auth_error_time');

  // Clear any cached role data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('user_role_') || key.startsWith('chat_endpoint_')) {
      console.log(`Removing cached data: ${key}`);
      localStorage.removeItem(key);
    }
  });

  console.log('All authentication data cleared');
};

/**
 * Get the best available authentication token
 * Tries all token storage locations, with priority order
 * @returns {string|null} The authentication token or null if none found
 */
export const getBestToken = () => {
  // Check all possible token storage locations
  const commonToken = localStorage.getItem('token');
  const userToken = localStorage.getItem('userToken');
  const doctorToken = localStorage.getItem('doctorToken');
  const persistentToken = localStorage.getItem('persistentToken');
  const reduxToken = localStorage.getItem('reduxToken');

  // Log token availability for debugging
  console.log('Token availability check:', {
    commonToken: !!commonToken,
    userToken: !!userToken,
    doctorToken: !!doctorToken,
    persistentToken: !!persistentToken,
    reduxToken: !!reduxToken
  });

  // Use the first available token, with priority
  let bestToken = null;

  if (commonToken) {
    console.log('Using common token from localStorage');
    bestToken = commonToken;
  } else if (doctorToken) {
    console.log('Using doctorToken from localStorage');
    bestToken = doctorToken;
  } else if (userToken) {
    console.log('Using userToken from localStorage');
    bestToken = userToken;
  } else if (persistentToken) {
    console.log('Using persistentToken from localStorage');
    bestToken = persistentToken;
  } else if (reduxToken) {
    console.log('Using reduxToken from localStorage');
    bestToken = reduxToken;
  }

  // If we found a token, save it to all locations for redundancy
  if (bestToken) {
    localStorage.setItem('token', bestToken);
    localStorage.setItem('userToken', bestToken);
    localStorage.setItem('doctorToken', bestToken);
    localStorage.setItem('persistentToken', bestToken);

    // Don't try to set axios headers here - this can cause circular dependencies
    // The axios config will handle setting headers when needed
  }

  return bestToken;
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
  console.log('Clearing all auth data from localStorage');

  // Clear all token storage locations
  localStorage.removeItem('token');
  localStorage.removeItem('userToken');
  localStorage.removeItem('doctorToken');
  localStorage.removeItem('persistentToken');
  localStorage.removeItem('reduxToken');

  // Clear user data
  localStorage.removeItem('user');
  localStorage.removeItem('userData');

  // Clear role-specific data
  localStorage.removeItem('doctorId');
  localStorage.removeItem('doctorName');

  // Don't try to clear axios headers here - this can cause circular dependencies
  // The axios config will handle clearing headers when needed

  console.log('All auth data cleared from localStorage');
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
