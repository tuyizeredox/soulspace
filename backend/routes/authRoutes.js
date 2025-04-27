const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

// Test endpoint to verify API is accessible
router.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Auth API is working!' });
});

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/signin', login); // Adding an alternative route for login

// Protected routes - require authentication
router.get('/me', auth, getCurrentUser);

module.exports = router;