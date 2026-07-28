'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useProperties } from '@/lib/hooks/use-properties';

export function PropertyAssignmentPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (propertyIds: string[]) => void;
}) {
  const { data: properties, isLoading } = useProperties({ limit: 100 });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!properties || properties.data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No properties exist yet — add one first.
      </p>
    );
  }

  const toggle = (id: string, checked: boolean) => {
    onChange(
      checked ? [...selected, id] : selected.filter((pid) => pid !== id),
    );
  };

  return (
    <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-3">
      {properties.data.map((p) => (
        <label
          key={p.id}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
        >
          <Checkbox
            checked={selected.includes(p.id)}
            onCheckedChange={(checked) => toggle(p.id, checked === true)}
          />
          <span>
            {p.address}, Unit {p.unitNumber}
          </span>
        </label>
      ))}
    </div>
  );
}
