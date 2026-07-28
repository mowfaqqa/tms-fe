import { api } from './client';
import type { Paginated, Property, Tenant } from '@/lib/types';

export interface PropertyListParams {
  page?: number;
  limit?: number;
  search?: string;
  occupancy?: 'vacant' | 'occupied';
}

export interface PropertyPayload {
  address: string;
  unitNumber: string;
  label?: string;
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

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/properties/${id}`);
    return data;
  },
};
