import { api } from './client';
import type {
  AssignedPropertiesRow,
  Property,
  ReportResponse,
  StaffActivityRow,
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

export const reportsApi = {
  async get<K extends ReportKey>(
    key: K,
  ): Promise<ReportResponse<ReportRowTypes[K]>> {
    const { data } = await api.get<ReportResponse<ReportRowTypes[K]>>(
      ENDPOINTS[key],
    );
    return data;
  },
};
