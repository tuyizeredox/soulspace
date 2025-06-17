const express = require('express');
const {
  getHospitalDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getPatientsForDoctor,
  getDoctorById,
  getDoctorSchedules,
  createScheduleRequest,
  updateScheduleRequest,
  getPendingScheduleRequests,
  updateScheduleRequestStatus
} = require('../controllers/doctorController');
const { getHospitalDoctorPerformance } = require('../controllers/doctorPerformanceController');
const {
  getDoctorStats,
  getDoctorShifts,
  getDoctorAppointments
} = require('../controllers/doctorStatsController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all doctors for a hospital
router.get('/hospital', verifyToken, authorizeRoles('hospital_admin', 'super_admin'), getHospitalDoctors);

// Get performance metrics for doctors in a hospital
router.get('/hospital/performance', verifyToken, authorizeRoles('hospital_admin', 'super_admin'), getHospitalDoctorPerformance);

// Get patients for the logged-in doctor
router.get('/my-patients', verifyToken, authorizeRoles('doctor'), getPatientsForDoctor);

// Get statistics for the logged-in doctor
router.get('/stats', verifyToken, authorizeRoles('doctor'), getDoctorStats);

// Get shifts for the logged-in doctor
router.get('/shifts', verifyToken, authorizeRoles('doctor'), getDoctorShifts);

// Get appointments for the logged-in doctor
router.get('/my-appointments', verifyToken, authorizeRoles('doctor'), getDoctorAppointments);

router.post('/', verifyToken, authorizeRoles('hospital_admin'), createDoctor);
router.put('/:id', verifyToken, authorizeRoles('hospital_admin'), updateDoctor);
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deleteDoctor);

// Schedule Management Routes
router.get('/:id/schedules', verifyToken, authorizeRoles('hospital_admin', 'doctor'), getDoctorSchedules);
router.post('/schedule-requests', verifyToken, authorizeRoles('hospital_admin', 'doctor'), createScheduleRequest);
router.put('/schedule-requests/:id', verifyToken, authorizeRoles('hospital_admin', 'doctor'), updateScheduleRequest);
router.get('/schedule-requests/pending', verifyToken, authorizeRoles('hospital_admin'), getPendingScheduleRequests);
router.put('/schedule-requests/:id/status', verifyToken, authorizeRoles('hospital_admin'), updateScheduleRequestStatus);

// Get doctor by ID - public route for chat functionality
router.get('/:id', getDoctorById);

module.exports = router;