const express = require('express');
const {
  getHospitalAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment
} = require('../controllers/appointmentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/hospital', verifyToken, authorizeRoles('hospital_admin'), getHospitalAppointments);
router.post('/', verifyToken, authorizeRoles('hospital_admin'), createAppointment);
router.put('/:id/status', verifyToken, authorizeRoles('hospital_admin'), updateAppointmentStatus);
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deleteAppointment);

module.exports = router;