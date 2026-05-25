const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const marketService = require('../services/marketService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { calculateHoldingMetrics } = require('../utils/finance');

const ensurePortfolio = async (userId) => {
  let portfolio = await Portfolio.findOne({ user: userId });

  if (!portfolio) {
    portfolio = await Portfolio.create({ user: userId });
  }

  return portfolio;
};

const getPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await ensurePortfolio(req.user._id);
  const holdings = await Holding.find({ user: req.user._id, portfolio: portfolio._id }).sort({ updatedAt: -1 });
  const enrichedHoldings = holdings.map((holding) => ({
    ...holding.toObject(),
    metrics: calculateHoldingMetrics(holding),
  }));

  return sendSuccess(res, 200, 'Portfolio loaded successfully', {
    portfolio,
    holdings: enrichedHoldings,
  });
});

const getPortfolioAnalytics = asyncHandler(async (req, res) => {
  const portfolio = await ensurePortfolio(req.user._id);
  const holdings = await Holding.find({ user: req.user._id, portfolio: portfolio._id });
  const metrics = holdings.map(calculateHoldingMetrics);
  const investedValue = metrics.reduce((sum, item) => sum + item.invested, 0);
  const currentValue = metrics.reduce((sum, item) => sum + item.currentValue, 0);
  const totalPnL = currentValue - investedValue;

  const allocationMap = holdings.reduce((acc, holding, index) => {
    const key = holding.assetType;
    acc[key] = (acc[key] || 0) + metrics[index].currentValue;
    return acc;
  }, {});

  const allocation = Object.entries(allocationMap).map(([label, value]) => ({
    label,
    amount: Number(value.toFixed(2)),
    value: currentValue > 0 ? Number(((value / currentValue) * 100).toFixed(2)) : 0,
  }));

  return sendSuccess(res, 200, 'Portfolio analytics loaded successfully', {
    summary: {
      cashBalance: portfolio.cashBalance,
      investedValue: Number(investedValue.toFixed(2)),
      portfolioValue: Number((portfolio.cashBalance + currentValue).toFixed(2)),
      currentValue: Number(currentValue.toFixed(2)),
      totalPnL: Number(totalPnL.toFixed(2)),
      totalPnLPercent: investedValue > 0 ? Number(((totalPnL / investedValue) * 100).toFixed(2)) : 0,
      realizedPnL: portfolio.realizedPnL,
      riskScore: portfolio.riskScore,
    },
    allocation,
    holdings: holdings.map((holding, index) => ({ ...holding.toObject(), metrics: metrics[index] })),
  });
});

const addHolding = asyncHandler(async (req, res) => {
  const { symbol, assetType, quantity } = req.body;
  const portfolio = await ensurePortfolio(req.user._id);
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
    existing.quantity = totalQuantity;
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

module.exports = { getPortfolio, getPortfolioAnalytics, addHolding, updateHolding, removeHolding, ensurePortfolio };
