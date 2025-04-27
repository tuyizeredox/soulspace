const express = require('express');
const { 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  createNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// User routes
router.get('/', verifyToken, getUserNotifications);
router.get('/unread-count', verifyToken, getUnreadCount);
router.put('/:id/read', verifyToken, markAsRead);
router.put('/mark-all-read', verifyToken, markAllAsRead);
router.delete('/:id', verifyToken, deleteNotification);

// Admin routes
router.post('/', verifyToken, authorizeRoles('super_admin', 'hospital_admin', 'doctor'), createNotification);

module.exports = router;
