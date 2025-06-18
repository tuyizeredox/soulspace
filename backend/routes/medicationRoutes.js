const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  searchMedications
} = require('../controllers/medicationController');

// Public routes
router.get('/', getAllMedications);
router.get('/search', searchMedications);
router.get('/:id', getMedicationById);

// Protected routes
router.post('/', verifyToken, createMedication);
router.put('/:id', verifyToken, updateMedication);
router.delete('/:id', verifyToken, deleteMedication);

module.exports = router;