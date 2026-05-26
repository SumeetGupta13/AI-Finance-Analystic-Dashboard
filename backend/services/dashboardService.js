const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Watchlist = require('../models/Watchlist');
const portfolioService = require('./portfolioService');
const transactionService = require('./transactionService');
const marketService = require('./marketService');
const aiService = require('./aiService');

const dataDirectory = path.join(__dirname, '..', 'data');
const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(dataDirectory, fileName), 'utf8'));
const useMockDatabase = () => process.env.NODE_ENV !== 'production' && mongoose.connection.readyState !== 1;

const normalizeFund = (fund) => ({
  ...fund,
  price: fund.nav,
  exchange: 'AMFI',
  sector: fund.category,
  industry: fund.risk,
  previousClose: fund.nav / (1 + fund.changePercent / 100),
  marketCap: fund.aum,
});

const getWatchlists = async (userId) => {
  if (useMockDatabase()) {
    return readJson('watchlists.json');
  }

  return Watchlist.find({ user: userId }).sort({ updatedAt: -1 });
};

const settle = async (label, task, fallback) => {
  try {
    return { label, data: await task(), warning: null };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[Dashboard summary] ${label} failed; serving fallback segment.`);
    }

    return {
      label,
      data: fallback,
      warning: {
        section: label,
        message: error.message || 'Live data temporarily unavailable',
      },
    };
  }
};

const getSummary = async (userId, query = {}) => {
  const [
    portfolio,
    transactions,
    watchlists,
    marketTrends,
    trendingStocks,
    topGainers,
    topLosers,
    news,
    aiSummary,
    crypto,
    stocks,
    mutualFunds,
  ] = await Promise.all([
    settle('portfolio', () => portfolioService.buildAnalytics(userId), null),
    settle('transactions', () => transactionService.listTransactions(userId, { limit: 20 }), []),
    settle('watchlist', () => getWatchlists(userId), []),
    settle('marketTrends', () => marketService.getMarketTrends(), null),
    settle('trendingStocks', () => marketService.getTrendingStocks(query.trendingLimit || 10), []),
    settle('topGainers', () => marketService.getTopGainers(query.moverLimit || 5), []),
    settle('topLosers', () => marketService.getTopLosers(query.moverLimit || 5), []),
    settle('news', () => marketService.getMarketNews({ limit: query.newsLimit || 8 }), []),
    settle('aiSummary', () => aiService.getCombinedSummary(query), null),
    settle('crypto', () => marketService.getCryptoMarkets({ limit: query.cryptoLimit || 20 }), []),
    settle('stocks', () => marketService.getStocks(), []),
    settle('mutualFunds', () => marketService.getMutualFunds(), []),
  ]);

  const warnings = [
    portfolio,
    transactions,
    watchlists,
    marketTrends,
    trendingStocks,
    topGainers,
    topLosers,
    news,
    aiSummary,
    crypto,
    stocks,
    mutualFunds,
  ].map((item) => item.warning).filter(Boolean);

  return {
    portfolio: portfolio.data,
    marketIndices: marketTrends.data?.indices || [],
    marketTrends: marketTrends.data,
    trendingStocks: trendingStocks.data,
    topGainers: topGainers.data,
    topLosers: topLosers.data,
    watchlist: watchlists.data,
    transactions: transactions.data,
    news: news.data,
    aiSummary: aiSummary.data,
    crypto: crypto.data,
    marketUniverse: [...stocks.data, ...crypto.data, ...mutualFunds.data.map(normalizeFund)],
    warnings,
    isFallback: warnings.length > 0,
  };
};

module.exports = {
  getSummary,
};
