import { StatusBadge } from '@/components/shared/status-badge';
import { TENANT_STATUS_LABELS, TENANT_STATUS_TONE } from '@/lib/labels';
import type { TenantStatus } from '@/lib/types';

export function TenantStatusBadge({ status }: { status: TenantStatus }) {
  return (
    <StatusBadge
      label={TENANT_STATUS_LABELS[status]}
      tone={TENANT_STATUS_TONE[status]}
    />
  );
}
