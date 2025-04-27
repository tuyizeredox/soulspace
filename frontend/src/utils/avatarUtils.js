/**
 * Utility functions for handling user avatars
 */

/**
 * Get the full avatar URL for a user
 * @param {Object} user - The user object
 * @param {boolean} forceRefresh - Whether to force a cache refresh with a timestamp
 * @returns {string} The full avatar URL or null if no avatar
 */
export const getAvatarUrl = (user, forceRefresh = false) => {
  if (!user) return null;

  // If user has no avatar, return null
  if (!user.avatar) return null;

  // If avatar is already a full URL, return it
  if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
    return forceRefresh ? `${user.avatar}?t=${Date.now()}` : user.avatar;
  }

  // If avatar is a relative path, prepend the API base URL
  // This handles paths like /uploads/avatars/avatar-123.jpg
  const baseUrl = process.env.REACT_APP_API_URL || '';
  const avatarUrl = user.avatar.startsWith('/')
    ? `${baseUrl}${user.avatar}`
    : `${baseUrl}/${user.avatar}`;

  // Log the constructed avatar URL for debugging
  console.log('Avatar URL constructed:', avatarUrl);

  // Add timestamp to force refresh if needed
  return forceRefresh ? `${avatarUrl}?t=${Date.now()}` : avatarUrl;
};

/**
 * Get the initials from a user's name
 * @param {string} name - The user's name
 * @returns {string} The user's initials (up to 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return 'U';

  const names = name.split(' ').filter(n => n.length > 0);

  if (names.length === 0) return 'U';
  if (names.length === 1) return names[0].charAt(0).toUpperCase();

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get the color for a user's role
 * @param {string} role - The user's role
 * @returns {string} The color for the role
 */
export const getRoleColor = (role) => {
  switch (role) {
    case 'super_admin':
      return '#9c27b0'; // Purple
    case 'hospital_admin':
      return '#1976d2'; // Blue
    case 'doctor':
      return '#2e7d32'; // Green
    case 'patient':
      return '#ed6c02'; // Orange
    case 'pharmacist':
      return '#d32f2f'; // Red
    case 'insurance_provider':
      return '#0288d1'; // Light Blue
    default:
      return '#757575'; // Grey
  }
};

/**
 * Get a label for a user's role
 * @param {string} role - The user's role
 * @returns {string} A formatted label for the role
 */
export const getRoleLabel = (role) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'hospital_admin':
      return 'Hospital Admin';
    case 'doctor':
      return 'Doctor';
    case 'patient':
      return 'Patient';
    case 'pharmacist':
      return 'Pharmacist';
    case 'insurance_provider':
      return 'Insurance Provider';
    default:
      return 'User';
  }
};
