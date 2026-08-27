'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, addYears, format, isValid, parseISO } from 'date-fns';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRenewTenancy } from '@/lib/hooks/use-tenants';
import { useCreateNotice } from '@/lib/hooks/use-notices';
import { useProperties } from '@/lib/hooks/use-properties';
import { getApiErrorMessage } from '@/lib/api/errors';
import { formatDate, formatMoney } from '@/lib/format';
import type { Tenant } from '@/lib/types';

const ISO_DAY = 'yyyy-MM-dd';

/**
 * A renewal normally runs from the day after the current term ends, for a
 * year. Prefilling those saves the common case from any typing at all, and
 * both stay editable for the ones that don't follow the pattern.
 */
function defaultTerm(tenancyEndDate: string) {
  const end = parseISO(tenancyEndDate);
  if (!isValid(end)) {
    return { start: '', end: '' };
  }
  const start = addDays(end, 1);
  return {
    start: format(start, ISO_DAY),
    end: format(addDays(addYears(start, 1), -1), ISO_DAY),
  };
}

export function RenewTenancyDialog({
  tenant,
  trigger,
}: {
  tenant: Tenant;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const renew = useRenewTenancy(tenant.id);
  const createNotice = useCreateNotice();
  const [open, setOpen] = useState(false);

  const term = defaultTerm(tenant.tenancyEndDate);
  const [startDate, setStartDate] = useState(term.start);
  const [endDate, setEndDate] = useState(term.end);
  const [rentAmount, setRentAmount] = useState(tenant.rentAmount);
  const [propertyId, setPropertyId] = useState(tenant.propertyId);
  const [alsoNotice, setAlsoNotice] = useState(false);

  // Reset on open rather than in an effect: the dialog outlives the tenant
  // prop across a renewal, and the fields should reflect whichever term is
  // current when it is reopened.
  const openChanged = (next: boolean) => {
    if (next) {
      const fresh = defaultTerm(tenant.tenancyEndDate);
      setStartDate(fresh.start);
      setEndDate(fresh.end);
      setRentAmount(tenant.rentAmount);
      setPropertyId(tenant.propertyId);
      setAlsoNotice(false);
    }
    setOpen(next);
  };

  const { data: properties } = useProperties(
    { page: 1, limit: 100 },
    { keepPreviousData: true },
  );

  const rentChanged = Number(rentAmount) !== Number(tenant.rentAmount);

  const submit = () => {
    if (!startDate || !endDate) {
      toast.error('Set both the start and end of the new term.');
      return;
    }
    if (parseISO(endDate) <= parseISO(startDate)) {
      toast.error('The new term must end after it starts.');
      return;
    }

    renew.mutate(
      {
        tenancyStartDate: startDate,
        tenancyEndDate: endDate,
        rentAmount: Number(rentAmount),
        ...(propertyId !== tenant.propertyId ? { propertyId } : {}),
      },
      {
        onSuccess: (next) => {
          toast.success('Tenancy renewed.');
          setOpen(false);
          // The notice is best-effort: the renewal itself has already been
          // saved, so a notice failure must not read as a failed renewal.
          if (alsoNotice) {
            createNotice.mutate(
              {
                tenantId: next.id,
                type: 'RENEWAL',
                proposedRentAmount: Number(rentAmount),
              },
              {
                onSuccess: () =>
                  toast.success('Renewal notice drafted.', {
                    description: 'Review and issue it from the Notices page.',
                  }),
                onError: (e) =>
                  toast.error(
                    `Renewed, but the notice could not be drafted: ${getApiErrorMessage(e)}`,
                  ),
              },
            );
          }
          router.push(`/tenants/${next.id}`);
        },
        onError: (e) => toast.error(getApiErrorMessage(e)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={openChanged}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Renew tenancy</DialogTitle>
          <DialogDescription>
            The current term is kept as history and a new one starts. Reminders
            are rebuilt around the new end date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium">{tenant.fullName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Current term ends {formatDate(tenant.tenancyEndDate)} at{' '}
              {formatMoney(tenant.rentAmount)}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="renew-start">New start date</Label>
              <Input
                id="renew-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renew-end">New end date</Label>
              <Input
                id="renew-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="renew-rent">Rent for the new term</Label>
            <Input
              id="renew-rent"
              type="number"
              min={0}
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />
            {rentChanged ? (
              <p className="text-xs text-muted-foreground">
                {formatMoney(tenant.rentAmount)} → {formatMoney(rentAmount)}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Property</Label>
            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {properties?.data.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.address}, Unit {p.unitNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {propertyId !== tenant.propertyId ? (
              <p className="text-xs text-muted-foreground">
                The tenant moves to this unit for the new term.
              </p>
            ) : null}
          </div>

          <label className="flex items-start gap-2.5 text-sm">
            <Checkbox
              checked={alsoNotice}
              onCheckedChange={(v) => setAlsoNotice(v === true)}
              className="mt-0.5"
            />
            <span>
              Also draft a renewal notice
              <span className="block text-xs text-muted-foreground">
                Created as a draft — nothing reaches the tenant until you issue
                it.
              </span>
            </span>
          </label>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={renew.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={renew.isPending}>
            {renew.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Renew tenancy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
