const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Authentication token is missing');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fittrack-dev-secret');

    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user || !user.isActive) {
      return errorResponse(res, 401, 'User account is not active or not found');
    }

    req.user = user;
    next();
  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired token');
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return errorResponse(res, 403, 'Admin access required');
  }
  next();
};

module.exports = { protect, adminOnly };
