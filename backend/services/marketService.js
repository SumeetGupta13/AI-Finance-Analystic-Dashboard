const fs = require('fs');
const path = require('path');
const { env } = require('../config/env');
const { buildUrl, fetchJson: providerFetchJson } = require('./apiClient');
const cryptoService = require('./cryptoService');
const newsService = require('./newsService');
const sentimentService = require('./sentimentService');
const tractionService = require('./tractionService');
const { getOrSetCache } = require('../utils/cache');
const { classifyApiError } = require('../utils/apiErrorHandler');

const dataDirectory = path.join(__dirname, '..', 'data');
let marketLimitPromise;

const readJson = (fileName) => {
  const filePath = path.join(dataDirectory, fileName);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const defaultStockSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'RELIANCE.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'TCS.NS', 'INFY.NS'];

const getMarketLimit = async () => {
  if (!marketLimitPromise) {
    marketLimitPromise = import('p-limit').then(({ default: pLimit }) => pLimit(2));
  }

  return marketLimitPromise;
};

const fetchJson = (url, options = {}) => providerFetchJson(url, { provider: 'Market Provider', ...options });

const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();

const clamp = (value, min, max) => Math.min(Math.max(Number(value) || 0, min), max);

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const round = (value, digits = 2) => Number(toNumber(value).toFixed(digits));

const filterByQuery = (items, filters = {}) => {
  const search = String(filters.search || '').trim().toLowerCase();
  const sector = String(filters.sector || '').trim().toLowerCase();
  const country = String(filters.country || '').trim().toLowerCase();
  const category = String(filters.category || '').trim().toLowerCase();
  const symbol = normalizeSymbol(filters.symbol);

  return items.filter((item) => {
    const matchesSearch =
      !search ||
      item.symbol.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search);
    const matchesSector = !sector || String(item.sector || '').toLowerCase() === sector;
    const matchesCountry = !country || String(item.country || '').toLowerCase() === country;
    const matchesCategory = !category || String(item.category || '').toLowerCase() === category;
    const matchesSymbol = !symbol || item.symbol === symbol;

    return matchesSearch && matchesSector && matchesCountry && matchesCategory && matchesSymbol;
  });
};

const sortByChange = (items, direction = 'desc') => {
  const multiplier = direction === 'desc' ? -1 : 1;
  return [...items].sort((a, b) => (a.changePercent - b.changePercent) * multiplier);
};

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

const getMockUniverse = () => {
  const stocks = readJson('stocks.json').map((stock) => ({
    ...stock,
    symbol: normalizeSymbol(stock.symbol),
  }));
  const crypto = readJson('crypto.json').map((asset) => ({
    ...asset,
    symbol: normalizeSymbol(asset.symbol),
  }));
  const mutualFunds = readJson('mutualFunds.json').map(normalizeFund);

  return [...stocks, ...crypto, ...mutualFunds];
};

const requireKey = (keyName, value, provider) => {
  if (!value) {
    throw new Error(`${keyName} is required for live ${provider} data. Set USE_MOCK_DATA=true to use local data.`);
  }
};

const normalizeProviderSymbol = (symbol) => normalizeSymbol(symbol).replace('.NS', '');

const mapFinnhubStock = ({ symbol, quote = {}, profile = {} }) => {
  const price = toNumber(quote.c);
  const previousClose = toNumber(quote.pc, price);
  const change = toNumber(quote.d, price - previousClose);
  const changePercent = toNumber(quote.dp, previousClose ? (change / previousClose) * 100 : 0);

  return calculateTrendScore({
    symbol: normalizeSymbol(symbol),
    name: profile.name || profile.ticker || normalizeSymbol(symbol),
    exchange: profile.exchange || 'US',
    country: profile.country || 'US',
    currency: profile.currency || 'USD',
    assetType: 'stock',
    sector: profile.finnhubIndustry || 'Equity',
    industry: profile.finnhubIndustry || 'Equity',
    price,
    previousClose,
    change: round(change),
    changePercent: round(changePercent),
    marketCap: profile.marketCapitalization ? round(profile.marketCapitalization * 1000000) : undefined,
    volume: quote.v || undefined,
    sparkline: [previousClose, price],
  });
};

