'use client';

import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { useProperties } from '@/lib/hooks/use-properties';
import { useDebounce } from '@/lib/hooks/use-debounce';
import type { Property } from '@/lib/types';

const describe = (p: Property) => `${p.address}, Unit ${p.unitNumber}`;

const PAGE_SIZE = 20;

export function PropertyAssignmentPicker({
  selected,
  onChange,
  initialLabels,
}: {
  selected: string[];
  onChange: (propertyIds: string[]) => void;
  /**
   * Labels for already-selected properties, so the chip list can name them
   * before the page they live on has been loaded — with 200+ properties the
   * ticked ones are usually several pages deep.
   */
  initialLabels?: Record<string, string>;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 350);

  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
    }),
    [page, debouncedSearch],
  );

  const { data: properties, isLoading } = useProperties(queryParams, {
    keepPreviousData: true,
  });

  // Remember the label of anything ticked, so a chip stays named after the
  // user pages or searches away from the property that produced it.
  const [labels, setLabels] = useState<Record<string, string>>(() => ({
    ...initialLabels,
  }));

  const deselect = (id: string) =>
    onChange(selected.filter((pid) => pid !== id));

  const toggle = (property: Property, checked: boolean) => {
    if (!checked) {
      deselect(property.id);
      return;
    }
    setLabels((prev) => ({ ...prev, [property.id]: describe(property) }));
    onChange([...selected, property.id]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by address, unit, or landlord…"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // A new search invalidates the current page number.
              setPage(1);
            }}
            onKeyDown={(e) => {
              // The picker is rendered inside the staff form — don't submit it.
              if (e.key === 'Enter') e.preventDefault();
            }}
          />
        </div>
        <p className="text-sm text-muted-foreground sm:shrink-0">
          {selected.length} selected
        </p>
      </div>

      {selected.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 rounded-md border bg-muted/30 p-2">
          {selected.map((id) => (
            <Badge key={id} variant="secondary" className="gap-1 font-normal">
              <span className="max-w-[22rem] truncate">
                {labels[id] ?? 'Selected property'}
              </span>
              <button
                type="button"
                aria-label={`Remove ${labels[id] ?? 'property'}`}
                className="rounded-full opacity-60 hover:opacity-100"
                onClick={() => deselect(id)}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : !properties || properties.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {debouncedSearch
            ? 'No properties match your search.'
            : 'No properties exist yet — add one first.'}
        </p>
      ) : (
        <>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-3">
            {properties.data.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
              >
                <Checkbox
                  checked={selected.includes(p.id)}
                  onCheckedChange={(checked) => toggle(p, checked === true)}
                />
                <span>
                  {p.address}, Unit {p.unitNumber}
                </span>
              </label>
            ))}
          </div>
          <PaginationBar meta={properties.meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
