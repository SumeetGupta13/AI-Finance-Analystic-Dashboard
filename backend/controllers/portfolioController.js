const Holding = require('../models/Holding');
const marketService = require('../services/marketService');
const portfolioService = require('../services/portfolioService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getPortfolio = asyncHandler(async (req, res) => {
  const data = await portfolioService.getPortfolio(req.user._id);
  return sendSuccess(res, 200, 'Portfolio loaded successfully', data);
});

const getPortfolioAnalytics = asyncHandler(async (req, res) => {
  const data = await portfolioService.buildAnalytics(req.user._id);
  return sendSuccess(res, 200, 'Portfolio analytics loaded successfully', data);
});

const buy = asyncHandler(async (req, res) => {
  const data = await portfolioService.buyAsset(req.user._id, req.body);
  const message = data.status === 'rejected' ? 'Buy order rejected' : 'Buy order completed';
  return sendSuccess(res, data.status === 'rejected' ? 200 : 201, message, data);
});

const sell = asyncHandler(async (req, res) => {
  const data = await portfolioService.sellAsset(req.user._id, req.body);
  const message = data.status === 'rejected' ? 'Sell order rejected' : 'Sell order completed';
  return sendSuccess(res, data.status === 'rejected' ? 200 : 201, message, data);
});

const getPortfolioTransactions = asyncHandler(async (req, res) => {
  const transactions = await portfolioService.getPortfolioTransactions(req.user._id);
  return sendSuccess(res, 200, 'Portfolio transactions loaded successfully', transactions, { count: transactions.length });
});

const getProfitLoss = asyncHandler(async (req, res) => {
  const data = await portfolioService.getProfitLoss(req.user._id);
  return sendSuccess(res, 200, 'Portfolio profit and loss loaded successfully', data);
});

const addHolding = asyncHandler(async (req, res) => {
  const { symbol, assetType, quantity } = req.body;
  const portfolio = await portfolioService.ensurePortfolio(req.user._id);
  const asset = await marketService.getAssetBySymbol(symbol);

  if (!asset || asset.assetType !== assetType) {
    res.status(404);
    throw new Error('Asset not found in market universe');
  }

  const existing = await Holding.findOne({ user: req.user._id, symbol: asset.symbol, assetType });
  const price = asset.price || asset.nav;
  let holding;

  if (existing) {
    const totalQuantity = existing.quantity + quantity;
    const totalCost = existing.quantity * existing.averagePrice + quantity * price;
    existing.quantity = Number(totalQuantity.toFixed(6));
    existing.averagePrice = Number((totalCost / totalQuantity).toFixed(4));
    existing.lastPriceSnapshot = price;
    holding = await existing.save();
  } else {
    holding = await Holding.create({
      user: req.user._id,
      portfolio: portfolio._id,
      assetType,
      symbol: asset.symbol,
      name: asset.name,
      exchange: asset.exchange,
      quantity,
      averagePrice: price,
      lastPriceSnapshot: price,
    });
  }

  return sendSuccess(res, 201, 'Holding saved successfully', holding);
});

const updateHolding = asyncHandler(async (req, res) => {
  const holding = await Holding.findOne({ _id: req.params.holdingId, user: req.user._id });

  if (!holding) {
    res.status(404);
    throw new Error('Holding not found');
  }

  if (req.body.quantity !== undefined) {
    holding.quantity = req.body.quantity;
  }

  if (req.body.averagePrice !== undefined) {
    holding.averagePrice = req.body.averagePrice;
  }

  const updated = await holding.save();
  return sendSuccess(res, 200, 'Holding updated successfully', updated);
});

const removeHolding = asyncHandler(async (req, res) => {
  const holding = await Holding.findOneAndDelete({ _id: req.params.holdingId, user: req.user._id });

  if (!holding) {
    res.status(404);
    throw new Error('Holding not found');
  }

  return sendSuccess(res, 200, 'Holding removed successfully', holding);
});

module.exports = {
  getPortfolio,
  getPortfolioAnalytics,
  buy,
  sell,
  getPortfolioTransactions,
  getProfitLoss,
  addHolding,
  updateHolding,
  removeHolding,
};
