import { StatusBadge } from '@/components/shared/status-badge';
import {
  ISSUE_PRIORITY_LABELS,
  ISSUE_PRIORITY_TONE,
  ISSUE_STATUS_LABELS,
  ISSUE_STATUS_TONE,
} from '@/lib/labels';
import type { IssuePriority, IssueStatus } from '@/lib/types';

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return (
    <StatusBadge
      label={ISSUE_STATUS_LABELS[status]}
      tone={ISSUE_STATUS_TONE[status]}
    />
  );
}

export function IssuePriorityBadge({ priority }: { priority: IssuePriority }) {
  return (
    <StatusBadge
      label={ISSUE_PRIORITY_LABELS[priority]}
      tone={ISSUE_PRIORITY_TONE[priority]}
    />
  );
}
