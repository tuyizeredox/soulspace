const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token and attaches the user to the request object
 */
const auth = async (req, res, next) => {
  let token = null; // Declare token variable in the outer scope

  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    token = authHeader.replace('Bearer ', '');

    // Verify token
    console.log('Auth middleware: Verifying token:', token.substring(0, 10) + '...');
    console.log('Auth middleware: JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'NOT SET');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware: Token verified successfully for user:', decoded.id);

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.error('Auth middleware: User not found for ID:', decoded.id);
      return res.status(401).json({ message: 'Token is valid but user not found' });
    }

    console.log('Auth middleware: User found:', user._id, 'Role:', user.role);

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    console.error('Auth middleware error type:', error.name);
    console.error('Auth middleware token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'No token');
    console.error('Auth middleware JWT_SECRET exists:', !!process.env.JWT_SECRET);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token signature' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = auth;
