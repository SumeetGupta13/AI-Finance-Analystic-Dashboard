const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { env } = require('../config/env');

const getHealth = asyncHandler(async (req, res) => {
  const databaseState = mongoose.connection.readyState;
  const databaseStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][databaseState] || 'unknown';

  return sendSuccess(res, 200, `${env.appName} API is healthy`, {
    service: 'stockiq-backend',
    environment: env.nodeEnv,
    marketDataMode: env.useMockData ? 'mock' : 'live',
    database: databaseStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = { getHealth };
