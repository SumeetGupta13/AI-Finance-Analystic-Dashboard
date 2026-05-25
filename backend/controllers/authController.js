const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { generateToken, getCookieOptions } = require('../utils/generateToken');
const { env } = require('../config/env');

const publicUserFields = '_id name email avatar role preferences createdAt updatedAt';

const setAuthCookie = (res, token) => {
  res.cookie('token', token, getCookieOptions());
};

const buildAuthPayload = (user, token) => ({
  user,
  token,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  await Portfolio.create({ user: user._id });
  const token = generateToken(user._id);
  setAuthCookie(res, token);

  return sendSuccess(res, 201, 'Account created successfully', buildAuthPayload(user, token));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user._id);
  setAuthCookie(res, token);

  const safeUser = await User.findById(user._id).select(publicUserFields);
  return sendSuccess(res, 200, 'Logged in successfully', buildAuthPayload(safeUser, token));
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    ...getCookieOptions(),
    maxAge: 0,
  });

  return sendSuccess(res, 200, 'Logged out successfully', null);
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(publicUserFields);

  return sendSuccess(res, 200, 'Profile loaded successfully', {
    user,
    session: {
      authenticated: true,
      environment: env.nodeEnv,
    },
  });
});

module.exports = { register, login, logout, getProfile };
