const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('emergencyContact').notEmpty().withMessage('Emergency contact is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

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

        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists with this email' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

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

            await user.save();

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Error registering user', error: error.message });
        }
    }
];

exports.login = async (req, res) => {
  console.log('Login endpoint hit with body:', req.body);

  // Check if request body is empty
  if (!req.body || Object.keys(req.body).length === 0) {
    console.log('Empty request body received');
    return res.status(400).json({ message: 'Request body is empty' });
  }

  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    console.log('Missing required fields:', { email: !!email, password: !!password });
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    console.log(`Attempting to find user with email: ${email}`);
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`User found: ${user._id}, comparing passwords`);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    console.log('Password matched, generating token');
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

    console.log(`Login successful for user: ${user._id}, role: ${user.role}`);

    // Send response with user data, token, and redirect URL
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      },
      token,
      redirectUrl: user.role === 'super_admin' ? '/admin/dashboard' : '/dashboard'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

/**
 * Get current user information
 * Protected route - requires authentication
 */
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already attached to req by the auth middleware
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};