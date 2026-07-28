import { StatusBadge } from '@/components/shared/status-badge';

export function StaffStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <StatusBadge
      label={isActive ? 'Active' : 'Deactivated'}
      tone={isActive ? 'success' : 'secondary'}
    />
  );
}
