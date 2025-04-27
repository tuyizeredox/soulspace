const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const createTestUser = async () => {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists');
      return existingUser;
    }
    
    // Create a new test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'patient',
      profile: {
        phone: '123-456-7890',
        dateOfBirth: new Date('1990-01-01'),
        address: '123 Test St, Test City',
        emergencyContact: 'Emergency Contact: 987-654-3210',
        bloodType: 'O+',
        allergies: 'None',
        chronicConditions: 'None'
      }
    });
    
    await testUser.save();
    console.log('Test user created successfully');
    return testUser;
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Execute the function
createTestUser()
  .then(user => {
    console.log('Test user details:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Script error:', err);
    process.exit(1);
  });