const mapFinnhubProfile = (symbol, profile = {}) => {
  if (!profile || Object.keys(profile).length === 0) {
    return null;
  }

  return {
    symbol: normalizeSymbol(symbol),
    ticker: profile.ticker || normalizeSymbol(symbol),
    name: profile.name || profile.ticker || normalizeSymbol(symbol),
    exchange: profile.exchange || 'US',
    country: profile.country || 'US',
    currency: profile.currency || 'USD',
    industry: profile.finnhubIndustry || 'Equity',
    ipo: profile.ipo,
    logo: profile.logo,
    phone: profile.phone,
    weburl: profile.weburl,
    marketCapitalization: profile.marketCapitalization ? round(profile.marketCapitalization * 1000000) : undefined,
    shareOutstanding: profile.shareOutstanding ? round(profile.shareOutstanding * 1000000) : undefined,
    updatedAt: new Date().toISOString(),
  };
};

const getFinnhubStock = async (symbol) => {
  requireKey('FINNHUB_API_KEY', env.finnhubApiKey, 'stock');
  const normalizedSymbol = normalizeSymbol(symbol);
  const providerSymbol = normalizeProviderSymbol(normalizedSymbol);
  const [quote, profile] = await Promise.all([
    fetchJson(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(providerSymbol)}&token=${env.finnhubApiKey}`),
    fetchJson(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(providerSymbol)}&token=${env.finnhubApiKey}`),
  ]);

  if (!quote || quote.c === 0) {
    return null;
  }

  return mapFinnhubStock({ symbol: normalizedSymbol, quote, profile });
};

const getFinnhubCompanyProfile = async (symbol) => {
  requireKey('FINNHUB_API_KEY', env.finnhubApiKey, 'company profile');
  const normalizedSymbol = normalizeSymbol(symbol);
  const providerSymbol = normalizeProviderSymbol(normalizedSymbol);
  const profile = await fetchJson(buildUrl('https://finnhub.io/api/v1/stock/profile2', {
    symbol: providerSymbol,
    token: env.finnhubApiKey,
  }), { provider: 'Finnhub' });

  return mapFinnhubProfile(normalizedSymbol, profile);
};

const mapFmpMover = (item) => {
  const price = toNumber(item.price);
  const change = toNumber(item.change);
  const changePercent = toNumber(String(item.changesPercentage || item.changePercent || '').replace('%', ''));

  return calculateTrendScore({
    symbol: normalizeSymbol(item.symbol),
    name: item.name || normalizeSymbol(item.symbol),
    exchange: item.exchange || 'FMP',
    country: 'US',
    currency: 'USD',
    assetType: 'stock',
    sector: item.sector || 'Equity',
    industry: item.industry || 'Equity',
    price,
    previousClose: price - change,
    change: round(change),
    changePercent: round(changePercent),
    marketCap: item.marketCap ? toNumber(item.marketCap) : undefined,
    volume: item.volume ? toNumber(item.volume) : undefined,
    sparkline: [price - change, price],
  });
};

const getFmpMovers = async (kind, limit = 5) => {
  requireKey('FMP_API_KEY', env.fmpApiKey, 'market movers');
  const endpoint = kind === 'gainers' ? 'gainers' : 'losers';
  const fallbackEndpoint = kind === 'gainers' ? 'biggest-gainers' : 'biggest-losers';
  const urls = [
    `https://financialmodelingprep.com/api/v3/stock_market/${endpoint}?apikey=${env.fmpApiKey}`,
    `https://financialmodelingprep.com/stable/${fallbackEndpoint}?apikey=${env.fmpApiKey}`,
  ];
  let payload;

  for (const url of urls) {
    try {
      payload = await fetchJson(url, { provider: 'FMP' });
      break;
    } catch (error) {
      if (url === urls[urls.length - 1]) throw error;
    }
  }

  const items = Array.isArray(payload) ? payload : payload.data || [];
  return items.slice(0, Number(limit) || 5).map(mapFmpMover);
};

