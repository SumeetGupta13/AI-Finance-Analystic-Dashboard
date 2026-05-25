const fs = require('fs');
const path = require('path');
const { env } = require('../config/env');

const dataDirectory = path.join(__dirname, '..', 'data');

const readJson = (fileName) => {
  const filePath = path.join(dataDirectory, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();

const filterByQuery = (items, filters = {}) => {
  const search = String(filters.search || '').trim().toLowerCase();
  const sector = String(filters.sector || '').trim().toLowerCase();
  const country = String(filters.country || '').trim().toLowerCase();
  const category = String(filters.category || '').trim().toLowerCase();

  return items.filter((item) => {
    const matchesSearch =
      !search ||
      item.symbol.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search);
    const matchesSector = !sector || String(item.sector || '').toLowerCase() === sector;
    const matchesCountry = !country || String(item.country || '').toLowerCase() === country;
    const matchesCategory = !category || String(item.category || '').toLowerCase() === category;

    return matchesSearch && matchesSector && matchesCountry && matchesCategory;
  });
};

const sortByChange = (items, direction = 'desc') => {
  const multiplier = direction === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => (a.changePercent - b.changePercent) * multiplier);
};

const getMockUniverse = () => {
  const stocks = readJson('stocks.json');
  const crypto = readJson('crypto.json');
  const mutualFunds = readJson('mutualFunds.json').map((fund) => ({
    ...fund,
    symbol: fund.symbol,
    price: fund.nav,
    exchange: 'AMFI',
    change: Number(((fund.nav * fund.changePercent) / 100).toFixed(2)),
    marketCap: fund.aum,
  }));

  return [...stocks, ...crypto, ...mutualFunds];
};

const liveProviderNotConfigured = (methodName) => {
  const providerKeys = [
    'ALPHA_VANTAGE_API_KEY',
    'FINNHUB_API_KEY',
    'TWELVE_DATA_API_KEY',
    'YAHOO_FINANCE_API_KEY',
    'COINGECKO_API_KEY',
    'NEWS_API_KEY',
  ];

  const configured = providerKeys.some((key) => Boolean(process.env[key]));

  if (!configured) {
    throw new Error(`${methodName} requires live market provider API keys or USE_MOCK_DATA=true`);
  }

  throw new Error(`${methodName} live provider adapter is not enabled in this deployment`);
};

const liveMarketProvider = {
  getStocks: () => liveProviderNotConfigured('getStocks'),
  getStockBySymbol: () => liveProviderNotConfigured('getStockBySymbol'),
  getTrendingStocks: () => liveProviderNotConfigured('getTrendingStocks'),
  getTopGainers: () => liveProviderNotConfigured('getTopGainers'),
  getTopLosers: () => liveProviderNotConfigured('getTopLosers'),
  getCryptoMarkets: () => liveProviderNotConfigured('getCryptoMarkets'),
  getMutualFunds: () => liveProviderNotConfigured('getMutualFunds'),
  getHistoricalData: () => liveProviderNotConfigured('getHistoricalData'),
  getMarketNews: () => liveProviderNotConfigured('getMarketNews'),
};

const marketService = {
  async getStocks(filters = {}) {
    if (!env.useMockData) {
      return liveMarketProvider.getStocks(filters);
    }

    return filterByQuery(readJson('stocks.json'), filters);
  },

  async getStockBySymbol(symbol) {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!env.useMockData) {
      return liveMarketProvider.getStockBySymbol(normalizedSymbol);
    }

    return readJson('stocks.json').find((stock) => stock.symbol === normalizedSymbol) || null;
  },

  async getAssetBySymbol(symbol) {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!env.useMockData) {
      const stock = await liveMarketProvider.getStockBySymbol(normalizedSymbol);
      return stock;
    }

    return getMockUniverse().find((asset) => asset.symbol === normalizedSymbol) || null;
  },

  async getTrendingStocks() {
    if (!env.useMockData) {
      return liveMarketProvider.getTrendingStocks();
    }

    const trends = readJson('marketTrends.json');
    const universe = getMockUniverse();
    return trends.trending
      .map((symbol) => universe.find((asset) => asset.symbol === symbol))
      .filter(Boolean);
  },

  async getTopGainers(limit = 5) {
    if (!env.useMockData) {
      return liveMarketProvider.getTopGainers(limit);
    }

    return sortByChange(getMockUniverse(), 'desc').slice(0, Number(limit) || 5);
  },

  async getTopLosers(limit = 5) {
    if (!env.useMockData) {
      return liveMarketProvider.getTopLosers(limit);
    }

    return sortByChange(getMockUniverse(), 'asc').slice(0, Number(limit) || 5);
  },

  async getCryptoMarkets(filters = {}) {
    if (!env.useMockData) {
      return liveMarketProvider.getCryptoMarkets(filters);
    }

    return filterByQuery(readJson('crypto.json'), filters);
  },

  async getMutualFunds(filters = {}) {
    if (!env.useMockData) {
      return liveMarketProvider.getMutualFunds(filters);
    }

    return filterByQuery(readJson('mutualFunds.json'), filters);
  },

  async getHistoricalData(symbol, range = '1M') {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!env.useMockData) {
      return liveMarketProvider.getHistoricalData(normalizedSymbol, range);
    }

    return {
      symbol: normalizedSymbol,
      range,
      candles: readJson('historicalPrices.json')[normalizedSymbol] || [],
    };
  },

  async getMarketNews(filters = {}) {
    if (!env.useMockData) {
      return liveMarketProvider.getMarketNews(filters);
    }

    const category = String(filters.category || '').trim().toLowerCase();
    const symbol = normalizeSymbol(filters.symbol);

    return readJson('marketNews.json').filter((article) => {
      const matchesCategory = !category || article.category.toLowerCase() === category;
      const matchesSymbol = !symbol || article.symbols.includes(symbol);
      return matchesCategory && matchesSymbol;
    });
  },

  async getMarketTrends() {
    if (!env.useMockData) {
      return liveProviderNotConfigured('getMarketTrends');
    }

    return readJson('marketTrends.json');
  },
};

module.exports = marketService;
