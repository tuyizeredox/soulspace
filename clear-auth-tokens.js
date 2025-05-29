/**
 * Emergency Token Clearing Script
 * Run this script in the browser console to clear all authentication tokens
 * This will fix "invalid signature" JWT errors
 */

console.log('🔧 Starting emergency token clearing...');

// Clear all possible token storage locations
const tokenKeys = [
  'token', 'userToken', 'doctorToken', 'persistentToken', 'reduxToken',
  'authToken', 'accessToken', 'jwt', 'jwtToken',
  'soulspace_auth_token', 'soulspace_token_backup', 'soulspace_refresh_token'
];

console.log('📝 Clearing token keys...');
tokenKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`   ✅ Removed: ${key}`);
    localStorage.removeItem(key);
  }
});

// Clear user data
const userDataKeys = [
  'user', 'userData', 'currentUser', 'userInfo', 'authUser', 'userProfile',
  'soulspace_user_data', 'doctorId', 'doctorName'
];

console.log('👤 Clearing user data...');
userDataKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`   ✅ Removed: ${key}`);
    localStorage.removeItem(key);
  }
});

// Clear auth error flags
console.log('🚫 Clearing error flags...');
const errorKeys = ['auth_error', 'auth_error_time', 'soulspace_token_expiry'];
errorKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    console.log(`   ✅ Removed: ${key}`);
    localStorage.removeItem(key);
  }
});

// Clear cached data
console.log('🗂️ Clearing cached data...');
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('user_role_') || 
      key.startsWith('chat_endpoint_') || 
      key.startsWith('messages_') ||
      key.startsWith('pendingReadOps')) {
    console.log(`   ✅ Removed cached: ${key}`);
    localStorage.removeItem(key);
  }
});

// Clear session storage
console.log('💾 Clearing session storage...');
sessionStorage.clear();

// Clear axios headers if available
if (typeof axios !== 'undefined' && axios.defaults && axios.defaults.headers) {
  console.log('🌐 Clearing axios headers...');
  delete axios.defaults.headers.common['Authorization'];
}

console.log('✨ Token clearing completed!');
console.log('');
console.log('🔄 Next steps:');
console.log('1. Refresh this page (F5 or Ctrl+R)');
console.log('2. Go to the login page');
console.log('3. Login with your credentials');
console.log('4. New valid tokens will be generated');
console.log('');
console.log('🎯 This should fix "invalid signature" JWT errors');

// Show a confirmation alert
alert('✅ All authentication tokens cleared!\n\nPlease refresh the page and login again.');
