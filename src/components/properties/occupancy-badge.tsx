import { StatusBadge } from '@/components/shared/status-badge';
import { OCCUPANCY_STATUS_LABELS, OCCUPANCY_STATUS_TONE } from '@/lib/labels';
import type { OccupancyStatus } from '@/lib/types';

export function OccupancyBadge({ status }: { status: OccupancyStatus }) {
  return (
    <StatusBadge
      label={OCCUPANCY_STATUS_LABELS[status]}
      tone={OCCUPANCY_STATUS_TONE[status]}
    />
  );
}
