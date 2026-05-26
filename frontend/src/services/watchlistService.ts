import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, AssetType, Watchlist } from '../types/domain';

export const watchlistService = {
  async list() {
    const response = await api.get<ApiResponse<Watchlist[]>>(endpoints.watchlists.root);
    return response.data.data;
  },

  async create(name: string) {
    const response = await api.post<ApiResponse<Watchlist>>(endpoints.watchlists.root, { name });
    return response.data.data;
  },

  async getPrimary() {
    const response = await api.get<ApiResponse<Watchlist>>(endpoints.watchlist.root);
    return response.data.data;
  },

  async addSymbol(input: { assetType?: AssetType; symbol: string }) {
    const response = await api.post<ApiResponse<Watchlist>>(endpoints.watchlist.root, input);
    return response.data.data;
  },

  async addItem(watchlistId: string, input: { assetType: AssetType; symbol: string }) {
    const response = await api.post<ApiResponse<Watchlist>>(endpoints.watchlists.items(watchlistId), input);
    return response.data.data;
  },

  async removeItem(watchlistId: string, symbol: string) {
    const response = await api.delete<ApiResponse<Watchlist>>(endpoints.watchlists.item(watchlistId, symbol));
    return response.data.data;
  },

  async removeSymbol(symbol: string) {
    const response = await api.delete<ApiResponse<Watchlist>>(endpoints.watchlist.symbol(symbol));
    return response.data.data;
  },

  async remove(watchlistId: string) {
    const response = await api.delete<ApiResponse<Watchlist>>(endpoints.watchlists.detail(watchlistId));
    return response.data.data;
  },
};
