const marketService = require('../services/marketService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getStocks = asyncHandler(async (req, res) => {
  const data = await marketService.getStocks(req.query);
  return sendSuccess(res, 200, 'Stocks loaded successfully', data, { count: data.length });
});

const getStockBySymbol = asyncHandler(async (req, res) => {
  const stock = await marketService.getStockBySymbol(req.params.symbol);

  if (!stock) {
    res.status(404);
    throw new Error('Stock not found');
  }

  return sendSuccess(res, 200, 'Stock loaded successfully', stock);
});

const getStockQuote = asyncHandler(async (req, res) => {
  const quote = await marketService.getStockQuote(req.params.symbol);

  if (!quote) {
    res.status(404);
    throw new Error('Stock quote not found');
  }

  return sendSuccess(res, 200, 'Stock quote loaded successfully', quote);
});

const getBatchQuotes = asyncHandler(async (req, res) => {
  const symbols = Array.isArray(req.body?.symbols) ? req.body.symbols : [];
  const quotes = await marketService.getQuotes(symbols);
  return sendSuccess(res, 200, 'Stock quotes loaded successfully', quotes, { count: quotes.length });
});

const getCompanyProfile = asyncHandler(async (req, res) => {
  const profile = await marketService.getCompanyProfile(req.params.symbol);

  if (!profile) {
    res.status(404);
    throw new Error('Company profile not found');
  }

  return sendSuccess(res, 200, 'Company profile loaded successfully', profile);
});

const getCryptoMarkets = asyncHandler(async (req, res) => {
  const data = await marketService.getCryptoMarkets(req.query);
  return sendSuccess(res, 200, 'Crypto markets loaded successfully', data, { count: data.length });
});

const getTrendingCrypto = asyncHandler(async (req, res) => {
  const data = await marketService.getTrendingCrypto(req.query.limit);
  return sendSuccess(res, 200, 'Trending crypto loaded successfully', data, { count: data.length });
});

const getMutualFunds = asyncHandler(async (req, res) => {
  const data = await marketService.getMutualFunds(req.query);
  return sendSuccess(res, 200, 'Mutual funds loaded successfully', data, { count: data.length });
});

const getTrending = asyncHandler(async (req, res) => {
  const data = await marketService.getTrendingStocks(req.query.limit);
  return sendSuccess(res, 200, 'Trending assets loaded successfully', data, { count: data.length });
});

const getTopGainers = asyncHandler(async (req, res) => {
  const data = await marketService.getTopGainers(req.query.limit);
  return sendSuccess(res, 200, 'Top gainers loaded successfully', data, { count: data.length });
});

const getTopLosers = asyncHandler(async (req, res) => {
  const data = await marketService.getTopLosers(req.query.limit);
  return sendSuccess(res, 200, 'Top losers loaded successfully', data, { count: data.length });
});

const getHistoricalData = asyncHandler(async (req, res) => {
  const data = await marketService.getHistoricalData(req.params.symbol, req.query.range);
  return sendSuccess(res, 200, 'Historical prices loaded successfully', data, { count: data.candles.length });
});

const getFinancialMetrics = asyncHandler(async (req, res) => {
  const data = await marketService.getFinancialMetrics(req.params.symbol);

  if (!data) {
    res.status(404);
    throw new Error('Financial metrics not found');
  }

  return sendSuccess(res, 200, 'Financial metrics loaded successfully', data);
});

const getMarketNews = asyncHandler(async (req, res) => {
  const data = await marketService.getMarketNews(req.query);
  return sendSuccess(res, 200, 'Market news loaded successfully', data, { count: data.length });
});

const getMarketTrends = asyncHandler(async (req, res) => {
  const data = await marketService.getMarketTrends();
  return sendSuccess(res, 200, 'Market trends loaded successfully', data);
});

const getSentimentAnalysis = asyncHandler(async (req, res) => {
  const data = await marketService.getSentimentAnalysis(req.query);
  return sendSuccess(res, 200, 'Sentiment analysis loaded successfully', data, { count: data.length });
});

const getAIInsights = asyncHandler(async (req, res) => {
  const data = await marketService.getAIInsights(req.query);
  return sendSuccess(res, 200, 'AI insights loaded successfully', data);
});

module.exports = {
  getStocks,
  getStockBySymbol,
  getStockQuote,
  getBatchQuotes,
  getCompanyProfile,
  getCryptoMarkets,
  getTrendingCrypto,
  getMutualFunds,
  getTrending,
  getTopGainers,
  getTopLosers,
  getHistoricalData,
  getFinancialMetrics,
  getMarketNews,
  getMarketTrends,
  getSentimentAnalysis,
  getAIInsights,
};
