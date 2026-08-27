import { ArrowRight } from 'lucide-react';
import type { ActivityChange } from '@/lib/types';

/**
 * The before/after values behind one activity entry. The server already
 * renders each change as a sentence; this splits it back into a value pair so
 * the arrow lines up in a column and long values can wrap on their own.
 */
export function ActivityChanges({
  changes,
  emptyLabel = '—',
}: {
  changes?: ActivityChange[];
  emptyLabel?: string;
}) {
  if (!changes || changes.length === 0) {
    return <span className="text-muted-foreground">{emptyLabel}</span>;
  }

  return (
    <ul className="space-y-1">
      {changes.map((change) => {
        // "rent amount: 500000 → 550000" — split on the first colon so the
        // field name can be emphasised separately from the values.
        const [field, ...rest] = change.description.split(': ');
        const values = rest.join(': ');
        const [from, to] = values.split(' → ');

        return (
          <li key={change.field} className="text-xs leading-relaxed">
            <span className="text-muted-foreground">{field}</span>{' '}
            {to === undefined ? (
              <span>{values}</span>
            ) : (
              <span className="inline-flex flex-wrap items-center gap-1">
                <span className="text-muted-foreground line-through">
                  {from}
                </span>
                <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
                <span className="font-medium">{to}</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
