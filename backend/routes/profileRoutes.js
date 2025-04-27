const express = require('express');
const router = express.Router();
const { updateProfile, uploadAvatar, upload } = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMiddleware');

// Log middleware to debug token issues
const logAuthHeader = (req, res, next) => {
  console.log('Profile route request:');
  console.log('- Path:', req.path);
  console.log('- Method:', req.method);
  console.log('- Auth header present:', !!req.headers.authorization);
  console.log('- Content-Type:', req.headers['content-type']);
  next();
};

// All profile routes require authentication
router.use(verifyToken);
router.use(logAuthHeader);

// Update user profile
router.put('/', updateProfile);

// Upload profile picture
router.post('/avatar', (req, res, next) => {
  console.log('Processing avatar upload request');

  upload(req, res, function (err) {
    if (err) {
      console.error('Multer error during file upload:', err);
      return res.status(400).json({ message: err.message });
    }
    console.log('File upload middleware completed successfully');
    next();
  });
}, uploadAvatar);

module.exports = router;
