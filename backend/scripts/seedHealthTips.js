const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HealthTip = require('../models/HealthTip');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Health tips data
const healthTipsData = [
  {
    title: 'Stay Hydrated',
    content: 'Drink at least 8 glasses of water daily to maintain optimal health. Proper hydration supports digestion, circulation, and temperature regulation.',
    category: 'General Wellness',
    tags: ['hydration', 'water', 'wellness'],
    iconName: 'WaterDrop',
    color: '#2196f3',
    isGeneral: true,
    source: 'Mayo Clinic'
  },
  {
    title: 'Regular Exercise',
    content: 'Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity each week, plus muscle-strengthening activities twice a week.',
    category: 'Exercise',
    tags: ['fitness', 'exercise', 'activity'],
    iconName: 'FitnessCenter',
    color: '#f44336',
    isGeneral: true,
    source: 'American Heart Association'
  },
  {
    title: 'Balanced Diet',
    content: 'Eat a variety of fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, added sugars, and excessive salt intake.',
    category: 'Nutrition',
    tags: ['diet', 'nutrition', 'food'],
    iconName: 'Restaurant',
    color: '#4caf50',
    isGeneral: true,
    source: 'USDA Dietary Guidelines'
  },
  {
    title: 'Adequate Sleep',
    content: 'Adults should aim for 7-9 hours of quality sleep each night. Consistent sleep schedules help maintain your body\'s internal clock.',
    category: 'Sleep',
    tags: ['sleep', 'rest', 'wellness'],
    iconName: 'Bedtime',
    color: '#9c27b0',
    isGeneral: true,
    source: 'National Sleep Foundation'
  },
  {
    title: 'Stress Management',
    content: 'Practice stress-reduction techniques like deep breathing, meditation, yoga, or mindfulness. Chronic stress can negatively impact both physical and mental health.',
    category: 'Mental Health',
    tags: ['stress', 'mental health', 'wellness'],
    iconName: 'SelfImprovement',
    color: '#ff9800',
    isGeneral: true,
    source: 'American Psychological Association'
  },
  {
    title: 'Regular Health Screenings',
    content: 'Schedule regular check-ups and preventive screenings based on your age, gender, and risk factors. Early detection is key for many health conditions.',
    category: 'Preventive Care',
    tags: ['checkup', 'screening', 'prevention'],
    iconName: 'HealthAndSafety',
    color: '#00bcd4',
    isGeneral: true,
    source: 'CDC'
  },
  {
    title: 'Hand Hygiene',
    content: 'Wash your hands frequently with soap and water for at least 20 seconds, especially before eating, after using the bathroom, and after being in public places.',
    category: 'Preventive Care',
    tags: ['hygiene', 'prevention', 'wellness'],
    iconName: 'CleanHands',
    color: '#3f51b5',
    isGeneral: true,
    source: 'World Health Organization'
  },
  {
    title: 'Limit Alcohol Consumption',
    content: 'If you drink alcohol, do so in moderation. This means up to one drink per day for women and up to two drinks per day for men.',
    category: 'General Wellness',
    tags: ['alcohol', 'moderation', 'wellness'],
    iconName: 'NoAlcohol',
    color: '#795548',
    isGeneral: true,
    source: 'American Heart Association'
  },
  {
    title: 'Quit Smoking',
    content: 'Smoking harms nearly every organ in your body. Quitting at any age can significantly improve your health and reduce risk of smoking-related diseases.',
    category: 'Preventive Care',
    tags: ['smoking', 'tobacco', 'prevention'],
    iconName: 'SmokeFree',
    color: '#607d8b',
    isGeneral: true,
    source: 'American Cancer Society'
  },
  {
    title: 'Sun Protection',
    content: 'Use sunscreen with SPF 30 or higher, wear protective clothing, and seek shade to protect your skin from harmful UV rays, especially between 10 AM and 4 PM.',
    category: 'Preventive Care',
    tags: ['skin', 'sun', 'protection'],
    iconName: 'WbSunny',
    color: '#ffc107',
    isGeneral: true,
    source: 'Skin Cancer Foundation'
  },
  {
    title: 'Mental Health Check-ins',
    content: 'Regularly assess your mental well-being and seek support when needed. Mental health is just as important as physical health.',
    category: 'Mental Health',
    tags: ['mental health', 'wellness', 'self-care'],
    iconName: 'Psychology',
    color: '#e91e63',
    isGeneral: true,
    source: 'National Institute of Mental Health'
  },
  {
    title: 'Social Connections',
    content: 'Maintain meaningful relationships and social connections. Strong social ties are linked to better health outcomes and longevity.',
    category: 'Mental Health',
    tags: ['social', 'relationships', 'wellness'],
    iconName: 'People',
    color: '#673ab7',
    isGeneral: true,
    source: 'Harvard Health'
  },
  // Condition-specific tips
  {
    title: 'Blood Sugar Monitoring',
    content: 'If you have diabetes, monitor your blood sugar levels regularly as recommended by your healthcare provider. Keep a log of your readings.',
    category: 'Chronic Conditions',
    tags: ['diabetes', 'blood sugar', 'monitoring'],
    iconName: 'Bloodtype',
    color: '#d32f2f',
    isGeneral: false,
    source: 'American Diabetes Association'
  },
  {
    title: 'Diabetes-Friendly Diet',
    content: 'Focus on fiber-rich foods, healthy carbohydrates, and heart-healthy fish. Limit refined carbs, sugary foods, and processed meats.',
    category: 'Nutrition',
    tags: ['diabetes', 'diet', 'nutrition'],
    iconName: 'SetMeal',
    color: '#388e3c',
    isGeneral: false,
    source: 'American Diabetes Association'
  },
  {
    title: 'Blood Pressure Management',
    content: 'For hypertension, maintain a low-sodium diet, exercise regularly, limit alcohol, and take medications as prescribed. Monitor your blood pressure at home.',
    category: 'Chronic Conditions',
    tags: ['hypertension', 'blood pressure', 'heart'],
    iconName: 'MonitorHeart',
    color: '#c62828',
    isGeneral: false,
    source: 'American Heart Association'
  },
  {
    title: 'DASH Diet for Hypertension',
    content: 'The DASH diet emphasizes fruits, vegetables, whole grains, and low-fat dairy while limiting sodium, saturated fats, and added sugars to help lower blood pressure.',
    category: 'Nutrition',
    tags: ['hypertension', 'diet', 'DASH'],
    iconName: 'Restaurant',
    color: '#43a047',
    isGeneral: false,
    source: 'National Heart, Lung, and Blood Institute'
  },
  {
    title: 'Asthma Trigger Management',
    content: 'Identify and avoid your asthma triggers, which may include allergens, irritants, exercise, or weather changes. Always keep rescue medication accessible.',
    category: 'Chronic Conditions',
    tags: ['asthma', 'breathing', 'triggers'],
    iconName: 'Air',
    color: '#0288d1',
    isGeneral: false,
    source: 'American Lung Association'
  },
  {
    title: 'Asthma Action Plan',
    content: 'Work with your healthcare provider to create an asthma action plan that outlines daily management and how to recognize and handle worsening symptoms.',
    category: 'Chronic Conditions',
    tags: ['asthma', 'action plan', 'management'],
    iconName: 'FactCheck',
    color: '#0097a7',
    isGeneral: false,
    source: 'CDC'
  },
  {
    title: 'Joint Protection for Arthritis',
    content: 'Use proper body mechanics, assistive devices, and joint protection techniques to reduce strain on affected joints and manage arthritis symptoms.',
    category: 'Chronic Conditions',
    tags: ['arthritis', 'joints', 'pain'],
    iconName: 'AccessibleForward',
    color: '#7b1fa2',
    isGeneral: false,
    source: 'Arthritis Foundation'
  },
  {
    title: 'Heart-Healthy Diet',
    content: 'Emphasize fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit saturated fats, trans fats, sodium, and added sugars for heart health.',
    category: 'Nutrition',
    tags: ['heart', 'diet', 'cardiovascular'],
    iconName: 'Favorite',
    color: '#d81b60',
    isGeneral: false,
    source: 'American Heart Association'
  }
];

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing health tips
    await HealthTip.deleteMany({});
    console.log('Cleared existing health tips');
    
    // Insert new health tips
    await HealthTip.insertMany(healthTipsData);
    console.log(`Successfully seeded ${healthTipsData.length} health tips`);
    
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();
