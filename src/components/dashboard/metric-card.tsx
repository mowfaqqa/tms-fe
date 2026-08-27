import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function MetricCard({
  label,
  value,
  icon: Icon,
  href,
  tone = 'default',
  loading = false,
  subtext,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  href?: string;
  tone?: 'default' | 'warning' | 'danger';
  loading?: boolean;
  /** Small line under the figure, e.g. the amount a count is standing in for. */
  subtext?: string;
}) {
  const toneClasses =
    tone === 'danger'
      ? 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
      : tone === 'warning'
        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
        : 'bg-primary/10 text-primary';

  const inner = (
    <Card className={cn(href && 'transition-colors hover:border-primary/40')}>
      <CardContent className="flex items-center gap-4">
        <div className={cn('flex size-11 items-center justify-center rounded-lg', toneClasses)}>
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-7 w-12" />
          ) : (
            <>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              {subtext ? (
                <p className="text-xs text-muted-foreground">{subtext}</p>
              ) : null}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