const getFmpFinancialMetrics = async (symbol) => {
  requireKey('FMP_API_KEY', env.fmpApiKey, 'financial metrics');
  const providerSymbol = normalizeProviderSymbol(symbol);
  const [profile, metrics, ratios] = await Promise.all([
    fetchJson(`https://financialmodelingprep.com/api/v3/profile/${encodeURIComponent(providerSymbol)}?apikey=${env.fmpApiKey}`, { provider: 'FMP' }).catch(() => []),
    fetchJson(`https://financialmodelingprep.com/api/v3/key-metrics-ttm/${encodeURIComponent(providerSymbol)}?apikey=${env.fmpApiKey}`, { provider: 'FMP' }).catch(() => []),
    fetchJson(`https://financialmodelingprep.com/api/v3/ratios-ttm/${encodeURIComponent(providerSymbol)}?apikey=${env.fmpApiKey}`, { provider: 'FMP' }).catch(() => []),
  ]);
  const profileItem = Array.isArray(profile) ? profile[0] : profile;
  const metricItem = Array.isArray(metrics) ? metrics[0] : metrics;
  const ratioItem = Array.isArray(ratios) ? ratios[0] : ratios;

  return {
    symbol: normalizeSymbol(symbol),
    marketCap: toNumber(profileItem?.mktCap || metricItem?.marketCapTTM),
    peRatio: toNumber(ratioItem?.priceEarningsRatioTTM || metricItem?.peRatioTTM),
    priceToBook: toNumber(metricItem?.pbRatioTTM),
    debtToEquity: toNumber(ratioItem?.debtEquityRatioTTM),
    returnOnEquity: toNumber(ratioItem?.returnOnEquityTTM),
    dividendYield: toNumber(ratioItem?.dividendYieldTTM),
    beta: toNumber(profileItem?.beta),
    sector: profileItem?.sector,
    industry: profileItem?.industry,
    updatedAt: new Date().toISOString(),
  };
};

const mapCoinGeckoAsset = (asset) => calculateTrendScore({
  symbol: normalizeSymbol(asset.symbol),
  name: asset.name,
  assetType: 'crypto',
  exchange: 'CoinGecko',
  currency: 'USD',
  price: toNumber(asset.current_price),
  previousClose: toNumber(asset.current_price) - toNumber(asset.price_change_24h),
  change: round(asset.price_change_24h),
  changePercent: round(asset.price_change_percentage_24h),
  marketCap: toNumber(asset.market_cap),
  volume: toNumber(asset.total_volume),
  circulatingSupply: toNumber(asset.circulating_supply),
  rank: asset.market_cap_rank,
  high52: toNumber(asset.ath),
  low52: toNumber(asset.atl),
  sparkline: asset.sparkline_in_7d?.price || [toNumber(asset.current_price)],
});

const mapNewsApiArticle = (article, index) => ({
  id: article.url || `live_news_${index}`,
  title: article.title,
  source: article.source?.name || 'NewsAPI',
  summary: article.description || article.content || '',
  publishedAt: article.publishedAt || new Date().toISOString(),
  category: 'Markets',
  sentiment: 'neutral',
  symbols: [],
});

