'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { useProperties } from '@/lib/hooks/use-properties';
import { useDebounce } from '@/lib/hooks/use-debounce';

const PAGE_SIZE = 20;

export function PropertyAssignmentPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (propertyIds: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

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

  const toggle = (id: string, checked: boolean) => {
    onChange(
      checked ? [...selected, id] : selected.filter((pid) => pid !== id),
    );
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
            onChange={(e) => setSearch(e.target.value)}
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
                  onCheckedChange={(checked) => toggle(p.id, checked === true)}
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
