const User = require('../models/User');
const HealthTip = require('../models/HealthTip');

// Get health recommendations for the user
exports.getHealthRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    let user = null;
    
    // If user is authenticated, get their information
    if (userId) {
      user = await User.findById(userId);
    }

    // Get personalized or general recommendations
    let recommendations = [
      { title: 'Managing Stress', path: '/articles/stress-management', icon: 'Psychology' },
      { title: 'Healthy Diet Tips', path: '/articles/diet-tips', icon: 'Restaurant' },
      { title: 'Sleep Improvement', path: '/articles/sleep-tips', icon: 'Bedtime' },
      { title: 'Exercise Routines', path: '/articles/exercise', icon: 'FitnessCenter' },
    ];

    // If we have a user with specific conditions, personalize recommendations
    if (user?.profile?.chronicConditions) {
      const conditions = user.profile.chronicConditions.toLowerCase();
      
      if (conditions.includes('diabetes')) {
        recommendations.push({ 
          title: 'Diabetes Management', 
          path: '/articles/diabetes-care', 
          icon: 'HealthAndSafety' 
        });
      }
      
      if (conditions.includes('hypertension') || conditions.includes('heart')) {
        recommendations.push({ 
          title: 'Heart Health', 
          path: '/articles/heart-health', 
          icon: 'Favorite' 
        });
      }
      
      if (conditions.includes('asthma')) {
        recommendations.push({ 
          title: 'Respiratory Health', 
          path: '/articles/respiratory-care', 
          icon: 'Air' 
        });
      }
    }

    res.json(recommendations);

  } catch (error) {
    console.error('Health Recommendations Error:', error);
    res.status(500).json({
      message: 'Error fetching health recommendations',
      error: error.message
    });
  }
};
