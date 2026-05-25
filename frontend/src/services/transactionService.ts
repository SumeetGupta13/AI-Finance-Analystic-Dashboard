import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, AssetType, Transaction } from '../types/domain';

type TradeInput = {
  assetType: AssetType;
  symbol: string;
  quantity: number;
};

export const transactionService = {
  async buy(input: TradeInput) {
    const response = await api.post<ApiResponse<unknown>>(endpoints.transactions.buy, input);
    return response.data.data;
  },

  async sell(input: TradeInput) {
    const response = await api.post<ApiResponse<unknown>>(endpoints.transactions.sell, input);
    return response.data.data;
  },

  async list() {
    const response = await api.get<ApiResponse<Transaction[]>>(endpoints.transactions.root);
    return response.data.data;
  },
};
