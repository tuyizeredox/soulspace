const express = require('express');
const { sendMessage, getMessages } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', verifyToken, sendMessage);
router.get('/', verifyToken, getMessages);

module.exports = router; 