// API types mirrored from tms-be/docs/FRONTEND_GUIDE.md

export type Role = 'ADMIN' | 'STAFF';
export type TenantStatus = 'ACTIVE' | 'EXPIRED' | 'RENEWED';
export type ReminderType =
  | 'SIX_MONTH'
  | 'THREE_MONTH'
  | 'ONE_MONTH'
  | 'FOURTEEN_DAY';
export type ReminderStatus = 'PENDING' | 'TRIGGERED' | 'ACKNOWLEDGED';
export type NotificationChannel = 'DASHBOARD' | 'EMAIL';
export type NoticeType = 'QUIT' | 'RENEWAL' | 'GENERAL';
export type NoticeStatus = 'DRAFT' | 'ISSUED';
export type ExpiringFilter = '6m' | '3m' | '30d' | 'expired';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface Reminder {
  id: string;
  tenantId: string;
  type: ReminderType;
  dueDate: string;
  status: ReminderStatus;
  triggeredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tenant {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  propertyAddress: string;
  unitNumber: string;
  tenancyStartDate: string;
  tenancyEndDate: string;
  rentAmount: string; // decimal serialized as string
  status: TenantStatus;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  reminders?: Reminder[];
}

export interface NotificationTenantRef {
  id: string;
  fullName: string;
  propertyAddress: string;
}

export interface AppNotification {
  id: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  isRead: boolean;
  tenantId: string | null;
  reminderId: string | null;
  createdAt: string;
  tenant?: NotificationTenantRef | null;
}

export interface Notice {
  id: string;
  tenantId: string;
  type: NoticeType;
  status: NoticeStatus;
  title: string;
  body: string;
  effectiveDate: string | null;
  issuedById: string | null;
  issuedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tenant?: Tenant | NotificationTenantRef;
}

export interface IssuedNotice extends Notice {
  emailSent: boolean;
}

export interface DashboardMetrics {
  totalActiveTenants: number;
  expiringWithin6Months: number;
  expiringWithin3Months: number;
  expiringWithin30Days: number;
  expiredTenancies: number;
}

export interface UpcomingAction {
  reminderId: string;
  tenantId: string;
  tenantName: string;
  property: string;
  expiryDate: string;
  reminderDueDate: string;
  reminderType: string; // already human-labeled by the server
  actionStatus: ReminderStatus;
}

export interface ReportResponse {
  report: string;
  generatedAt: string;
  params: Record<string, unknown>;
  count: number;
  rows: Tenant[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  path?: string;
  timestamp?: string;
}
