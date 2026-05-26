import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import { getCachedValue, setCachedValue } from '../utils/serviceCache';
import type {
  AIInsightPayload,
  ApiResponse,
  Candle,
  MarketAsset,
  MarketTrendOverview,
  MutualFund,
  NewsArticle,
  SentimentAnalysis,
} from '../types/domain';

export const marketService = {
  async getStocks(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<MarketAsset[]>>(endpoints.market.stocks, { params });
    return response.data.data;
  },

  async getStockBySymbol(symbol: string) {
    const response = await api.get<ApiResponse<MarketAsset>>(endpoints.market.stock(symbol));
    return response.data.data;
  },

  async getStockQuote(symbol: string) {
    const response = await api.get<ApiResponse<MarketAsset>>(endpoints.market.quote(symbol));
    return response.data.data;
  },

  async getQuotes(symbols: string[]) {
    const cacheKey = `stockiq_quotes_${symbols.map((symbol) => symbol.toUpperCase()).sort().join('_')}`;

    try {
      const response = await api.post<ApiResponse<MarketAsset[]>>(endpoints.market.quotes, { symbols });
      setCachedValue(cacheKey, response.data.data);
      return response.data.data;
    } catch {
      return getCachedValue<MarketAsset[]>(cacheKey) || [];
    }
  },

  async getCompanyProfile(symbol: string) {
    const response = await api.get<ApiResponse<Record<string, unknown>>>(endpoints.market.profile(symbol));
    return response.data.data;
  },

  async getTrending() {
    const response = await api.get<ApiResponse<MarketAsset[]>>(endpoints.market.trending);
    return response.data.data;
  },

  async getTopGainers(limit = 5) {
    const response = await api.get<ApiResponse<MarketAsset[]>>(endpoints.market.gainers, { params: { limit } });
    return response.data.data;
  },

  async getTopLosers(limit = 5) {
    const response = await api.get<ApiResponse<MarketAsset[]>>(endpoints.market.losers, { params: { limit } });
    return response.data.data;
  },

  async getCryptoMarkets(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<MarketAsset[]>>(endpoints.market.crypto, { params });
    return response.data.data;
  },

  async getTrendingCrypto(limit = 10) {
    const response = await api.get<ApiResponse<MarketAsset[]>>(endpoints.market.trendingCrypto, { params: { limit } });
    return response.data.data;
  },

  async getMutualFunds(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<MutualFund[]>>(endpoints.market.mutualFunds, { params });
    return response.data.data;
  },

  async getHistoricalData(symbol: string, range = '1M') {
    const response = await api.get<ApiResponse<{ symbol: string; range: string; candles: Candle[] }>>(
      endpoints.market.history(symbol),
      { params: { range } }
    );
    return response.data.data;
  },

  async getMarketNews(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<NewsArticle[]>>(endpoints.market.news, { params });
    return response.data.data;
  },

  async getMarketTrends() {
    const response = await api.get<ApiResponse<MarketTrendOverview>>(endpoints.market.trends);
    return response.data.data;
  },

  async getSentimentAnalysis(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<SentimentAnalysis[]>>(endpoints.market.sentiment, { params });
    return response.data.data;
  },

  async getAIInsights(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<AIInsightPayload>>(endpoints.market.aiInsights, { params });
    return response.data.data;
  },
};