const liveMarketProvider = {
  async getStocks(filters = {}) {
    const symbols = String(filters.symbols || process.env.DEFAULT_STOCK_SYMBOLS || defaultStockSymbols.join(','))
      .split(',')
      .map((symbol) => symbol.trim())
      .filter(Boolean);
    const limit = await getMarketLimit();
    const stocks = (await Promise.all(symbols.map((symbol) => limit(() => getFinnhubStock(symbol).catch(() => null))))).filter(Boolean);
    return filterByQuery(stocks, filters);
  },

  getStockBySymbol(symbol) {
    return getFinnhubStock(symbol);
  },

  getStockQuote(symbol) {
    return getFinnhubStock(symbol);
  },

  getCompanyProfile(symbol) {
    return getFinnhubCompanyProfile(symbol);
  },

  async getTrendingStocks(limit = 10) {
    const stocks = await this.getStocks();
    const crypto = await this.getCryptoMarkets().catch(() => []);
    return tractionService.rankByTrendScore([...stocks, ...crypto]).slice(0, Number(limit) || 10);
  },

  async getTopGainers(limit = 5) {
    if (env.fmpApiKey) return getFmpMovers('gainers', limit);
    return sortByChange(await this.getStocks(), 'desc').slice(0, Number(limit) || 5);
  },

  async getTopLosers(limit = 5) {
    if (env.fmpApiKey) return getFmpMovers('losers', limit);
    return sortByChange(await this.getStocks(), 'asc').slice(0, Number(limit) || 5);
  },

  async getCryptoMarkets(filters = {}) {
    const assets = await cryptoService.getCryptoMarkets(filters);
    return filterByQuery(assets.map((asset) => calculateTrendScore(asset)), filters);
  },

  async getTrendingCrypto(limit = 10) {
    const assets = await cryptoService.getTrendingCrypto(limit);
    return assets.map((asset) => calculateTrendScore(asset));
  },

  getMutualFunds() {
    return Promise.resolve(readJson('mutualFunds.json').map((fund) => ({
      ...fund,
      trend: calculateTrendScore(normalizeFund(fund)),
    })));
  },

  async getHistoricalData(symbol, range = '1M') {
    requireKey('FMP_API_KEY', env.fmpApiKey, 'historical prices');
    const to = new Date();
    const from = new Date(to);
    const rangeDays = { '1D': 1, '5D': 5, '1M': 30, '6M': 182, '1Y': 365, MAX: 1825 };
    from.setDate(to.getDate() - (rangeDays[range] || 30));
    const url = buildUrl('https://financialmodelingprep.com/stable/historical-price-eod/full', {
      symbol: normalizeProviderSymbol(symbol),
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      apikey: env.fmpApiKey,
    });
    const payload = await fetchJson(url, { provider: 'FMP' });
    const rows = Array.isArray(payload) ? payload : payload.historical || [];

    return {
      symbol: normalizeSymbol(symbol),
      range,
      candles: rows.map((row) => ({
        date: row.date,
        open: toNumber(row.open),
        high: toNumber(row.high),
        low: toNumber(row.low),
        close: toNumber(row.close),
        volume: toNumber(row.volume),
      })).reverse(),
    };
  },

  async getMarketNews(filters = {}) {
    const articles = await newsService.getFinancialNews(filters);
    return articles.map(enrichNewsWithSentiment);
  },

  async getMarketTrends() {
    const [stocks, crypto] = await Promise.all([
      this.getStocks().catch(() => []),
      this.getCryptoMarkets({ limit: 20 }).catch(() => []),
    ]);
    return tractionService.buildMarketTrends([...stocks, ...crypto]);
  },

  getSentimentAnalysis(filters = {}) {
    return sentimentService.getLiveNewsSentiment(filters);
  },

  async getAIInsights(filters = {}) {
    const aiService = require('./aiService');
    return aiService.getInsights(filters);
  },
};

const getRecommendation = (trendScore, sentimentScore = 0, changePercent = 0) => {
  const adjustedScore = trendScore + sentimentScore * 10 + clamp(changePercent, -5, 5);

  if (adjustedScore >= 86) return 'Strong Buy';
  if (adjustedScore >= 70) return 'Buy';
  if (adjustedScore >= 45) return 'Hold';
  if (adjustedScore >= 28) return 'Sell';
  return 'Strong Sell';
};

const getSentimentBySymbol = (symbol) => {
  const normalizedSymbol = normalizeSymbol(symbol);
  return readJson('newsSentiment.json').find((item) => normalizeSymbol(item.symbol) === normalizedSymbol) || null;
};

const inferVolumeChange = (asset) => {
  if (asset.averageVolume && asset.volume) {
    return clamp(10 + ((asset.volume - asset.averageVolume) / asset.averageVolume) * 50, 0, 20);
  }

  return clamp(8 + Math.abs(asset.changePercent || 0) * 3, 0, 20);
};

const getTrendSignalMap = () => {
  const trends = readJson('marketTrends.json');
  return new Map((trends.trendSignals || []).map((signal) => [normalizeSymbol(signal.symbol), signal]));
};

const buildTrendComponents = (asset, signalMap = getTrendSignalMap()) => {
  const sentiment = getSentimentBySymbol(asset.symbol);
  const configured = signalMap.get(asset.symbol);

  return {
    volumeChange: round(clamp(configured?.volumeChange ?? inferVolumeChange(asset), 0, 20)),
    priceMomentum: round(clamp(configured?.priceMomentum ?? 10 + (asset.changePercent || 0) * 3, 0, 20)),
    newsImpact: round(clamp(configured?.newsImpact ?? 10 + (sentiment?.score || 0) * 10, 0, 20)),
    socialBuzz: round(configured?.socialBuzz ?? clamp((sentiment?.confidence || 50) / 6, 0, 20)),
    watchlistGrowth: round(configured?.watchlistGrowth ?? clamp(Math.abs(asset.changePercent || 0) * 3 + 4, 0, 20)),
  };
};

