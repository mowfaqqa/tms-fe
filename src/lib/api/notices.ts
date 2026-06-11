import { api, downloadFile } from './client';
import type {
  IssuedNotice,
  Notice,
  NoticeStatus,
  NoticeType,
  Paginated,
} from '@/lib/types';

export interface NoticeListParams {
  page?: number;
  limit?: number;
  tenantId?: string;
  type?: NoticeType;
  status?: NoticeStatus;
}

export interface CreateNoticePayload {
  tenantId: string;
  type: NoticeType;
  noticePeriodDays?: number;
  proposedRentAmount?: number;
  renewalTermMonths?: number;
  customMessage?: string;
}

export const noticesApi = {
  async list(params: NoticeListParams): Promise<Paginated<Notice>> {
    const { data } = await api.get<Paginated<Notice>>('/notices', { params });
    return data;
  },

  async get(id: string): Promise<Notice> {
    const { data } = await api.get<Notice>(`/notices/${id}`);
    return data;
  },

  async create(payload: CreateNoticePayload): Promise<Notice> {
    const { data } = await api.post<Notice>('/notices', payload);
    return data;
  },

  async update(
    id: string,
    payload: { title?: string; body?: string },
  ): Promise<Notice> {
    const { data } = await api.patch<Notice>(`/notices/${id}`, payload);
    return data;
  },

  async issue(id: string): Promise<IssuedNotice> {
    const { data } = await api.patch<IssuedNotice>(`/notices/${id}/issue`);
    return data;
  },

  async remove(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/notices/${id}`);
    return data;
  },

  downloadPdf(id: string): Promise<void> {
    return downloadFile(`/notices/${id}/pdf`, `notice-${id}.pdf`);
  },
};
