const express = require('express');
const { 
  getHospitalDoctors, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor 
} = require('../controllers/doctorController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/hospital', verifyToken, authorizeRoles('hospital_admin'), getHospitalDoctors);
router.post('/', verifyToken, authorizeRoles('hospital_admin'), createDoctor);
router.put('/:id', verifyToken, authorizeRoles('hospital_admin'), updateDoctor);
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deleteDoctor);

module.exports = router;