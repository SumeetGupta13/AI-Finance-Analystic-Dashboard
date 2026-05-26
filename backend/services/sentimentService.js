const fs = require('fs');
const path = require('path');
const { env } = require('../config/env');
const { fetchJson: providerFetchJson } = require('./apiClient');
const { getRecommendation } = require('./tractionService');

const dataDirectory = path.join(__dirname, '..', 'data');
const groqBaseUrl = 'https://api.groq.com/openai/v1/chat/completions';

const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(dataDirectory, fileName), 'utf8'));

const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();

const round = (value, digits = 2) => Number((Number(value) || 0).toFixed(digits));

const parseJsonFromText = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = String(text || '').match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    return match ? JSON.parse(match[0]) : null;
  }
};

const fetchJson = (url, options = {}) => providerFetchJson(url, { provider: 'News sentiment provider', ...options });

const getMockSentimentAnalysis = (filters = {}) => {
  const symbol = normalizeSymbol(filters.symbol);
  const sentiment = String(filters.sentiment || '').trim().toLowerCase();

  return readJson('newsSentiment.json')
    .filter((item) => {
      const matchesSymbol = !symbol || normalizeSymbol(item.symbol) === symbol;
      const matchesSentiment = !sentiment || item.sentiment.toLowerCase() === sentiment || item.label.toLowerCase() === sentiment;
      return matchesSymbol && matchesSentiment;
    })
    .map((item) => ({
      ...item,
      confidencePercent: `${item.confidence}%`,
      recommendation: getRecommendation(50 + item.score * 35, item.score, 0),
    }));
};

const getSentimentDistribution = (items) => {
  const total = items.length || 1;
  const positive = items.filter((item) => ['positive', 'bullish'].includes(String(item.sentiment || item.label).toLowerCase())).length;
  const negative = items.filter((item) => ['negative', 'bearish'].includes(String(item.sentiment || item.label).toLowerCase())).length;
  const neutral = Math.max(items.length - positive - negative, 0);

  return {
    positive: Math.round((positive / total) * 100),
    negative: Math.round((negative / total) * 100),
    neutral: Math.round((neutral / total) * 100),
  };
};

const inferSentimentWithoutAI = (article) => {
  const text = `${article.title || ''} ${article.description || article.summary || ''}`.toLowerCase();
  const positiveWords = ['gain', 'gains', 'beat', 'beats', 'surge', 'rally', 'growth', 'strong', 'positive', 'record'];
  const negativeWords = ['fall', 'falls', 'miss', 'loss', 'weak', 'drop', 'decline', 'risk', 'negative', 'cuts'];
  const positiveScore = positiveWords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
  const negativeScore = negativeWords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
  const score = positiveScore === negativeScore ? 0 : (positiveScore - negativeScore) / Math.max(positiveScore + negativeScore, 1);
  const sentiment = score > 0.2 ? 'Positive' : score < -0.2 ? 'Negative' : 'Neutral';

  return {
    sentiment,
    label: sentiment === 'Positive' ? 'bullish' : sentiment === 'Negative' ? 'bearish' : 'neutral',
    score: round(score, 2),
    confidence: Math.min(95, 55 + Math.abs(score) * 40),
    reason: 'Derived from financial keyword polarity because Groq sentiment analysis is not configured.',
  };
};

const analyzeWithGroq = async (articles) => {
  if (!env.groqApiKey) {
    return articles.map(inferSentimentWithoutAI);
  }

  const prompt = [
    'Analyze these financial news headlines for market sentiment.',
    'Return only JSON array. Each item must include sentiment Positive/Neutral/Negative, label bullish/neutral/bearish, score -1..1, confidence 0..100, reason.',
    JSON.stringify(articles.map((article) => ({
      title: article.title,
      summary: article.description || article.summary,
      symbols: article.symbols || [],
    }))),
  ].join('\n');

  const payload = await fetchJson(groqBaseUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.groqModel,
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are a financial sentiment analysis engine. Return strict JSON only.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const content = payload.choices?.[0]?.message?.content || '';
  const parsed = parseJsonFromText(content);

  if (!Array.isArray(parsed)) {
    return articles.map(inferSentimentWithoutAI);
  }

  return parsed.map((item, index) => ({
    ...inferSentimentWithoutAI(articles[index] || {}),
    ...item,
    score: round(item.score, 2),
    confidence: Math.round(Number(item.confidence) || 65),
  }));
};

const getLiveNewsSentiment = async (filters = {}) => {
  if (!env.newsApiKey) {
    throw new Error('NEWS_API_KEY is required when USE_MOCK_DATA=false for news sentiment');
  }

  const query = filters.q || filters.symbol || 'stock market OR finance OR earnings OR crypto';
  const url = new URL('https://newsapi.org/v2/everything');
  url.searchParams.set('q', query);
  url.searchParams.set('language', 'en');
  url.searchParams.set('sortBy', 'publishedAt');
  url.searchParams.set('pageSize', String(filters.limit || 10));
  url.searchParams.set('apiKey', env.newsApiKey);

  const payload = await fetchJson(url.toString());
  const articles = payload.articles || [];
  const analysis = await analyzeWithGroq(articles);

  return articles.map((article, index) => ({
    id: article.url || `news_${index}`,
    title: article.title,
    source: article.source?.name || 'NewsAPI',
    summary: article.description || article.content || '',
    publishedAt: article.publishedAt,
    category: 'Markets',
    symbols: filters.symbol ? [normalizeSymbol(filters.symbol)] : [],
    ...analysis[index],
    sentimentScore: analysis[index]?.score || 0,
    confidence: Math.round(analysis[index]?.confidence || 65),
  }));
};

const getNewsSentimentDashboard = async (filters = {}) => {
  let items;

  if (env.useMockData) {
    items = getMockSentimentAnalysis(filters);
  } else {
    try {
      items = await getLiveNewsSentiment(filters);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        const code = error.statusCode ? ` (${error.statusCode})` : '';
        console.warn(`[News sentiment] live providers failed${code}; serving fallback sentiment data.`);
      }
      items = getMockSentimentAnalysis(filters);
    }
  }

  return {
    items,
    distribution: getSentimentDistribution(items),
    summary: {
      total: items.length,
      positive: items.filter((item) => String(item.sentiment).toLowerCase() === 'positive').length,
      negative: items.filter((item) => String(item.sentiment).toLowerCase() === 'negative').length,
      neutral: items.filter((item) => String(item.sentiment).toLowerCase() === 'neutral').length,
    },
  };
};

module.exports = {
  getMockSentimentAnalysis,
  getLiveNewsSentiment,
  getNewsSentimentDashboard,
  getSentimentDistribution,
};
