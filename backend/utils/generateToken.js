const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

const getCookieOptions = () => {
  const maxAge = env.jwtCookieExpiresIn * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge,
  };
};

module.exports = { generateToken, getCookieOptions };
