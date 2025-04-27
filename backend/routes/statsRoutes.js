const express = require('express');
const { getAdminStats } = require('../controllers/statsController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/admin', verifyToken, authorizeRoles('super_admin'), getAdminStats);

module.exports = router;