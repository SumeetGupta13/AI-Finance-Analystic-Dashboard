import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, User } from '../types/domain';

export const settingsService = {
  async getSettings() {
    const response = await api.get<ApiResponse<{ user: User; portfolio: unknown }>>(endpoints.settings.root);
    return response.data.data;
  },

  async updateProfile(input: { name?: string; avatar?: string }) {
    const response = await api.patch<ApiResponse<User>>(endpoints.settings.profile, input);
    return response.data.data;
  },

  async updatePreferences(input: { currency?: 'INR' | 'USD'; defaultMarket?: 'IN' | 'US' | 'GLOBAL'; riskProfile?: 'conservative' | 'balanced' | 'aggressive' }) {
    const response = await api.patch<ApiResponse<User>>(endpoints.settings.preferences, input);
    return response.data.data;
  },
};