const calculateTrendScore = (asset, signalMap = getTrendSignalMap()) => {
  const components = buildTrendComponents(asset, signalMap);
  const trendScore = clamp(
    components.volumeChange +
      components.priceMomentum +
      components.newsImpact +
      components.socialBuzz +
      components.watchlistGrowth,
    0,
    100
  );
  const sentiment = getSentimentBySymbol(asset.symbol);
  const recommendation = getRecommendation(trendScore, sentiment?.score || 0, asset.changePercent);

  return {
    ...asset,
    trendScore: round(trendScore),
    trendComponents: components,
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
          reason: 'Derived from price, volume, news, buzz, and watchlist growth signals.',
        },
    recommendation,
  };
};

const rankByTrendScore = (items) => {
  const signalMap = getTrendSignalMap();
  return items
    .map((asset) => calculateTrendScore(asset, signalMap))
    .sort((a, b) => b.trendScore - a.trendScore);
};

const enrichNewsWithSentiment = (article) => {
  const sentimentMatches = (article.symbols || [])
    .map(getSentimentBySymbol)
    .filter(Boolean);
  const averageScore =
    sentimentMatches.length > 0
      ? sentimentMatches.reduce((sum, item) => sum + item.score, 0) / sentimentMatches.length
      : article.sentiment === 'positive'
        ? 0.45
        : article.sentiment === 'negative'
          ? -0.45
          : 0;
  const averageConfidence =
    sentimentMatches.length > 0
      ? sentimentMatches.reduce((sum, item) => sum + item.confidence, 0) / sentimentMatches.length
      : 70;

  return {
    ...article,
    sentimentScore: round(averageScore, 2),
    confidence: Math.round(averageConfidence),
  };
};

const buildMarketMomentum = (rankedAssets) => {
  const momentumBasket = rankedAssets.slice(0, 10);
  const averageTrendScore =
    momentumBasket.length > 0
      ? momentumBasket.reduce((sum, asset) => sum + asset.trendScore, 0) / momentumBasket.length
      : 0;
  const bullishCount = rankedAssets.filter((asset) => asset.trendScore >= 70).length;
  const bearishCount = rankedAssets.filter((asset) => asset.trendScore < 45).length;
  const label = averageTrendScore >= 70 ? 'Strong momentum' : averageTrendScore >= 55 ? 'Positive momentum' : averageTrendScore >= 40 ? 'Mixed momentum' : 'Weak momentum';

  return {
    score: round(averageTrendScore),
    label,
    bullishCount,
    bearishCount,
    summary: `${bullishCount} assets show bullish traction while ${bearishCount} assets require caution.`,
  };
};

const logLiveFallback = (provider, error) => {
  if (process.env.NODE_ENV !== 'test') {
    const code = error?.statusCode ? ` (${error.statusCode})` : '';
    console.warn(`[${provider}] ${classifyApiError(error)}${code}; serving fallback market data.`);
  }
};

const getMarketTtl = () => env.cacheTtlMarket;
const getNewsTtl = () => env.cacheTtlNews;
const getAiTtl = () => env.cacheTtlAi;

