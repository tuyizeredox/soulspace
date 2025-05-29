const jwt = require('jsonwebtoken');

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Log token details for debugging (first 10 characters only)
    console.log('Verifying token:', token.substring(0, 10) + '...');
    console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 'NOT SET');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully for user:', decoded.id);

    // Include all user information from the token
    req.user = {
      id: decoded.id, // Changed from userId to id to match the token structure
      role: decoded.role,
      name: decoded.name,
      email: decoded.email,
      hospitalId: decoded.hospitalId // Include hospitalId if available
    };

    // For hospital_admin role, try to get the hospitalId from the database if not in token
    if (decoded.role === 'hospital_admin' && !decoded.hospitalId) {
      try {
        const User = require('../models/User');
        const user = await User.findById(decoded.id).select('hospitalId');
        if (user && user.hospitalId) {
          req.user.hospitalId = user.hospitalId;
        }
      } catch (dbError) {
        console.error('Error fetching user hospitalId:', dbError);
        // Continue even if we couldn't get the hospitalId
      }
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    console.error('Error type:', error.name);
    console.error('Token (first 20 chars):', token.substring(0, 20) + '...');
    console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.error('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token signature' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token not active' });
    }

    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};
