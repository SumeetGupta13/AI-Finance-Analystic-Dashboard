import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import type {
  ApiResponse,
  Transaction,
  TransactionAnalytics,
  TransactionInput,
  TransactionSummary,
  TradeInput,
  TradeResult,
} from '../types/domain';

export type TransactionQuery = {
  type?: string;
  status?: string;
  category?: string;
  month?: number;
  year?: number;
  search?: string;
  limit?: number;
};

export const transactionService = {
  async create(input: TransactionInput) {
    const response = await api.post<ApiResponse<Transaction>>(endpoints.transactions.root, input);
    return response.data.data;
  },

  async list(query?: TransactionQuery) {
    const response = await api.get<ApiResponse<Transaction[]>>(endpoints.transactions.root, { params: query });
    return response.data.data;
  },

  async monthly(query?: TransactionQuery) {
    const response = await api.get<ApiResponse<TransactionAnalytics['monthly']>>(endpoints.transactions.monthly, { params: query });
    return response.data.data;
  },

  async summary(query?: TransactionQuery) {
    const response = await api.get<ApiResponse<TransactionSummary>>(endpoints.transactions.summary, { params: query });
    return response.data.data;
  },

  async analytics(query?: TransactionQuery) {
    const response = await api.get<ApiResponse<TransactionAnalytics>>(endpoints.transactions.analytics, { params: query });
    return response.data.data;
  },

  async getById(transactionId: string) {
    const response = await api.get<ApiResponse<Transaction>>(endpoints.transactions.detail(transactionId));
    return response.data.data;
  },

  async update(transactionId: string, input: Partial<TransactionInput>) {
    const response = await api.put<ApiResponse<Transaction>>(endpoints.transactions.detail(transactionId), input);
    return response.data.data;
  },

  async remove(transactionId: string) {
    const response = await api.delete<ApiResponse<Transaction>>(endpoints.transactions.detail(transactionId));
    return response.data.data;
  },

  async buy(input: TradeInput) {
    const response = await api.post<ApiResponse<TradeResult>>(endpoints.transactions.buy, input);
    return response.data.data;
  },

  async sell(input: TradeInput) {
    const response = await api.post<ApiResponse<TradeResult>>(endpoints.transactions.sell, input);
    return response.data.data;
  },
};
