import { StatusBadge } from '@/components/shared/status-badge';

/**
 * Marks a tenancy paid in instalments. A settled arrangement still shows —
 * the flag records that an arrangement exists, not that money is owed — but
 * it reads as settled rather than as something to chase.
 */
export function PartPaymentBadge({
  isPartPayment,
  isFullyPaid = false,
}: {
  isPartPayment?: boolean;
  isFullyPaid?: boolean;
}) {
  if (!isPartPayment) return null;
  return (
    <StatusBadge
      label={isFullyPaid ? 'Part payment · settled' : 'Part payment'}
      tone={isFullyPaid ? 'secondary' : 'destructive'}
    />
  );
}
