const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const marketService = require('./marketService');
const { calculateCharges, calculateHoldingMetrics } = require('../utils/finance');

const INITIAL_WALLET_BALANCE = 100000;
const dataDirectory = path.join(__dirname, '..', 'data');

const round = (value, digits = 2) => Number((Number(value) || 0).toFixed(digits));
const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();
const useMockDatabase = () => process.env.NODE_ENV !== 'production' && mongoose.connection.readyState !== 1;
const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(dataDirectory, fileName), 'utf8'));

const buildMockAnalytics = () => {
  const analytics = readJson('portfolioAnalytics.json');
  const holdings = (analytics.holdings || []).map((holding, index) => {
    const lastPriceSnapshot = holding.lastPriceSnapshot || holding.lastPrice || holding.averagePrice;
    const view = {
      _id: holding._id || `mock_holding_${index + 1}`,
      exchange: holding.exchange || 'NSE',
      ...holding,
      lastPriceSnapshot,
    };

    return {
      ...view,
      metrics: calculateHoldingMetrics(view),
    };
  });
  const investedValue = holdings.reduce((sum, holding) => sum + holding.metrics.invested, 0);
  const currentValue = holdings.reduce((sum, holding) => sum + holding.metrics.currentValue, 0);
  const unrealizedPnL = currentValue - investedValue;

  return {
    ...analytics,
    summary: {
      initialWalletBalance: INITIAL_WALLET_BALANCE,
      walletBalance: analytics.summary.cashBalance,
      currentValue: round(currentValue),
      realizedPnL: 0,
      unrealizedPnL: round(unrealizedPnL),
      ...analytics.summary,
    },
    holdings,
  };
};

const ensurePortfolio = async (userId) => {
  if (useMockDatabase()) {
    const analytics = buildMockAnalytics();
    return {
      _id: 'mock_portfolio',
      user: userId,
      cashBalance: analytics.summary.cashBalance,
      currency: 'INR',
      totalInvested: analytics.summary.investedValue,
      realizedPnL: analytics.summary.realizedPnL || 0,
      riskScore: analytics.summary.riskScore,
    };
  }

  let portfolio = await Portfolio.findOne({ user: userId });

  if (!portfolio) {
    portfolio = await Portfolio.create({ user: userId, cashBalance: INITIAL_WALLET_BALANCE });
  }

  return portfolio;
};

const getAssetPrice = (asset) => Number(asset?.price || asset?.nav || 0);

