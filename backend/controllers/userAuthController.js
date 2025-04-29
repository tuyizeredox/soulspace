const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * User login controller
 * @route POST /api/user/login
 * @access Public
 */
exports.loginUser = async (req, res) => {
  console.log('Login request received:', req.body);

  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user by email
    console.log(`Looking for user with email: ${email}`);
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Compare passwords
    console.log('Comparing passwords');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create JWT token
    console.log('Creating JWT token');
    // Include hospitalId in the token if the user is a hospital_admin
    const tokenPayload = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    };

    // Add hospitalId to token payload if it exists
    if (user.hospitalId) {
      console.log(`Including hospitalId in token: ${user.hospitalId}`);
      tokenPayload.hospitalId = user.hospitalId;
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send success response
    console.log('Login successful, sending response');
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      redirectUrl: user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Get current user information
 * @route GET /api/user/me
 * @access Private
 */
exports.getCurrentUser = async (req, res) => {
  try {
    console.log('Getting current user info for user ID:', req.user.id);

    // Find user by ID (excluding password)
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send user data
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        hospitalId: user.hospitalId
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Register new user
 * @route POST /api/user/register
 * @access Public
 */
exports.registerUser = async (req, res) => {
  console.log('Register request received:', req.body);

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      address,
      emergencyContact,
      bloodType,
      allergies,
      chronicConditions,
      role
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role: role || 'patient',
      profile: {
        phone,
        dateOfBirth,
        address,
        emergencyContact,
        bloodType,
        allergies,
        chronicConditions
      }
    });

    // Save user to database
    await user.save();

    // Create JWT token
    // Include hospitalId in the token if the user has one
    const tokenPayload = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email
    };

    // Add hospitalId to token payload if it exists
    if (user.hospitalId) {
      console.log(`Including hospitalId in token: ${user.hospitalId}`);
      tokenPayload.hospitalId = user.hospitalId;
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      redirectUrl: user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
