const express = require('express');
const {
  getHospitalAppointments,
  createAppointment,
  createPatientAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getPatientAppointments
} = require('../controllers/appointmentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Hospital admin routes
router.get('/hospital', verifyToken, authorizeRoles('hospital_admin'), getHospitalAppointments);
router.post('/admin', verifyToken, authorizeRoles('hospital_admin'), createAppointment);
router.put('/:id/status', verifyToken, authorizeRoles('hospital_admin'), updateAppointmentStatus);
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deleteAppointment);

// Patient routes
router.get('/patient', verifyToken, getPatientAppointments); // Allow any authenticated user to view their appointments
router.post('/', verifyToken, createPatientAppointment); // Allow any authenticated user to book an appointment

module.exports = router;