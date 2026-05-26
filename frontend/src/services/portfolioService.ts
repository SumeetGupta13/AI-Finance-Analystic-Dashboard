import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, AssetType, PortfolioAnalytics, PortfolioPayload, TradeInput, TradeResult, Transaction } from '../types/domain';

export const portfolioService = {
  async getPortfolio() {
    const response = await api.get<ApiResponse<PortfolioPayload>>(endpoints.portfolio.root);
    return response.data.data;
  },

  async getAnalytics() {
    const response = await api.get<ApiResponse<PortfolioAnalytics>>(endpoints.portfolio.analytics);
    return response.data.data;
  },

  async buy(input: TradeInput) {
    const response = await api.post<ApiResponse<TradeResult>>(endpoints.portfolio.buy, input);
    return response.data.data;
  },

  async sell(input: TradeInput) {
    const response = await api.post<ApiResponse<TradeResult>>(endpoints.portfolio.sell, input);
    return response.data.data;
  },

  async getTransactions() {
    const response = await api.get<ApiResponse<Transaction[]>>(endpoints.portfolio.transactions);
    return response.data.data;
  },

  async getProfitLoss() {
    const response = await api.get<ApiResponse<PortfolioAnalytics['summary'] & { winners: unknown[]; losers: unknown[] }>>(endpoints.portfolio.profitLoss);
    return response.data.data;
  },

  async addHolding(input: { assetType: AssetType; symbol: string; quantity: number }) {
    const response = await api.post<ApiResponse<unknown>>(endpoints.portfolio.holdings, input);
    return response.data.data;
  },

  async updateHolding(holdingId: string, input: { quantity?: number; averagePrice?: number }) {
    const response = await api.patch<ApiResponse<unknown>>(endpoints.portfolio.holding(holdingId), input);
    return response.data.data;
  },

  async removeHolding(holdingId: string) {
    const response = await api.delete<ApiResponse<unknown>>(endpoints.portfolio.holding(holdingId));
    return response.data.data;
  },
};
