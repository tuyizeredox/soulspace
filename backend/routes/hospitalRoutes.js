const express = require('express');
const router = express.Router();

// Import controllers
const {
    getHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital,
    getHospitalAdmins,
    getDoctorsByHospital
} = require('../controllers/hospitalController');

const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const { getHospitalStats, getSystemStats } = require('../controllers/hospitalStatsController');
const { getNearbyHospitals } = require('../controllers/nearbyHospitalController');
const { getHospitalDepartmentStats } = require('../controllers/departmentStatsController');

// Hospital CRUD operations
router.get('/', verifyToken, authorizeRoles('super_admin'), getHospitals);
router.post('/', verifyToken, authorizeRoles('super_admin'), createHospital);

// Hospital statistics - more specific route should come before generic routes
router.get('/system-stats', verifyToken, authorizeRoles('super_admin'), getSystemStats);

// Get department statistics for a hospital
router.get('/departments/stats', verifyToken, authorizeRoles('hospital_admin', 'super_admin'), getHospitalDepartmentStats);

// Get nearby hospitals
router.get('/nearby', verifyToken, getNearbyHospitals);

// Get statistics for a specific hospital
router.get('/:hospitalId/stats', verifyToken, authorizeRoles('hospital_admin', 'super_admin'), getHospitalStats);

// Get hospital admins
router.get('/:id/admins', verifyToken, authorizeRoles('super_admin', 'hospital_admin'), getHospitalAdmins);

// Get doctors for a specific hospital
router.get('/:id/doctors', verifyToken, getDoctorsByHospital);

// Generic hospital routes
router.get('/:id', verifyToken, getHospitalById);
router.put('/:id', verifyToken, authorizeRoles('super_admin', 'hospital_admin'), updateHospital);
router.delete('/:id', verifyToken, authorizeRoles('super_admin'), deleteHospital);

module.exports = router;
