const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes
 * Verifies JWT token and attaches user to request
 */
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      console.log('UserAuth middleware: Verifying token:', token.substring(0, 10) + '...');
      console.log('UserAuth middleware: JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'NOT SET');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('UserAuth middleware: Token verified successfully for user:', decoded.id);

      // Add user to request (excluding password)
      req.user = {
        id: decoded.id,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email
      };

      console.log('UserAuth middleware: User set:', decoded.id, 'Role:', decoded.role);
      next();
    } catch (error) {
      console.error('UserAuth middleware error:', error.message);
      console.error('UserAuth middleware error type:', error.name);
      console.error('UserAuth middleware token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'No token');
      console.error('UserAuth middleware JWT_SECRET exists:', !!process.env.JWT_SECRET);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token signature' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
      }

      res.status(401).json({ success: false, message: 'Not authorized' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

/**
 * Middleware to restrict access based on user role
 * @param {...String} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }

    next();
  };
};
