const express = require('express');
const router = express.Router();

// Import controllers
const {
    getHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital,
    getHospitalAdmins
} = require('../controllers/hospitalController');

const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getHospitalStats, getSystemStats } = require('../controllers/hospitalStatsController');
const { getNearbyHospitals } = require('../controllers/nearbyHospitalController');

// Hospital CRUD operations
router.get('/', verifyToken, authorizeRoles('super_admin'), getHospitals);
router.post('/', verifyToken, authorizeRoles('super_admin'), createHospital);

// Hospital statistics - more specific route should come before generic routes
router.get('/system-stats', verifyToken, authorizeRoles('super_admin'), getSystemStats);
router.get('/nearby', verifyToken, getNearbyHospitals);
router.get('/:hospitalId/stats', verifyToken, authorizeRoles('hospital_admin'), getHospitalStats);

// Get hospital admins
router.get('/:id/admins', verifyToken, authorizeRoles('super_admin', 'hospital_admin'), getHospitalAdmins);

// Generic hospital routes
router.get('/:id', verifyToken, getHospitalById);
router.put('/:id', verifyToken, authorizeRoles('super_admin', 'hospital_admin'), updateHospital);
router.delete('/:id', verifyToken, authorizeRoles('super_admin'), deleteHospital);

module.exports = router;
