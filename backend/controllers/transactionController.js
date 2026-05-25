const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const marketService = require('../services/marketService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { calculateCharges } = require('../utils/finance');
const { ensurePortfolio } = require('./portfolioController');

const createRejectedTransaction = async ({ req, portfolio, asset, type, quantity, reason }) => {
  const price = asset?.price || asset?.nav || 0;
  const grossAmount = quantity * price;
  const charges = calculateCharges(grossAmount);

  return Transaction.create({
    user: req.user._id,
    portfolio: portfolio._id,
    type,
    assetType: req.body.assetType,
    symbol: String(req.body.symbol).toUpperCase(),
    name: asset?.name || String(req.body.symbol).toUpperCase(),
    quantity,
    price: price || 0.000001,
    grossAmount,
    charges,
    netAmount: grossAmount + charges,
    status: 'rejected',
    rejectionReason: reason,
  });
};

const buy = asyncHandler(async (req, res) => {
  const { symbol, assetType, quantity } = req.body;
  const portfolio = await ensurePortfolio(req.user._id);
  const asset = await marketService.getAssetBySymbol(symbol);

  if (!asset || asset.assetType !== assetType) {
    res.status(404);
    throw new Error('Asset not found in market universe');
  }

  const price = asset.price || asset.nav;
  const grossAmount = Number((quantity * price).toFixed(2));
  const charges = calculateCharges(grossAmount);
  const netAmount = Number((grossAmount + charges).toFixed(2));

  if (portfolio.cashBalance < netAmount) {
    const rejected = await createRejectedTransaction({
      req,
      portfolio,
      asset,
      type: 'buy',
      quantity,
      reason: 'Insufficient virtual cash balance',
    });
    return sendSuccess(res, 200, 'Buy order rejected', rejected);
  }

  let holding = await Holding.findOne({ user: req.user._id, symbol: asset.symbol, assetType });

  if (holding) {
    const totalQuantity = holding.quantity + quantity;
    const totalCost = holding.quantity * holding.averagePrice + grossAmount;
    holding.quantity = totalQuantity;
    holding.averagePrice = Number((totalCost / totalQuantity).toFixed(4));
    holding.lastPriceSnapshot = price;
    holding = await holding.save();
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

  portfolio.cashBalance = Number((portfolio.cashBalance - netAmount).toFixed(2));
  portfolio.totalInvested = Number((portfolio.totalInvested + grossAmount).toFixed(2));
  await portfolio.save();

  const transaction = await Transaction.create({
    user: req.user._id,
    portfolio: portfolio._id,
    type: 'buy',
    assetType,
    symbol: asset.symbol,
    name: asset.name,
    quantity,
    price,
    grossAmount,
    charges,
    netAmount,
    status: 'completed',
  });

  return sendSuccess(res, 201, 'Buy order completed', { transaction, holding, portfolio });
});

const sell = asyncHandler(async (req, res) => {
  const { symbol, assetType, quantity } = req.body;
  const portfolio = await ensurePortfolio(req.user._id);
  const asset = await marketService.getAssetBySymbol(symbol);
  const holding = await Holding.findOne({ user: req.user._id, symbol: String(symbol).toUpperCase(), assetType });

  if (!asset || !holding) {
    res.status(404);
    throw new Error('Holding not found for this asset');
  }

  if (holding.quantity < quantity) {
    const rejected = await createRejectedTransaction({
      req,
      portfolio,
      asset,
      type: 'sell',
      quantity,
      reason: 'Sell quantity exceeds available holding',
    });
    return sendSuccess(res, 200, 'Sell order rejected', rejected);
  }

  const price = asset.price || asset.nav;
  const grossAmount = Number((quantity * price).toFixed(2));
  const charges = calculateCharges(grossAmount);
  const netAmount = Number((grossAmount - charges).toFixed(2));
  const realizedPnL = Number(((price - holding.averagePrice) * quantity - charges).toFixed(2));

  holding.quantity = Number((holding.quantity - quantity).toFixed(6));
  holding.lastPriceSnapshot = price;

  if (holding.quantity === 0) {
    await holding.deleteOne();
  } else {
    await holding.save();
  }

  portfolio.cashBalance = Number((portfolio.cashBalance + netAmount).toFixed(2));
  portfolio.realizedPnL = Number((portfolio.realizedPnL + realizedPnL).toFixed(2));
  await portfolio.save();

  const transaction = await Transaction.create({
    user: req.user._id,
    portfolio: portfolio._id,
    type: 'sell',
    assetType,
    symbol: asset.symbol,
    name: asset.name,
    quantity,
    price,
    grossAmount,
    charges,
    netAmount,
    status: 'completed',
  });

  return sendSuccess(res, 201, 'Sell order completed', { transaction, portfolio });
});

const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
  return sendSuccess(res, 200, 'Transactions loaded successfully', transactions, { count: transactions.length });
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.transactionId, user: req.user._id });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  return sendSuccess(res, 200, 'Transaction loaded successfully', transaction);
});

module.exports = { buy, sell, getTransactions, getTransactionById };
