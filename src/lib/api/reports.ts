import { api } from './client';
import type {
  ActivityAction,
  AssignedPropertiesRow,
  Property,
  ReportResponse,
  StaffActivityRow,
  StaffActivitySummary,
  Tenant,
} from '@/lib/types';

export type ReportKey =
  | 'upcoming'
  | 'active'
  | 'expired'
  | 'recently-added'
  | 'vacant-properties'
  | 'occupied-properties'
  | 'staff-activity'
  | 'assigned-properties';

const ENDPOINTS: Record<ReportKey, string> = {
  upcoming: '/reports/upcoming-expirations',
  active: '/reports/active-tenants',
  expired: '/reports/expired-tenants',
  'recently-added': '/reports/recently-added-tenants',
  'vacant-properties': '/reports/vacant-properties',
  'occupied-properties': '/reports/occupied-properties',
  'staff-activity': '/reports/staff-activity',
  'assigned-properties': '/reports/assigned-properties',
};

/** Row type each report key resolves to — used by useReport<T>() call sites. */
export interface ReportRowTypes {
  upcoming: Tenant;
  active: Tenant;
  expired: Tenant;
  'recently-added': Tenant;
  'vacant-properties': Property;
  'occupied-properties': Property;
  'staff-activity': StaffActivityRow;
  'assigned-properties': AssignedPropertiesRow;
}

/** Report keys visible only to ADMIN — hide their tabs for STAFF in the UI. */
export const ADMIN_ONLY_REPORTS: ReportKey[] = [
  'staff-activity',
  'assigned-properties',
];

/**
 * Staff activity is the one paginated report — the audit log grows without
 * bound, so the server pages it. The others return a bounded result set in
 * full and ignore these params.
 */
export interface ReportParams {
  page?: number;
  limit?: number;
  staffId?: string;
  from?: string;
  to?: string;
  action?: ActivityAction;
  entityType?: string;
}

export const reportsApi = {
  async get<K extends ReportKey>(
    key: K,
    params: ReportParams = {},
  ): Promise<ReportResponse<ReportRowTypes[K]>> {
    const { data } = await api.get<ReportResponse<ReportRowTypes[K]>>(
      ENDPOINTS[key],
      { params },
    );
    return data;
  },

  /** Action counts and activity span, for the same filters as `get`. */
  async staffActivitySummary(
    params: ReportParams = {},
  ): Promise<StaffActivitySummary> {
    const { data } = await api.get<StaffActivitySummary>(
      '/reports/staff-activity/summary',
      { params },
    );
    return data;
  },
};
