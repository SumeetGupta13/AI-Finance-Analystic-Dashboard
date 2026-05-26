const fs = require('fs');
const path = require('path');
const { env } = require('../config/env');
const { buildUrl, fetchJson, withFallback } = require('./apiClient');

const dataDirectory = path.join(__dirname, '..', 'data');

const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(dataDirectory, fileName), 'utf8'));
const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();
const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const round = (value, digits = 2) => Number(toNumber(value).toFixed(digits));

const getCoinGeckoHeaders = () => {
  if (!env.coinGeckoApiKey) {
    return {};
  }

  return { 'x-cg-demo-api-key': env.coinGeckoApiKey };
};

const filterByQuery = (items, filters = {}) => {
  const search = String(filters.search || filters.q || '').trim().toLowerCase();
  const symbol = normalizeSymbol(filters.symbol);

  return items.filter((item) => {
    const matchesSearch =
      !search ||
      item.symbol.toLowerCase().includes(search) ||
      item.name.toLowerCase().includes(search);
    const matchesSymbol = !symbol || item.symbol === symbol;
    return matchesSearch && matchesSymbol;
  });
};

const mapMockCrypto = (asset) => ({
  ...asset,
  symbol: normalizeSymbol(asset.symbol),
});

const mapCoinGeckoMarket = (asset) => ({
  id: asset.id,
  symbol: normalizeSymbol(asset.symbol),
  name: asset.name,
  assetType: 'crypto',
  exchange: 'CoinGecko',
  currency: 'USD',
  price: toNumber(asset.current_price),
  previousClose: round(toNumber(asset.current_price) - toNumber(asset.price_change_24h)),
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

const getMockCryptoMarkets = (filters = {}) => {
  const limit = Number(filters.limit) || undefined;
  const items = filterByQuery(readJson('crypto.json').map(mapMockCrypto), filters);
  return limit ? items.slice(0, limit) : items;
};

const getLiveCryptoMarkets = async (filters = {}) => {
  const url = buildUrl('https://api.coingecko.com/api/v3/coins/markets', {
    vs_currency: String(filters.currency || 'usd'),
    order: filters.order || 'market_cap_desc',
    per_page: Number(filters.limit) || 50,
    page: Number(filters.page) || 1,
    sparkline: true,
    price_change_percentage: '24h',
    ids: filters.ids,
  });

  const payload = await fetchJson(url, {
    provider: 'CoinGecko',
    headers: getCoinGeckoHeaders(),
  });

  return filterByQuery((payload || []).map(mapCoinGeckoMarket), filters);
};

const getLiveTrendingCrypto = async (limit = 10) => {
  const payload = await fetchJson('https://api.coingecko.com/api/v3/search/trending', {
    provider: 'CoinGecko',
    headers: getCoinGeckoHeaders(),
  });

  const coins = (payload.coins || []).slice(0, Number(limit) || 10);
  return coins.map(({ item }) => ({
    id: item.id,
    symbol: normalizeSymbol(item.symbol),
    name: item.name,
    assetType: 'crypto',
    exchange: 'CoinGecko',
    currency: 'USD',
    price: toNumber(item.data?.price),
    marketCap: toNumber(String(item.data?.market_cap || '').replace(/[$,]/g, '')),
    rank: item.market_cap_rank,
    sparkline: [toNumber(item.data?.price)],
  }));
};

const getCryptoMarkets = (filters = {}) =>
  withFallback({
    useMockData: env.useMockData,
    provider: 'CoinGecko',
    live: () => getLiveCryptoMarkets(filters),
    mock: () => getMockCryptoMarkets(filters),
  });

const getTrendingCrypto = (limit = 10) =>
  withFallback({
    useMockData: env.useMockData,
    provider: 'CoinGecko',
    live: () => getLiveTrendingCrypto(limit),
    mock: () => getMockCryptoMarkets({ limit }).sort((a, b) => (a.rank || 999) - (b.rank || 999)),
  });

const getCryptoBySymbol = async (symbol) => {
  const normalizedSymbol = normalizeSymbol(symbol);
  const items = await getCryptoMarkets({ symbol: normalizedSymbol, limit: 100 });
  return items.find((asset) => asset.symbol === normalizedSymbol) || null;
};

module.exports = {
  getCryptoMarkets,
  getTrendingCrypto,
  getCryptoBySymbol,
};
