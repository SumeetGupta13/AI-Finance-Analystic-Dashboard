const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getSettings = asyncHandler(async (req, res) => {
  const [user, portfolio] = await Promise.all([
    User.findById(req.user._id),
    Portfolio.findOne({ user: req.user._id }),
  ]);

  return sendSuccess(res, 200, 'Settings loaded successfully', { user, portfolio });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updates = {};

  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.avatar !== undefined) updates.avatar = req.body.avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, 200, 'Profile updated successfully', user);
});

const updatePreferences = asyncHandler(async (req, res) => {
  const updates = {};

  for (const key of ['currency', 'defaultMarket', 'riskProfile']) {
    if (req.body[key] !== undefined) {
      updates[`preferences.${key}`] = req.body[key];
    }
  }

  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, {
    new: true,
    runValidators: true,
  });

  return sendSuccess(res, 200, 'Preferences updated successfully', user);
});

module.exports = { getSettings, updateProfile, updatePreferences };
