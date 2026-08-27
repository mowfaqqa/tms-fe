import type { IssueListParams } from './api/issues';
import type { NoticeListParams } from './api/notices';
import type { NotificationListParams } from './api/notifications';
import type { PropertyListParams } from './api/properties';
import type { ReportKey, ReportParams } from './api/reports';
import type { StaffActivityParams, StaffListParams } from './api/staff';
import type { TenantListParams } from './api/tenants';

export const queryKeys = {
  dashboard: {
    metrics: ['dashboard', 'metrics'] as const,
    upcomingActions: ['dashboard', 'upcoming-actions'] as const,
  },
  tenants: {
    all: ['tenants'] as const,
    list: (params: TenantListParams) => ['tenants', 'list', params] as const,
    detail: (id: string) => ['tenants', 'detail', id] as const,
    reminders: (id: string) => ['tenants', id, 'reminders'] as const,
    notices: (id: string) => ['tenants', id, 'notices'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params: NotificationListParams) =>
      ['notifications', 'list', params] as const,
    unreadCount: ['notifications', 'unread-count'] as const,
  },
  notices: {
    all: ['notices'] as const,
    list: (params: NoticeListParams) => ['notices', 'list', params] as const,
    detail: (id: string) => ['notices', 'detail', id] as const,
  },
  issues: {
    all: ['issues'] as const,
    list: (params: IssueListParams) => ['issues', 'list', params] as const,
    detail: (id: string) => ['issues', 'detail', id] as const,
    summary: ['issues', 'summary'] as const,
  },
  reports: {
    detail: (key: ReportKey, params: ReportParams = {}) =>
      ['reports', key, params] as const,
    staffActivitySummary: (params: ReportParams = {}) =>
      ['reports', 'staff-activity', 'summary', params] as const,
  },
  properties: {
    all: ['properties'] as const,
    list: (params: PropertyListParams) =>
      ['properties', 'list', params] as const,
    detail: (id: string) => ['properties', 'detail', id] as const,
    tenants: (id: string) => ['properties', id, 'tenants'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (params: StaffListParams) => ['staff', 'list', params] as const,
    detail: (id: string) => ['staff', 'detail', id] as const,
    activity: (id: string, params: StaffActivityParams = {}) =>
      ['staff', id, 'activity', params] as const,
  },
};
