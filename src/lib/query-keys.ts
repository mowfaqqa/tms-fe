import type { NoticeListParams } from './api/notices';
import type { NotificationListParams } from './api/notifications';
import type { ReportKey } from './api/reports';
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
  reports: {
    detail: (key: ReportKey) => ['reports', key] as const,
  },
};
