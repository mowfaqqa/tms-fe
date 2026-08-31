'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { PaginationBar } from '@/components/shared/pagination-bar';
import { PropertyTable } from '@/components/properties/property-table';
import { useProperties } from '@/lib/hooks/use-properties';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useAuth } from '@/lib/auth/auth-context';

type OccupancyOption = 'all' | 'vacant' | 'occupied' | 'occupied_expired';

function PropertiesContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState(params.get('search') ?? '');
  const [occupancy, setOccupancy] = useState<OccupancyOption>(
    (params.get('occupancy') as OccupancyOption) ?? 'all',
  );
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 350);

  useEffect(() => {
    const qs = new URLSearchParams();
    if (debouncedSearch) qs.set('search', debouncedSearch);
    if (occupancy !== 'all') qs.set('occupancy', occupancy);
    const query = qs.toString();
    router.replace(query ? `/properties?${query}` : '/properties', {
      scroll: false,
    });
  }, [debouncedSearch, occupancy, router]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      occupancy: occupancy === 'all' ? undefined : occupancy,
    }),
    [page, debouncedSearch, occupancy],
  );

  const { data, isLoading } = useProperties(queryParams);

  return (
    <>
      <PageHeader
        title="Properties"
        description="Manage properties and see who's assigned to each one."
        actions={
          isAdmin ? (
            <Button asChild>
              <Link href="/properties/new">
                <Plus className="size-4" />
                Add property
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by address, unit, or landlord…"
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={occupancy}
              onValueChange={(v) => {
                setOccupancy(v as OccupancyOption);
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-52">
                <SelectValue placeholder="Occupancy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All properties</SelectItem>
                <SelectItem value="vacant">Vacant</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="occupied_expired">
                  Tenancy expired
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No properties found"
              description={
                isAdmin
                  ? 'Try adjusting your filters, or add a new property.'
                  : 'No properties are assigned to you yet — contact an admin.'
              }
              action={
                isAdmin ? (
                  <Button asChild size="sm">
                    <Link href="/properties/new">
                      <Plus className="size-4" />
                      Add property
                    </Link>
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <>
              <PropertyTable properties={data.data} />
              <PaginationBar meta={data.meta} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <PropertiesContent />
    </Suspense>
  );
}
