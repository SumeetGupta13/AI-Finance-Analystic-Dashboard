import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, Candle, MarketAsset, MutualFund, NewsArticle } from '../types/domain';

export const marketService = {
  async getStocks(params?: Record<string, string>) {
    const response = await api.get<ApiResponse<MarketAsset[]>>(endpoints.market.stocks, { params });
    return response.data.data;
  },

  async getStockBySymbol(symbol: string) {
    const response = await api.get<ApiResponse<MarketAsset>>(endpoints.market.stock(symbol));
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
    const response = await api.get<ApiResponse<unknown>>(endpoints.market.trends);
    return response.data.data;
  },
};
