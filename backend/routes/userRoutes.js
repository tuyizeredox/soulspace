const express = require('express');
const { getUsers, getUserById, updateUser, deleteUser, getUserStats } = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

// Get user statistics
router.get('/stats', verifyToken, authorizeRoles('super_admin'), getUserStats);

// User CRUD operations
router.get('/', verifyToken, authorizeRoles('super_admin'), getUsers);

// Get user by ID - allow access to own profile and hospital admin profiles
router.get('/:id', verifyToken, (req, res, next) => {
  // Allow access if:
  // 1. User is requesting their own profile
  // 2. User is a super_admin
  // 3. User is trying to view a hospital_admin profile (for chat purposes)
  if (req.params.id === req.user.id || req.user.role === 'super_admin') {
    return next();
  }

  // For other cases, check if the requested profile is a hospital admin
  User.findById(req.params.id)
    .select('role')
    .then(user => {
      if (user && user.role === 'hospital_admin') {
        return next();
      }
      return res.status(403).json({ message: 'Access denied' });
    })
    .catch(err => {
      return res.status(500).json({ message: 'Error checking user role', error: err.message });
    });
}, getUserById);

router.put('/:id', verifyToken, authorizeRoles('super_admin'), updateUser);
router.delete('/:id', verifyToken, authorizeRoles('super_admin'), deleteUser);

module.exports = router;