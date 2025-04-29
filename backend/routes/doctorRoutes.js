const express = require('express');
const {
  getHospitalDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const { getHospitalDoctorPerformance } = require('../controllers/doctorPerformanceController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all doctors for a hospital
router.get('/hospital', verifyToken, authorizeRoles('hospital_admin', 'super_admin'), getHospitalDoctors);

// Get performance metrics for doctors in a hospital
router.get('/hospital/performance', verifyToken, authorizeRoles('hospital_admin', 'super_admin'), getHospitalDoctorPerformance);
router.post('/', verifyToken, authorizeRoles('hospital_admin'), createDoctor);
router.put('/:id', verifyToken, authorizeRoles('hospital_admin'), updateDoctor);
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deleteDoctor);

module.exports = router;