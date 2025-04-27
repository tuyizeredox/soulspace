const express = require('express');
const { loginUser, getCurrentUser, registerUser } = require('../controllers/userAuthController');
const { protect } = require('../middleware/userAuthMiddleware');
const router = express.Router();

// Test endpoint to verify API is accessible
router.get('/test', (req, res) => {
  console.log('User auth test endpoint hit');
  res.status(200).json({ success: true, message: 'User auth API is working!' });
});

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/me', protect, getCurrentUser);

module.exports = router;
