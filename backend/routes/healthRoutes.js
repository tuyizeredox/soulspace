const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get health recommendations - protected route requiring authentication
router.get('/recommendations', verifyToken, healthController.getHealthRecommendations);

// Get health stats - protected route requiring authentication
router.get('/stats', verifyToken, (req, res) => {
  // Mock data for now
  const stats = {
    steps: { current: 8742, goal: 10000 },
    sleep: { current: 7.2, goal: 8 },
    water: { current: 6, goal: 8 },
    heartRate: { current: 72 }
  };

  res.json(stats);
});

module.exports = router;
