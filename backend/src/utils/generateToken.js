const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token and stores it in an HTTP-only cookie
 * @param {Object} res - Express response object
 * @param {String} userId - The database ID of the user
 * @returns {String} - The generated token
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  // Set JWT as HTTP-only cookie to prevent XSS attacks
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};

module.exports = generateToken;
