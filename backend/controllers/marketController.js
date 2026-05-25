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

const getCryptoMarkets = asyncHandler(async (req, res) => {
  const data = await marketService.getCryptoMarkets(req.query);
  return sendSuccess(res, 200, 'Crypto markets loaded successfully', data, { count: data.length });
});

const getMutualFunds = asyncHandler(async (req, res) => {
  const data = await marketService.getMutualFunds(req.query);
  return sendSuccess(res, 200, 'Mutual funds loaded successfully', data, { count: data.length });
});

const getTrending = asyncHandler(async (req, res) => {
  const data = await marketService.getTrendingStocks();
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

const getMarketNews = asyncHandler(async (req, res) => {
  const data = await marketService.getMarketNews(req.query);
  return sendSuccess(res, 200, 'Market news loaded successfully', data, { count: data.length });
});

const getMarketTrends = asyncHandler(async (req, res) => {
  const data = await marketService.getMarketTrends();
  return sendSuccess(res, 200, 'Market trends loaded successfully', data);
});

module.exports = {
  getStocks,
  getStockBySymbol,
  getCryptoMarkets,
  getMutualFunds,
  getTrending,
  getTopGainers,
  getTopLosers,
  getHistoricalData,
  getMarketNews,
  getMarketTrends,
};
