import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'secondary' | 'outline' | 'destructive' | 'success';

const TONE_VARIANT: Record<
  Tone,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  default: 'default',
  secondary: 'secondary',
  outline: 'outline',
  destructive: 'destructive',
  success: 'outline',
};

export function StatusBadge({
  label,
  tone = 'default',
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <Badge
      variant={TONE_VARIANT[tone]}
      className={cn(
        tone === 'success' &&
          'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400',
        className,
      )}
    >
      {label}
    </Badge>
  );
}
