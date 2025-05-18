const express = require('express');
const router = express.Router();
const patientDoctorChatController = require('../controllers/patientDoctorChatController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * @route GET /api/patient-doctor-chat/patient
 * @desc Get all chats for a patient with their doctors
 * @access Private (Patient only)
 */
router.get('/patient',
  verifyToken,
  authorizeRoles('patient'),
  patientDoctorChatController.getPatientChats
);

/**
 * @route GET /api/patient-doctor-chat/doctor
 * @desc Get all chats for a doctor with their patients
 * @access Private (Doctor only)
 */
router.get('/doctor',
  verifyToken,
  authorizeRoles('doctor'),
  patientDoctorChatController.getDoctorChats
);

/**
 * @route POST /api/patient-doctor-chat
 * @desc Create or access a chat between a patient and a doctor
 * @access Private
 */
router.post('/',
  verifyToken,
  patientDoctorChatController.accessPatientDoctorChat
);

/**
 * @route GET /api/patient-doctor-chat/:chatId/messages
 * @desc Get messages for a specific chat
 * @access Private
 */
router.get('/:chatId/messages',
  verifyToken,
  (req, res, next) => {
    // Try the new implementation first
    patientDoctorChatController.getChatMessages(req, res, (err) => {
      if (err) {
        // If the new implementation fails, fall back to the legacy implementation
        console.log('Falling back to legacy getMessages implementation');
        patientDoctorChatController.getMessages(req, res, next);
      }
    });
  }
);

/**
 * @route POST /api/patient-doctor-chat/:chatId/messages
 * @desc Send a message in a patient-doctor chat
 * @access Private
 */
router.post('/:chatId/messages',
  verifyToken,
  patientDoctorChatController.sendChatMessage
);

module.exports = router;
