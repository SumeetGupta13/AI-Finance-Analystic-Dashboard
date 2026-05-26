const fs = require('fs');
const path = require('path');
const { env } = require('../config/env');

const dataDirectory = path.join(__dirname, '..', 'data');

const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(dataDirectory, fileName), 'utf8'));

const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(toNumber(value), min), max);

const round = (value, digits = 2) => Number(toNumber(value).toFixed(digits));

const normalizeFund = (fund) => ({
  ...fund,
  symbol: normalizeSymbol(fund.symbol),
  price: fund.nav,
  exchange: 'AMFI',
  change: round((fund.nav * fund.changePercent) / 100),
  marketCap: fund.aum,
  sector: fund.category,
  industry: fund.risk,
});

const getMockUniverse = () => [
  ...readJson('stocks.json').map((stock) => ({ ...stock, symbol: normalizeSymbol(stock.symbol) })),
  ...readJson('crypto.json').map((asset) => ({ ...asset, symbol: normalizeSymbol(asset.symbol) })),
  ...readJson('mutualFunds.json').map(normalizeFund),
];

const getSentimentBySymbol = (symbol) => {
  const normalizedSymbol = normalizeSymbol(symbol);
  return readJson('newsSentiment.json').find((item) => normalizeSymbol(item.symbol) === normalizedSymbol) || null;
};

const getTrendSignalMap = () => {
  const trends = readJson('marketTrends.json');
  return new Map((trends.trendSignals || []).map((signal) => [normalizeSymbol(signal.symbol), signal]));
};

const inferVolumeChange = (asset) => {
  if (asset.averageVolume && asset.volume) {
    return clamp(10 + ((asset.volume - asset.averageVolume) / asset.averageVolume) * 50, 0, 20);
  }

  return clamp(8 + Math.abs(asset.changePercent || 0) * 3, 0, 20);
};

const buildTrendComponents = (asset, signalMap = getTrendSignalMap()) => {
  const sentiment = getSentimentBySymbol(asset.symbol);
  const configured = signalMap.get(normalizeSymbol(asset.symbol));

  return {
    priceMomentum: round(clamp(configured?.priceMomentum ?? 10 + (asset.changePercent || 0) * 3, 0, 20)),
    tradingVolume: round(clamp(configured?.volumeChange ?? inferVolumeChange(asset), 0, 20)),
    volumeChange: round(clamp(configured?.volumeChange ?? inferVolumeChange(asset), 0, 20)),
    newsImpact: round(clamp(configured?.newsImpact ?? 10 + (sentiment?.score || 0) * 10, 0, 20)),
    watchlistGrowth: round(configured?.watchlistGrowth ?? clamp(Math.abs(asset.changePercent || 0) * 3 + 4, 0, 20)),
    socialBuzz: round(configured?.socialBuzz ?? clamp((sentiment?.confidence || 50) / 6, 0, 20)),
  };
};

const getRecommendation = (trendScore, sentimentScore = 0, changePercent = 0) => {
  const adjustedScore = trendScore + sentimentScore * 10 + clamp(changePercent, -5, 5);

  if (adjustedScore >= 86) return 'Strong Buy';
  if (adjustedScore >= 70) return 'Buy';
  if (adjustedScore >= 45) return 'Hold';
  if (adjustedScore >= 28) return 'Sell';
  return 'Strong Sell';
};

const getSignal = (recommendation) => {
  if (recommendation === 'Strong Buy' || recommendation === 'Buy') return 'buy';
  if (recommendation === 'Strong Sell' || recommendation === 'Sell') return 'sell';
  return 'hold';
};

