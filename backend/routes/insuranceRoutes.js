const express = require('express');
const { createClaim, getClaims } = require('../controllers/insuranceController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', verifyToken, authorizeRoles('patient', 'insurance_provider'), createClaim);
router.get('/', verifyToken, authorizeRoles('super_admin', 'insurance_provider'), getClaims);

module.exports = router; 