const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use absolute path to ensure directory is created in the right place
    const uploadDir = path.join(__dirname, '..', 'uploads', 'avatars');
    console.log('Avatar upload directory:', uploadDir);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created avatar upload directory');
    }

    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `avatar-${req.user.id}-${uniqueSuffix}${ext}`;
    console.log('Generated avatar filename:', filename);
    cb(null, filename);
  }
});

// File filter for avatar uploads
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
exports.upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
}).single('avatar');

// Helper function to log request details for debugging
const logRequestDetails = (req) => {
  console.log('Profile request details:');
  console.log('- User ID:', req.user?.id);
  console.log('- Auth header present:', !!req.headers.authorization);
  console.log('- Content-Type:', req.headers['content-type']);

  if (req.file) {
    console.log('- File details:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      path: req.file.path
    });
  } else {
    console.log('- No file uploaded');
  }
};

/**
 * Update user profile
 * @route PUT /api/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    console.log('Updating profile for user:', req.user.id);

    const { name, email, profile } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name,
        email: email,
        profile: profile
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profile: updatedUser.profile
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

/**
 * Upload profile picture
 * @route POST /api/profile/avatar
 * @access Private
 */
exports.uploadAvatar = async (req, res) => {
  try {
    console.log('=== AVATAR UPLOAD REQUEST ===');
    console.log('Processing avatar upload for user:', req.user.id);

    // Log detailed request information
    logRequestDetails(req);

    // Verify authentication
    if (!req.user || !req.user.id) {
      console.error('Authentication error: No user in request');
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the file path - ensure it starts with a slash for proper URL formatting
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    console.log('Avatar URL to be saved:', avatarUrl);

    // Delete old avatar file if it exists
    try {
      const user = await User.findById(req.user.id);
      if (user && user.avatar && user.avatar.startsWith('/uploads/avatars/')) {
        const oldAvatarPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
          console.log('Deleted old avatar file:', oldAvatarPath);
        }
      }
    } catch (err) {
      console.log('Error deleting old avatar file:', err);
      // Continue with the update even if deleting the old file fails
    }

    // Update user with new avatar URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      console.log('User not found for avatar update');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Avatar updated successfully for user:', req.user.id);

    res.status(200).json({
      message: 'Profile picture updated successfully',
      avatarUrl: updatedUser.avatar,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
};
