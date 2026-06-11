import type {
  NoticeStatus,
  NoticeType,
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
};

export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  RENEWED: 'Renewed',
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
};

export const NOTICE_STATUS_TONE: Record<NoticeStatus, BadgeTone> = {
  DRAFT: 'outline',
  ISSUED: 'success',
};
