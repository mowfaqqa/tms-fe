import { api } from './client';
import type { AppNotification, Paginated } from '@/lib/types';

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationsApi = {
  async list(
    params: NotificationListParams,
  ): Promise<Paginated<AppNotification>> {
    const { data } = await api.get<Paginated<AppNotification>>(
      '/notifications',
      { params },
    );
    return data;
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get<{ count: number }>(
      '/notifications/unread-count',
    );
    return data.count;
  },

  async markRead(id: string): Promise<AppNotification> {
    const { data } = await api.patch<AppNotification>(
      `/notifications/${id}/read`,
    );
    return data;
  },

  async markAllRead(): Promise<{ updated: number }> {
    const { data } = await api.patch('/notifications/read-all');
    return data;
  },
};