const rawMarketService = {
  async getStocks(filters = {}) {
    if (!env.useMockData) {
      try {
        const stocks = await liveMarketProvider.getStocks(filters);
        if (stocks.length > 0) {
          return stocks;
        }

        logLiveFallback('Finnhub', new Error('No live stocks returned'));
      } catch (error) {
        logLiveFallback('Finnhub', error);
      }
    }

    return filterByQuery(readJson('stocks.json'), filters).map((stock) => calculateTrendScore({ ...stock, symbol: normalizeSymbol(stock.symbol) }));
  },

  async getStockBySymbol(symbol) {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getStockBySymbol(normalizedSymbol);
      } catch (error) {
        logLiveFallback('Finnhub', error);
      }
    }

    const stock = readJson('stocks.json').find((item) => normalizeSymbol(item.symbol) === normalizedSymbol);
    return stock ? calculateTrendScore({ ...stock, symbol: normalizedSymbol }) : null;
  },

  async getStockQuote(symbol) {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getStockQuote(normalizedSymbol);
      } catch (error) {
        logLiveFallback('Finnhub quote', error);
      }
    }

    const stock = readJson('stocks.json').find((item) => normalizeSymbol(item.symbol) === normalizedSymbol);
    return stock ? calculateTrendScore({ ...stock, symbol: normalizedSymbol }) : null;
  },

  async getQuotes(symbols = []) {
    const uniqueSymbols = Array.from(new Set((Array.isArray(symbols) ? symbols : []).map(normalizeSymbol).filter(Boolean))).slice(0, 50);
    const limit = await getMarketLimit();
    const quotes = await Promise.all(uniqueSymbols.map((symbol) => limit(() => this.getStockQuote(symbol).catch(() => null))));

    return quotes.filter(Boolean);
  },

  async getCompanyProfile(symbol) {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!env.useMockData) {
      try {
        const profile = await liveMarketProvider.getCompanyProfile(normalizedSymbol);
        if (profile) return profile;
      } catch (error) {
        logLiveFallback('Finnhub company profile', error);
      }
    }

    const stock = readJson('stocks.json').find((item) => normalizeSymbol(item.symbol) === normalizedSymbol);
    return stock
      ? {
          symbol: normalizedSymbol,
          ticker: normalizedSymbol,
          name: stock.name,
          exchange: stock.exchange,
          country: stock.country,
          currency: stock.currency,
          sector: stock.sector,
          industry: stock.industry,
          marketCapitalization: stock.marketCap,
          updatedAt: new Date().toISOString(),
        }
      : null;
  },

  async getAssetBySymbol(symbol) {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!env.useMockData) {
      try {
        const stock = await liveMarketProvider.getStockBySymbol(normalizedSymbol);
        if (stock) return stock;
      } catch (error) {
        logLiveFallback('Finnhub', error);
      }

      try {
        const crypto = await cryptoService.getCryptoBySymbol(normalizedSymbol);
        if (crypto) return calculateTrendScore(crypto);
      } catch (error) {
        logLiveFallback('CoinGecko', error);
      }
    }

    return getMockUniverse().find((asset) => asset.symbol === normalizedSymbol) || null;
  },

  async getTrendingStocks(limit = 10) {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getTrendingStocks(limit);
      } catch (error) {
        logLiveFallback('Market trends', error);
      }
    }

    return rankByTrendScore(getMockUniverse()).slice(0, Number(limit) || 10);
  },

  async getTopGainers(limit = 5) {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getTopGainers(limit);
      } catch (error) {
        logLiveFallback('FMP gainers', error);
      }
    }

    return sortByChange(getMockUniverse(), 'desc').slice(0, Number(limit) || 5).map((asset) => calculateTrendScore(asset));
  },

  async getTopLosers(limit = 5) {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getTopLosers(limit);
      } catch (error) {
        logLiveFallback('FMP losers', error);
      }
    }

    return sortByChange(getMockUniverse(), 'asc').slice(0, Number(limit) || 5).map((asset) => calculateTrendScore(asset));
  },

  async getCryptoMarkets(filters = {}) {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getCryptoMarkets(filters);
      } catch (error) {
        logLiveFallback('CoinGecko', error);
      }
    }

    return filterByQuery(readJson('crypto.json'), filters).map((asset) => calculateTrendScore({ ...asset, symbol: normalizeSymbol(asset.symbol) }));
  },

  async getTrendingCrypto(limit = 10) {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getTrendingCrypto(limit);
      } catch (error) {
        logLiveFallback('CoinGecko trending', error);
      }
    }

    return rankByTrendScore(readJson('crypto.json').map((asset) => ({ ...asset, symbol: normalizeSymbol(asset.symbol) }))).slice(0, Number(limit) || 10);
  },

  async getMutualFunds(filters = {}) {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getMutualFunds(filters);
      } catch (error) {
        logLiveFallback('Mutual fund fallback', error);
      }
    }

    return filterByQuery(readJson('mutualFunds.json'), filters).map((fund) => ({
      ...fund,
      trend: calculateTrendScore(normalizeFund(fund)),
    }));
  },

  async getHistoricalData(symbol, range = '1M') {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getHistoricalData(normalizedSymbol, range);
      } catch (error) {
        logLiveFallback('FMP history', error);
      }
    }

    return {
      symbol: normalizedSymbol,
      range,
      candles: readJson('historicalPrices.json')[normalizedSymbol] || [],
    };
  },

  async getMarketNews(filters = {}) {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getMarketNews(filters);
      } catch (error) {
        logLiveFallback('NewsAPI', error);
      }
    }

    const category = String(filters.category || '').trim().toLowerCase();
    const symbol = normalizeSymbol(filters.symbol);
    const sentiment = String(filters.sentiment || '').trim().toLowerCase();

    return readJson('marketNews.json')
      .filter((article) => {
        const matchesCategory = !category || article.category.toLowerCase() === category;
        const matchesSymbol = !symbol || article.symbols.includes(symbol);
        const matchesSentiment = !sentiment || article.sentiment.toLowerCase() === sentiment;
        return matchesCategory && matchesSymbol && matchesSentiment;
      })
      .map(enrichNewsWithSentiment);
  },

  async getMarketTrends() {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getMarketTrends();
      } catch (error) {
        logLiveFallback('Market trend providers', error);
      }
    }

    const trends = readJson('marketTrends.json');
    const rankedAssets = rankByTrendScore(getMockUniverse());
    const bullishAssets = rankedAssets.filter((asset) => asset.trendScore >= 70);
    const bearishAssets = rankedAssets.filter((asset) => asset.trendScore < 45);
    const hotStocks = rankedAssets.filter((asset) => asset.assetType === 'stock' && asset.trendScore >= 70);

    return {
      ...trends,
      trendingStocks: rankedAssets.slice(0, 8),
      bullishAssets,
      bearishAssets,
      hotStocks,
      marketMomentum: buildMarketMomentum(rankedAssets),
      recommendations: {
        strongBuy: rankedAssets.filter((asset) => asset.recommendation === 'Strong Buy'),
        buy: rankedAssets.filter((asset) => asset.recommendation === 'Buy'),
        hold: rankedAssets.filter((asset) => asset.recommendation === 'Hold'),
        sell: rankedAssets.filter((asset) => asset.recommendation === 'Sell'),
        strongSell: rankedAssets.filter((asset) => asset.recommendation === 'Strong Sell'),
      },
    };
  },

  async getSentimentAnalysis(filters = {}) {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getSentimentAnalysis(filters);
      } catch (error) {
        logLiveFallback('Groq sentiment', error);
      }
    }

    const symbol = normalizeSymbol(filters.symbol);
    const sentiment = String(filters.sentiment || '').trim().toLowerCase();
    const items = readJson('newsSentiment.json').filter((item) => {
      const matchesSymbol = !symbol || normalizeSymbol(item.symbol) === symbol;
      const matchesSentiment = !sentiment || item.sentiment.toLowerCase() === sentiment || item.label.toLowerCase() === sentiment;
      return matchesSymbol && matchesSentiment;
    });

    return items.map((item) => ({
      ...item,
      confidencePercent: `${item.confidence}%`,
      recommendation: getRecommendation(50 + item.score * 35, item.score, 0),
    }));
  },

  async getAIInsights(filters = {}) {
    if (!env.useMockData) {
      try {
        return await liveMarketProvider.getAIInsights(filters);
      } catch (error) {
        logLiveFallback('Groq insights', error);
      }
    }

    const symbol = normalizeSymbol(filters.symbol);
    const type = String(filters.type || '').trim();
    const insights = readJson('aiInsights.json');
    const marketTrends = await this.getMarketTrends();

    const filterBySymbol = (items) => {
      if (!symbol) return items;
      return items.filter((item) => (item.symbols || [item.symbol]).filter(Boolean).map(normalizeSymbol).includes(symbol));
    };

    const payload = {
      ...insights,
      marketMomentum: marketTrends.marketMomentum,
      topOpportunities: marketTrends.bullishAssets.slice(0, 5).map((asset) => ({
        symbol: asset.symbol,
        name: asset.name,
        trendScore: asset.trendScore,
        recommendation: asset.recommendation,
        reason: asset.sentiment.reason,
      })),
    };

    if (symbol) {
      payload.marketSummaries = filterBySymbol(payload.marketSummaries || []);
      payload.recommendations = filterBySymbol(payload.recommendations || []);
      payload.marketOpportunities = filterBySymbol(payload.marketOpportunities || []);
      payload.topOpportunities = payload.topOpportunities.filter((item) => normalizeSymbol(item.symbol) === symbol);
    }

    if (type && Object.prototype.hasOwnProperty.call(payload, type)) {
      return payload[type];
    }

    return payload;
  },

  async getFinancialMetrics(symbol) {
    const normalizedSymbol = normalizeSymbol(symbol);

    if (!env.useMockData) {
      try {
        return await getFmpFinancialMetrics(normalizedSymbol);
      } catch (error) {
        logLiveFallback('FMP metrics', error);
      }
    }

    const stock = readJson('stocks.json').find((item) => normalizeSymbol(item.symbol) === normalizedSymbol);
    return stock
      ? {
          symbol: normalizedSymbol,
          marketCap: stock.marketCap,
          peRatio: stock.peRatio,
          dividendYield: stock.dividendYield,
          beta: stock.beta,
          sector: stock.sector,
          industry: stock.industry,
          updatedAt: new Date().toISOString(),
        }
      : null;
  },
};

