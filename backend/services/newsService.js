const fs = require('fs');
const path = require('path');
const { env } = require('../config/env');
const { buildUrl, fetchJson, withFallback } = require('./apiClient');

const dataDirectory = path.join(__dirname, '..', 'data');

const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(dataDirectory, fileName), 'utf8'));
const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();

const inferSentiment = (text = '') => {
  const value = text.toLowerCase();
  const positive = ['gain', 'rally', 'surge', 'beat', 'growth', 'bullish', 'profit', 'record'];
  const negative = ['fall', 'drop', 'miss', 'loss', 'bearish', 'risk', 'probe', 'warning'];
  const score = positive.reduce((sum, word) => sum + (value.includes(word) ? 1 : 0), 0) -
    negative.reduce((sum, word) => sum + (value.includes(word) ? 1 : 0), 0);

  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
};

const mapNewsArticle = (article, index, category = 'Markets') => {
  const title = article.title || 'Market update';
  const summary = article.description || article.content || '';

  return {
    id: article.url || `live_news_${index}`,
    title,
    source: article.source?.name || article.source || 'NewsAPI',
    summary,
    publishedAt: article.publishedAt || new Date().toISOString(),
    url: article.url,
    imageUrl: article.urlToImage,
    category,
    sentiment: inferSentiment(`${title} ${summary}`),
    symbols: [],
  };
};

const filterMockNews = (filters = {}) => {
  const category = String(filters.category || '').trim().toLowerCase();
  const symbol = normalizeSymbol(filters.symbol);
  const sentiment = String(filters.sentiment || '').trim().toLowerCase();
  const search = String(filters.search || filters.q || '').trim().toLowerCase();
  const limit = Number(filters.limit) || undefined;

  const items = readJson('marketNews.json').filter((article) => {
    const matchesCategory = !category || article.category.toLowerCase() === category;
    const matchesSymbol = !symbol || article.symbols.includes(symbol);
    const matchesSentiment = !sentiment || article.sentiment.toLowerCase() === sentiment;
    const matchesSearch =
      !search ||
      article.title.toLowerCase().includes(search) ||
      article.summary.toLowerCase().includes(search);
    return matchesCategory && matchesSymbol && matchesSentiment && matchesSearch;
  });

  return limit ? items.slice(0, limit) : items;
};

const getLiveFinancialNews = async (filters = {}) => {
  if (!env.newsApiKey) {
    throw new Error('NEWS_API_KEY is required for live financial news');
  }

  const category = filters.category || 'Markets';
  const query = filters.q || filters.search || filters.symbol || 'stock market OR finance OR earnings OR crypto';
  const url = buildUrl('https://newsapi.org/v2/everything', {
    q: query,
    language: 'en',
    sortBy: filters.sortBy || 'publishedAt',
    pageSize: Number(filters.limit) || 20,
    apiKey: env.newsApiKey,
  });
  const payload = await fetchJson(url, { provider: 'NewsAPI' });

  return (payload.articles || []).map((article, index) => mapNewsArticle(article, index, category));
};

const getLiveHeadlines = async (filters = {}) => {
  if (!env.newsApiKey) {
    throw new Error('NEWS_API_KEY is required for live financial headlines');
  }

  const url = buildUrl('https://newsapi.org/v2/top-headlines', {
    country: filters.country || 'us',
    category: filters.category || 'business',
    pageSize: Number(filters.limit) || 20,
    apiKey: env.newsApiKey,
  });
  const payload = await fetchJson(url, { provider: 'NewsAPI' });

  return (payload.articles || []).map((article, index) => mapNewsArticle(article, index, 'Business'));
};

const getFinancialNews = (filters = {}) =>
  withFallback({
    useMockData: env.useMockData,
    provider: 'NewsAPI',
    live: () => getLiveFinancialNews(filters),
    mock: () => filterMockNews(filters),
  });

const getFinancialHeadlines = (filters = {}) =>
  withFallback({
    useMockData: env.useMockData,
    provider: 'NewsAPI',
    live: () => getLiveHeadlines(filters),
    mock: () => filterMockNews({ ...filters, category: filters.category || '' }),
  });

const getNewsCategories = () => {
  const categories = new Set(readJson('marketNews.json').map((article) => article.category));
  return Array.from(categories).sort();
};

module.exports = {
  getFinancialNews,
  getFinancialHeadlines,
  getNewsCategories,
};
