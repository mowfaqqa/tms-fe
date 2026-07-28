import { api } from './client';
import type {
  ExpiringFilter,
  Notice,
  Paginated,
  Reminder,
  Tenant,
  TenantStatus,
} from '@/lib/types';

export interface TenantListParams {
  page?: number;
  limit?: number;
  search?: string;
  expiring?: ExpiringFilter;
  status?: TenantStatus;
}

export interface TenantPayload {
  fullName: string;
  phoneNumber: string;
  email: string;
  propertyId: string;
  tenancyStartDate: string;
  tenancyEndDate: string;
  rentAmount: number;
  status?: TenantStatus;
}

export const tenantsApi = {
  async list(params: TenantListParams): Promise<Paginated<Tenant>> {
    const { data } = await api.get<Paginated<Tenant>>('/tenants', { params });
    return data;
  },

  async get(id: string): Promise<Tenant> {
    const { data } = await api.get<Tenant>(`/tenants/${id}`);
    return data;
  },

  async reminders(id: string): Promise<Reminder[]> {
    const { data } = await api.get<Reminder[]>(`/tenants/${id}/reminders`);
    return data;
  },

  async notices(id: string): Promise<Notice[]> {
    const { data } = await api.get<Notice[]>(`/tenants/${id}/notices`);
    return data;
  },

  async create(payload: TenantPayload): Promise<Tenant> {
    const { data } = await api.post<Tenant>('/tenants', payload);
    return data;
  },

  async update(
    id: string,
    payload: Partial<TenantPayload>,
  ): Promise<Tenant> {
    const { data } = await api.patch<Tenant>(`/tenants/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/tenants/${id}`);
    return data;
  },
};
