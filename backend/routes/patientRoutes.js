const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  getPatientAppointments,
  getHospitalPatients,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', verifyToken, authorizeRoles('hospital_admin'), getPatients);
router.get('/hospital', verifyToken, authorizeRoles('hospital_admin'), getHospitalPatients);
router.get('/:id', verifyToken, authorizeRoles('hospital_admin', 'doctor'), getPatientById);
router.post('/', verifyToken, authorizeRoles('hospital_admin'), createPatient);
router.put('/:id', verifyToken, authorizeRoles('hospital_admin'), updatePatient);
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deletePatient);

module.exports = router;