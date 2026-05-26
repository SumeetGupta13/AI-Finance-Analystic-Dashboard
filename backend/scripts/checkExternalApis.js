const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const mongoose = require('mongoose');

const checks = [];

const addResult = (name, ok, error = '') => {
  checks.push({ name, ok, error });
};

const fetchJson = async (name, url, options = {}, validate = Boolean) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    let payload = {};

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { raw: text };
    }

    if (!response.ok) {
      const message = payload.error?.message || payload.message || payload.Note || payload.raw || `HTTP ${response.status}`;
      throw new Error(`HTTP ${response.status}: ${message}`);
    }

    if (!validate(payload)) {
      throw new Error('Unexpected response shape');
    }

    addResult(name, true);
  } catch (error) {
    const cause = error.cause?.code || error.cause?.message;
    addResult(name, false, cause ? `${error.message} (${cause})` : error.message);
  } finally {
    clearTimeout(timeout);
  }
};

const requireEnv = (name) => {
  if (!process.env[name] || !String(process.env[name]).trim()) {
    throw new Error(`${name} is missing`);
  }

  return String(process.env[name]).trim();
};

const checkMongo = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    addResult('MongoDB', false, 'MONGODB_URI or MONGO_URI is missing');
    return;
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    addResult('MongoDB', true);
  } catch (error) {
    addResult('MongoDB', false, error.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

const run = async () => {
  try {
    const finnhubApiKey = requireEnv('FINNHUB_API_KEY');
    const fmpApiKey = requireEnv('FMP_API_KEY');
    const newsApiKey = requireEnv('NEWS_API_KEY');
    const groqApiKey = requireEnv('GROQ_API_KEY');
    const coinGeckoApiKey = requireEnv('COINGECKO_API_KEY');
    const groqModel = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

    await fetchJson(
      'Finnhub quote',
      `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${encodeURIComponent(finnhubApiKey)}`,
      {},
      (payload) => typeof payload.c === 'number'
    );

    await fetchJson(
      'Finnhub company profile',
      `https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=${encodeURIComponent(finnhubApiKey)}`,
      {},
      (payload) => Boolean(payload.name || payload.ticker)
    );

    await fetchJson(
      'FMP historical prices',
      `https://financialmodelingprep.com/stable/historical-price-eod/full?symbol=AAPL&apikey=${encodeURIComponent(fmpApiKey)}`,
      {},
      (payload) => Array.isArray(payload)
    );

    await fetchJson(
      'FMP top gainers',
      `https://financialmodelingprep.com/stable/biggest-gainers?apikey=${encodeURIComponent(fmpApiKey)}`,
      {},
      (payload) => Array.isArray(payload)
    );

    await fetchJson(
      'NewsAPI headlines',
      `https://newsapi.org/v2/top-headlines?country=us&category=business&pageSize=1&apiKey=${encodeURIComponent(newsApiKey)}`,
      {},
      (payload) => Array.isArray(payload.articles)
    );

    await fetchJson(
      'CoinGecko markets',
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin&per_page=1&page=1&sparkline=false',
      { headers: { 'x-cg-demo-api-key': coinGeckoApiKey } },
      (payload) => Array.isArray(payload) && payload.length > 0
    );

    await fetchJson(
      'Groq chat completions',
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModel,
          temperature: 0,
          messages: [
            { role: 'system', content: 'Return JSON only.' },
            { role: 'user', content: 'Return {"ok":true}' },
          ],
        }),
      },
      (payload) => Array.isArray(payload.choices)
    );

    await checkMongo();
  } catch (error) {
    addResult('Environment variables', false, error.message);
  }

  checks.forEach((check) => {
    const suffix = check.ok ? '' : ` - ${check.error}`;
    console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name}${suffix}`);
  });

  if (checks.some((check) => !check.ok)) {
    process.exitCode = 1;
  }
};

run();
