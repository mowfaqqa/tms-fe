import { api } from './client';
import type { Paginated, Property, Tenant } from '@/lib/types';

export interface PropertyListParams {
  page?: number;
  limit?: number;
  search?: string;
  occupancy?: 'vacant' | 'occupied' | 'occupied_expired';
}

export interface PropertyPayload {
  address: string;
  unitNumber: string;
  label?: string;
}

export interface ConfirmVacancyPayload {
  /** When the property was handed back. Defaults to now server-side. */
  vacatedAt?: string;
  note?: string;
  /** Close a still-running tenancy too — an early move-out. */
  endRunningTenancy?: boolean;
}

export const propertiesApi = {
  async list(params: PropertyListParams): Promise<Paginated<Property>> {
    const { data } = await api.get<Paginated<Property>>('/properties', {
      params,
    });
    return data;
  },

  async get(id: string): Promise<Property> {
    const { data } = await api.get<Property>(`/properties/${id}`);
    return data;
  },

  async tenants(id: string): Promise<Tenant[]> {
    const { data } = await api.get<Tenant[]>(`/properties/${id}/tenants`);
    return data;
  },

  async create(payload: PropertyPayload): Promise<Property> {
    const { data } = await api.post<Property>('/properties', payload);
    return data;
  },

  async update(
    id: string,
    payload: Partial<PropertyPayload>,
  ): Promise<Property> {
    const { data } = await api.patch<Property>(`/properties/${id}`, payload);
    return data;
  },

  /**
   * Confirms the property empty. Nothing else makes a let property vacant —
   * a tenancy expiring only means the term lapsed.
   */
  async confirmVacancy(
    id: string,
    payload: ConfirmVacancyPayload,
  ): Promise<Property> {
    const { data } = await api.post<Property>(
      `/properties/${id}/vacancy`,
      payload,
    );
    return data;
  },

  async clearVacancy(id: string): Promise<Property> {
    const { data } = await api.delete<Property>(`/properties/${id}/vacancy`);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/properties/${id}`);
    return data;
  },
};
