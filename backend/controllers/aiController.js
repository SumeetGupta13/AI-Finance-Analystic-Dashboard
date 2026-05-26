const aiService = require('../services/aiService');
const portfolioService = require('../services/portfolioService');
const transactionService = require('../services/transactionService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getInsights = asyncHandler(async (req, res) => {
  const data = await aiService.getInsights(req.query);
  return sendSuccess(res, 200, 'AI insights loaded successfully', data);
});

const getRisk = asyncHandler(async (req, res) => {
  const data = await aiService.getRisk(req.query);
  return sendSuccess(res, 200, 'AI risk analysis loaded successfully', data);
});

const getSuggestions = asyncHandler(async (req, res) => {
  const data = await aiService.getSuggestions(req.query);
  return sendSuccess(res, 200, 'AI suggestions loaded successfully', data);
});

const getNewsSentiment = asyncHandler(async (req, res) => {
  const data = await aiService.getNewsSentiment(req.query);
  return sendSuccess(res, 200, 'AI news sentiment loaded successfully', data, { count: data.items.length });
});

const getMarketTrends = asyncHandler(async (req, res) => {
  const data = await aiService.getMarketTrends(req.query);
  return sendSuccess(res, 200, 'AI market trends loaded successfully', data);
});

const getSummary = asyncHandler(async (req, res) => {
  const data = await aiService.getCombinedSummary(req.query);
  return sendSuccess(res, 200, 'AI summary loaded successfully', data);
});

const getTransactionInsights = asyncHandler(async (req, res) => {
  const portfolioAnalytics = await portfolioService.buildAnalytics(req.user._id);
  const analytics = await transactionService.getAnalytics(req.user._id, req.query, portfolioAnalytics);
  return sendSuccess(res, 200, 'AI transaction insights loaded successfully', analytics.aiInsights);
});

module.exports = {
  getInsights,
  getRisk,
  getSuggestions,
  getNewsSentiment,
  getMarketTrends,
  getSummary,
  getTransactionInsights,
};
