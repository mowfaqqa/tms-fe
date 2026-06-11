import { api } from './client';
import type { ReportResponse } from '@/lib/types';

export type ReportKey = 'upcoming' | 'active' | 'expired';

const ENDPOINTS: Record<ReportKey, string> = {
  upcoming: '/reports/upcoming-expirations',
  active: '/reports/active-tenants',
  expired: '/reports/expired-tenants',
};

export const reportsApi = {
  async get(key: ReportKey): Promise<ReportResponse> {
    const { data } = await api.get<ReportResponse>(ENDPOINTS[key]);
    return data;
  },
};
