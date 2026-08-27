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
export type ReminderStatus =
  | 'PENDING'
  | 'TRIGGERED'
  | 'ACKNOWLEDGED'
  // Set when the tenancy expires while reminders are still pending, so they
  // stop firing notices about a tenancy everyone already knows has lapsed.
  | 'CANCELLED';
export type NotificationChannel = 'DASHBOARD' | 'EMAIL';
export type NoticeType = 'QUIT' | 'RENEWAL' | 'GENERAL';
export type NoticeStatus = 'DRAFT' | 'ISSUED';
export type ExpiringFilter = '6m' | '3m' | '30d' | 'expired';
export type OccupancyStatus = 'VACANT' | 'OCCUPIED';
export type IssueCategory =
  | 'MAINTENANCE'
  | 'TENANT_COMPLAINT'
  | 'RENT_PAYMENT'
  | 'SECURITY'
  | 'LEGAL'
  | 'OTHER';
export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type IssueStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED';

export type ActivityAction =
  | 'PROPERTY_CREATED'
  | 'PROPERTY_UPDATED'
  | 'PROPERTY_DELETED'
  | 'TENANT_CREATED'
  | 'TENANT_UPDATED'
  | 'TENANT_DELETED'
  | 'STAFF_CREATED'
  | 'STAFF_UPDATED'
  | 'STAFF_DEACTIVATED'
  | 'STAFF_REACTIVATED'
  | 'PROPERTY_ASSIGNED'
  | 'PROPERTY_UNASSIGNED'
  | 'NOTICE_CREATED'
  | 'NOTICE_UPDATED'
  | 'NOTICE_ISSUED'
  | 'NOTICE_DELETED'
  | 'REMINDER_ACKNOWLEDGED'
  | 'ISSUE_RAISED'
  | 'ISSUE_UPDATED'
  | 'ISSUE_STATUS_CHANGED'
  // Actor is null on these — the nightly sweep, not a person.
  | 'TENANCY_EXPIRED';

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

/** One end of the renewal chain — a superseded term, or the one that replaced it. */
export interface TenancyTermRef {
  id: string;
  tenancyStartDate: string;
  tenancyEndDate: string;
  rentAmount: string;
  status: TenantStatus;
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
  /** The term this one renewed, when this record came from a renewal. */
  renewedFromId?: string | null;
  renewedFrom?: TenancyTermRef | null;
  /** The term that replaced this one. Present only on a RENEWED record. */
  renewedTo?: TenancyTermRef | null;
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
  // Free-text remark for extra details
  remark: string | null;
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

/** Who raised or closed an issue. */
export interface UserRef {
  id: string;
  fullName: string;
  email: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  propertyId: string | null;
  tenantId: string | null;
  raisedById: string | null;
  resolvedById: string | null;
  /** What the admin did about it. Required by the server on close. */
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  property?: (PropertyRef & { label: string | null }) | null;
  tenant?: { id: string; fullName: string; phoneNumber: string } | null;
  raisedBy?: UserRef | null;
  resolvedBy?: UserRef | null;
}

export interface IssueSummary {
  counts: Record<IssueStatus, number>;
  /** OPEN + IN_REVIEW — what still needs the admin's attention. */
  awaitingReview: number;
  total: number;
}

export interface NotificationIssueRef {
  id: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
}

export interface AppNotification {
  id: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  isRead: boolean;
  tenantId: string | null;
  reminderId: string | null;
  issueId?: string | null;
  /** Null means everyone in scope; a user id addresses one person. */
  recipientId?: string | null;
  createdAt: string;
  tenant?: NotificationTenantRef | null;
  issue?: NotificationIssueRef | null;
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

/**
 * One field the actor changed. `from`/`to` come back as JSON primitives —
 * strings for money and dates, since the server normalises them on write.
 */
export interface ActivityChange {
  field: string;
  from: unknown;
  to: unknown;
  /** Server-rendered, e.g. "rent amount: 500000 → 550000". */
  description: string;
}

export interface ActivityLogEntry {
  id: string;
  actorId: string | null;
  actor?: {
    id: string;
    fullName: string;
    email: string;
    role?: Role;
  } | null;
  action: ActivityAction;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  /**
   * Rendered by the server, e.g. "Updated property 12 Adeola St (Unit 4) —
   * changed unit number, label". Optional: rows written before the audit
   * detail work have no metadata to build one from.
   */
  summary?: string;
  entityLabel?: string | null;
  changes?: ActivityChange[];
  changeCount?: number;
}

/** Action counts and span for a staff member, from /staff/:id/activity. */
export interface StaffActivitySummary {
  totalActions: number;
  byAction: { action: ActivityAction; count: number }[];
  firstActionAt: string | null;
  lastActionAt: string | null;
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
  /** Rows in this page. Not the overall total — see `meta.total`. */
  count: number;
  rows: T[];
  /** Present only on paginated reports (currently staff activity). */
  meta?: PaginationMeta;
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
