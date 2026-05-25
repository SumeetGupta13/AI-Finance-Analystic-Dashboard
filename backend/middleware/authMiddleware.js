const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { env } = require('../config/env');

const getTokenFromRequest = (req) => {
  const authorization = req.headers.authorization || '';

  if (authorization.startsWith('Bearer ')) {
    return authorization.split(' ')[1];
  }

  return req.cookies?.token || null;
};

const protect = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    res.status(401);
    throw new Error('Authentication token is required');
  }

  const decoded = jwt.verify(token, env.jwtSecret);
  const User = require('../models/User');
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('User session is no longer valid');
  }

  req.user = user;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    return next(new Error('You do not have permission to access this resource'));
  }

  return next();
};

module.exports = { protect, authorize };
