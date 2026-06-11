import { api } from './client';
import type { LoginResponse } from '@/lib/types';

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return data;
  },
};
