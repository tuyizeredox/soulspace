const express = require('express');
const {
  getRecentMedicalRecords,
  getPatientMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  getMyMedicalRecords
} = require('../controllers/medicalRecordController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Get recent medical records for the logged-in doctor
router.get('/recent', verifyToken, authorizeRoles('doctor'), getRecentMedicalRecords);

// Get all medical records for a patient (doctor access)
router.get('/patient/:patientId', verifyToken, authorizeRoles('doctor'), getPatientMedicalRecords);

// Get my medical records (patient access)
router.get('/my-records', verifyToken, authorizeRoles('patient'), getMyMedicalRecords);

// Create a new medical record
router.post('/', verifyToken, authorizeRoles('doctor'), createMedicalRecord);

// Update a medical record
router.put('/:id', verifyToken, authorizeRoles('doctor'), updateMedicalRecord);

module.exports = router;
