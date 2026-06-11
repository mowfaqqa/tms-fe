import { StatusBadge } from '@/components/shared/status-badge';
import { NOTICE_STATUS_LABELS, NOTICE_STATUS_TONE } from '@/lib/labels';
import type { NoticeStatus } from '@/lib/types';

export function NoticeStatusBadge({ status }: { status: NoticeStatus }) {
  return (
    <StatusBadge
      label={NOTICE_STATUS_LABELS[status]}
      tone={NOTICE_STATUS_TONE[status]}
    />
  );
}
