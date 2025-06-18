const express = require('express');
const {
  getHospitalAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getMyAssignment,
  getDoctorAssignments
} = require('../controllers/patientAssignmentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Route for patients to get their own assignment
router.get('/my-assignment', verifyToken, authorizeRoles('patient'), getMyAssignment);

// Route for doctors to get their patient assignments
router.get('/doctor/:doctorId', verifyToken, getDoctorAssignments);

// Routes for hospital admins
router.get('/hospital', verifyToken, authorizeRoles('hospital_admin'), getHospitalAssignments);
router.post('/', verifyToken, authorizeRoles('hospital_admin'), createAssignment);
router.put('/:id', verifyToken, authorizeRoles('hospital_admin'), updateAssignment);
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deleteAssignment);

module.exports = router;
