const express = require('express');
const { registerHospital, approveHospital } = require('../controllers/hospitalRegistrationController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', verifyToken, authorizeRoles('super_admin'), registerHospital);
router.put('/approve/:id', verifyToken, authorizeRoles('super_admin'), approveHospital);

module.exports = router;