const marketService = {
  getStocks: (filters = {}) => getOrSetCache(`stocks_${JSON.stringify(filters)}`, () => rawMarketService.getStocks(filters), getMarketTtl()),
  getStockBySymbol: (symbol) => getOrSetCache(`stock_${normalizeSymbol(symbol)}`, () => rawMarketService.getStockBySymbol(symbol), getMarketTtl()),
  getStockQuote: (symbol) => getOrSetCache(`quote_${normalizeSymbol(symbol)}`, () => rawMarketService.getStockQuote(symbol), getMarketTtl()),
  getQuotes: (symbols = []) => getOrSetCache(`quotes_${JSON.stringify((Array.isArray(symbols) ? symbols : []).map(normalizeSymbol).sort())}`, () => rawMarketService.getQuotes(symbols), getMarketTtl()),
  getCompanyProfile: (symbol) => getOrSetCache(`profile_${normalizeSymbol(symbol)}`, () => rawMarketService.getCompanyProfile(symbol), getMarketTtl()),
  getAssetBySymbol: (symbol) => getOrSetCache(`asset_${normalizeSymbol(symbol)}`, () => rawMarketService.getAssetBySymbol(symbol), getMarketTtl()),
  getTrendingStocks: (limit = 10) => getOrSetCache(`trending_${limit}`, () => rawMarketService.getTrendingStocks(limit), getMarketTtl()),
  getTopGainers: (limit = 5) => getOrSetCache(`gainers_${limit}`, () => rawMarketService.getTopGainers(limit), getMarketTtl()),
  getTopLosers: (limit = 5) => getOrSetCache(`losers_${limit}`, () => rawMarketService.getTopLosers(limit), getMarketTtl()),
  getCryptoMarkets: (filters = {}) => getOrSetCache(`crypto_${JSON.stringify(filters)}`, () => rawMarketService.getCryptoMarkets(filters), getMarketTtl()),
  getTrendingCrypto: (limit = 10) => getOrSetCache(`crypto_trending_${limit}`, () => rawMarketService.getTrendingCrypto(limit), getMarketTtl()),
  getMutualFunds: (filters = {}) => getOrSetCache(`funds_${JSON.stringify(filters)}`, () => rawMarketService.getMutualFunds(filters), getMarketTtl()),
  getHistoricalData: (symbol, range = '1M') => getOrSetCache(`history_${normalizeSymbol(symbol)}_${range}`, () => rawMarketService.getHistoricalData(symbol, range), getMarketTtl()),
  getMarketNews: (filters = {}) => getOrSetCache(`news_${JSON.stringify(filters)}`, () => rawMarketService.getMarketNews(filters), getNewsTtl()),
  getMarketTrends: () => getOrSetCache('market_trends', () => rawMarketService.getMarketTrends(), getMarketTtl()),
  getSentimentAnalysis: (filters = {}) => getOrSetCache(`sentiment_${JSON.stringify(filters)}`, () => rawMarketService.getSentimentAnalysis(filters), getAiTtl()),
  getAIInsights: (filters = {}) => getOrSetCache(`ai_insights_${JSON.stringify(filters)}`, () => rawMarketService.getAIInsights(filters), getAiTtl()),
  getFinancialMetrics: (symbol) => getOrSetCache(`metrics_${normalizeSymbol(symbol)}`, () => rawMarketService.getFinancialMetrics(symbol), getMarketTtl()),
};

module.exports = marketService;
