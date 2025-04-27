const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get all chats for a user
router.get('/', verifyToken, chatController.getUserChats);

// Create or access a one-on-one chat
router.post('/', verifyToken, chatController.accessChat);

// Create a group chat
router.post('/group', verifyToken, chatController.createGroupChat);

// Rename a group chat
router.put('/group/rename', verifyToken, chatController.renameGroupChat);

// Add user to a group chat
router.put('/group/add', verifyToken, chatController.addToGroupChat);

// Remove user from a group chat
router.put('/group/remove', verifyToken, chatController.removeFromGroupChat);

// Send a message
router.post('/message', verifyToken, chatController.sendMessage);

// Get hospital admins (for super admin or hospital admin)
router.get('/admins/hospital', verifyToken, chatController.getHospitalAdmins);

// Create a super admin group with all hospital admins
router.post('/superadmin/group', verifyToken, chatController.createSuperAdminGroup);

// Mark messages as read
router.put('/:chatId/read', verifyToken, chatController.markAsRead);

// Get messages for a chat - MUST BE LAST as it uses a parameter that could match other routes
router.get('/:chatId', verifyToken, chatController.getMessages);

module.exports = router;
