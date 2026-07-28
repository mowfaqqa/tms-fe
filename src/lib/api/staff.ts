import { api } from './client';
import type { Paginated, StaffUser } from '@/lib/types';

export interface StaffListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  password: string;
  propertyIds?: string[];
}

export interface UpdateStaffPayload {
  fullName?: string;
  email?: string;
}

export const staffApi = {
  async list(params: StaffListParams): Promise<Paginated<StaffUser>> {
    const { data } = await api.get<Paginated<StaffUser>>('/staff', {
      params,
    });
    return data;
  },

  async get(id: string): Promise<StaffUser> {
    const { data } = await api.get<StaffUser>(`/staff/${id}`);
    return data;
  },

  async create(payload: CreateStaffPayload): Promise<StaffUser> {
    const { data } = await api.post<StaffUser>('/staff', payload);
    return data;
  },

  async update(id: string, payload: UpdateStaffPayload): Promise<StaffUser> {
    const { data } = await api.patch<StaffUser>(`/staff/${id}`, payload);
    return data;
  },

  async deactivate(id: string): Promise<StaffUser> {
    const { data } = await api.patch<StaffUser>(`/staff/${id}/deactivate`);
    return data;
  },

  async reactivate(id: string): Promise<StaffUser> {
    const { data } = await api.patch<StaffUser>(`/staff/${id}/reactivate`);
    return data;
  },

  async assignProperties(
    id: string,
    propertyIds: string[],
  ): Promise<StaffUser> {
    const { data } = await api.put<StaffUser>(`/staff/${id}/properties`, {
      propertyIds,
    });
    return data;
  },
};
