'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { DoorClosed, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { useConfirmVacancy } from '@/lib/hooks/use-properties';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { Property } from '@/lib/types';

const ISO_DAY = 'yyyy-MM-dd';

/**
 * The only way a let property becomes vacant. A tenancy expiring does not do
 * it — the tenant is assumed to still be in the unit until someone who can
 * see it says the keys are back.
 */
export function ConfirmVacancyDialog({
  property,
  trigger,
}: {
  property: Property;
  trigger: React.ReactNode;
}) {
  const confirmVacancy = useConfirmVacancy(property.id);
  const [open, setOpen] = useState(false);
  const [vacatedAt, setVacatedAt] = useState(format(new Date(), ISO_DAY));
  const [note, setNote] = useState('');
  const [endRunningTenancy, setEndRunningTenancy] = useState(false);

  // A running tenancy has to be closed deliberately: confirming a vacancy
  // under one is an early move-out, not a tidy-up.
  const hasRunningTenancy = property.activeTenantCount > 0;

  const openChanged = (next: boolean) => {
    if (next) {
      setVacatedAt(format(new Date(), ISO_DAY));
      setNote('');
      setEndRunningTenancy(false);
    }
    setOpen(next);
  };

  const submit = () => {
    if (!vacatedAt) {
      toast.error('Set the date the property was handed back.');
      return;
    }
    if (hasRunningTenancy && !endRunningTenancy) {
      toast.error(
        'This property still has a running tenancy. Tick the early move-out box to close it.',
      );
      return;
    }

    confirmVacancy.mutate(
      {
        vacatedAt,
        ...(note.trim() ? { note: note.trim() } : {}),
        ...(endRunningTenancy ? { endRunningTenancy: true } : {}),
      },
      {
        onSuccess: () => {
          toast.success('Property confirmed vacant.');
          setOpen(false);
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
          <DialogTitle>Confirm property vacant</DialogTitle>
          <DialogDescription>
            Marks the unit empty and available to re-let. Letting it again
            clears this on its own.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border bg-muted/40 p-3 text-sm">
            <p className="font-medium">
              {property.address}, Unit {property.unitNumber}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {property.occupantCount} tenant
              {property.occupantCount === 1 ? '' : 's'} on record here
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacated-at">Date handed back</Label>
            <Input
              id="vacated-at"
              type="date"
              max={format(new Date(), ISO_DAY)}
              value={vacatedAt}
              onChange={(e) => setVacatedAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacancy-note">Note (optional)</Label>
            <Textarea
              id="vacancy-note"
              rows={3}
              placeholder="Keys returned to the office, unit inspected…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {hasRunningTenancy ? (
            <label className="flex items-start gap-2.5 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/40">
              <Checkbox
                checked={endRunningTenancy}
                onCheckedChange={(v) => setEndRunningTenancy(v === true)}
                className="mt-0.5"
              />
              <span>
                This tenancy is still running — record an early move-out
                <span className="block text-xs text-muted-foreground">
                  The term is closed as at this date. The contracted end date
                  stays on the record.
                </span>
              </span>
            </label>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={confirmVacancy.isPending}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={confirmVacancy.isPending}>
            {confirmVacancy.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <DoorClosed className="size-4" />
            )}
            Confirm vacant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
