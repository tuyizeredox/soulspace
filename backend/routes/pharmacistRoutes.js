const express = require('express');
const { 
  getHospitalPharmacists, 
  createPharmacist, 
  updatePharmacist, 
  deletePharmacist 
} = require('../controllers/pharmacistController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/hospital', verifyToken, authorizeRoles('hospital_admin'), getHospitalPharmacists);
router.post('/', verifyToken, authorizeRoles('hospital_admin'), createPharmacist);
router.put('/:id', verifyToken, authorizeRoles('hospital_admin'), updatePharmacist);
router.delete('/:id', verifyToken, authorizeRoles('hospital_admin'), deletePharmacist);

module.exports = router;