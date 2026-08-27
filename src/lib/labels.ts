import type {
  ActivityAction,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  IdentificationType,
  MaritalStatus,
  NoticeStatus,
  NoticeType,
  OccupancyStatus,
  ReminderStatus,
  ReminderType,
  TenantStatus,
} from './types';

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  SIX_MONTH: '6-Month Reminder',
  THREE_MONTH: '3-Month Reminder',
  ONE_MONTH: '1-Month Reminder',
  FOURTEEN_DAY: 'Final Reminder (14 days)',
};

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  PENDING: 'Pending',
  TRIGGERED: 'Triggered',
  ACKNOWLEDGED: 'Acknowledged',
  CANCELLED: 'Cancelled',
};

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  RENEWED: 'Renewed',
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  SINGLE: 'Single',
  MARRIED: 'Married',
  DIVORCED: 'Divorced',
  WIDOWED: 'Widowed',
  SEPARATED: 'Separated',
};

export const IDENTIFICATION_TYPE_LABELS: Record<IdentificationType, string> = {
  DRIVERS_LICENSE: "Driver's License",
  INTERNATIONAL_PASSPORT: 'International Passport',
  NATIONAL_ID: 'National ID',
};

export const NOTICE_TYPE_LABELS: Record<NoticeType, string> = {
  QUIT: 'Notice to Quit',
  RENEWAL: 'Renewal Notice',
  GENERAL: 'General Notice',
};

export const NOTICE_STATUS_LABELS: Record<NoticeStatus, string> = {
  DRAFT: 'Draft',
  ISSUED: 'Issued',
};

type BadgeTone = 'default' | 'secondary' | 'outline' | 'destructive' | 'success';

export const TENANT_STATUS_TONE: Record<TenantStatus, BadgeTone> = {
  ACTIVE: 'success',
  EXPIRED: 'destructive',
  RENEWED: 'secondary',
};

export const REMINDER_STATUS_TONE: Record<ReminderStatus, BadgeTone> = {
  PENDING: 'outline',
  TRIGGERED: 'default',
  ACKNOWLEDGED: 'secondary',
  CANCELLED: 'secondary',
};

export const NOTICE_STATUS_TONE: Record<NoticeStatus, BadgeTone> = {
  DRAFT: 'outline',
  ISSUED: 'success',
};

export const OCCUPANCY_STATUS_LABELS: Record<OccupancyStatus, string> = {
  VACANT: 'Vacant',
  OCCUPIED: 'Occupied',
};

export const OCCUPANCY_STATUS_TONE: Record<OccupancyStatus, BadgeTone> = {
  VACANT: 'secondary',
  OCCUPIED: 'success',
};

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  PROPERTY_CREATED: 'Property created',
  PROPERTY_UPDATED: 'Property updated',
  PROPERTY_DELETED: 'Property deleted',
  TENANT_CREATED: 'Tenant created',
  TENANT_UPDATED: 'Tenant updated',
  TENANT_DELETED: 'Tenant deleted',
  STAFF_CREATED: 'Staff created',
  STAFF_UPDATED: 'Staff updated',
  STAFF_DEACTIVATED: 'Staff deactivated',
  STAFF_REACTIVATED: 'Staff reactivated',
  PROPERTY_ASSIGNED: 'Property assigned',
  PROPERTY_UNASSIGNED: 'Property unassigned',
  NOTICE_CREATED: 'Notice drafted',
  NOTICE_UPDATED: 'Notice updated',
  NOTICE_ISSUED: 'Notice issued',
  NOTICE_DELETED: 'Notice deleted',
  REMINDER_ACKNOWLEDGED: 'Reminder acknowledged',
  ISSUE_RAISED: 'Issue reported',
  ISSUE_UPDATED: 'Issue updated',
  ISSUE_STATUS_CHANGED: 'Issue status changed',
  TENANCY_EXPIRED: 'Tenancy expired',
};

/**
 * The server can add actions ahead of a frontend deploy, so never index the
 * map directly — an unknown action would render as `undefined`. Falls back to
 * a readable version of the enum name.
 */
export function activityActionLabel(action: ActivityAction | string): string {
  return (
    ACTIVITY_ACTION_LABELS[action as ActivityAction] ??
    action
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/^./, (c) => c.toUpperCase())
  );
}

/**
 * What an activity entry was *about*, for display under the action label.
 * Deliberately not the server's `summary` sentence — that repeats the action
 * verb already shown above it, and its diff tail repeats the changes column.
 *
 * Assignment entries are the exception: their `entityLabel` is the staff
 * member, so the property has to come from the metadata or the row would
 * never say which property moved.
 */
export function activitySubject(entry: {
  action: ActivityAction;
  entityLabel?: string | null;
  metadata?: Record<string, unknown> | null;
}): string | null {
  const propertyLabel =
    typeof entry.metadata?.propertyLabel === 'string'
      ? entry.metadata.propertyLabel
      : null;

  if (
    entry.action === 'PROPERTY_ASSIGNED' ||
    entry.action === 'PROPERTY_UNASSIGNED'
  ) {
    const preposition = entry.action === 'PROPERTY_ASSIGNED' ? 'to' : 'from';
    if (propertyLabel && entry.entityLabel) {
      return `${propertyLabel} ${preposition} ${entry.entityLabel}`;
    }
    return propertyLabel ?? entry.entityLabel ?? null;
  }

  return entry.entityLabel ?? null;
}

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  OPEN: 'Open',
  IN_REVIEW: 'In review',
  RESOLVED: 'Resolved',
  REJECTED: 'Declined',
};

export const ISSUE_STATUS_TONE: Record<IssueStatus, BadgeTone> = {
  OPEN: 'destructive',
  IN_REVIEW: 'default',
  RESOLVED: 'success',
  REJECTED: 'secondary',
};

export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const ISSUE_PRIORITY_TONE: Record<IssuePriority, BadgeTone> = {
  LOW: 'secondary',
  MEDIUM: 'outline',
  HIGH: 'default',
  URGENT: 'destructive',
};

export const ISSUE_CATEGORY_LABELS: Record<IssueCategory, string> = {
  MAINTENANCE: 'Maintenance',
  TENANT_COMPLAINT: 'Tenant complaint',
  RENT_PAYMENT: 'Rent / payment',
  SECURITY: 'Security',
  LEGAL: 'Legal',
  OTHER: 'Other',
};
