const express = require('express');
const router = express.Router();
const aiAssistantController = require('../controllers/aiAssistantController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public route for guest users (no authentication required)
router.post('/guest-message', aiAssistantController.processGuestMessage);

// All other routes are protected and require authentication
router.use(verifyToken);

// Process messages sent to the AI assistant
router.post('/message', aiAssistantController.processMessage);

// Get personalized health tips
router.get('/health-tips', aiAssistantController.getHealthTips);

// Speech-to-text conversion
router.post('/speech-to-text', aiAssistantController.speechToText);

// Text-to-speech conversion
router.post('/text-to-speech', aiAssistantController.textToSpeech);

module.exports = router;
