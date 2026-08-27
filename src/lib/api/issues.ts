import { api } from './client';
import type {
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  IssueSummary,
  Paginated,
} from '@/lib/types';

export interface IssueListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: IssueStatus;
  category?: IssueCategory;
  priority?: IssuePriority;
  raisedById?: string;
  propertyId?: string;
  /** OPEN and IN_REVIEW only — the admin's working queue. */
  openOnly?: boolean;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  category?: IssueCategory;
  priority?: IssuePriority;
  propertyId?: string;
  tenantId?: string;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  category?: IssueCategory;
  priority?: IssuePriority;
}

export interface ChangeIssueStatusPayload {
  status: IssueStatus;
  /** Required by the server when moving to RESOLVED or REJECTED. */
  resolutionNote?: string;
}

export const issuesApi = {
  async list(params: IssueListParams): Promise<Paginated<Issue>> {
    const { data } = await api.get<Paginated<Issue>>('/issues', { params });
    return data;
  },

  async summary(): Promise<IssueSummary> {
    const { data } = await api.get<IssueSummary>('/issues/summary');
    return data;
  },

  async get(id: string): Promise<Issue> {
    const { data } = await api.get<Issue>(`/issues/${id}`);
    return data;
  },

  async create(payload: CreateIssuePayload): Promise<Issue> {
    const { data } = await api.post<Issue>('/issues', payload);
    return data;
  },

  async update(id: string, payload: UpdateIssuePayload): Promise<Issue> {
    const { data } = await api.patch<Issue>(`/issues/${id}`, payload);
    return data;
  },

  async changeStatus(
    id: string,
    payload: ChangeIssueStatusPayload,
  ): Promise<Issue> {
    const { data } = await api.patch<Issue>(`/issues/${id}/status`, payload);
    return data;
  },
};
