'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, Users } from 'lucide-react';
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
import { TenantTable } from '@/components/tenants/tenant-table';
import { useTenants } from '@/lib/hooks/use-tenants';
import { useDebounce } from '@/lib/hooks/use-debounce';
import type { ExpiringFilter, TenantStatus } from '@/lib/types';

const EXPIRING_OPTIONS: { value: ExpiringFilter; label: string }[] = [
  { value: '6m', label: 'Within 6 months' },
  { value: '3m', label: 'Within 3 months' },
  { value: '30d', label: 'Within 30 days' },
  { value: 'expired', label: 'Expired' },
];

const STATUS_OPTIONS: { value: TenantStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RENEWED', label: 'Renewed' },
  { value: 'EXPIRED', label: 'Expired' },
];

function TenantsContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [search, setSearch] = useState(params.get('search') ?? '');
  const [expiring, setExpiring] = useState<ExpiringFilter | 'all'>(
    (params.get('expiring') as ExpiringFilter) ?? 'all',
  );
  const [status, setStatus] = useState<TenantStatus | 'all'>(
    (params.get('status') as TenantStatus) ?? 'all',
  );
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 350);

  // Reflect filters in the URL (shareable / deep-linkable).
  useEffect(() => {
    const qs = new URLSearchParams();
    if (debouncedSearch) qs.set('search', debouncedSearch);
    if (expiring !== 'all') qs.set('expiring', expiring);
    if (status !== 'all') qs.set('status', status);
    const query = qs.toString();
    router.replace(query ? `/tenants?${query}` : '/tenants', { scroll: false });
  }, [debouncedSearch, expiring, status, router]);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      search: debouncedSearch || undefined,
      expiring: expiring === 'all' ? undefined : expiring,
      status: status === 'all' ? undefined : status,
    }),
    [page, debouncedSearch, expiring, status],
  );

  const { data, isLoading } = useTenants(queryParams);

  return (
    <>
      <PageHeader
        title="Tenants"
        description="Manage tenant records and tenancy dates."
        actions={
          <Button asChild>
            <Link href="/tenants/new">
              <Plus className="size-4" />
              Add tenant
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or address…"
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <Select
              value={expiring}
              onValueChange={(v) => {
                setExpiring(v as ExpiringFilter | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Expiring" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All expiry windows</SelectItem>
                {EXPIRING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as TenantStatus | 'all');
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
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
              icon={Users}
              title="No tenants found"
              description="Try adjusting your filters, or add a new tenant."
              action={
                <Button asChild size="sm">
                  <Link href="/tenants/new">
                    <Plus className="size-4" />
                    Add tenant
                  </Link>
                </Button>
              }
            />
          ) : (
            <>
              <TenantTable tenants={data.data} />
              <PaginationBar meta={data.meta} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function TenantsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <TenantsContent />
    </Suspense>
  );
}