const buildMockTradeTransaction = ({ userId, portfolio, asset, type, quantity, price, grossAmount, charges, netAmount, profitLoss = 0, status = 'completed', rejectionReason = '' }) => ({
  _id: `txn_mock_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
  user: userId,
  portfolio: portfolio._id,
  type,
  category: 'Virtual Trading',
  title: `${type === 'stock_buy' ? 'Buy' : 'Sell'} ${quantity} ${asset?.symbol || ''}`.trim(),
  amount: netAmount,
  assetType: asset?.assetType || 'stock',
  symbol: asset?.symbol || '',
  stockSymbol: asset?.symbol || '',
  name: asset?.name || asset?.symbol || '',
  stockName: asset?.name || asset?.symbol || '',
  quantity,
  price,
  grossAmount,
  totalValue: grossAmount,
  charges,
  fees: charges,
  netAmount,
  profitLoss,
  paymentMethod: 'virtual_wallet',
  notes: rejectionReason,
  status,
  rejectionReason,
  transactionDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const enrichHolding = async (holding) => {
  const asset = await marketService.getAssetBySymbol(holding.symbol).catch(() => null);
  const currentPrice = getAssetPrice(asset) || holding.lastPriceSnapshot || holding.averagePrice;
  const view = {
    ...holding.toObject(),
    lastPriceSnapshot: currentPrice,
    sector: asset?.sector || asset?.category || 'Unclassified',
    marketAsset: asset,
  };

  return {
    ...view,
    metrics: calculateHoldingMetrics(view),
  };
};

const getHoldings = async (userId, portfolioId) => {
  const holdings = await Holding.find({ user: userId, portfolio: portfolioId }).sort({ updatedAt: -1 });
  return Promise.all(holdings.map(enrichHolding));
};

const recalculatePortfolioTotals = async (portfolio) => {
  const holdings = await Holding.find({ user: portfolio.user, portfolio: portfolio._id });
  const totalInvested = holdings.reduce((sum, holding) => sum + holding.quantity * holding.averagePrice, 0);
  portfolio.totalInvested = round(totalInvested);
  await portfolio.save();
  return portfolio;
};

const buildAnalytics = async (userId) => {
  if (useMockDatabase()) {
    return buildMockAnalytics();
  }

  const portfolio = await ensurePortfolio(userId);
  const holdings = await getHoldings(userId, portfolio._id);
  const metrics = holdings.map((holding) => holding.metrics);
  const investedValue = metrics.reduce((sum, item) => sum + item.invested, 0);
  const currentValue = metrics.reduce((sum, item) => sum + item.currentValue, 0);
  const unrealizedPnL = currentValue - investedValue;
  const totalPnL = portfolio.realizedPnL + unrealizedPnL;

  const allocationMap = holdings.reduce((acc, holding) => {
    const key = holding.assetType;
    acc[key] = (acc[key] || 0) + holding.metrics.currentValue;
    return acc;
  }, {});

  const sectorMap = holdings.reduce((acc, holding) => {
    const key = holding.sector || 'Unclassified';
    acc[key] = (acc[key] || 0) + holding.metrics.currentValue;
    return acc;
  }, {});

  const allocation = Object.entries(allocationMap).map(([label, value]) => ({
    label,
    amount: round(value),
    value: currentValue > 0 ? round((value / currentValue) * 100) : 0,
  }));

  const sectorExposure = Object.entries(sectorMap).map(([label, value]) => ({
    label,
    amount: round(value),
    value: currentValue > 0 ? round((value / currentValue) * 100) : 0,
  }));

  return {
    summary: {
      initialWalletBalance: INITIAL_WALLET_BALANCE,
      cashBalance: round(portfolio.cashBalance),
      walletBalance: round(portfolio.cashBalance),
      investedValue: round(investedValue),
      portfolioValue: round(portfolio.cashBalance + currentValue),
      currentValue: round(currentValue),
      realizedPnL: round(portfolio.realizedPnL),
      unrealizedPnL: round(unrealizedPnL),
      totalPnL: round(totalPnL),
      totalPnLPercent: investedValue > 0 ? round((unrealizedPnL / investedValue) * 100) : 0,
      riskScore: portfolio.riskScore,
    },
    allocation,
    sectorExposure,
    holdings,
  };
};

const createTradeTransaction = async ({
  userId,
  portfolio,
  asset,
  type,
  quantity,
  price,
  grossAmount,
  charges,
  netAmount,
  profitLoss = 0,
  status = 'completed',
  rejectionReason = '',
  notes = '',
}) => {
  const isBuy = type === 'stock_buy';

  return Transaction.create({
    user: userId,
    portfolio: portfolio._id,
    type,
    category: 'Virtual Trading',
    title: `${isBuy ? 'Buy' : 'Sell'} ${quantity} ${asset?.symbol || ''}`.trim(),
    amount: netAmount,
    assetType: asset?.assetType || 'stock',
    symbol: asset?.symbol || '',
    stockSymbol: asset?.symbol || '',
    name: asset?.name || asset?.symbol || '',
    stockName: asset?.name || asset?.symbol || '',
    quantity,
    price,
    grossAmount,
    totalValue: grossAmount,
    charges,
    fees: charges,
    netAmount,
    profitLoss,
    paymentMethod: 'virtual_wallet',
    notes,
    status,
    rejectionReason,
  });
};

const createRejectedTrade = async ({ userId, portfolio, asset, type, quantity, reason }) => {
  const price = getAssetPrice(asset);
  const grossAmount = round(quantity * price);
  const charges = calculateCharges(grossAmount);
  const netAmount = type === 'stock_sell' ? Math.max(round(grossAmount - charges), 0) : round(grossAmount + charges);

  return createTradeTransaction({
    userId,
    portfolio,
    asset,
    type,
    quantity,
    price,
    grossAmount,
    charges,
    netAmount,
    status: 'rejected',
    rejectionReason: reason,
    notes: reason,
  });
};

const buyAsset = async (userId, { symbol, assetType = 'stock', quantity }) => {
  const portfolio = await ensurePortfolio(userId);
  const normalizedSymbol = normalizeSymbol(symbol);
  const tradeQuantity = Number(quantity);
  const asset = await marketService.getAssetBySymbol(normalizedSymbol);

  if (!asset || asset.assetType !== assetType) {
    const error = new Error('Asset not found in market universe');
    error.statusCode = 404;
    throw error;
  }

  const price = getAssetPrice(asset);
  const grossAmount = round(tradeQuantity * price);
  const charges = calculateCharges(grossAmount);
  const netAmount = round(grossAmount + charges);

  if (portfolio.cashBalance < netAmount) {
    if (useMockDatabase()) {
      const transaction = buildMockTradeTransaction({
        userId,
        portfolio,
        asset,
        type: 'stock_buy',
        quantity: tradeQuantity,
        price,
        grossAmount,
        charges,
        netAmount,
        status: 'rejected',
        rejectionReason: 'Insufficient virtual wallet balance',
      });

      return { status: 'rejected', transaction, portfolio, reason: transaction.rejectionReason };
    }

    const transaction = await createRejectedTrade({
      userId,
      portfolio,
      asset,
      type: 'stock_buy',
      quantity: tradeQuantity,
      reason: 'Insufficient virtual wallet balance',
    });

    return { status: 'rejected', transaction, portfolio, reason: transaction.rejectionReason };
  }

  if (useMockDatabase()) {
    const transaction = buildMockTradeTransaction({
      userId,
      portfolio,
      asset,
      type: 'stock_buy',
      quantity: tradeQuantity,
      price,
      grossAmount,
      charges,
      netAmount,
    });
    const holding = {
      _id: `holding_mock_${asset.symbol}`,
      user: userId,
      portfolio: portfolio._id,
      assetType,
      symbol: asset.symbol,
      name: asset.name,
      exchange: asset.exchange || 'NSE',
      quantity: tradeQuantity,
      averagePrice: price,
      lastPriceSnapshot: price,
    };

    return { status: 'completed', transaction, holding, portfolio: { ...portfolio, cashBalance: round(portfolio.cashBalance - netAmount) } };
  }

  let holding = await Holding.findOne({ user: userId, symbol: asset.symbol, assetType });

  if (holding) {
    const totalQuantity = holding.quantity + tradeQuantity;
    const totalCost = holding.quantity * holding.averagePrice + grossAmount;
    holding.quantity = round(totalQuantity, 6);
    holding.averagePrice = round(totalCost / totalQuantity, 4);
    holding.lastPriceSnapshot = price;
    holding = await holding.save();
  } else {
    holding = await Holding.create({
      user: userId,
      portfolio: portfolio._id,
      assetType,
      symbol: asset.symbol,
      name: asset.name,
      exchange: asset.exchange || 'NSE',
      quantity: tradeQuantity,
      averagePrice: price,
      lastPriceSnapshot: price,
    });
  }

  portfolio.cashBalance = round(portfolio.cashBalance - netAmount);
  await recalculatePortfolioTotals(portfolio);

  const transaction = await createTradeTransaction({
    userId,
    portfolio,
    asset,
    type: 'stock_buy',
    quantity: tradeQuantity,
    price,
    grossAmount,
    charges,
    netAmount,
  });

  return { status: 'completed', transaction, holding, portfolio };
};

const sellAsset = async (userId, { symbol, assetType = 'stock', quantity }) => {
  const portfolio = await ensurePortfolio(userId);
  const normalizedSymbol = normalizeSymbol(symbol);
  const tradeQuantity = Number(quantity);
  const asset = await marketService.getAssetBySymbol(normalizedSymbol);

  if (useMockDatabase()) {
    const analytics = buildMockAnalytics();
    const holding = analytics.holdings.find((item) => item.symbol === normalizedSymbol && item.assetType === assetType);

    if (!asset || asset.assetType !== assetType || !holding) {
      const error = new Error('Holding not found for this asset');
      error.statusCode = 404;
      throw error;
    }

    const price = getAssetPrice(asset);
    const grossAmount = round(tradeQuantity * price);
    const charges = calculateCharges(grossAmount);
    const netAmount = round(Math.max(grossAmount - charges, 0));

    if (holding.quantity < tradeQuantity) {
      const transaction = buildMockTradeTransaction({
        userId,
        portfolio,
        asset,
        type: 'stock_sell',
        quantity: tradeQuantity,
        price,
        grossAmount,
        charges,
        netAmount,
        status: 'rejected',
        rejectionReason: 'Sell quantity exceeds available holding',
      });

      return { status: 'rejected', transaction, portfolio, reason: transaction.rejectionReason };
    }

    const profitLoss = round((price - holding.averagePrice) * tradeQuantity - charges);
    const transaction = buildMockTradeTransaction({
      userId,
      portfolio,
      asset,
      type: 'stock_sell',
      quantity: tradeQuantity,
      price,
      grossAmount,
      charges,
      netAmount,
      profitLoss,
    });

    return { status: 'completed', transaction, portfolio: { ...portfolio, cashBalance: round(portfolio.cashBalance + netAmount) }, profitLoss };
  }

  const holding = await Holding.findOne({ user: userId, symbol: normalizedSymbol, assetType });

  if (!asset || asset.assetType !== assetType || !holding) {
    const error = new Error('Holding not found for this asset');
    error.statusCode = 404;
    throw error;
  }

  if (holding.quantity < tradeQuantity) {
    const transaction = await createRejectedTrade({
      userId,
      portfolio,
      asset,
      type: 'stock_sell',
      quantity: tradeQuantity,
      reason: 'Sell quantity exceeds available holding',
    });

    return { status: 'rejected', transaction, portfolio, reason: transaction.rejectionReason };
  }

  const price = getAssetPrice(asset);
  const grossAmount = round(tradeQuantity * price);
  const charges = calculateCharges(grossAmount);
  const netAmount = round(Math.max(grossAmount - charges, 0));
  const profitLoss = round((price - holding.averagePrice) * tradeQuantity - charges);

  holding.quantity = round(holding.quantity - tradeQuantity, 6);
  holding.lastPriceSnapshot = price;

  if (holding.quantity <= 0) {
    await holding.deleteOne();
  } else {
    await holding.save();
  }

  portfolio.cashBalance = round(portfolio.cashBalance + netAmount);
  portfolio.realizedPnL = round(portfolio.realizedPnL + profitLoss);
  await recalculatePortfolioTotals(portfolio);

  const transaction = await createTradeTransaction({
    userId,
    portfolio,
    asset,
    type: 'stock_sell',
    quantity: tradeQuantity,
    price,
    grossAmount,
    charges,
    netAmount,
    profitLoss,
  });

  return { status: 'completed', transaction, portfolio, profitLoss };
};

const getPortfolio = async (userId) => {
  if (useMockDatabase()) {
    const analytics = buildMockAnalytics();
    const portfolio = await ensurePortfolio(userId);

    return {
      portfolio,
      holdings: analytics.holdings,
      summary: analytics.summary,
    };
  }

  const portfolio = await ensurePortfolio(userId);
  const holdings = await getHoldings(userId, portfolio._id);
  const analytics = await buildAnalytics(userId);

  return {
    portfolio,
    holdings,
    summary: analytics.summary,
  };
};

const getPortfolioTransactions = async (userId) => {
  if (useMockDatabase()) {
    return readJson('transactions.json');
  }

  return Transaction.find({
    user: userId,
    type: { $in: ['stock_buy', 'stock_sell', 'buy', 'sell'] },
  }).sort({ transactionDate: -1, createdAt: -1 });
};

const getProfitLoss = async (userId) => {
  const analytics = await buildAnalytics(userId);
  const trades = await getPortfolioTransactions(userId);

  return {
    ...analytics.summary,
    winners: analytics.holdings
      .filter((holding) => holding.metrics.pnl >= 0)
      .sort((a, b) => b.metrics.pnl - a.metrics.pnl)
      .slice(0, 5),
    losers: analytics.holdings
      .filter((holding) => holding.metrics.pnl < 0)
      .sort((a, b) => a.metrics.pnl - b.metrics.pnl)
      .slice(0, 5),
    realizedTransactions: trades.filter((trade) => trade.type === 'stock_sell' && trade.status === 'completed'),
  };
};

module.exports = {
  INITIAL_WALLET_BALANCE,
  ensurePortfolio,
  getPortfolio,
  buildAnalytics,
  buyAsset,
  sellAsset,
  getPortfolioTransactions,
  getProfitLoss,
};
