const express = require('express');
const { dispatchAmbulance, getEmergencyStatus } = require('../controllers/emergencyResponderController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/dispatch', verifyToken, authorizeRoles('emergency_responder'), dispatchAmbulance);
router.get('/status', verifyToken, authorizeRoles('emergency_responder', 'hospital_admin'), getEmergencyStatus);

module.exports = router; 