const calculateTrendScore = (asset, signalMap = getTrendSignalMap()) => {
  const components = buildTrendComponents(asset, signalMap);
  const trendScore = clamp(
    components.priceMomentum +
      components.tradingVolume +
      components.newsImpact +
      components.watchlistGrowth +
      components.socialBuzz,
    0,
    100
  );
  const sentiment = getSentimentBySymbol(asset.symbol);
  const recommendation = getRecommendation(trendScore, sentiment?.score || 0, asset.changePercent);

  return {
    ...asset,
    trendScore: round(trendScore),
    trendComponents: components,
    buySignal: getSignal(recommendation) === 'buy',
    sellSignal: getSignal(recommendation) === 'sell',
    signal: getSignal(recommendation),
    recommendation,
    sentiment: sentiment
      ? {
          label: sentiment.sentiment,
          score: sentiment.score,
          confidence: sentiment.confidence,
          reason: sentiment.reason,
        }
      : {
          label: trendScore >= 60 ? 'Positive' : trendScore <= 35 ? 'Negative' : 'Neutral',
          score: round((trendScore - 50) / 50, 2),
          confidence: 62,
          reason: 'Derived from price momentum, trading volume, news impact, watchlist growth, and social buzz.',
        },
  };
};

const rankByTrendScore = (assets) => {
  const signalMap = getTrendSignalMap();
  return assets
    .map((asset) => calculateTrendScore(asset, signalMap))
    .sort((a, b) => b.trendScore - a.trendScore);
};

const buildMarketMomentum = (rankedAssets) => {
  const basket = rankedAssets.slice(0, 10);
  const score = basket.length > 0 ? basket.reduce((sum, asset) => sum + asset.trendScore, 0) / basket.length : 0;
  const bullishCount = rankedAssets.filter((asset) => asset.trendScore >= 70).length;
  const bearishCount = rankedAssets.filter((asset) => asset.trendScore < 45).length;

  return {
    score: round(score),
    label: score >= 70 ? 'Strong momentum' : score >= 55 ? 'Positive momentum' : score >= 40 ? 'Mixed momentum' : 'Weak momentum',
    bullishCount,
    bearishCount,
    summary: `${bullishCount} assets show bullish traction while ${bearishCount} assets require caution.`,
  };
};

const buildMarketTrends = (assets = getMockUniverse()) => {
  const trends = env.useMockData ? readJson('marketTrends.json') : {
    indices: [],
    trending: [],
    topGainers: [],
    topLosers: [],
    sectorPerformance: [],
    trendSignals: [],
    marketMood: {
      score: 0,
      label: 'Loading',
      summary: 'Live market breadth will be derived after provider data is loaded.',
    },
  };
  const rankedAssets = rankByTrendScore(assets);
  const bullishAssets = rankedAssets.filter((asset) => asset.trendScore >= 70);
  const bearishAssets = rankedAssets.filter((asset) => asset.trendScore < 45);
  const hotStocks = rankedAssets.filter((asset) => asset.assetType === 'stock' && asset.trendScore >= 70);
  const marketMomentum = buildMarketMomentum(rankedAssets);

  return {
    ...trends,
    trendingStocks: rankedAssets.slice(0, 8),
    bullishAssets,
    bearishAssets,
    hotStocks,
    marketMomentum,
    recommendations: {
      strongBuy: rankedAssets.filter((asset) => asset.recommendation === 'Strong Buy'),
      buy: rankedAssets.filter((asset) => asset.recommendation === 'Buy'),
      hold: rankedAssets.filter((asset) => asset.recommendation === 'Hold'),
      sell: rankedAssets.filter((asset) => asset.recommendation === 'Sell'),
      strongSell: rankedAssets.filter((asset) => asset.recommendation === 'Strong Sell'),
    },
    formula: {
      trendScore: 'Price Momentum + Trading Volume + News Impact + Watchlist Growth + Social Buzz',
      componentRange: '0-20 each',
      totalRange: '0-100',
    },
  };
};

module.exports = {
  buildTrendComponents,
  calculateTrendScore,
  getRecommendation,
  rankByTrendScore,
  buildMarketMomentum,
  buildMarketTrends,
};
