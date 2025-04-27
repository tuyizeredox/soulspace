import axios from './axios';

/**
 * Fetch user details by ID
 * @param {string} userId - The user ID to fetch details for
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - User details
 */
export const fetchUserById = async (userId, token) => {
  try {
    if (!userId) {
      console.error('No user ID provided to fetchUserById');
      return null;
    }

    // Make sure we're using the correct ID format
    // MongoDB ObjectId is typically stored as a string in the format: 680921233cd3517d151b195a
    // Extract just the ID part if it's in ObjectId format
    let cleanUserId;

    if (typeof userId === 'object' && userId._id) {
      // If userId is an object with _id property
      cleanUserId = userId._id.toString().replace(/[^a-zA-Z0-9]/g, '');
    } else if (typeof userId === 'string' && userId.includes('new ObjectId')) {
      // If userId is a string with ObjectId format like "new ObjectId('680921233cd3517d151b195a')"
      const match = userId.match(/['"]([0-9a-fA-F]{24})['"]/);
      cleanUserId = match ? match[1] : userId.replace(/[^a-zA-Z0-9]/g, '');
    } else {
      // Regular string ID
      cleanUserId = userId.toString().replace(/[^a-zA-Z0-9]/g, '');
    }

    console.log(`Fetching details for user ID: ${cleanUserId}`);

    const config = {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    const response = await axios.get(`/api/users/${cleanUserId}`, config);

    if (!response || !response.data) {
      console.error('Invalid response when fetching user details');
      return null;
    }

    console.log(`Successfully fetched details for user: ${response.data.name}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user details for ID ${userId}:`, error);
    return null;
  }
};

/**
 * Cache for storing user details to avoid repeated API calls
 */
const userCache = new Map();

/**
 * Fetch user details by ID with caching
 * @param {string} userId - The user ID to fetch details for
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - User details
 */
export const fetchUserByIdWithCache = async (userId, token) => {
  // Return from cache if available
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }

  // Fetch from API if not in cache
  const userData = await fetchUserById(userId, token);

  // Store in cache if successful
  if (userData) {
    userCache.set(userId, userData);
  }

  return userData;
};

/**
 * Clear the user cache
 */
export const clearUserCache = () => {
  userCache.clear();
};
