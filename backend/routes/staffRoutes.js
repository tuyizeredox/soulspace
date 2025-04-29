const express = require('express');
const {
  getHospitalStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffStats,
  assignDepartment,
  updateStaffStatus
} = require('../controllers/staffController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all staff for a hospital
router.get('/hospital', verifyToken, authorizeRoles('hospital_admin'), getHospitalStaff);

// Get staff statistics
router.get('/stats', verifyToken, authorizeRoles('hospital_admin'), getStaffStats);

// Get staff by ID
router.get('/:id', verifyToken, authorizeRoles('hospital_admin'), getStaffById);

// Create a new staff member
router.post('/', verifyToken, authorizeRoles('hospital_admin'), createStaff);

// Update a staff member
router.put('/:id', verifyToken, authorizeRoles('hospital_admin'), updateStaff);

// Delete a staff member
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deleteStaff);

// Assign staff to departments
router.post('/assign-department', verifyToken, authorizeRoles('hospital_admin'), assignDepartment);

// Update staff status
router.post('/update-status', verifyToken, authorizeRoles('hospital_admin'), updateStaffStatus);

module.exports = router;
