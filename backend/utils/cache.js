const NodeCache = require('node-cache');
const { env } = require('../config/env');

const cache = new NodeCache({ stdTTL: env.cacheTtlMarket, checkperiod: 120 });

const isCacheEnabled = () => env.enableApiCache;

const getCache = (key) => {
  if (!isCacheEnabled()) return null;
  return cache.get(key);
};

const setCache = (key, value, ttl = env.cacheTtlMarket) => {
  if (!isCacheEnabled()) return false;
  return cache.set(key, value, ttl);
};

const getOrSetCache = async (key, fetchFunction, ttl = env.cacheTtlMarket) => {
  if (!isCacheEnabled()) {
    return fetchFunction();
  }

  const cachedValue = getCache(key);
  if (cachedValue !== undefined && cachedValue !== null) {
    return cachedValue;
  }

  const freshValue = await fetchFunction();
  if (freshValue) {
    setCache(key, freshValue, ttl);
  }
  return freshValue;
};

const getStaleCache = (key) => cache.get(key);

const flushCache = () => {
  cache.flushAll();
};

module.exports = {
  getCache,
  getStaleCache,
  setCache,
  getOrSetCache,
  flushCache,
};
