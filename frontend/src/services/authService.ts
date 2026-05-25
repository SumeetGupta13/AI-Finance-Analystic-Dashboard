import api from '../api/axios';
import { endpoints } from '../api/endpoints';
import type { ApiResponse, User } from '../types/domain';

type AuthPayload = {
  user: User;
  token: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export const authService = {
  async register(input: RegisterInput) {
    const response = await api.post<ApiResponse<AuthPayload>>(endpoints.auth.register, input);
    return response.data.data;
  },

  async login(input: LoginInput) {
    const response = await api.post<ApiResponse<AuthPayload>>(endpoints.auth.login, input);
    return response.data.data;
  },

  async logout() {
    await api.post<ApiResponse<null>>(endpoints.auth.logout);
  },

  async profile() {
    const response = await api.get<ApiResponse<{ user: User }>>(endpoints.auth.profile);
    return response.data.data.user;
  },
};
