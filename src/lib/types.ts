// API types mirrored from tms-be/docs/FRONTEND_GUIDE.md

export type Role = 'ADMIN' | 'STAFF';
export type TenantStatus = 'ACTIVE' | 'EXPIRED' | 'RENEWED';
export type MaritalStatus =
  | 'SINGLE'
  | 'MARRIED'
  | 'DIVORCED'
  | 'WIDOWED'
  | 'SEPARATED';
export type IdentificationType =
  | 'DRIVERS_LICENSE'
  | 'INTERNATIONAL_PASSPORT'
  | 'NATIONAL_ID';
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
export type OccupancyStatus = 'VACANT' | 'OCCUPIED';
export type ActivityAction =
  | 'PROPERTY_CREATED'
  | 'PROPERTY_UPDATED'
  | 'TENANT_CREATED'
  | 'TENANT_UPDATED'
  | 'STAFF_CREATED'
  | 'STAFF_UPDATED'
  | 'STAFF_DEACTIVATED'
  | 'STAFF_REACTIVATED'
  | 'PROPERTY_ASSIGNED'
  | 'PROPERTY_UNASSIGNED';

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

export interface Property {
  id: string;
  address: string;
  unitNumber: string;
  label: string | null;
  activeTenantCount: number;
  occupancyStatus: OccupancyStatus;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyRef {
  id: string;
  address: string;
  unitNumber: string;
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
  propertyId: string;
  property?: PropertyRef;
  tenancyStartDate: string;
  tenancyEndDate: string;
  rentAmount: string; // decimal serialized as string
  status: TenantStatus;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  reminders?: Reminder[];
  // Acquaintance form — personal details
  age: number | null;
  profession: string | null;
  nationality: string | null;
  homeAddress: string | null;
  officeAddress: string | null;
  officePhoneNumber: string | null;
  maritalStatus: MaritalStatus | null;
  stateOfOrigin: string | null;
  lga: string | null;
  // Acquaintance form — family / dependants
  spouseName: string | null;
  spouseOfficeAddress: string | null;
  spousePhoneNumber: string | null;
  numberOfChildren: number | null;
  numberOfDependants: number | null;
  // Acquaintance form — means of identification
  identificationType: IdentificationType | null;
  identificationNumber: string | null;
  // Acquaintance form — history & referee
  lastResidentialAddress: string | null;
  reasonForLeaving: string | null;
  applicantSignature: string | null;
  applicantSignedAt: string | null;
  agentName: string | null;
  refereeName: string | null;
  refereeProfession: string | null;
  refereeAddress: string | null;
  refereePhoneNumber: string | null;
  refereeSignature: string | null;
  refereeSignedAt: string | null;
  // Acquaintance form — for official use only
  serviceCharge: string | null; // decimal serialized as string
  generalRemark: string | null;
  officialSignature: string | null;
  officialSignedAt: string | null;
}

export interface NotificationTenantRef {
  id: string;
  fullName: string;
  property?: PropertyRef;
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
  totalProperties: number;
  occupiedProperties: number;
  vacantProperties: number;
}

export interface StaffAssignment {
  id: string;
  propertyId: string;
  staffId: string;
  assignedById: string | null;
  createdAt: string;
  property: Property;
}

export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staffAssignments: StaffAssignment[];
}

export interface ActivityLogEntry {
  id: string;
  actorId: string | null;
  actor?: { id: string; fullName: string; email: string } | null;
  action: ActivityAction;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
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

export interface ReportResponse<T = Tenant> {
  report: string;
  generatedAt: string;
  params: Record<string, unknown>;
  count: number;
  rows: T[];
}

export type StaffActivityRow = ActivityLogEntry;

export interface AssignedPropertiesRow {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  staffAssignments: { property: Property }[];
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
