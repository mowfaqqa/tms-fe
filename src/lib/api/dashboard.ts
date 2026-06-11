import { api } from './client';
import type { DashboardMetrics, UpcomingAction } from '@/lib/types';

export const dashboardApi = {
  async metrics(): Promise<DashboardMetrics> {
    const { data } = await api.get<DashboardMetrics>('/dashboard/metrics');
    return data;
  },

  async upcomingActions(): Promise<UpcomingAction[]> {
    const { data } = await api.get<UpcomingAction[]>(
      '/dashboard/upcoming-actions',
    );
    return data;
  },
};
