const express = require('express');
const { 
  getHospitalNurses, 
  createNurse, 
  updateNurse, 
  deleteNurse,
  assignDoctors,
  getNursesByDoctor
} = require('../controllers/nurseController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all nurses for a hospital
router.get('/hospital', verifyToken, authorizeRoles('hospital_admin'), getHospitalNurses);

// Create a new nurse
router.post('/', verifyToken, authorizeRoles('hospital_admin'), createNurse);

// Update a nurse
router.put('/:id', verifyToken, authorizeRoles('hospital_admin'), updateNurse);

// Delete a nurse
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deleteNurse);

// Assign doctors to a nurse
router.put('/:id/assign-doctors', verifyToken, authorizeRoles('hospital_admin'), assignDoctors);

// Get nurses assigned to a specific doctor
router.get('/by-doctor/:doctorId', verifyToken, authorizeRoles('hospital_admin', 'doctor'), getNursesByDoctor);

module.exports = router;
